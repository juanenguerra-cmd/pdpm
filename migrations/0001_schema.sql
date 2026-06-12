CREATE TABLE IF NOT EXISTS resident_rows (
  id TEXT PRIMARY KEY,
  position INTEGER NOT NULL DEFAULT 0,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_resident_rows_position ON resident_rows(position);
CREATE INDEX IF NOT EXISTS idx_resident_rows_updated_at ON resident_rows(updated_at);
