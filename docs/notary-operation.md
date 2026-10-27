# Private online journal

Start at https://meansandmeasures.com/api/notary/session (the website footer's
**Journal sign-in** link). Access authenticates the API application first, then
the route redirects to `/notary/`, protected by the existing UI application.
Both applications allow only `brian@meansandmeasures.com`, use the existing
identity providers and eight-hour sessions, and also cover the corresponding
`www.meansandmeasures.com` paths. Their audiences remain distinct; the records
API continues to validate the original API audience and signed owner identity.
Existing app/policy identities were retained rather than replacing authentication.

If a journal was opened directly and synchronization needs another session,
use its **Sign in to journal** link. The handoff reads no records, generates no
keys and returns only to the journal on the same recognized hostname. The main
and `www` hostnames have separate browser storage: use the hostname/browser
containing your existing keys, or import its encrypted recovery bundle into a
fresh browser. Signing in alone does not transfer encryption keys.

## Data and verification

The UI encrypts cloud record contents with AES-GCM. Access identity, workspace
signatures, replay checks, append idempotency and hash chaining are enforced by
`src/pages/api/notary/records.ts`. Browser signing/decryption keys remain in
IndexedDB; recovery bundles preserve the supported transfer path. Import does
not overwrite an already initialized browser identity. Do not clear journal
storage to troubleshoot login. KC departure now only removes `kc-` preferences.

The production schema already contained migrations 0003–0005 before this work;
their reviewed tables, columns and indexes were reconciled with migration
tracking. Do not rerun the ALTER TABLE statements against an existing schema.
No existing record, workspace owner or browser key was reassigned.

Check logged-out access on both hostnames: `/notary/`, `/notary/index.html`,
`/notary/app.js`, `/api/notary/session` and `/api/notary/records` must require
Access authentication. Normal website pages stay public. The API also rejects
requests without a verified Access JWT even if an edge route is misconfigured.
Journal assets and API responses use no-store policies. Local ID images remain
local; their `data:`/`blob:` rendering is allowed only in the journal CSP.

Owner acceptance: sign in, use the browser containing existing keys (or import
an existing recovery bundle), verify synchronization, and inspect a real existing
record. This implementation does not create a fictitious notarial act to test
production. Full owner-session/key acceptance is separate from verifying login
gates and schema. Existing notarial/legal copy was not recertified in this change.

## Rollback

The added footer/sign-in route and UI link can be reverted together; existing
direct journal access remains. Access changes only added the matching `www`
destinations to each existing app. Remove those secondary destinations to restore
their prior hostname coverage while retaining owner-only policies. Schema-history
reconciliation changed migration bookkeeping, not journal data or table structure.
