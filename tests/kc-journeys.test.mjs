import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const exportsOf = {};
runInNewContext(
    ts.transpileModule(read('src/data/kcMachine.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
    { exports: exportsOf }
);
const journeys = exportsOf.kcJourneys;
const serviceSlugs = new Set(readdirSync(new URL('../src/content/kc-services/', import.meta.url)).filter(f => f.endsWith('.md')).map(f => f.slice(0, -3)));

test('four journeys with unique ids and at least one step each', () => {
    assert.equal(journeys.length, 4);
    assert.equal(new Set(journeys.map(j => j.id)).size, journeys.length);
    for (const journey of journeys) assert.ok(journey.steps.length > 0, journey.id);
});

test('every journey service slug exists in the kc-services collection', () => {
    for (const journey of journeys) for (const step of journey.steps) for (const slug of step.serviceSlugs) {
        assert.ok(serviceSlugs.has(slug), `${journey.id}/${step.id} references missing service ${slug}`);
    }
});

test('every step href points at an existing KC page', () => {
    for (const journey of journeys) for (const step of journey.steps) {
        const path = step.href.split(/[?#]/)[0];
        assert.match(path, /^\/kc(\/|$)/, `${journey.id}/${step.id}`);
        const base = path === '/kc' ? 'src/pages/kc/index' : `src/pages${path}`;
        assert.ok(existsSync(new URL(`../${base}.astro`, import.meta.url)), `${journey.id}/${step.id}: no page for ${step.href}`);
    }
});

test('journey pages exist, are prerendered, and are listed in both sitemaps', () => {
    const page = read('src/pages/kc/journeys/[id].astro');
    assert.match(page, /export const prerender = true/);
    assert.match(page, /getStaticPaths/);
    assert.ok(existsSync(new URL('../src/pages/kc/journeys/index.astro', import.meta.url)));
    assert.match(read('src/pages/sitemap.xml.ts'), /kc\/journeys/);
    assert.match(read('src/pages/sitemap.astro'), /\/kc\/journeys"/);
});

test('jcha entry points at the county housing-authority page', () => {
    assert.match(read('src/content/kc-services/jcha.md'), /website: "https:\/\/www\.jocogov\.org\/department\/housing-services\/housing-authority"/);
});
