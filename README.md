# 🌱 ExpiryWise

> **"Know before it expires. Waste less."**

ExpiryWise is a smart food, grocery, medicine, cosmetics, and household expiry tracker that helps users eliminate waste and stay organized. Users can add products manually or scan shopping receipts with optical AI (OCR) to track inventory, receive automated expiry reminders, and discover zero-waste recipes for items expiring soon.

---

## ✨ Features & Capabilities

### 1. 📊 Page 1 — Overview Hub
- **Urgent Expiry Banner**: High-priority alert banner for items expiring today with instant zero-waste recipe links.
- **Interactive Status Cards**:
  - 🟢 **Fresh**: Good condition with healthy shelf life remaining.
  - 🟠 **Expiring Soon**: 1–3 days left before expiration.
  - ⚡ **Expiring Today**: High-priority alert for immediate action.
  - 🔴 **Expired**: Prompting discard or safety check.
  - 📦 **Total Products**: All tracked items in your inventory.
- **Sustainability & Savings Tracker**: Real-time counter of total dollars saved ($\$$) and kilograms of $\text{CO}_2$ emissions prevented from landfills.
- **Storage Zone Breakdown**: Item counts for Fridge, Freezer, Pantry, Medicine Cabinet, Bathroom, Vanity, etc.

### 2. 🥗 Page 2 — My Products & Kitchen Inventory
- **Full Inventory Management**:
  - **Live Search**: Instant filter by product name, brand, location, or notes.
  - **Category Filters**: Food (🥦), Beverages (🧃), Medicine (💊), Cosmetics (💄), Household (🧼), Other (📦).
  - **Storage Location Filters**: Fridge (🥛), Freezer (🧊), Pantry (🍞), Medicine Cabinet (💊), etc.
  - **Status Filters**: All, Fresh, Expiring Soon, Expiring Today, Expired, Used/Consumed.
  - **Sorting**: Expiry date (soonest/latest), Name A–Z, Recently Added.
  - **View Toggle**: Responsive Grid Cards or compact List View.
- **Product Actions**:
  - ✅ **Mark as Used / Consumed**: Triggers celebratory confetti burst and updates savings metrics.
  - ✏️ **Edit & Update**: Modify dates, quantities, and photos.
  - 🗑️ **Delete Item**.
  - 🛒 **Shopping & Replenishment List**: 1-click re-buy or copy grocery shopping list to clipboard.
  - 📥 **Export to CSV Spreadsheet** & 🖨️ **Print Inventory**.

### 3. 🧾 Page 3 — Optical Bill Scanner (AI OCR)
- **Multi-Input Modes**:
  - Upload receipt photo / invoice (JPG, PNG, WEBP).
  - Take live webcam snapshot with alignment viewfinder.
  - Try pre-loaded sample grocery, pharmacy, and pantry bills.
- **Information Extraction**:
  - Store name, purchase date, line items, quantities, and prices.
- **⚠️ Expiry Date Integrity**:
  - *Shopping bills do not contain expiry dates*. ExpiryWise never invents false dates.
  - Automatically matches items with built-in shelf-life heuristics and presents an editable review table for confirming dates before saving in batch.

### 4. 🔐 User Authentication & Database Privacy
- **Sign Up, Login & Logout**: Secure, isolated user sessions.
- **Forgot Password Workflow**: Password recovery and instant reset.
- **1-Click Demo Login**: Pre-seeded demo account (*Emma Green*).
- **SQLite Database**: Persistent relational database storage in `expirywise.db` with offline-first client synchronization.

---

## 🚀 Running the App Locally

```bash
# 1. Install dependencies
npm install

# 2. Run both Frontend & SQLite Backend concurrently
npm run dev:full

# Or run Frontend only
npm run dev

# Or run Backend only
npm run server
```

- **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** `http://localhost:3001`
