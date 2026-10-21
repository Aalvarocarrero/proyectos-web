-- Owner-partitioned D1 schema. Apply through the approved Sites/Vinext workflow only.
CREATE TABLE IF NOT EXISTS projects (
  owner_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  project_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (owner_id, project_id)
);

CREATE TABLE IF NOT EXISTS memory_records (
  owner_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  record_id TEXT NOT NULL,
  record_type TEXT NOT NULL,
  at TEXT NOT NULL,
  record_json TEXT NOT NULL,
  PRIMARY KEY (owner_id, project_id, record_id),
  FOREIGN KEY (owner_id, project_id) REFERENCES projects(owner_id, project_id)
);

CREATE INDEX IF NOT EXISTS memory_records_order
  ON memory_records (owner_id, project_id, at DESC, record_id DESC);

CREATE TABLE IF NOT EXISTS operations (
  owner_id TEXT NOT NULL,
  operation_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  record_id TEXT NOT NULL,
  result_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (owner_id, operation_id),
  FOREIGN KEY (owner_id, project_id) REFERENCES projects(owner_id, project_id)
);

CREATE INDEX IF NOT EXISTS operations_project
  ON operations (owner_id, project_id, created_at DESC);

CREATE TRIGGER IF NOT EXISTS projects_immutable_update
BEFORE UPDATE ON projects BEGIN SELECT RAISE(ABORT, 'projects are immutable'); END;
CREATE TRIGGER IF NOT EXISTS projects_immutable_delete
BEFORE DELETE ON projects BEGIN SELECT RAISE(ABORT, 'projects are immutable'); END;
CREATE TRIGGER IF NOT EXISTS memory_records_append_only_update
BEFORE UPDATE ON memory_records BEGIN SELECT RAISE(ABORT, 'memory records are append-only'); END;
CREATE TRIGGER IF NOT EXISTS memory_records_append_only_delete
BEFORE DELETE ON memory_records BEGIN SELECT RAISE(ABORT, 'memory records are append-only'); END;
CREATE TRIGGER IF NOT EXISTS operations_immutable_update
BEFORE UPDATE ON operations BEGIN SELECT RAISE(ABORT, 'operation receipts are immutable'); END;
CREATE TRIGGER IF NOT EXISTS operations_immutable_delete
BEFORE DELETE ON operations BEGIN SELECT RAISE(ABORT, 'operation receipts are immutable'); END;
