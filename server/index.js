import express from 'express';
import cors from 'cors';
import db, { initDatabase } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize DB schema
initDatabase();

// --- AUTH ROUTES ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email' });
  }

  if (password && user.password && user.password !== password) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    reminderDaysDefault: user.reminder_days_default,
    soundEnabled: !!user.sound_enabled,
    currency: user.currency,
    createdAt: user.created_at
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const cleanEmail = email.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, name, email, password, avatar, reminder_days_default, sound_enabled, currency, created_at)
    VALUES (?, ?, ?, ?, ?, 2, 1, '$', ?)
  `).run(id, name.trim() || 'Food Hero', cleanEmail, password || 'password123', avatar, now);

  res.status(201).json({
    id,
    name: name.trim() || 'Food Hero',
    email: cleanEmail,
    avatar,
    reminderDaysDefault: 2,
    soundEnabled: true,
    currency: '$',
    createdAt: now
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email, newPassword } = req.body;
  const user = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email?.trim());
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPassword, user.id);
  res.json({ success: true, message: 'Password updated successfully' });
});

// --- PRODUCT ROUTES ---
app.get('/api/products', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId parameter is required' });

  const rows = db.prepare(`
    SELECT * FROM products WHERE user_id = ? ORDER BY expiry_date ASC
  `).all(userId);

  const products = rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    name: r.name,
    brand: r.brand || '',
    category: r.category,
    quantity: r.quantity,
    purchaseDate: r.purchase_date,
    expiryDate: r.expiry_date,
    storageLocation: r.storage_location,
    reminderPreference: r.reminder_preference,
    price: r.price,
    notes: r.notes,
    photoUrl: r.photo_url,
    isConsumed: !!r.is_consumed,
    isWasted: !!r.is_wasted,
    consumedAt: r.consumed_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }));

  res.json(products);
});

app.post('/api/products', (req, res) => {
  const p = req.body;
  if (!p.userId || !p.name || !p.expiryDate) {
    return res.status(400).json({ error: 'Missing required product fields' });
  }

  const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO products (
      id, user_id, name, brand, category, quantity, purchase_date, expiry_date,
      storage_location, reminder_preference, price, notes, photo_url, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, p.userId, p.name, p.brand || '', p.category || 'Food', p.quantity || '1',
    p.purchaseDate || now.slice(0, 10), p.expiryDate, p.storageLocation || 'Fridge',
    p.reminderPreference ?? 2, p.price || null, p.notes || null, p.photoUrl || null,
    now, now
  );

  res.status(201).json({ id, ...p, createdAt: now, updatedAt: now });
});

app.post('/api/products/batch', (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  const insertStmt = db.prepare(`
    INSERT INTO products (
      id, user_id, name, brand, category, quantity, purchase_date, expiry_date,
      storage_location, reminder_preference, price, notes, photo_url, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const created = [];
  const now = new Date().toISOString();

  const transaction = db.transaction((list) => {
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      const id = `prod_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 7)}`;
      insertStmt.run(
        id, p.userId, p.name, p.brand || '', p.category || 'Food', p.quantity || '1',
        p.purchaseDate || now.slice(0, 10), p.expiryDate, p.storageLocation || 'Fridge',
        p.reminderPreference ?? 2, p.price || null, p.notes || null, p.photoUrl || null,
        now, now
      );
      created.push({ id, ...p, createdAt: now, updatedAt: now });
    }
  });

  transaction(items);
  res.status(201).json(created);
});

app.put('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const p = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE products SET
      name = COALESCE(?, name),
      brand = COALESCE(?, brand),
      category = COALESCE(?, category),
      quantity = COALESCE(?, quantity),
      purchase_date = COALESCE(?, purchase_date),
      expiry_date = COALESCE(?, expiry_date),
      storage_location = COALESCE(?, storage_location),
      reminder_preference = COALESCE(?, reminder_preference),
      price = COALESCE(?, price),
      notes = COALESCE(?, notes),
      photo_url = COALESCE(?, photo_url),
      is_consumed = COALESCE(?, is_consumed),
      is_wasted = COALESCE(?, is_wasted),
      consumed_at = COALESCE(?, consumed_at),
      updated_at = ?
    WHERE id = ?
  `).run(
    p.name, p.brand, p.category, p.quantity, p.purchaseDate, p.expiryDate,
    p.storageLocation, p.reminderPreference, p.price, p.notes, p.photoUrl,
    p.isConsumed !== undefined ? (p.isConsumed ? 1 : 0) : null,
    p.isWasted !== undefined ? (p.isWasted ? 1 : 0) : null,
    p.consumedAt, now, id
  );

  res.json({ success: true });
});

app.delete('/api/products/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Serve frontend in production
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 ExpiryWise Full-Stack Server running on http://localhost:${PORT}`);
});
