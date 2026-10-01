# Migration validation — 2026-10-01

The current live civicbrands.org sitemap was fetched and followed, rather than treating old planning documents as current state.

- All 60 sitemap URLs return HTTP 200 on the local migrated site.
- All 24 additional linked content/resource paths return HTTP 200 locally. The other two source links are generated CSS bundles, replaced by the new build's CSS rather than retained as application dependencies.
- All 56 HTML sitemap pages completed axe-core checks against WCAG 2 A/AA, 2.1 A/AA and 2.2 AA tags, with zero reported violations after fixes.
- Six pages initially overflowed at 320px; affected pages passed a focused recheck after wrapping fixes. The error pages and current brand specimen also pass the automated accessibility and 320px checks.
- Forty WOFF files covering all eight approved families are bundled. Original logo artwork is retained without transformation, alongside font licenses. Historical CivicBrands artwork remains historical, rather than being re-lettered as Means+Measures.
- Keyboard checks pass for the main and KC skip links, visible focus rings, and the brand specimen theme toggle.
- The four linked PDF documents are byte-for-byte identical to the live CivicBrands originals.
- Website and Forecast builds pass. Existing D1 IDs, Worker identities and Forecast cron are retained.

These are local results. Automated checks do not certify full WCAG compliance; manual-review rules are recorded in accessibility-results.json. Forecast is deployed at https://forecast.meansandmeasures.com; /healthz returns {"ok":true}. Version: c36630d4-0b71-4b46-afd8-6e42725bfc59. No remote form submission was performed. The changed Cloudflare token successfully accesses the existing account. Website asset upload is blocked by the environment secret proxy: POST /accounts/dcd87bec1efac6b2926f8e162268b446/workers/assets/upload?base64=true returns HTTP 401 with "Unauthorized: authentication failed for integration codex-secret-api.cloudflare.com" when Wrangler uses Cloudflare's required temporary upload JWT. The website is not deployed. Use a local authenticated Cloudflare session or a platform route supporting asset-upload JWTs; replacing the working account token is unnecessary.

## Live cutover completed

The user uploaded website version af242499-b57c-40fa-a239-f183c45a22b8 from their local CLI. The subsequent domain-binding failure was traced to pre-existing CNAMEs pointing both new hostnames at means-measures.pages.dev. Those two CNAME records were backed up and replaced by individual Workers custom-domain bindings; email and verification records were left unchanged. A zone cache purge removed the old Pages specimen responses. The live homepage now renders Means+Measures and /kc/food renders Food — KC. Live sitemap results are recorded in live-deployment-results.json. Forecast remains live.

Domain shuttering was not performed. Other known old-domain services discovered in the account include api.civicbrands.org (WhatsApp webhook) and ocsp-pki.civicbrands.org (certificate/OCSP service); those are outside the website sitemap and require explicit continuity work before domain retirement.
