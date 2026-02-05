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

  CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY,
    source_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    full_url TEXT NOT NULL,
    source TEXT NOT NULL,
    license TEXT NOT NULL DEFAULT '',
    title TEXT DEFAULT '',
    creator TEXT DEFAULT '',
    date TEXT DEFAULT '',
    medium TEXT DEFAULT '',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS event_images (
    event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    image_id TEXT NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    explanation TEXT DEFAULT '',
    explanation_locked INTEGER NOT NULL DEFAULT 0,
    selected INTEGER NOT NULL DEFAULT 0,
    dismissed INTEGER NOT NULL DEFAULT 0,
    order_index INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (event_id, image_id)
  );

  CREATE INDEX IF NOT EXISTS idx_event_images_event ON event_images(event_id);
`)

export { schema }
