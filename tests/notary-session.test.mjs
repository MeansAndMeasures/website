import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';

const source = readFileSync(new URL('../src/pages/api/notary/session.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
runInNewContext(code, { exports, Response, URL });

test('session handoff preserves journal origin and never caches or creates data', async () => {
    for (const origin of ['https://meansandmeasures.com', 'https://www.meansandmeasures.com']) {
        const response = await exports.GET({ request: new Request(origin + '/api/notary/session?returnTo=https://example.com') });
        assert.equal(response.status, 303);
        assert.equal(response.headers.get('location'), origin + '/notary/');
        assert.equal(response.headers.get('cache-control'), 'no-store');
        assert.equal(await response.text(), '');
    }
});
test('session handoff cannot become an arbitrary-origin redirect', async () => {
    const response = await exports.GET({ request: new Request('https://untrusted.example/api/notary/session') });
    assert.equal(response.headers.get('location'), 'https://meansandmeasures.com/notary/');
});
