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

const transpile = path => ts.transpileModule(read(path), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const es = {}; runInNewContext(transpile('src/data/kcJourneysEs.ts'), { exports: es });
const esServices = {}; runInNewContext(transpile('src/data/kcServicesEs.ts'), { exports: esServices });

test('Spanish text covers every journey and step, with no leftover English copy', () => {
    for (const journey of journeys) {
        const text = es.kcJourneysEs[journey.id];
        assert.ok(text, `no Spanish text for ${journey.id}`);
        for (const field of ['title', 'question', 'summary']) {
            assert.ok(text[field] && text[field] !== journey[field], `${journey.id}.${field} missing or untranslated`);
        }
        assert.equal(Object.keys(text.steps).sort().join(), journey.steps.map(s => s.id).sort().join(), `${journey.id} step ids`);
        for (const step of journey.steps) {
            assert.ok(text.steps[step.id].title && text.steps[step.id].title !== step.title, `${journey.id}/${step.id} title`);
            assert.ok(text.steps[step.id].guidance && text.steps[step.id].guidance !== step.guidance, `${journey.id}/${step.id} guidance`);
        }
    }
    assert.equal(Object.keys(es.kcJourneysEs).sort().join(), journeys.map(j => j.id).sort().join());
});

test('Spanish service strings only reference real services', () => {
    for (const slug of Object.keys(esServices.kcServicesEs)) assert.ok(serviceSlugs.has(slug), slug);
});

test('Spanish page links resolve to existing Spanish pages', () => {
    for (const path of es.kcSpanishPages) {
        assert.ok(existsSync(new URL(`../src/pages/es${path}.astro`, import.meta.url)), `no Spanish page for ${path}`);
    }
    assert.equal(es.spanishHref('/kc/housing#eviction').href, '/es/kc/housing#eviction');
    assert.equal(es.spanishHref('/kc/housing#eviction').spanish, true);
    assert.equal(es.spanishHref('/kc/utilities').href, '/kc/utilities');
    assert.equal(es.spanishHref('/kc/utilities').spanish, false);
});

test('Spanish journey pages exist, link both languages, and are in sitemaps with hreflang pairs', () => {
    const page = read('src/pages/es/kc/journeys/[id].astro');
    assert.match(page, /export const prerender = true/);
    assert.match(page, /lang="es"/);
    assert.match(page, /getStaticPaths/);
    assert.ok(existsSync(new URL('../src/pages/es/kc/journeys/index.astro', import.meta.url)));
    for (const path of ['src/pages/kc/journeys/[id].astro', 'src/pages/kc/journeys/index.astro']) {
        assert.match(read(path), /KCLanguageSwitcher/, path);
        assert.match(read(path), /\/es\/kc\/journeys/, path);
    }
    const sitemap = read('src/pages/sitemap.xml.ts');
    assert.match(sitemap, /es\/kc\/journeys/);
    assert.match(sitemap, /`journeys\/\$\{journey\.id\}`/);
    assert.match(read('src/pages/sitemap.astro'), /\/es\/kc\/journeys"/);
});

test('repaired KC links point at the verified official pages', () => {
    const site = slug => read(`src/content/kc-services/${slug}.md`).match(/^website: "(.*)"/m)[1];
    assert.equal(site('jaydoc-clinic'), 'https://www.kumc.edu/school-of-medicine/patient-care/student-run-clinics/jaydoc-free-clinic.html');
    assert.equal(site('sojourner-clinic'), 'https://www.sojournerhealthclinic.com/');
    assert.equal(site('salvation-army-kc'), 'https://www.salvationarmyusa.org/usa-central-territory/kansas-and-western-missouri/');
});

test('Cabot Westside and IRC entries carry the facts verified on their official pages', () => {
    const field = (slug, key) => read(`src/content/kc-services/${slug}.md`).match(new RegExp(`^${key}: (.*)$`, 'm'))?.[1];
    assert.equal(field('cabot-westside', 'website'), '"https://samrodgers.org/contact-us/"');
    assert.equal(field('cabot-westside', 'phone'), '"816-471-0900"');
    assert.equal(field('cabot-westside', 'address'), '"2121 Summit St, Kansas City, MO 64108"');
    assert.match(field('cabot-westside', 'name'), /Samuel U\. Rodgers Health Center/);
    assert.equal(field('cabot-westside', 'statusNeutral'), undefined, 'unverified immigration-status claim must not return');
    assert.equal(field('irc-kc', 'website'), '"https://www.rescue.org/united-states/kansas-city-ks"');
    assert.equal(field('irc-kc', 'phone'), '"913-558-1659"');
    assert.equal(field('irc-kc', 'states'), '["KS"]');
    assert.equal(field('irc-kc', 'ksResidentRequired'), 'true');
    assert.equal(field('irc-kc', 'fearAddressed'), undefined);
    for (const page of ['src/pages/kc/give-help.astro', 'src/pages/kc/newcomers.astro', 'src/pages/es/kc/newcomers.astro']) {
        assert.doesNotMatch(read(page), /rescue\.org\/united-states\/kansas-city-mo/, page);
    }
});
