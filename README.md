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

## Development and checks

Use Node.js 24 or a newer supported even-numbered release with npm. Install locked dependencies with `npm ci`; build-tool
script approvals are in `.npmrc`. `npm run dev` serves the local site at port 4321.
`npm run build` generates the production Worker and assets; `npm run preview`
previews the built application. `node --test tests/*.test.mjs` runs departure
and intake regressions. `node --check public/notary/app.js` checks journal syntax.

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
`GET /api/intake/export` accepts the shared owner session or `Authorization: Bearer INTAKE_EXPORT_TOKEN` and
returns the latest 250 submissions with notification status. Keep exports private.
KC suggestions use the same owner session, with a separate legacy export token for automation.

## Shared website sign-in

`/account/` is the private workspace; `/auth/login?returnTo=/notary/` is the public
sign-in entry. The website Access application uses the existing notary API audience
and protects the workspace, journal UI/API, and `/api/auth/session`. Both website
hostnames belong to this one application. The deployed application ID, audience, destinations and owner policy are recorded
in `config/website-access.json`; this file contains no credentials and is a
readback reference, not an automatic deployment script. `src/lib/websiteAuth.ts` verifies signed
Access assertions and owns the permission map. The current owner retains journal,
intake, suggestions, connection and CivicNavigator permissions. Never infer journal ownership from
a different upstream subject or change the stored workspace identity during login.

Private export handlers accept the shared identity as well as their existing
export tokens for automation. Export routes remain outside the edge login gate so
existing bearer-token jobs continue working; origin authorization is mandatory.
The private workspace renders their results without exposing export tokens.
`/api/auth/session` returns only the verified subject, email, permissions and expiry;
it never returns credentials. Public site pages and intake submission stay public.

## Notary journal

`public/notary/` contains the browser UI; `/api/notary/records` stores encrypted
records in D1. Cloudflare Access login, the API's verified identity, workspace
signatures and journal encryption serve different purposes. Preserve the browser's
IndexedDB keys and recovery bundle; a login alone does not recover encryption keys.
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
