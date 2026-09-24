import { Product, User, WasteMetrics } from '../types';
import { getDaysRemaining } from '../utils/dateUtils';

const USERS_KEY = 'expirywise_users_v1';
const CURRENT_USER_KEY = 'expirywise_current_user_v1';
const PRODUCTS_KEY = 'expirywise_products_v1';
const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api');

// User methods
export function getRegisteredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRegisteredUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

// Product Storage Methods (User Isolated + SQLite DB Synchronized)
export function getAllProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAllProducts(products: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function getUserProducts(userId: string): Product[] {
  const all = getAllProducts();
  return all.filter(p => p.userId === userId);
}

export function addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const all = getAllProducts();
  const newProduct: Product = {
    ...product,
    id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  all.unshift(newProduct);
  saveAllProducts(all);

  // Async sync to SQLite backend
  fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  }).catch(() => {});

  return newProduct;
}

export function addMultipleProducts(products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]): Product[] {
  const all = getAllProducts();
  const created: Product[] = [];

  products.forEach((p, idx) => {
    const newProd: Product = {
      ...p,
      id: `prod_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    created.push(newProd);
    all.unshift(newProd);
  });

  saveAllProducts(all);

  // Async sync to SQLite backend
  fetch(`${API_BASE}/products/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: products })
  }).catch(() => {});

  return created;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const all = getAllProducts();
  const index = all.findIndex(p => p.id === id);
  if (index === -1) return null;

  const updated: Product = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  all[index] = updated;
  saveAllProducts(all);

  // Async sync to SQLite backend
  fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  }).catch(() => {});

  return updated;
}

export function deleteProduct(id: string): boolean {
  const all = getAllProducts();
  const filtered = all.filter(p => p.id !== id);
  if (filtered.length === all.length) return false;
  saveAllProducts(filtered);

  // Async sync to SQLite backend
  fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE'
  }).catch(() => {});

  return true;
}

export function markProductAsConsumed(id: string): Product | null {
  return updateProduct(id, {
    isConsumed: true,
    isWasted: false,
    consumedAt: new Date().toISOString()
  });
}

export function markProductAsWasted(id: string): Product | null {
  return updateProduct(id, {
    isConsumed: false,
    isWasted: true,
    consumedAt: new Date().toISOString()
  });
}

// Waste & Eco Analytics
export function computeUserMetrics(userId: string): WasteMetrics {
  const userProducts = getUserProducts(userId);
  let totalTracked = userProducts.length;
  let consumedCount = 0;
  let wastedCount = 0;
  let moneySaved = 0;
  let moneyWasted = 0;

  userProducts.forEach(p => {
    const price = p.price || 3.50;
    if (p.isConsumed) {
      consumedCount++;
      moneySaved += price;
    } else if (p.isWasted) {
      wastedCount++;
      moneyWasted += price;
    } else {
      const days = getDaysRemaining(p.expiryDate);
      if (days < 0) {
        wastedCount++;
        moneyWasted += price;
      }
    }
  });

  const co2PreventedKg = parseFloat((consumedCount * 0.85).toFixed(1));

  return {
    totalTracked,
    consumedCount,
    wastedCount,
    moneySaved: parseFloat(moneySaved.toFixed(2)),
    moneyWasted: parseFloat(moneyWasted.toFixed(2)),
    co2PreventedKg
  };
}

// Export / Backup
export function exportUserDataAsCSV(userId: string): string {
  const products = getUserProducts(userId);
  const headers = ['Product Name', 'Brand', 'Category', 'Quantity', 'Storage Location', 'Purchase Date', 'Expiry Date', 'Status', 'Price', 'Notes'];
  
  const rows = products.map(p => {
    const days = getDaysRemaining(p.expiryDate);
    const status = days < 0 ? 'Expired' : days === 0 ? 'Expiring Today' : days <= 3 ? 'Expiring Soon' : 'Fresh';
    return [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${(p.brand || '').replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.quantity}"`,
      `"${p.storageLocation}"`,
      p.purchaseDate,
      p.expiryDate,
      status,
      p.price || 0,
      `"${(p.notes || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
