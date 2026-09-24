import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../expirywise.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for high performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize clean production tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      avatar TEXT,
      reminder_days_default INTEGER DEFAULT 2,
      sound_enabled INTEGER DEFAULT 1,
      currency TEXT DEFAULT '$',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      brand TEXT,
      category TEXT NOT NULL,
      quantity TEXT NOT NULL,
      purchase_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      storage_location TEXT NOT NULL,
      reminder_preference INTEGER DEFAULT 2,
      price REAL,
      notes TEXT,
      photo_url TEXT,
      is_consumed INTEGER DEFAULT 0,
      is_wasted INTEGER DEFAULT 0,
      consumed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
    CREATE INDEX IF NOT EXISTS idx_products_expiry ON products(expiry_date);
  `);
}

export default db;
