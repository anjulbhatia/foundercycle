import { DatabaseSync } from "node:sqlite";
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";

let db: DatabaseSync | null = null;

/** DB lives outside the repo so clones stay clean. Override with FOUNDERCYCLE_DB_PATH. */
export function dbPath(): string {
  const p = process.env.FOUNDERCYCLE_DB_PATH;
  if (p) return p;
  return join(homedir(), ".foundercycle", "foundercycle.db");
}

const INLINE_SCHEMA = `
CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  context TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'disconnected',
  scopes TEXT DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'task',
  status TEXT NOT NULL DEFAULT 'planned',
  priority INTEGER DEFAULT 0,
  summary TEXT DEFAULT '',
  links_json TEXT DEFAULT '[]',
  approval_flag INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
  steps_json TEXT DEFAULT '[]',
  result TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);
`;

export function getDb(): DatabaseSync {
  if (db) return db;
  const path = dbPath();
  mkdirSync(dirname(path), { recursive: true });
  db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL;");
  const schemaPath = join(process.cwd(), "db", "schema.sql");
  const sql = existsSync(schemaPath) ? readFileSync(schemaPath, "utf-8") : INLINE_SCHEMA;
  db.exec(sql);
  const providers = ["gmail", "calendar", "notion", "slack", "github"];
  const insert = db.prepare(
    "INSERT OR IGNORE INTO connections (provider, status) VALUES (?, 'disconnected')"
  );
  for (const p of providers) insert.run(p);
  return db;
}

export type Profile = { id: number; name: string; context: string };
export type Connection = { provider: string; status: string };
export type Card = {
  id: number;
  title: string;
  type: string;
  status: string;
  priority: number;
  summary: string;
  links_json: string;
  approval_flag: number;
};

export function getLatestProfile(): Profile | undefined {
  return getDb()
    .prepare("SELECT id, name, context FROM profiles ORDER BY id DESC LIMIT 1")
    .get() as Profile | undefined;
}

/** Next actionable card: planned first, then ongoing, by priority. */
export function getNextCard(): Card | undefined {
  return getDb()
    .prepare(
      `SELECT * FROM cards WHERE status IN ('planned', 'ongoing')
       ORDER BY CASE status WHEN 'planned' THEN 0 ELSE 1 END, priority DESC, id ASC LIMIT 1`
    )
    .get() as Card | undefined;
}

export function listCards(status?: string): Card[] {
  const database = getDb();
  if (status) {
    return database
      .prepare("SELECT * FROM cards WHERE status = ? ORDER BY priority DESC, id DESC")
      .all(status) as Card[];
  }
  return database
    .prepare("SELECT * FROM cards ORDER BY priority DESC, id DESC")
    .all() as Card[];
}

export function updateCard(
  id: number,
  patch: { type?: string; status?: string; summary?: string; links?: string[] }
): void {
  const sets: string[] = [];
  const params: unknown[] = [];
  if (patch.type !== undefined) {
    sets.push("type = ?");
    params.push(patch.type);
  }
  if (patch.status !== undefined) {
    sets.push("status = ?");
    params.push(patch.status);
  }
  if (patch.summary !== undefined) {
    sets.push("summary = ?");
    params.push(patch.summary);
  }
  if (patch.links !== undefined) {
    sets.push("links_json = ?");
    params.push(JSON.stringify(patch.links));
  }
  if (sets.length === 0) return;
  params.push(id);
  getDb().prepare(`UPDATE cards SET ${sets.join(", ")} WHERE id = ?`).run(...params);
}

export function createRun(cardId: number, steps: string[], result: string): number {
  const res = getDb()
    .prepare("INSERT INTO runs (card_id, steps_json, result) VALUES (?, ?, ?)")
    .run(cardId, JSON.stringify(steps), result);
  return Number(res.lastInsertRowid);
}
