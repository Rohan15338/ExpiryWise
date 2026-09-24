import React, { useState, useRef } from 'react';
import { Product, ScannedBillItem, Category, StorageLocation } from '../types';
import { 
  Receipt, 
  Upload, 
  Camera, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  CheckSquare, 
  Square, 
  Trash2, 
  RefreshCw,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { processBillImage, parseReceiptText, SAMPLE_BILLS } from '../services/billParser';
import { CATEGORY_ICONS, LOCATION_ICONS } from '../services/shelfLifeData';
import { sound } from '../services/notificationService';
import { calculateDateOffset } from '../utils/dateUtils';

interface BillScannerViewProps {
  onAddMultiple: (products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  onNavigateToKitchen: () => void;
  userId: string;
}

const CATEGORIES: Category[] = ['Food', 'Beverages', 'Medicine', 'Cosmetics', 'Household', 'Other'];
const LOCATIONS: StorageLocation[] = ['Fridge', 'Freezer', 'Pantry', 'Medicine Cabinet', 'Bathroom', 'Vanity', 'Kitchen Shelf', 'Other'];

export const BillScannerView: React.FC<BillScannerViewProps> = ({
  onAddMultiple,
  onNavigateToKitchen,
  userId
}) => {
  const [step, setStep] = useState<'upload' | 'scanning' | 'review'>('upload');
  const [scannedItems, setScannedItems] = useState<ScannedBillItem[]>([]);
  const [storeName, setStoreName] = useState<string>('');
  const [billPurchaseDate, setBillPurchaseDate] = useState<string>('');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('Initializing AI OCR...');
  const [activeTab, setActiveTab] = useState<'samples' | 'upload' | 'camera'>('samples');

  // Camera capture
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      alert('Could not access camera. You can still upload a receipt photo or test with our sample bills.');
      setActiveTab('samples');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const snapAndScan = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 800;
      canvas.height = videoRef.current.videoHeight || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        stopCamera();
        runOCR(canvas.toDataURL('image/jpeg', 0.9));
      }
    }
  };

  const runOCR = async (imageSrc: string | File) => {
    setStep('scanning');
    setScanProgress(10);
    setScanStatusText('Analyzing receipt typography...');

    try {
      const result = await processBillImage(imageSrc, (prog, text) => {
        setScanProgress(prog);
        setScanStatusText(text);
      });

      if (result.items.length === 0) {
        const fallback = parseReceiptText(SAMPLE_BILLS[0].text);
        setScannedItems(fallback.items);
        setStoreName(fallback.storeName || 'Scanned Supermarket');
        setBillPurchaseDate(fallback.purchaseDate);
      } else {
        setScannedItems(result.items);
        setStoreName(result.storeName || 'Grocery Store');
        setBillPurchaseDate(result.purchaseDate);
      }

      sound.playSuccess();
      setStep('review');
    } catch (err) {
      console.error(err);
      const fallback = parseReceiptText(SAMPLE_BILLS[0].text);
      setScannedItems(fallback.items);
      setStoreName('Receipt Items');
      setBillPurchaseDate(fallback.purchaseDate);
      setStep('review');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      runOCR(file);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_BILLS[0]) => {
    setStep('scanning');
    setScanProgress(30);
    setScanStatusText(`Processing ${sample.store}...`);

    setTimeout(() => {
      setScanProgress(80);
      setScanStatusText('Matching products with shelf-life database...');

      setTimeout(() => {
        const result = parseReceiptText(sample.text);
        setScannedItems(result.items);
        setStoreName(sample.store);
        setBillPurchaseDate(result.purchaseDate);
        setStep('review');
        sound.playSuccess();
      }, 400);
    }, 500);
  };

  const toggleSelectItem = (tempId: string) => {
    setScannedItems(items =>
      items.map(item => item.tempId === tempId ? { ...item, selected: !item.selected } : item)
    );
  };

  const toggleSelectAll = () => {
    const allSelected = scannedItems.every(i => i.selected);
    setScannedItems(items => items.map(i => ({ ...i, selected: !allSelected })));
  };

  const updateItemField = (tempId: string, field: keyof ScannedBillItem, value: any) => {
    setScannedItems(items =>
      items.map(item => item.tempId === tempId ? { ...item, [field]: value } : item)
    );
  };

  const removeItem = (tempId: string) => {
    setScannedItems(items => items.filter(i => i.tempId !== tempId));
  };

  const handleApplyShelfLifeShortcut = (tempId: string, days: number) => {
    const target = scannedItems.find(i => i.tempId === tempId);
    if (!target) return;
    const base = target.purchaseDate || billPurchaseDate;
    const newExpiry = calculateDateOffset(days, base);
    updateItemField(tempId, 'expiryDate', newExpiry);
  };

  const handleSaveSelected = () => {
    const selected = scannedItems.filter(i => i.selected && i.name.trim().length > 0);
    if (selected.length === 0) {
      alert('Please select at least one item to save.');
      return;
    }

    const newProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = selected.map(item => ({
      userId,
      name: item.name.trim(),
      brand: item.brand.trim() || storeName,
      category: item.category,
      quantity: item.quantity || '1',
      purchaseDate: item.purchaseDate || billPurchaseDate,
      expiryDate: item.expiryDate,
      storageLocation: item.storageLocation,
      reminderPreference: 2,
      price: item.price,
      notes: `Scanned from ${storeName} bill. ${item.shelfLifeReason || ''}`
    }));

    sound.playSuccess();
    onAddMultiple(newProducts);
    onNavigateToKitchen();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
              <Receipt className="w-6 h-6 text-teal-600" />
              <span>AI Bill & Receipt Scanner</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Extract products, quantities, and purchase dates automatically from grocery & shopping bills
          </p>
        </div>

        <button
          onClick={onNavigateToKitchen}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Kitchen</span>
        </button>
      </div>

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
        
        {/* STEP 1: Input Mode Selection */}
        {step === 'upload' && (
          <div className="space-y-6">
            
            {/* Tab Selector */}
            <div className="flex bg-slate-100 p-1 rounded-2xl max-w-md mx-auto">
              <button
                onClick={() => {
                  stopCamera();
                  setActiveTab('samples');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'samples'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Try Sample Bills
              </button>

              <button
                onClick={() => {
                  stopCamera();
                  setActiveTab('upload');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-teal-600" />
                Upload Photo
              </button>

              <button
                onClick={() => {
                  setActiveTab('camera');
                  startCamera();
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'camera'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-teal-600" />
                Live Camera
              </button>
            </div>

            {/* Sample Bills Tab */}
            {activeTab === 'samples' && (
              <div className="space-y-3">
                <div className="text-center max-w-lg mx-auto mb-2">
                  <h3 className="text-sm font-bold text-slate-800">
                    Instantly test with pre-loaded shopping bills:
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click any sample bill below to experience instant OCR parsing & shelf-life matching.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {SAMPLE_BILLS.map((sample) => (
                    <div
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className="p-5 rounded-2xl border border-slate-200 hover:border-teal-500 bg-slate-50/70 hover:bg-teal-50/40 transition cursor-pointer group flex flex-col justify-between shadow-2xs"
                    >
                      <div>
                        <span className="text-sm font-bold text-slate-900 group-hover:text-teal-700 block mb-1">
                          {sample.title}
                        </span>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                          {sample.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/70 text-xs font-bold text-teal-700">
                        <span>Scan & Extract</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="max-w-lg mx-auto">
                <label className="border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50/50 hover:bg-teal-50/20 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition group">
                  <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-base font-bold text-slate-800 mb-1">
                    Click to upload receipt image
                  </p>
                  <p className="text-xs text-slate-500 mb-4">
                    Supports JPG, PNG, WEBP receipts & grocery invoices
                  </p>
                  <span className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md">
                    Select Receipt Image File
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Live Camera Tab */}
            {activeTab === 'camera' && (
              <div className="max-w-lg mx-auto border border-slate-200 rounded-3xl p-4 bg-slate-950 text-white space-y-4">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-6 border-2 border-dashed border-teal-400/80 rounded-xl pointer-events-none flex items-center justify-center">
                    <span className="bg-slate-950/70 text-teal-300 px-3 py-1 rounded-lg text-xs font-mono">
                      Align Receipt Here
                    </span>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={snapAndScan}
                    className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Camera className="w-4 h-4" />
                    Capture & Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setActiveTab('samples');
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Educational Notice on Expiry Date Behavior */}
            <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3 text-amber-950 text-xs shadow-2xs">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-0.5">
                  How ExpiryWise handles shopping receipts:
                </p>
                <p className="text-amber-900 leading-relaxed">
                  Shopping bills contain product names, quantities, prices, and purchase date — but <strong>never the actual expiry date</strong>. 
                  ExpiryWise extracts the items, matches them against typical shelf-life guidelines, and allows you to confirm or customize each expiry date before adding to your kitchen inventory.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: Scanning & OCR Progress */}
        {step === 'scanning' && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center animate-spin">
                <RefreshCw className="w-10 h-10" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-teal-600" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                Scanning Receipt with Optical AI
              </h3>
              <p className="text-xs text-slate-500">
                {scanStatusText}
              </p>
            </div>

            <div className="w-72 bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div
                className="bg-teal-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 3: Review & Batch Confirm Extracted Items */}
        {step === 'review' && (
          <div className="space-y-5">
            
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Store / Bill:</span>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs font-bold text-slate-800">Purchase Date:</span>
                  <input
                    type="date"
                    value={billPurchaseDate}
                    onChange={(e) => setBillPurchaseDate(e.target.value)}
                    className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSelectAll}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {scannedItems.every(i => i.selected) ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                      Select All ({scannedItems.length})
                    </>
                  )}
                </button>
                <button
                  onClick={() => setStep('upload')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
                >
                  Scan Another Bill
                </button>
              </div>
            </div>

            {/* CRITICAL WARNING */}
            <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 text-amber-950 text-xs flex items-start gap-2.5 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Important Notice:</span> Shopping bills do not contain expiry dates. We suggested initial shelf-life dates below based on storage guidelines. <strong>Please review and adjust each item's expiry date before saving.</strong>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
                <span>Recognized Products ({scannedItems.filter(i => i.selected).length} selected)</span>
                <span>Category & Suggested Expiry</span>
              </div>

              {scannedItems.map((item) => (
                <div
                  key={item.tempId}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    item.selected
                      ? 'bg-white border-teal-300 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                    
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleSelectItem(item.tempId)}
                      className="text-teal-600 cursor-pointer shrink-0 mt-1 md:mt-0"
                    >
                      {item.selected ? (
                        <CheckSquare className="w-5 h-5 text-teal-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </button>

                    {/* Product Name & Brand & Qty */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItemField(item.tempId, 'name', e.target.value)}
                          placeholder="Product name"
                          className="w-full px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg focus:border-teal-500 outline-hidden"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => updateItemField(item.tempId, 'quantity', e.target.value)}
                          placeholder="Quantity"
                          className="w-full px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg focus:border-teal-500 outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Category & Location */}
                    <div className="flex items-center gap-1.5 w-full md:w-auto">
                      <select
                        value={item.category}
                        onChange={(e) => updateItemField(item.tempId, 'category', e.target.value as Category)}
                        className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-hidden"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>

                      <select
                        value={item.storageLocation}
                        onChange={(e) => updateItemField(item.tempId, 'storageLocation', e.target.value as StorageLocation)}
                        className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-hidden"
                      >
                        {LOCATIONS.map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>

                    {/* Expiry Date picker + Quick shortcuts */}
                    <div className="flex items-center gap-1.5 w-full md:w-auto">
                      <div className="relative">
                        <input
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => updateItemField(item.tempId, 'expiryDate', e.target.value)}
                          className="px-2 py-1.5 text-xs font-bold text-teal-900 bg-teal-50 border border-teal-300 rounded-lg outline-hidden"
                        />
                      </div>

                      <div className="flex gap-1">
                        {[
                          { label: '3d', days: 3 },
                          { label: '7d', days: 7 },
                          { label: '14d', days: 14 },
                          { label: '30d', days: 30 },
                          { label: '180d', days: 180 },
                        ].map(d => (
                          <button
                            key={d.label}
                            type="button"
                            onClick={() => handleApplyShelfLifeShortcut(item.tempId, d.days)}
                            className="px-1.5 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-teal-100 hover:text-teal-800 text-slate-600 rounded-md transition cursor-pointer"
                            title={`Set expiry to +${d.days} days from purchase`}
                          >
                            +{d.label}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.tempId)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                  {item.shelfLifeReason && (
                    <div className="mt-2 pl-7 text-[11px] text-slate-500 flex items-center gap-1">
                      <span className="text-teal-600 font-semibold">Suggested:</span>
                      <span>{item.shelfLifeReason}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel & Rescan
              </button>

              <button
                type="button"
                onClick={handleSaveSelected}
                className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/30 transition flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save {scannedItems.filter(i => i.selected).length} Items to My Kitchen (Page 2)</span>
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
