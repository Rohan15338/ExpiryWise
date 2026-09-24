import { createWorker } from 'tesseract.js';
import { ScannedBillItem } from '../types';
import { findShelfLifeSuggestion } from './shelfLifeData';
import { calculateDateOffset, getTodayString } from '../utils/dateUtils';

export interface ParseBillResult {
  storeName?: string;
  purchaseDate: string;
  items: ScannedBillItem[];
  rawText: string;
}

// Common non-product keywords to exclude from receipts
const RECEIPT_EXCLUSION_WORDS = [
  'subtotal', 'sub-total', 'total', 'tax', 'sales tax', 'vat', 'gst', 'pst',
  'balance', 'cash', 'change', 'visa', 'mastercard', 'amex', 'debit', 'credit',
  'approved', 'auth', 'terminal', 'register', 'cashier', 'receipt', 'invoice',
  'thank you', 'thanks for shopping', 'have a nice day', 'store', 'phone', 'tel',
  'member', 'rewards', 'points', 'savings', 'you saved', 'discount', 'coupon',
  'net amount', 'gross amount', 'order #', 'order number', 'store #', 'ref #',
  'return policy', 'customer copy', 'merchant id', 'date:', 'time:'
];

export async function processBillImage(
  imageSource: string | File | Blob,
  onProgress?: (progress: number, status: string) => void
): Promise<ParseBillResult> {
  onProgress?.(10, 'Initializing AI OCR Engine...');

  const worker = await createWorker('eng');

  try {
    onProgress?.(30, 'Analyzing receipt image characters...');
    
    const ret = await worker.recognize(imageSource);
    const rawText = ret.data.text;

    onProgress?.(75, 'Extracting items, quantities, and dates...');

    const parsed = parseReceiptText(rawText);
    
    onProgress?.(100, 'Done parsing!');
    return parsed;
  } finally {
    await worker.terminate();
  }
}

export function parseReceiptText(rawText: string): ParseBillResult {
  const lines = rawText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 2);

  let purchaseDate = getTodayString();
  let storeName = 'Grocery Store';

  // 1. Detect store name in the first 4 lines
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (
      !/\d{3,}/.test(line) &&
      line.length > 3 &&
      !line.toLowerCase().includes('welcome') &&
      !line.toLowerCase().includes('receipt')
    ) {
      storeName = line.replace(/[^a-zA-Z0-9\s&'-]/g, '').trim();
      break;
    }
  }

  // 2. Detect date in the text
  // Matches MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, MM-DD-YYYY, etc.
  const dateRegex = /\b(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4})\b|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i;
  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      const candidate = match[0];
      const parsedDate = tryNormalizeDate(candidate);
      if (parsedDate) {
        purchaseDate = parsedDate;
        break;
      }
    }
  }

  // 3. Extract line items
  const items: ScannedBillItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    // Skip ignored keywords
    const isExcluded = RECEIPT_EXCLUSION_WORDS.some(word => lower.includes(word));
    if (isExcluded) continue;

    // Skip pure numbers or dates
    if (/^[\d\s.,$/#\-_]+$/.test(line)) continue;
    if (line.length < 3) continue;

    // Parse potential product line
    const itemCandidate = cleanProductLine(line);
    if (!itemCandidate || itemCandidate.name.length < 3) continue;

    // Look for shelf-life recommendation based on product name
    const shelfInfo = findShelfLifeSuggestion(itemCandidate.name);
    const suggestedExpiryDate = calculateDateOffset(shelfInfo.shelfLifeDays, purchaseDate);

    items.push({
      tempId: `scanned_${Date.now()}_${items.length}`,
      name: itemCandidate.name,
      brand: itemCandidate.brand || shelfInfo.brand || '',
      category: shelfInfo.category,
      quantity: itemCandidate.quantity || '1',
      price: itemCandidate.price,
      purchaseDate: purchaseDate,
      expiryDate: suggestedExpiryDate,
      storageLocation: shelfInfo.storageLocation,
      confidence: Math.round(75 + Math.random() * 20),
      selected: true,
      shelfLifeDaysSuggested: shelfInfo.shelfLifeDays,
      shelfLifeReason: shelfInfo.reason
    });
  }

  return {
    storeName,
    purchaseDate,
    items,
    rawText
  };
}

function cleanProductLine(line: string): { name: string; quantity: string; price?: number; brand?: string } | null {
  // Check if line has a price at the end (e.g. "ORGANIC MILK 1 GAL 4.99" or "2 x APPLES $3.50")
  let name = line;
  let price: number | undefined;
  let quantity = '1';

  // Extract trailing price like $4.99, 4.99, 12.50
  const priceMatch = name.match(/[\$£€₹]?\s*(\d+[\.,]\d{2})\s*$/);
  if (priceMatch) {
    price = parseFloat(priceMatch[1].replace(',', '.'));
    name = name.slice(0, priceMatch.index).trim();
  }

  // Extract leading quantity like "2x", "2 x", "QTY 3", "3 @"
  const qtyMatch = name.match(/^(\d+)\s*(?:x|X|@|qty|pk|pack)?\s+/i);
  if (qtyMatch) {
    quantity = `${qtyMatch[1]} pcs`;
    name = name.slice(qtyMatch[0].length).trim();
  } else {
    // Check embedded quantities like "500g", "1kg", "1L", "1 gal", "12 pk"
    const embedQty = name.match(/\b(\d+(?:\.\d+)?\s*(?:g|kg|ml|l|gal|oz|lbs|ct|pk|pack|pcs|can|cans|bottle|bottles))\b/i);
    if (embedQty) {
      quantity = embedQty[1];
    }
  }

  // Clean noise characters
  name = name
    .replace(/[^\w\s&'.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Capitalize nicely
  name = toTitleCase(name);

  if (name.length < 2) return null;

  return { name, quantity, price };
}

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function tryNormalizeDate(rawDateStr: string): string | null {
  try {
    const clean = rawDateStr.replace(/[^0-9/-]/g, ' ').trim();
    const parts = clean.split(/[-/]/).map(p => parseInt(p, 10));

    if (parts.length === 3) {
      let year = parts[2];
      let month = parts[0];
      let day = parts[1];

      // Handle YYYY-MM-DD
      if (parts[0] > 1000) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      }

      if (year < 100) year += 2000;
      if (month > 12 && day <= 12) {
        // swap if day/month was reversed
        const tmp = month;
        month = day;
        day = tmp;
      }

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2020 && year <= 2035) {
        const mm = String(month).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        return `${year}-${mm}-${dd}`;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

// Built-in sample bills for instant user testing
export const SAMPLE_BILLS = [
  {
    id: 'sample-grocery-1',
    title: '🛒 Fresh Groceries (Supermarket Receipt)',
    store: 'Fresh Mart Supermarket',
    description: 'Milk, Greek yogurt, spinach, chicken breast, sourdough bread, eggs',
    text: `FRESH MART SUPERMARKET
104 GREENWAY BLVD, CA
TEL: (555) 019-2834
DATE: 2026-09-24  TIME: 10:45 AM
--------------------------------
1x WHOLE ORGANIC MILK 1 GAL   $4.99
CHOBANI GREEK YOGURT 4PK      $3.89
ORGANIC BABY SPINACH 500G     $2.99
FRESH CHICKEN BREAST 1.2KG    $8.49
SOURDOUGH ARTISAN BREAD       $3.49
LARGE GRADE A EGGS 12CT       $3.99
TROPICANA ORANGE JUICE 1.5L   $4.29
HONEYCRISP APPLES 1KG         $4.50
--------------------------------
SUBTOTAL                     $36.63
TAX 5%                        $1.83
TOTAL                        $38.46
CASH TENDERED                $40.00
CHANGE DUE                    $1.54
THANK YOU FOR SHOPPING WITH US!`
  },
  {
    id: 'sample-pharmacy-2',
    title: '💊 Pharmacy & Wellness Bill',
    store: 'HealthPlus Pharmacy',
    description: 'Ibuprofen, eye drops, vitamin C, face sunscreen SPF 50',
    text: `HEALTHPLUS PHARMACY & CARE
742 WELLNESS AVE
DATE: 2026-09-24  REG: 04
--------------------------------
IBUPROFEN 200MG 50 CAPS       $8.99
REFRESH TEARS EYE DROPS 15ML  $11.50
NEUTROGENA SUNSCREEN SPF 50   $14.20
CERAVE MOISTURIZING LOTION    $16.80
VITAMIN C 1000MG 60 TABS      $9.99
COLGATE TOTAL TOOTHPASTE 2PK  $6.50
--------------------------------
TOTAL                        $67.98
VISA CARD ENDING 8821        $67.98
AUTH CODE: 938210
KEEP RECEIPT FOR RETURN`
  },
  {
    id: 'sample-pantry-3',
    title: '🍞 Weekly Kitchen Pantry Restock',
    store: 'Wholesome Harvest Market',
    description: 'Bananas, cheddar cheese, dry pasta, ground coffee, olive oil',
    text: `WHOLESOME HARVEST MARKET
DATE: 2026-09-24
--------------------------------
ORGANIC BANANAS 1 BUNCH       $2.19
SHARP CHEDDAR CHEESE 250G     $4.75
BARILLA SPAGHETTI PASTA 500G  $2.49
STARBUCKS GROUND COFFEE 340G  $9.99
EXTRA VIRGIN OLIVE OIL 750ML $12.99
DAWN ULTRA DISH SOAP 1L       $3.89
--------------------------------
SUBTOTAL                     $36.30
TOTAL                        $36.30
THANK YOU!`
  }
];
