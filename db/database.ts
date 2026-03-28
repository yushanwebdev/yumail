import * as SQLite from 'expo-sqlite';

const DB_NAME = 'yumail.db';

let _db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync(DB_NAME);
    _db.execSync('PRAGMA journal_mode = WAL;');
    _db.execSync('PRAGMA foreign_keys = ON;');
    createSchema(_db);
  }
  return _db;
}

function createSchema(db: SQLite.SQLiteDatabase): void {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS emails (
      id              TEXT PRIMARY KEY NOT NULL,
      sender          TEXT NOT NULL,
      from_address    TEXT NOT NULL,
      subject         TEXT NOT NULL DEFAULT '',
      snippet         TEXT NOT NULL DEFAULT '',
      date_display    TEXT NOT NULL DEFAULT '',
      created_at      TEXT NOT NULL,
      created_date    TEXT NOT NULL,
      created_at_ms   INTEGER NOT NULL,
      is_read         INTEGER NOT NULL DEFAULT 0,
      message_id      TEXT,
      has_attachments INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_emails_date_sort
      ON emails(created_date DESC, created_at_ms DESC);

    CREATE INDEX IF NOT EXISTS idx_emails_date_read
      ON emails(created_date, is_read);

    CREATE TABLE IF NOT EXISTS sync_meta (
      key   TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}
