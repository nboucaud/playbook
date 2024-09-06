/**
Sqlite
  > STORAGE/workspaces/{workspaceId}.db
     > Table(Snapshots)
     > Table(Updates)
     > Table(...)

Table(Snapshots)
|docId|blob|createdAt|updatedAt|
|-----|----|---------|---------|
| str | bin| Date    | Date    |

Table(Updates)
| id |docId|blob|createdAt|
|----|-----|----|---------|
|auto| str | bin| Date    |
*/
export const WORKSPACE_SQLITE_SCHEMA = `
CREATE TABLE IF NOT EXISTS "updates" (
  doc_id 
  data BLOB NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
);
CREATE TABLE IF NOT EXISTS "blobs" (
  key TEXT PRIMARY KEY NOT NULL,
  data BLOB NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE IF NOT EXISTS "version_info" (
  version NUMBER NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE IF NOT EXISTS "server_clock" (
  key TEXT PRIMARY KEY NOT NULL,
  data BLOB NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE IF NOT EXISTS "sync_metadata" (
  key TEXT PRIMARY KEY NOT NULL,
  data BLOB NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
)
`;
