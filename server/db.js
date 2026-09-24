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

// Initialize tables
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

  // Seed default demo user if not exists
  const demoUser = db.prepare('SELECT id FROM users WHERE id = ?').get('usr_demo_eco_chef');
  if (!demoUser) {
    const today = new Date().toISOString().slice(0, 10);
    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, password, avatar, reminder_days_default, sound_enabled, currency, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      'usr_demo_eco_chef',
      'Emma Green',
      'emma@expirywise.app',
      'password123',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      2,
      1,
      '$',
      new Date().toISOString()
    );

    // Seed sample products
    const insertProduct = db.prepare(`
      INSERT INTO products (
        id, user_id, name, brand, category, quantity, purchase_date, expiry_date, 
        storage_location, reminder_preference, price, notes, photo_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const offsetDate = (days) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0, 10);
    };

    const demoProducts = [
      ['p_demo_1', 'usr_demo_eco_chef', 'Organic Whole Milk', 'Organic Valley', 'Beverages', '1 Gallon', offsetDate(-6), today, 'Fridge', 1, 4.89, 'Opened 3 days ago. Great for pancakes or tea today!', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=80', offsetDate(-6), offsetDate(-6)],
      ['p_demo_2', 'usr_demo_eco_chef', 'Greek Yogurt 0% Fat', 'Chobani', 'Food', '4 x 150g', offsetDate(-10), offsetDate(2), 'Fridge', 2, 3.99, 'Smooth texture for breakfast bowls.', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&auto=format&fit=crop&q=80', offsetDate(-10), offsetDate(-10)],
      ['p_demo_3', 'usr_demo_eco_chef', 'Sourdough Country Loaf', 'Artisan Bakery', 'Food', '1 Loaf', offsetDate(-4), offsetDate(1), 'Pantry', 1, 4.50, 'Make garlic toast or croutons if not finished.', 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=300&auto=format&fit=crop&q=80', offsetDate(-4), offsetDate(-4)],
      ['p_demo_4', 'usr_demo_eco_chef', 'Organic Baby Spinach', 'Earthbound Farm', 'Food', '300g tub', offsetDate(-8), offsetDate(-2), 'Fridge', 2, 3.29, 'Check for wilting. If still firm, cook into pasta sauce.', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&auto=format&fit=crop&q=80', offsetDate(-8), offsetDate(-8)],
      ['p_demo_5', 'usr_demo_eco_chef', 'Fresh Free-Range Eggs', 'Vital Farms', 'Food', '12 Large Eggs', offsetDate(-5), offsetDate(18), 'Fridge', 3, 4.99, 'Pasture-raised grade A.', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&auto=format&fit=crop&q=80', offsetDate(-5), offsetDate(-5)],
      ['p_demo_6', 'usr_demo_eco_chef', 'Sharp Cheddar Cheese Block', 'Cabot Creamery', 'Food', '250g', offsetDate(-3), offsetDate(25), 'Fridge', 3, 3.89, 'Keep wrapped tightly in parchment.', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&auto=format&fit=crop&q=80', offsetDate(-3), offsetDate(-3)],
      ['p_demo_7', 'usr_demo_eco_chef', 'Ibuprofen Pain Reliever', 'Advil', 'Medicine', '100 caplets', offsetDate(-60), offsetDate(450), 'Medicine Cabinet', 7, 11.99, '200mg caplets in medicine cabinet.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80', offsetDate(-60), offsetDate(-60)],
      ['p_demo_8', 'usr_demo_eco_chef', 'Moisturizing Sunscreen SPF 50', 'La Roche-Posay', 'Cosmetics', '50ml', offsetDate(-30), offsetDate(280), 'Bathroom', 14, 19.99, 'Broad spectrum UV protection.', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80', offsetDate(-30), offsetDate(-30)],
      ['p_demo_9', 'usr_demo_eco_chef', 'Soothing Eye Drops', 'Refresh Tears', 'Medicine', '15ml bottle', offsetDate(-35), offsetDate(-5), 'Medicine Cabinet', 3, 9.49, 'Discard after 30 days of opening.', 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&auto=format&fit=crop&q=80', offsetDate(-35), offsetDate(-35)]
    ];

    for (const p of demoProducts) {
      insertProduct.run(...p);
    }
  }
}

export default db;
