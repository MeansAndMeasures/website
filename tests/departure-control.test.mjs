import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../src/components/SiteHeader.astro', import.meta.url), 'utf8');
const script = source.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];

function storage(values) {
    const data = new Map(Object.entries(values));
    return { data, get length() { return data.size; }, key: i => [...data.keys()][i], removeItem: key => data.delete(key) };
}

for (const trigger of ['click', 'keyboard']) {
    test(`${trigger} leaves KC while preserving journal identity, cache and pending seal`, () => {
        const local = storage({ 'kc-readability-size': 'large', mmNotaryPublicJwk: 'identity', 'meansandmeasures.ksNotaryJournal.v3': 'records', 'meansandmeasures.ksNotary.pendingSeal.v1': 'pending', unrelated: 'preserve' });
        const session = storage({ 'kc-session': 'temporary', unrelated: 'preserve' });
        const handlers = {};
        let destination;
        runInNewContext(script, {
            document: { querySelector: () => ({ addEventListener: (event, fn) => handlers[event] = fn }), addEventListener: (event, fn) => handlers[event] = fn },
            window: { localStorage: local, sessionStorage: session, location: { replace: url => destination = url } }
        });
        if (trigger === 'click') handlers.click();
        else {
            handlers.keydown({ key: 'Escape', shiftKey: false });
            assert.equal(destination, undefined);
            handlers.keydown({ key: 'Escape', shiftKey: true });
        }
        assert.equal(destination, 'https://www.google.com');
        assert.deepEqual([...local.data.keys()], ['mmNotaryPublicJwk', 'meansandmeasures.ksNotaryJournal.v3', 'meansandmeasures.ksNotary.pendingSeal.v1', 'unrelated']);
        assert.deepEqual([...session.data.keys()], ['unrelated']);
    });
}

test('departure still redirects when browser storage is unavailable', () => {
    let leave;
    let destination;
    const window = { location: { replace: url => destination = url } };
    for (const name of ['localStorage', 'sessionStorage']) Object.defineProperty(window, name, { get() { throw new Error('Storage denied'); } });
    runInNewContext(script, { window, document: { querySelector: () => ({ addEventListener: (_, fn) => leave = fn }), addEventListener() {} } });
    leave();
    assert.equal(destination, 'https://www.google.com');
});
