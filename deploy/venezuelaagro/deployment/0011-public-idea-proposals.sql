CREATE TABLE IF NOT EXISTS public_idea_proposals (
  id TEXT PRIMARY KEY NOT NULL,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  state TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'published', 'withdrawn')),
  consent_version TEXT NOT NULL,
  consent_at TEXT NOT NULL,
  approved_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (owner_id,request_id),
  CHECK (status != 'published' OR approved_at IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_public_idea_proposals_review ON public_idea_proposals(status, approved_at);
