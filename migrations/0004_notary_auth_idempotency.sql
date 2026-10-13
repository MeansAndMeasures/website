CREATE TABLE IF NOT EXISTS notary_workspaces (
    workspace_hash TEXT PRIMARY KEY,
    public_key_jwk TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT
);

CREATE TABLE IF NOT EXISTS notary_auth_requests (
    workspace_hash TEXT NOT NULL,
    request_id TEXT NOT NULL,
    request_timestamp TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workspace_hash, request_id)
);

ALTER TABLE notary_journal_records ADD COLUMN idempotency_key TEXT;
ALTER TABLE notary_journal_records ADD COLUMN body_sha256 TEXT;
ALTER TABLE notary_journal_records ADD COLUMN paper_copy_sha256 TEXT;
ALTER TABLE notary_journal_records ADD COLUMN access_identity TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_notary_journal_idempotency
    ON notary_journal_records (workspace_hash, idempotency_key);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notary_journal_prev_hash
    ON notary_journal_records (workspace_hash, previous_hash);

CREATE INDEX IF NOT EXISTS idx_notary_auth_created
    ON notary_auth_requests (created_at);
