CREATE TABLE IF NOT EXISTS kc_suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submitted_at TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'suggest',
  org_name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  urgent INTEGER NOT NULL DEFAULT 0,
  submitter_name TEXT NOT NULL DEFAULT '',
  submitter_contact TEXT NOT NULL DEFAULT '',
  translation_contribution TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  remote_address TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_kc_suggestions_submitted_at
  ON kc_suggestions (submitted_at DESC);
