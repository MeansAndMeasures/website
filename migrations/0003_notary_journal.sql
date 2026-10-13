CREATE TABLE IF NOT EXISTS notary_journal_records (
    workspace_hash TEXT NOT NULL,
    record_id TEXT NOT NULL,
    saved_at TEXT NOT NULL,
    entry_hash TEXT NOT NULL,
    previous_hash TEXT NOT NULL,
    iv TEXT NOT NULL,
    ciphertext TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workspace_hash, record_id)
);

CREATE INDEX IF NOT EXISTS idx_notary_journal_workspace_saved
    ON notary_journal_records (workspace_hash, saved_at DESC);
