ALTER TABLE intake_submissions ADD COLUMN email_status TEXT NOT NULL DEFAULT 'not_requested';
ALTER TABLE intake_submissions ADD COLUMN email_message_id TEXT;
ALTER TABLE intake_submissions ADD COLUMN email_sent_at TEXT;
