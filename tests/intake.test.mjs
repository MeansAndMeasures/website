import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';

const source = readFileSync(new URL('../src/pages/api/intake.ts', import.meta.url), 'utf8').replaceAll('import.meta.env.DEV', 'false');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function setup({ sendFails = false, storeFails = false, receiptFails = false } = {}) {
    const queries = [], emails = [];
    const env = {
        INTAKE_DB: { prepare(sql) { return { bind(...args) { return { async run() {
            queries.push({ sql, args });
            if (storeFails || (receiptFails && sql.includes("email_status = 'sent'"))) throw Error('database failure');
            return { meta: { last_row_id: 42 } };
        } }; } }; } },
        INTAKE_EMAIL: { async send(message) { if (sendFails) throw Error('provider failure'); emails.push(message); return { messageId: 'receipt-42' }; } }
    };
    const exports = {};
    runInNewContext(code, { exports, require: () => ({ env }), Response, console: { error() {} } });
    return { queries, emails, post: payload => exports.POST({ request: new Request('https://meansandmeasures.com/api/intake', { method: 'POST', body: JSON.stringify(payload) }) }) };
}
test('stores before emailing, routes procurement, escapes content and sets reply-to', async () => {
    const state = setup();
    const response = await state.post({ name: 'A <person>', email: 'person@example.com', topic: 'Procurement', message: '<script>hello</script>' });
    assert.equal(response.status, 200);
    assert.match(state.queries[0].sql, /INSERT INTO intake_submissions/);
    assert.equal(state.emails[0].to, 'procurement@meansandmeasures.com');
    assert.equal(state.emails[0].replyTo, 'person@example.com');
    assert.match(state.emails[0].html, /&lt;script&gt;/);
    assert.match(state.queries[1].sql, /email_status = 'sent'/);
});
test('general inquiries use contact mailbox and no reply-to if omitted', async () => {
    const state = setup(); await state.post({ message: 'Hello' });
    assert.equal(state.emails[0].to, 'contact@meansandmeasures.com');
    assert.equal(state.emails[0].replyTo, undefined);
});
test('email failure preserves durable intake and records failed notification', async () => {
    const state = setup({ sendFails: true }); const response = await state.post({ message: 'Hello' });
    assert.equal(response.status, 202); assert.equal((await response.json()).ok, true);
    assert.match(state.queries.at(-1).sql, /email_status = 'failed'/);
});
test('storage failure does not send email', async () => {
    const state = setup({ storeFails: true }); assert.equal((await state.post({ message: 'Hello' })).status, 502); assert.equal(state.emails.length, 0);
});
test('receipt persistence failure does not invite duplicate submission', async () => {
    const state = setup({ receiptFails: true }); assert.equal((await state.post({ message: 'Hello' })).status, 200); assert.equal(state.emails.length, 1);
});
test('honeypot and invalid email never store or send', async () => {
    const state = setup(); await state.post({ company: 'bot', message: 'Hello' });
    assert.equal((await state.post({ email: 'bad address', message: 'Hello' })).status, 400);
    assert.equal(state.queries.length, 0); assert.equal(state.emails.length, 0);
});
