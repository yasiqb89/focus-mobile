import * as SQLite from "expo-sqlite";

const DB_NAME = "focus_mobile.db";
const SNAPSHOT_KEY = "focus-state";

type KeyValueRow = {
  value: string;
};

let db: SQLite.SQLiteDatabase | null = null;

function getDb() {
  if (!db) {
    db = SQLite.openDatabaseSync(DB_NAME);
    db.execSync(
      "CREATE TABLE IF NOT EXISTS key_value (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL, updated_at TEXT NOT NULL)"
    );
  }
  return db;
}

export function loadSnapshot<T>(): T | null {
  try {
    const row = getDb().getFirstSync<KeyValueRow>(
      "SELECT value FROM key_value WHERE key = ?",
      SNAPSHOT_KEY
    );
    return row ? (JSON.parse(row.value) as T) : null;
  } catch {
    return null;
  }
}

export function saveSnapshot<T>(snapshot: T): void {
  try {
    getDb().runSync(
      "INSERT OR REPLACE INTO key_value (key, value, updated_at) VALUES (?, ?, ?)",
      SNAPSHOT_KEY,
      JSON.stringify(snapshot),
      new Date().toISOString()
    );
  } catch {
    // Persistence is best-effort in the MVP; the in-memory state remains authoritative.
  }
}
