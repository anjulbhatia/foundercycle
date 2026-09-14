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

CREATE TABLE IF NOT EXISTS agent_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  model TEXT NOT NULL DEFAULT 'auto',
  approval_mode TEXT NOT NULL DEFAULT 'manual',
  review_threshold REAL NOT NULL DEFAULT 0.5,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
