import { Product, User, WasteMetrics } from '../types';
import { calculateDateOffset, getTodayString, getDaysRemaining } from '../utils/dateUtils';

const USERS_KEY = 'expirywise_users_v1';
const CURRENT_USER_KEY = 'expirywise_current_user_v1';
const PRODUCTS_KEY = 'expirywise_products_v1';
const API_BASE = 'http://localhost:3001/api';

// Initial Demo User
export const DEMO_USER: User = {
  id: 'usr_demo_eco_chef',
  name: 'Emma Green',
  email: 'emma@expirywise.app',
  password: 'password123',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  reminderDaysDefault: 2,
  soundEnabled: true,
  currency: '$',
  createdAt: '2026-09-01T08:00:00.000Z'
};

// Seed sample products for Emma Green (Local fallback / seed)
export function getInitialDemoProducts(userId: string): Product[] {
  const today = getTodayString();

  return [
    {
      id: 'p_demo_1',
      userId,
      name: 'Organic Whole Milk',
      brand: 'Organic Valley',
      category: 'Beverages',
      quantity: '1 Gallon',
      purchaseDate: calculateDateOffset(-6, today),
      expiryDate: today, // Expiring Today!
      storageLocation: 'Fridge',
      reminderPreference: 1,
      price: 4.89,
      notes: 'Opened 3 days ago. Great for pancakes or tea today!',
      photoUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=80',
      createdAt: calculateDateOffset(-6, today),
      updatedAt: calculateDateOffset(-6, today)
    },
    {
      id: 'p_demo_2',
      userId,
      name: 'Greek Yogurt 0% Fat',
      brand: 'Chobani',
      category: 'Food',
      quantity: '4 x 150g',
      purchaseDate: calculateDateOffset(-10, today),
      expiryDate: calculateDateOffset(2, today), // Expiring soon (2 days)
      storageLocation: 'Fridge',
      reminderPreference: 2,
      price: 3.99,
      notes: 'Smooth texture for breakfast bowls.',
      photoUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&auto=format&fit=crop&q=80',
      createdAt: calculateDateOffset(-10, today),
      updatedAt: calculateDateOffset(-10, today)
    },
    {
      id: 'p_demo_3',
      userId,
      name: 'Sourdough Country Loaf',
      brand: 'Artisan Bakery',
      category: 'Food',
      quantity: '1 Loaf',
      purchaseDate: calculateDateOffset(-4, today),
      expiryDate: calculateDateOffset(1, today), // Expiring tomorrow (1 day)
      storageLocation: 'Pantry',
      reminderPreference: 1,
      price: 4.50,
      notes: 'Make garlic toast or croutons if not finished.',
      photoUrl: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=300&auto=format&fit=crop&q=80',
      createdAt: calculateDateOffset(-4, today),
      updatedAt: calculateDateOffset(-4, today)
    },
    {
      id: 'p_demo_4',
      userId,
      name: 'Organic Baby Spinach',
      brand: 'Earthbound Farm',
      category: 'Food',
      quantity: '300g tub',
      purchaseDate: calculateDateOffset(-8, today),
      expiryDate: calculateDateOffset(-2, today), // Expired 2 days ago
      storageLocation: 'Fridge',
      reminderPreference: 2,
      price: 3.29,
      notes: 'Check for wilting. If still firm, cook into pasta sauce.',
      photoUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&auto=format&fit=crop&q=80',
      createdAt: calculateDateOffset(-8, today),
      updatedAt: calculateDateOffset(-8, today)
    },
    {
      id: 'p_demo_5',
      userId,
      name: 'Fresh Free-Range Eggs',
      brand: 'Vital Farms',
      category: 'Food',
      quantity: '12 Large Eggs',
      purchaseDate: calculateDateOffset(-5, today),
      expiryDate: calculateDateOffset(18, today), // Fresh (18 days left)
      storageLocation: 'Fridge',
      reminderPreference: 3,
      price: 4.99,
      notes: 'Pasture-raised grade A.',
      photoUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&auto=format&fit=crop&q=80',
      createdAt: calculateDateOffset(-5, today),
      updatedAt: calculateDateOffset(-5, today)
    },
    {
      id: 'p_demo_6',
      userId,
      name: 'Sharp Cheddar Cheese Block',
      brand: 'Cabot Creamery',
      category: 'Food',
      quantity: '250g',
      purchaseDate: calculateDateOffset(-3, today),
      expiryDate: calculateDateOffset(25, today), // Fresh
      storageLocation: 'Fridge',
      reminderPreference: 3,
      price: 3.89,
      notes: 'Keep wrapped tightly in parchment.',
      photoUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&auto=format&fit=crop&q=80',
      createdAt: calculateDateOffset(-3, today),
      updatedAt: calculateDateOffset(-3, today)
    },
    {
      id: 'p_demo_7',
      userId,
      name: 'Ibuprofen Pain Reliever',
      brand: 'Advil',
      category: 'Medicine',
      quantity: '100 caplets',
      purchaseDate: calculateDateOffset(-60, today),
      expiryDate: calculateDateOffset(450, today), // Fresh
      storageLocation: 'Medicine Cabinet',
      reminderPreference: 7,
      price: 11.99,
      notes: '200mg caplets in medicine cabinet.',
      photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
      createdAt: calculateDateOffset(-60, today),
      updatedAt: calculateDateOffset(-60, today)
    },
    {
      id: 'p_demo_8',
      userId,
      name: 'Moisturizing Sunscreen SPF 50',
      brand: 'La Roche-Posay',
      category: 'Cosmetics',
      quantity: '50ml',
      purchaseDate: calculateDateOffset(-30, today),
      expiryDate: calculateDateOffset(280, today), // Fresh
      storageLocation: 'Bathroom',
      reminderPreference: 14,
      price: 19.99,
      notes: 'Broad spectrum UV protection.',
      photoUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80',
      createdAt: calculateDateOffset(-30, today),
      updatedAt: calculateDateOffset(-30, today)
    },
    {
      id: 'p_demo_9',
      userId,
      name: 'Soothing Eye Drops',
      brand: 'Refresh Tears',
      category: 'Medicine',
      quantity: '15ml bottle',
      purchaseDate: calculateDateOffset(-35, today),
      expiryDate: calculateDateOffset(-5, today), // Expired 5 days ago
      storageLocation: 'Medicine Cabinet',
      reminderPreference: 3,
      price: 9.49,
      notes: 'Discard after 30 days of opening.',
      photoUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&auto=format&fit=crop&q=80',
      createdAt: calculateDateOffset(-35, today),
      updatedAt: calculateDateOffset(-35, today)
    }
  ];
}

// User methods
export function getRegisteredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      const initial = [DEMO_USER];
      localStorage.setItem(USERS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [DEMO_USER];
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
    if (!raw) {
      return [];
    }
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
  const userProds = all.filter(p => p.userId === userId);
  
  if (userProds.length === 0 && userId === DEMO_USER.id) {
    const demoProds = getInitialDemoProducts(userId);
    const updated = [...all, ...demoProds];
    saveAllProducts(updated);
    return demoProds;
  }

  return userProds;
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
