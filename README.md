# Means+Measures website

Public website, KC resource navigation and exports, research/artifact publishing,
contact intake, and the private Kansas notary journal. Astro renders the site on
Cloudflare Workers; `wrangler.jsonc` targets `meansandmeasures.com` and
`www.meansandmeasures.com`. Development branch: `Prime`.

## Structure

- `src/pages/`: public pages, discovery/export endpoints, intake and notary APIs.
- `src/content/` and `src/content.config.ts`: validated services, work, research
  and artifacts. Update source records rather than generated exports.
- `src/data/kcMachine.ts`, `src/lib/kcMachine.ts`, `src/lib/resourceGraph.ts`:
  journey/relationship definitions, validation and common resource representations.
- `src/components/`, `src/layouts/`, `src/styles/`: shared presentation and KC controls.
- `public/`: identity assets, documents and browser-side notary application.
- `migrations/`: D1 schema history; `tests/`: focused Node regression checks.
- `dist/`, `.astro/`, `.wrangler/`: generated output or local runtime state.

## Homepage and finder

`src/pages/index.astro` is a landing page, not an index of pages, and it is
one screen. The name and the mark hold still while the page scrolls; the
statement beside them crossfades in place, one per scroll step: the intro with
the primary action, the two principles, the two directions (each draws its
rule down or up), and the close. The halves of the tagline and a four-item
index jump to their statement; the index line fills with progress; arrow keys
step through. Behaviour is `public/lib/stage.js` (static file, CSP). Without
script the statements follow one another as ordinary content. Do not add link
lists, tiles or a search field to it.

The finder (`src/components/SiteFinder.astro`) is opened from the header on
every page (the Find button, or `/`) and sits inline on the 404 page.

- `src/data/finder.ts`: the hand-kept routes, each with the words a person is
  likely to type. The finder lists nothing until someone types.
- `src/pages/find.json.ts`: prerendered index; adds work, research and
  artifacts from the content collections automatically. The KC directory is
  one project: it has one entry plus the crisis page, and its own pages and
  services are searched at `/kc/directory`, not here.
- `public/lib/finder.js`: matching and the combobox behaviour. A static file
  because the site CSP allows only same-origin script files and no inline
  script or style. Crisis words always put `/kc/crisis` first.
- Without script the field submits to `/sitemap`. `tests/finder.test.mjs` covers the matching rules.

`public/means-measures/assets/web/` holds 8-bit sRGB derivatives of the logo
masters for the header, icons and error page. Regenerate them from the masters
when the masters change; do not edit them by hand.

## Development and checks

Use Node.js 24 or a newer supported even-numbered release with npm. 
Install locked dependencies with `npm ci`; 
build-tool
script approvals are in `.npmrc`. 
`npm run dev` serves the local site at port 4321.
`npm run build` generates the production Worker and assets; 
`npm run preview` previews the built application. 
`node --test tests/*.test.mjs` runs departure and intake regressions. 
`node --check public/notary/app.js` checks journal syntax.

After changing bindings, run
`npx wrangler types src/worker-configuration.d.ts --include-runtime false`.
Runtime APIs come from the pinned Workers types. Keep Cloudflare secrets out of
source and command arguments. Local bindings use local data and simulate email
unless explicitly configured as remote; a local success is not delivery evidence.

## Intake operation

`POST /api/intake` validates input and stores it in `INTAKE_DB` before sending a
notification through `INTAKE_EMAIL`. General inquiries go to
`contact@meansandmeasures.com`; procurement goes to `procurement@meansandmeasures.com`.
Sender: `website@contact.meansandmeasures.com`, using the existing enabled sending
subdomain. The submitter's address becomes Reply-To, never the envelope sender.
Inbound mailbox DNS is independent of this outgoing binding.

Migration `0006_intake_email.sql` adds notification status, message ID and timestamp.
An email failure retains the submission and records `failed`; HTTP 202 acknowledges
durable receipt. Automatic email retries are not implemented. Review pending/failed
notifications through the authenticated export or D1, and follow up manually.
`GET /api/intake/export` requires `Authorization: Bearer INTAKE_EXPORT_TOKEN` and
returns the latest 250 submissions with notification status. Keep exports private.
KC suggestions have a separate export token and review workflow.

## Notary journal
[![Verify Kansas Notary Journal](https://github.com/MeansAndMeasures/website/actions/workflows/notary-verify.yml/badge.svg)](https://github.com/MeansAndMeasures/website/actions/workflows/notary-verify.yml)

`public/notary/` contains the browser UI; 
`/api/notary/records` stores encrypted records in D1. 
Cloudflare Access login, the API's verified identity, workspace signatures and journal encryption serve different purposes. Preserve the browser's IndexedDB keys and recovery bundle; a login alone does not recover encryption keys.
KC departure only removes `kc-` preference keys and preserves journal state.
Journal migrations are `0003`–`0005`; verify production migration state before use.

## Release and contribution

Follow `AGENTS.md` and the hub's master TODO/claim workflow. Preserve existing
uncommitted work; use bounded commits and meaningful checks. Content uses stable
slugs and source references. Follow neighboring TypeScript/Astro conventions
(four-space indentation in most application files); no formatter/linter script
is configured. Explain behavior, validation and remaining limits in pull requests.

Check the intended account and pending migrations with `npx wrangler whoami` and
`npx wrangler d1 migrations list meansandmeasures-intake --remote`. Apply only
reviewed schema changes. `npm run deploy` rebuilds and deploys; bare `wrangler deploy`
can publish an older build. Verify affected public routes and bindings afterward.
The existing notary GitHub workflow builds and deploys selected journal/migration
changes on `Prime`; inspect workflow results after a matching push.

### Rotate the deployment token through GitHub OAuth

Use GitHub CLI's OAuth login flow and the repository script to update
`CLOUDFLARE_API_TOKEN` without copying the token into shell history.

1. Authenticate with GitHub CLI OAuth: `gh auth login`.
2. Run `node scripts/set-cloudflare-token.mjs` from this repository root.
3. Paste the new Cloudflare API token when prompted (input is masked).

The script verifies token validity and account access before updating the
repository secret. To target a different repository, pass `owner/name` as the
first argument.
