# 🌱 ExpiryWise

> **"Know before it expires. Waste less."**

ExpiryWise is a smart web application designed to eliminate household waste by tracking expiration dates for groceries, pantry essentials, medicine, cosmetics, and household items with automated reminders, AI bill scanning, and zero-waste recipe recommendations.

---

## ✨ Features

### 1. 🔐 User Authentication & Complete Data Isolation
- **Sign Up & Login**: Create personal accounts with full data privacy.
- **Forgot Password**: Password reset and recovery workflow.
- **1-Click Demo Login**: Explore pre-seeded pantry items instantly with Emma Green's demo profile.
- **Private Data Scoping**: Every product, receipt scan, and preference is strictly scoped per user in isolated storage.

### 2. 📊 Interactive Dashboard & Urgency Status Cards
- **Status Cards**:
  - 🟢 **Fresh**: Good condition with healthy shelf life remaining.
  - 🟠 **Expiring Soon**: 1–3 days left before expiration.
  - ⚡ **Expiring Today**: High-priority alert banner for immediate action.
  - 🔴 **Expired**: Prompting discard or safety check.
  - 📦 **Total Products**: All tracked items.
- **Sustainability & Money-Saved Tracker**: Real-time counter of total dollars saved and kg of CO₂ emissions prevented from landfills.
- **1-Click Filtering**: Click any status card to filter products instantly.

### 3. ➕ Smart Add & Edit Product
- **Fields**: Product Name, Brand, Category, Quantity, Purchase Date, Expiry Date, Storage Location, Reminder Preference, Photo, Notes, Price.
- **Categories Supported**:
  - 🥦 Food
  - 🧃 Beverages
  - 💊 Medicine
  - 💄 Cosmetics
  - 🧼 Household
  - 📦 Other
- **Storage Locations**:
  - 🥛 Fridge
  - 🧊 Freezer
  - 🍞 Pantry
  - 💊 Medicine Cabinet
  - 🧴 Bathroom
  - 💄 Vanity
  - 🧂 Kitchen Shelf
  - 📦 Other
- **Smart Shelf-Life AI Auto-Fill**: Auto-detects category, storage location, and suggests default shelf life as you type common product names.
- **Quick Date Shortcuts**: Instant `+3 Days`, `+1 Wk`, `+2 Wks`, `+1 Mo`, `+6 Mo`, `+1 Yr` buttons.
- **Photo Upload & Live Camera**: Snap photo directly via webcam or upload image.

### 4. 🧾 AI Optical Bill Scanner (OCR)
- **Upload, Live Snap, or Sample Receipts**:
  - Upload receipt photo / invoice.
  - Take live webcam snapshot with alignment frame.
  - Try pre-loaded sample grocery, pharmacy, and pantry bills.
- **Intelligent Information Extraction**:
  - Store name
  - Purchase date
  - Line items & quantities
  - Category matching & recommended storage
- **⚠️ Expiry Date Integrity Guarantee**:
  - *Shopping bills do not contain expiry dates*. ExpiryWise never invents false dates.
  - Presents an editable review table with shelf-life suggestions, allowing users to verify or adjust dates before saving in batch.

### 5. 🍳 Zero-Waste Cooking & Recipe Suggestions
- Instant zero-waste culinary ideas and preservation tips (e.g., banana pancakes, fridge frittata, homemade croutons, smoothie bowls) for items expiring today or soon.

### 6. 🔔 Alert Reminders & Audio Chimes
- In-app notification center with badge indicator.
- Browser desktop push notification integration.
- Soothing Web Audio synthesized chimes on task completion and alerts.
- Confetti celebration when items are marked as used/consumed.

### 7. 🛒 Replenishment & Shopping List
- Automatically keeps track of consumed/wasted items for 1-click re-adding or copying to clipboard as a grocery shopping list.
- CSV spreadsheet export and printable inventory view.

---

## 🚀 Running the App Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser to start tracking and wasting less!
