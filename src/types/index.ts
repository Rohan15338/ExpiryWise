export type Category = 'Food' | 'Beverages' | 'Medicine' | 'Cosmetics' | 'Household' | 'Other';

export type StorageLocation = 
  | 'Fridge'
  | 'Freezer'
  | 'Pantry'
  | 'Medicine Cabinet'
  | 'Bathroom'
  | 'Vanity'
  | 'Kitchen Shelf'
  | 'Other';

export type ProductStatus = 'fresh' | 'expiring_today' | 'expiring_soon' | 'expired';

export interface Product {
  id: string;
  userId: string;
  name: string;
  brand: string;
  category: Category;
  quantity: string;
  purchaseDate: string; // YYYY-MM-DD
  expiryDate: string;   // YYYY-MM-DD
  storageLocation: StorageLocation;
  photoUrl?: string;
  reminderPreference: number; // days before expiry: 0 (same day), 1, 2, 3, 7, 14
  price?: number;
  notes?: string;
  isConsumed?: boolean;
  isWasted?: boolean;
  consumedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  reminderDaysDefault: number;
  soundEnabled: boolean;
  currency: string;
  createdAt: string;
}

export interface ScannedBillItem {
  tempId: string;
  name: string;
  brand: string;
  category: Category;
  quantity: string;
  price?: number;
  purchaseDate: string;
  expiryDate: string;
  storageLocation: StorageLocation;
  confidence: number;
  selected: boolean;
  shelfLifeDaysSuggested: number;
  shelfLifeReason: string;
}

export interface WasteMetrics {
  totalTracked: number;
  consumedCount: number;
  wastedCount: number;
  moneySaved: number;
  moneyWasted: number;
  co2PreventedKg: number;
}

export interface NotificationItem {
  id: string;
  productId: string;
  productName: string;
  category: Category;
  expiryDate: string;
  daysRemaining: number;
  status: ProductStatus;
  read: boolean;
  createdAt: string;
}
