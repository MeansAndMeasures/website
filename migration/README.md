# CivicBrands → Means+Measures cutover

Target: https://meansandmeasures.com and https://forecast.meansandmeasures.com. The old domain will be shuttered; this deployment has no redirect dependency.

The URL map records the current live CivicBrands sitemap. All source page routes and public downloads are retained. Historical filings and original brand material retain attribution. The current brand comes from meansandmeasures.com, CSS release 1.0.0 / Identity Standard v1.5, approved artwork dated 2026-09-24. Its specimen is preserved under /means-measures/index.html; its root CSS/font/asset URLs are also retained.

Deploy the website as the meansandmeasures-website Worker with the meansandmeasures-intake D1 database bound as INTAKE_DB (data copied row-for-row from the legacy civicbrands-intake database; the legacy civicbrands-website Worker and civicbrands-intake database remain in the account until explicitly retired). Deploy Forecast using its existing forecast Worker, D1 ID and cron. Both configurations bind the new custom domains. Do not create empty replacement databases.

The Cloudflare token now accesses the existing account. Forecast is deployed; the website asset upload is blocked because this environment secret proxy rejects Cloudflare temporary upload JWTs. Deploy the website from an authenticated local session. DNS/custom-domain ownership and mail delivery must be configured in that account. All mail links now use meansandmeasures.com with existing mailbox local-parts; the code does not provision mailboxes. Update the external FAA relay FORECAST_INGEST_URL to https://forecast.meansandmeasures.com/ingest/notam, retaining the existing INGEST_TOKEN.

The DID document is relocated to did:web:meansandmeasures.com with its existing public verification key. Previously issued credentials using did:web:civicbrands.org need issuer-side reissuance or another explicit continuity arrangement before the old domain is removed; changing a document cannot rewrite issued credentials.

Website: npm run build; node node_modules/wrangler/bin/wrangler.js deploy --keep-vars.
Forecast: npm run build; node node_modules/wrangler-direct/bin/wrangler.js deploy --keep-vars. The repository's production gate now accepts MeansAndMeasures/forecast; it also requires committed source and performs its own release checks.

No old-domain shutdown, DNS deletion, database migration, or external mailbox changes were performed by this code change. Publish the new surfaces and update external integrations before shuttering the old domain.
