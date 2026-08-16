CREATE TABLE IF NOT EXISTS intake_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submitted_at TEXT NOT NULL,
    recipient TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    topic TEXT NOT NULL,
    message TEXT NOT NULL,
    user_agent TEXT NOT NULL DEFAULT '',
    remote_address TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_intake_submissions_submitted_at
    ON intake_submissions (submitted_at DESC);
