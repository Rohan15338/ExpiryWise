import React, { useState, useEffect, useRef } from 'react';
import { Product, Category, StorageLocation } from '../types';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  HelpCircle,
  Tag,
  MapPin,
  Clock,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { getTodayString, calculateDateOffset } from '../utils/dateUtils';
import { findShelfLifeSuggestion, CATEGORY_ICONS, LOCATION_ICONS } from '../services/shelfLifeData';
import { sound } from '../services/notificationService';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialProduct?: Product | null;
  userId: string;
}

const CATEGORIES: Category[] = ['Food', 'Beverages', 'Medicine', 'Cosmetics', 'Household', 'Other'];
const LOCATIONS: StorageLocation[] = ['Fridge', 'Freezer', 'Pantry', 'Medicine Cabinet', 'Bathroom', 'Vanity', 'Kitchen Shelf', 'Other'];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
  userId
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [quantity, setQuantity] = useState('1');
  const [purchaseDate, setPurchaseDate] = useState(getTodayString());
  const [expiryDate, setExpiryDate] = useState(calculateDateOffset(7));
  const [storageLocation, setStorageLocation] = useState<StorageLocation>('Fridge');
  const [reminderPreference, setReminderPreference] = useState(2);
  const [price, setPrice] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [autoSuggestionReason, setAutoSuggestionReason] = useState<string | null>(null);

  // Camera capture state
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setBrand(initialProduct.brand || '');
      setCategory(initialProduct.category);
      setQuantity(initialProduct.quantity);
      setPurchaseDate(initialProduct.purchaseDate);
      setExpiryDate(initialProduct.expiryDate);
      setStorageLocation(initialProduct.storageLocation);
      setReminderPreference(initialProduct.reminderPreference ?? 2);
      setPrice(initialProduct.price ? String(initialProduct.price) : '');
      setNotes(initialProduct.notes || '');
      setPhotoUrl(initialProduct.photoUrl || '');
      setAutoSuggestionReason(null);
    } else {
      resetForm();
    }
  }, [initialProduct, isOpen]);

  const resetForm = () => {
    setName('');
    setBrand('');
    setCategory('Food');
    setQuantity('1');
    setPurchaseDate(getTodayString());
    setExpiryDate(calculateDateOffset(7));
    setStorageLocation('Fridge');
    setReminderPreference(2);
    setPrice('');
    setNotes('');
    setPhotoUrl('');
    setAutoSuggestionReason(null);
    stopCamera();
  };

  // Smart auto-suggestion when typing product name
  const handleNameChange = (newName: string) => {
    setName(newName);
    if (!initialProduct && newName.length >= 3) {
      const match = findShelfLifeSuggestion(newName);
      setCategory(match.category);
      setStorageLocation(match.storageLocation);
      if (match.brand && !brand) {
        setBrand(match.brand);
      }
      setExpiryDate(calculateDateOffset(match.shelfLifeDays, purchaseDate));
      setAutoSuggestionReason(`Smart match: ${match.reason}`);
    }
  };

  const handleApplyShortcut = (days: number) => {
    setExpiryDate(calculateDateOffset(days, purchaseDate));
  };

  // Handle Photo Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Webcam Camera Capture
  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Camera access was denied or not available.');
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg', 0.85);
        setPhotoUrl(dataUri);
      }
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a product name.');
      return;
    }
    if (!expiryDate) {
      alert('Please enter an expiry date.');
      return;
    }

    sound.playSuccess();

    onSave({
      userId,
      name: name.trim(),
      brand: brand.trim(),
      category,
      quantity: quantity.trim() || '1',
      purchaseDate,
      expiryDate,
      storageLocation,
      reminderPreference: Number(reminderPreference),
      price: price ? parseFloat(price) : undefined,
      notes: notes.trim() || undefined,
      photoUrl: photoUrl || undefined
    });

    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                {initialProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-xs text-slate-500">
                Track expiry date and set automatic reminders
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Smart Suggestion Alert banner */}
          {autoSuggestionReason && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{autoSuggestionReason}</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoSuggestionReason(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Product Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Organic Whole Milk, Greek Yogurt..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Chobani, Nestle, Vital Farms..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
              />
            </div>
          </div>

          {/* Category & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {CATEGORIES.map((cat) => {
                  const meta = CATEGORY_ICONS[cat];
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-2 py-2 text-xs font-medium rounded-xl border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        isSelected
                          ? `${meta.bg} font-semibold ring-2 ring-emerald-500/30 text-slate-900`
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{meta.icon}</span>
                      <span className="truncate">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Quantity & Packaging
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 1 bottle, 500g, 2 packs..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
              />
              <div className="flex gap-1.5 mt-1.5">
                {['1', '2', '500g', '1L', '1 Pack'].map((quickQty) => (
                  <button
                    key={quickQty}
                    type="button"
                    onClick={() => setQuantity(quickQty)}
                    className="px-2 py-0.5 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                  >
                    {quickQty}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Storage Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Storage Location
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LOCATIONS.map((loc) => {
                const isSelected = storageLocation === loc;
                const info = LOCATION_ICONS[loc] || { icon: '📦', label: loc };
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setStorageLocation(loc)}
                    className={`px-3 py-2 text-xs rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{info.icon}</span>
                    <span className="truncate">{loc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Purchase Date & Expiry Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Purchase Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Expiry Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden font-medium text-emerald-900 font-bold"
                />
              </div>

              {/* Quick shelf-life duration buttons */}
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-[10px] text-slate-400 self-center mr-1">Quick:</span>
                {[
                  { label: '+3 Days', days: 3 },
                  { label: '+1 Wk', days: 7 },
                  { label: '+2 Wks', days: 14 },
                  { label: '+1 Mo', days: 30 },
                  { label: '+6 Mo', days: 180 },
                  { label: '+1 Yr', days: 365 },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => handleApplyShortcut(btn.days)}
                    className="px-2 py-0.5 text-[10px] font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reminder Preference & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Reminder Preference
              </label>
              <select
                value={reminderPreference}
                onChange={(e) => setReminderPreference(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden font-medium"
              >
                <option value={0}>On the day of expiry (Today)</option>
                <option value={1}>1 day before expiry</option>
                <option value={2}>2 days before expiry (Recommended)</option>
                <option value={3}>3 days before expiry</option>
                <option value={5}>5 days before expiry</option>
                <option value={7}>1 week before expiry</option>
                <option value={14}>2 weeks before expiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                Price (Optional for Waste Savings)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 4.99"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
              />
            </div>
          </div>

          {/* Product Photo Upload / Webcam Snapshot */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Product Photo (Optional)</span>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                >
                  Remove photo
                </button>
              )}
            </label>

            {showCamera ? (
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-900 text-white space-y-3">
                <div className="relative rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Snap Photo
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {photoUrl ? (
                  <div className="relative w-20 h-20 rounded-2xl border border-slate-200 overflow-hidden shrink-0 shadow-sm">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <div className="flex flex-wrap gap-2 flex-1">
                  <label className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    Take Photo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes / Consumption Tips
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Opened on Monday. Freeze if unused by tomorrow..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/30 transition active:scale-98 cursor-pointer"
            >
              {initialProduct ? 'Save Changes' : 'Add to Inventory'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
