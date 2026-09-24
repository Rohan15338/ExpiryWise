import { Category, StorageLocation } from '../types';

export interface ShelfLifeRule {
  keywords: string[];
  category: Category;
  defaultLocation: StorageLocation;
  shelfLifeDays: number;
  reason: string;
  brandHint?: string;
}

export const SHELF_LIFE_DATABASE: ShelfLifeRule[] = [
  // Dairy & Eggs
  {
    keywords: ['milk', 'dairy', 'half and half', 'creamer', 'whole milk', 'skim milk', 'almond milk', 'oat milk', 'soy milk'],
    category: 'Beverages',
    defaultLocation: 'Fridge',
    shelfLifeDays: 7,
    reason: 'Opened/fresh milk typically stays fresh for 7 days in the fridge.'
  },
  {
    keywords: ['yogurt', 'curd', 'greek yogurt', 'kefir'],
    category: 'Food',
    defaultLocation: 'Fridge',
    shelfLifeDays: 14,
    reason: 'Sealed yogurt lasts ~2 weeks; consume within 5 days of opening.'
  },
  {
    keywords: ['egg', 'eggs', 'egg white'],
    category: 'Food',
    defaultLocation: 'Fridge',
    shelfLifeDays: 28,
    reason: 'Fresh refrigerated eggs stay good for 3 to 4 weeks.'
  },
  {
    keywords: ['cheese', 'cheddar', 'mozzarella', 'parmesan', 'gouda', 'feta', 'paneer'],
    category: 'Food',
    defaultLocation: 'Fridge',
    shelfLifeDays: 21,
    reason: 'Hard cheeses last 3-4 weeks; soft cheeses last ~1-2 weeks.'
  },
  {
    keywords: ['butter', 'margarine'],
    category: 'Food',
    defaultLocation: 'Fridge',
    shelfLifeDays: 60,
    reason: 'Refrigerated butter keeps well for up to 2 months.'
  },

  // Bakery & Grains
  {
    keywords: ['bread', 'bagel', 'loaf', 'sourdough', 'brioche', 'buns', 'pita', 'tortilla', 'croissant'],
    category: 'Food',
    defaultLocation: 'Pantry',
    shelfLifeDays: 6,
    reason: 'Fresh bakery bread lasts 5-7 days at room temperature.'
  },
  {
    keywords: ['rice', 'flour', 'pasta', 'spaghetti', 'quinoa', 'oats', 'cereal', 'noodles'],
    category: 'Food',
    defaultLocation: 'Pantry',
    shelfLifeDays: 180,
    reason: 'Dry grains and dry pasta have a long pantry life of 6-12 months.'
  },

  // Fresh Meat & Seafood
  {
    keywords: ['chicken', 'poultry', 'breast', 'thigh', 'wings', 'turkey'],
    category: 'Food',
    defaultLocation: 'Fridge',
    shelfLifeDays: 2,
    reason: 'Raw poultry should be cooked or frozen within 2 days of purchase.'
  },
  {
    keywords: ['beef', 'steak', 'pork', 'ground beef', 'mince', 'lamb', 'bacon', 'sausage'],
    category: 'Food',
    defaultLocation: 'Fridge',
    shelfLifeDays: 3,
    reason: 'Raw red meats last 3-5 days; ground meats last 1-2 days refrigerated.'
  },
  {
    keywords: ['fish', 'salmon', 'tuna', 'shrimp', 'prawn', 'cod', 'tilapia', 'seafood'],
    category: 'Food',
    defaultLocation: 'Fridge',
    shelfLifeDays: 2,
    reason: 'Fresh seafood is best prepared within 1-2 days.'
  },

  // Fruits & Vegetables
  {
    keywords: ['banana', 'bananas', 'avocado', 'tomato', 'tomatoes'],
    category: 'Food',
    defaultLocation: 'Pantry',
    shelfLifeDays: 5,
    reason: 'Ripens at room temperature within 4-6 days.'
  },
  {
    keywords: ['apple', 'apples', 'orange', 'oranges', 'lemon', 'citrus', 'lime'],
    category: 'Food',
    defaultLocation: 'Fridge',
    shelfLifeDays: 21,
    reason: 'Apples and citrus keep crisp in the crisper drawer for 3 weeks.'
  },
  {
    keywords: ['berry', 'berries', 'strawberry', 'strawberries', 'blueberry', 'blueberries', 'raspberry'],
    category: 'Food',
    defaultLocation: 'Fridge',
    shelfLifeDays: 5,
    reason: 'Fresh berries are delicate; store unwashed in the fridge for ~5 days.'
  },
  {
    keywords: ['spinach', 'lettuce', 'salad', 'greens', 'kale', 'herb', 'cilantro', 'coriander', 'basil'],
    category: 'Food',
    defaultLocation: 'Fridge',
    shelfLifeDays: 5,
    reason: 'Leafy greens stay fresh for 4-6 days in a sealed crisper.'
  },
  {
    keywords: ['potato', 'potatoes', 'onion', 'onions', 'garlic'],
    category: 'Food',
    defaultLocation: 'Pantry',
    shelfLifeDays: 30,
    reason: 'Store in a cool, dark pantry for 3-5 weeks.'
  },

  // Beverages & Condiments
  {
    keywords: ['juice', 'orange juice', 'apple juice', 'lemonade', 'smoothie'],
    category: 'Beverages',
    defaultLocation: 'Fridge',
    shelfLifeDays: 10,
    reason: 'Refrigerated fresh juice lasts ~7-10 days once opened.'
  },
  {
    keywords: ['coffee', 'tea', 'espresso', 'green tea'],
    category: 'Beverages',
    defaultLocation: 'Pantry',
    shelfLifeDays: 180,
    reason: 'Sealed coffee and tea retain freshness for ~6 months in a dry pantry.'
  },
  {
    keywords: ['sauce', 'ketchup', 'mayo', 'mayonnaise', 'mustard', 'salad dressing', 'soy sauce', 'jam', 'peanut butter'],
    category: 'Food',
    defaultLocation: 'Fridge',
    shelfLifeDays: 90,
    reason: 'Opened condiments typically stay good for 2-4 months refrigerated.'
  },
  {
    keywords: ['canned', 'soup', 'beans', 'canned tuna', 'canned tomato', 'tuna can'],
    category: 'Food',
    defaultLocation: 'Pantry',
    shelfLifeDays: 365,
    reason: 'Canned non-perishables last 1 to 2 years.'
  },

  // Medicine & Health
  {
    keywords: ['paracetamol', 'ibuprofen', 'aspirin', 'tylenol', 'advil', 'tablet', 'capsule', 'pain relief'],
    category: 'Medicine',
    defaultLocation: 'Medicine Cabinet',
    shelfLifeDays: 730,
    reason: 'OTC medications generally have a 2-year shelf life. Check bottle stamp!'
  },
  {
    keywords: ['cough syrup', 'syrup', 'liquid medicine', 'antacid'],
    category: 'Medicine',
    defaultLocation: 'Medicine Cabinet',
    shelfLifeDays: 180,
    reason: 'Liquid medicines often expire within 6 months after opening.'
  },
  {
    keywords: ['eye drops', 'nasal spray', 'ointment'],
    category: 'Medicine',
    defaultLocation: 'Medicine Cabinet',
    shelfLifeDays: 30,
    reason: 'Eye drops should be discarded 28-30 days after opening to prevent contamination.'
  },

  // Cosmetics & Personal Care
  {
    keywords: ['sunscreen', 'sunblock', 'spf'],
    category: 'Cosmetics',
    defaultLocation: 'Vanity',
    shelfLifeDays: 365,
    reason: 'Sunscreen active filters stay potent for ~12 months after opening.'
  },
  {
    keywords: ['mascara', 'eyeliner'],
    category: 'Cosmetics',
    defaultLocation: 'Vanity',
    shelfLifeDays: 90,
    reason: 'Eye cosmetics should be replaced every 3 months for ocular hygiene.'
  },
  {
    keywords: ['serum', 'moisturizer', 'face cream', 'lotion', 'toner', 'cleanser'],
    category: 'Cosmetics',
    defaultLocation: 'Bathroom',
    shelfLifeDays: 180,
    reason: 'Facial skincare products generally maintain efficacy for 6 months.'
  },
  {
    keywords: ['shampoo', 'conditioner', 'body wash', 'soap', 'toothpaste'],
    category: 'Cosmetics',
    defaultLocation: 'Bathroom',
    shelfLifeDays: 365,
    reason: 'Standard bath essentials last ~12 months once opened.'
  },

  // Household
  {
    keywords: ['detergent', 'dish soap', 'cleaner', 'bleach', 'disinfectant', 'spray', 'sponge', 'paper towel', 'trash bag'],
    category: 'Household',
    defaultLocation: 'Other',
    shelfLifeDays: 365,
    reason: 'Cleaning and household supplies typically remain effective for 1 year.'
  }
];

export function findShelfLifeSuggestion(itemName: string): {
  category: Category;
  storageLocation: StorageLocation;
  shelfLifeDays: number;
  reason: string;
  brand: string;
} {
  const lower = itemName.toLowerCase();

  // Extract potential brand name if available
  const commonBrands = [
    'Nestle', 'Kraft', 'Heinz', 'Dannon', 'Chobani', 'Tropicana', 'Kellogg', 
    'Colgate', 'Dove', 'Nivea', 'L\'Oreal', 'Pfizer', 'Bayer', 'Tylenol',
    'Tesco', 'Kirkland', 'Great Value', 'Trader Joe\'s', 'Organic Valley', 'Amul', 'Britannia'
  ];

  let detectedBrand = '';
  for (const b of commonBrands) {
    if (lower.includes(b.toLowerCase())) {
      detectedBrand = b;
      break;
    }
  }

  for (const rule of SHELF_LIFE_DATABASE) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        return {
          category: rule.category,
          storageLocation: rule.defaultLocation,
          shelfLifeDays: rule.shelfLifeDays,
          reason: rule.reason,
          brand: detectedBrand
        };
      }
    }
  }

  // Generic fallback
  return {
    category: 'Food',
    storageLocation: 'Fridge',
    shelfLifeDays: 7,
    reason: 'Default perishable guideline (~7 days). Check packaging for stamped date.',
    brand: detectedBrand
  };
}

export const CATEGORY_ICONS: Record<Category, { icon: string; label: string; color: string; bg: string }> = {
  Food: { icon: '🥦', label: 'Food', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  Beverages: { icon: '🧃', label: 'Beverages', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
  Medicine: { icon: '💊', label: 'Medicine', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  Cosmetics: { icon: '💄', label: 'Cosmetics', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  Household: { icon: '🧼', label: 'Household', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  Other: { icon: '📦', label: 'Other', color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
};

export const LOCATION_ICONS: Record<StorageLocation, { icon: string; label: string }> = {
  Fridge: { icon: '🥛', label: 'Fridge' },
  Freezer: { icon: '🧊', label: 'Freezer' },
  Pantry: { icon: '🍞', label: 'Pantry' },
  'Medicine Cabinet': { icon: '💊', label: 'Medicine Cabinet' },
  Bathroom: { icon: '🧴', label: 'Bathroom' },
  Vanity: { icon: '💄', label: 'Vanity' },
  'Kitchen Shelf': { icon: '🧂', label: 'Kitchen Shelf' },
  Other: { icon: '📦', label: 'Other' },
};
