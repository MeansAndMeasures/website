import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { webcrypto } from 'node:crypto';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';

const pair = await webcrypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const publicKey = { ...await webcrypto.subtle.exportKey('jwk', pair.publicKey), kid: 'test-key' };
const source = readFileSync(new URL('../src/lib/websiteAuth.ts', import.meta.url), 'utf8');
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
function load(source, dependencies = {}, globals = {}) {
    const exports = {};
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    runInNewContext(code, { exports, require: name => { if (!(name in dependencies)) throw Error('Unexpected import: ' + name); return dependencies[name]; }, Response, Request, URL, TextEncoder, TextDecoder, Uint8Array, atob, AbortSignal, crypto: webcrypto, fetch: async () => Response.json({ keys: [publicKey] }), ...globals });
    return exports;
}
const auth = load(source);
async function request(overrides = {}, { sign = true } = {}) {
    const now = Math.floor(Date.now() / 1000);
    const payload = { iss: auth.ACCESS_ISSUER, aud: [auth.ACCESS_AUDIENCE], sub: 'owner-subject', email: auth.OWNER_EMAIL, iat: now, exp: now + 3600, ...overrides };
    const body = encode({ alg: 'RS256', kid: publicKey.kid }) + '.' + encode(payload);
    const signature = sign ? Buffer.from(await webcrypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(body))).toString('base64url') : 'invalid';
    return new Request('https://meansandmeasures.com/api/auth/session', { headers: { 'cf-access-jwt-assertion': body + '.' + signature } });
}
test('shared identity verifies real signatures and grants the existing owner each private permission', async () => {
    const req = await request();
    for (const permission of auth.OWNER_PERMISSIONS) assert.equal((await auth.authorizedIdentity(req, permission)).email, auth.OWNER_EMAIL);
});
test('untrusted, expired, future, wrong-audience and forged assertions cannot authorize', async () => {
    assert.equal(await auth.websiteIdentity(new Request('https://meansandmeasures.com')), null);
    for (const overrides of [{ aud: ['other-app'] }, { iss: 'https://evil.example' }, { exp: 1 }, { iat: Date.now() }, { sub: '' }, { nbf: Date.now() }]) {
        assert.equal(await auth.websiteIdentity(await request(overrides)), null);
    }
    assert.equal(await auth.websiteIdentity(await request({}, { sign: false })), null);
    assert.equal(await auth.authorizedIdentity(await request({ email: 'other@example.com' }), 'journal'), null);
});
test('sign-in return paths cannot escape the site or point at arbitrary public handlers', () => {
    for (const path of ['https://evil.example', '//evil.example', '/\\evil.example', '/api/intake', '/auth/login', '/notary/\r\nLocation: https://evil.example']) assert.equal(auth.safeReturnPath(path), '/account/');
    assert.equal(auth.safeReturnPath('/notary/?entry=1'), '/notary/?entry=1');
    assert.equal(auth.safeReturnPath('/account/intake/'), '/account/intake/');
});
test('session returns identity and permissions without exposing the assertion', async () => {
    const handler = load(readFileSync(new URL('../src/pages/api/auth/session.ts', import.meta.url), 'utf8'), { '../../../lib/websiteAuth': auth });
    const response = await handler.GET({ request: await request() });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const body = await response.json();
    assert.deepEqual(Object.keys(body).sort(), ['authenticated', 'email', 'expiresAt', 'permissions', 'subject']);
    assert.equal((await handler.GET({ request: new Request('https://meansandmeasures.com/api/auth/session') })).status, 401);
});
for (const [name, permission, tokenName] of [['intake', 'intake', 'INTAKE_EXPORT_TOKEN'], ['kc-suggest', 'suggestions', 'KC_SUGGEST_EXPORT_TOKEN']]) {
    test(`${name} export supports shared sign-in and existing automation, and rejects anonymous callers before querying`, async () => {
        let queries = 0;
        const env = { [tokenName]: 'automation-token', INTAKE_DB: { prepare() { queries++; return { all: async () => ({ results: [] }) }; } } };
        const handler = load(readFileSync(new URL(`../src/pages/api/${name}/export.ts`, import.meta.url), 'utf8'), { 'cloudflare:workers': { env }, '../../../lib/websiteAuth': auth });
        assert.equal((await handler.GET({ request: new Request(`https://meansandmeasures.com/api/${name}/export`) })).status, 401);
        assert.equal(queries, 0);
        assert.equal((await handler.GET({ request: await request() })).status, 200);
        assert.equal((await handler.GET({ request: new Request(`https://meansandmeasures.com/api/${name}/export`, { headers: { authorization: 'Bearer automation-token' } }) })).status, 200);
        assert.equal(queries, 2);
        assert.equal(await auth.authorizedIdentity(await request({ email: 'other@example.com' }), permission), null);
    });
}

test('the signed shared cookie authorizes exports outside the edge gate without trusting plain identity headers', async () => {
    const req = await request();
    const cookieRequest = new Request('https://meansandmeasures.com/api/intake/export', { headers: { cookie: 'CF_Authorization=' + req.headers.get('cf-access-jwt-assertion') } });
    assert.equal((await auth.authorizedIdentity(cookieRequest, 'intake')).email, auth.OWNER_EMAIL);
    assert.equal(await auth.websiteIdentity(new Request('https://meansandmeasures.com', { headers: { 'cf-access-authenticated-user-email': auth.OWNER_EMAIL } })), null);
});
