import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'

const DB_PATH = './data/storystudio.db'

// Ensure data directory exists
const dbDir = dirname(DB_PATH)
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true })
}

const sqlite = new Database(DB_PATH)
export const db = drizzle(sqlite, { schema })

// Initialize tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    settings TEXT NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    metadata TEXT NOT NULL DEFAULT '{}',
    source TEXT NOT NULL DEFAULT 'user' CHECK(source IN ('ai', 'user')),
    locked INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_events_project_id ON events(project_id);
  CREATE INDEX IF NOT EXISTS idx_events_order ON events(project_id, order_index);
`)

export { schema }
