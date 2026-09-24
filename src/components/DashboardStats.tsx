import React from 'react';
import { Product, ProductStatus } from '../types';
import { getDaysRemaining } from '../utils/dateUtils';
import { 
  Plus, 
  Receipt, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Package, 
  TrendingUp, 
  Leaf,
  Sparkles
} from 'lucide-react';
import { sound } from '../services/notificationService';

interface DashboardStatsProps {
  products: Product[];
  activeFilter: ProductStatus | 'all';
  onFilterChange: (filter: ProductStatus | 'all') => void;
  onOpenAddProduct: () => void;
  onOpenScanBill: () => void;
  onOpenRecipes?: () => void;
  moneySaved: number;
  co2PreventedKg: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  products,
  activeFilter,
  onFilterChange,
  onOpenAddProduct,
  onOpenScanBill,
  onOpenRecipes,
  moneySaved,
  co2PreventedKg
}) => {
  // Count active (unconsumed/unwasted) products
  const activeProducts = products.filter(p => !p.isConsumed && !p.isWasted);
  
  let freshCount = 0;
  let expiringSoonCount = 0;
  let expiredCount = 0;
  let expiringTodayCount = 0;

  activeProducts.forEach(p => {
    const days = getDaysRemaining(p.expiryDate);
    if (days < 0) {
      expiredCount++;
    } else if (days === 0) {
      expiringTodayCount++;
    } else if (days <= 3) {
      expiringSoonCount++;
    } else {
      freshCount++;
    }
  });

  const totalCount = activeProducts.length;

  return (
    <div className="space-y-4">
      {/* High-priority Expiring Today Alert Banner */}
      {expiringTodayCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm shadow-amber-500/10 animate-pulse-subtle">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-amber-500/30">
              ⚡
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-amber-950 flex items-center gap-2">
                Action Required: {expiringTodayCount} item{expiringTodayCount === 1 ? '' : 's'} expiring today!
              </h3>
              <p className="text-xs text-amber-800 font-medium">
                Consume or freeze them today to save money and prevent food waste.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenRecipes && (
              <button
                onClick={onOpenRecipes}
                className="flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Recipe Ideas
              </button>
            )}
            <button
              onClick={() => onFilterChange('expiring_today')}
              className="flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 transition cursor-pointer"
            >
              View Items ({expiringTodayCount})
            </button>
          </div>
        </div>
      )}

      {/* Main Status Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total Products Card */}
        <button
          onClick={() => onFilterChange('all')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
              : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Outfit']">
              {totalCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">items</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 truncate">All inventory items</p>
        </button>

        {/* 🟢 Fresh Products Card */}
        <button
          onClick={() => onFilterChange('fresh')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
            activeFilter === 'fresh'
              ? 'bg-emerald-50/90 border-emerald-600 shadow-md ring-2 ring-emerald-600/20'
              : 'bg-white/80 border-slate-200/80 hover:bg-emerald-50/40 hover:border-emerald-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <span>🟢</span> Fresh
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-100/80 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-800 font-['Outfit']">
              {freshCount}
            </span>
            <span className="text-xs text-emerald-600 font-medium">good</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-700 truncate">&gt; 3 days remaining</p>
        </button>

        {/* 🟠 Expiring Soon Card */}
        <button
          onClick={() => onFilterChange('expiring_soon')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
            activeFilter === 'expiring_soon'
              ? 'bg-orange-50/90 border-orange-500 shadow-md ring-2 ring-orange-500/20'
              : 'bg-white/80 border-slate-200/80 hover:bg-orange-50/40 hover:border-orange-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider flex items-center gap-1">
              <span>🟠</span> Soon
            </span>
            <span className="p-1.5 rounded-lg bg-orange-100/80 text-orange-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-orange-800 font-['Outfit']">
              {expiringSoonCount}
            </span>
            <span className="text-xs text-orange-600 font-medium">items</span>
          </div>
          <p className="mt-1 text-[11px] text-orange-700 truncate">Expires in 1-3 days</p>
        </button>

        {/* ⚡ Expiring Today Card */}
        <button
          onClick={() => onFilterChange('expiring_today')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
            activeFilter === 'expiring_today'
              ? 'bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-500/20'
              : 'bg-white/80 border-slate-200/80 hover:bg-amber-50/40 hover:border-amber-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <span>⚡</span> Today
            </span>
            <span className="p-1.5 rounded-lg bg-amber-100/80 text-amber-800">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-900 font-['Outfit']">
              {expiringTodayCount}
            </span>
            <span className="text-xs text-amber-700 font-medium">urgent</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-800 truncate">Expires today</p>
        </button>

        {/* 🔴 Expired Card */}
        <button
          onClick={() => onFilterChange('expired')}
          className={`col-span-2 lg:col-span-1 p-4 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
            activeFilter === 'expired'
              ? 'bg-rose-50/90 border-rose-600 shadow-md ring-2 ring-rose-600/20'
              : 'bg-white/80 border-slate-200/80 hover:bg-rose-50/40 hover:border-rose-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1">
              <span>🔴</span> Expired
            </span>
            <span className="p-1.5 rounded-lg bg-rose-100/80 text-rose-700">
              <XCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-rose-800 font-['Outfit']">
              {expiredCount}
            </span>
            <span className="text-xs text-rose-600 font-medium">items</span>
          </div>
          <p className="mt-1 text-[11px] text-rose-700 truncate">Check or discard</p>
        </button>

      </div>

      {/* Quick Hero Banner with Waste Savings & Action CTAs */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-4 sm:p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="space-y-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h2 className="text-lg sm:text-xl font-bold font-['Outfit'] flex items-center gap-2">
              <span>🌱</span> Zero-Waste Household Hub
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
              Active Protection
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Track fresh groceries, medicine, cosmetics and household items. Upload shopping bills with OCR to populate your inventory in seconds.
          </p>
          
          {/* Sustainability impact stats */}
          <div className="flex items-center justify-center md:justify-start gap-4 pt-2 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>${moneySaved.toFixed(2)} Saved</span>
            </div>
            <div className="flex items-center gap-1.5 text-teal-300 font-medium">
              <Leaf className="w-3.5 h-3.5" />
              <span>{co2PreventedKg} kg CO₂ Prevented</span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-center">
          <button
            onClick={() => {
              sound.playSuccess();
              onOpenScanBill();
            }}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Receipt className="w-4 h-4" />
            <span>Scan Bill (AI OCR)</span>
          </button>

          <button
            onClick={() => {
              sound.playSuccess();
              onOpenAddProduct();
            }}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Manually</span>
          </button>
        </div>

      </div>
    </div>
  );
};
