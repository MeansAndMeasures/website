-- Journal signing keys are authorized under a person, not treated as the owner.
-- Existing workspaces require explicit owner migration rather than implicit takeover.
ALTER TABLE notary_workspaces ADD COLUMN owner_identity TEXT;
CREATE INDEX IF NOT EXISTS idx_notary_workspace_owner ON notary_workspaces (owner_identity);
