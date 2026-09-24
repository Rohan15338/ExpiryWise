import React from 'react';
import { Product, ProductStatus, StorageLocation } from '../types';
import { getDaysRemaining, formatDateDisplay, getProductStatus, getStatusBadgeInfo } from '../utils/dateUtils';
import { CATEGORY_ICONS, LOCATION_ICONS } from '../services/shelfLifeData';
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
  Sparkles, 
  ChefHat, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  Refrigerator
} from 'lucide-react';
import { sound } from '../services/notificationService';

interface OverviewViewProps {
  products: Product[];
  onNavigateToKitchen: (filter?: ProductStatus | 'all', location?: string) => void;
  onNavigateToScanner: () => void;
  onOpenAddProduct: () => void;
  onOpenRecipes: () => void;
  moneySaved: number;
  co2PreventedKg: number;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  products,
  onNavigateToKitchen,
  onNavigateToScanner,
  onOpenAddProduct,
  onOpenRecipes,
  moneySaved,
  co2PreventedKg
}) => {
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

  // Items expiring today or soonest
  const urgentItems = [...activeProducts]
    .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))
    .slice(0, 4);

  // Storage location counts
  const locationCounts: Record<string, number> = {};
  activeProducts.forEach(p => {
    locationCounts[p.storageLocation] = (locationCounts[p.storageLocation] || 0) + 1;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Hero Welcome Banner with Sustainability Impact */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] tracking-tight">
              Welcome to ExpiryWise Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time monitoring of all fresh groceries, pantry staples, medicines, and household supplies. Never let good items go to waste.
            </p>

            {/* Impact Metric Chips */}
            <div className="flex flex-wrap items-center gap-4 pt-3 text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-emerald-300 font-bold backdrop-blur-xs">
                <TrendingUp className="w-4 h-4" />
                <span>${moneySaved.toFixed(2)} Money Saved</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-teal-300 font-bold backdrop-blur-xs">
                <Leaf className="w-4 h-4" />
                <span>{co2PreventedKg} kg CO₂ Prevented</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => {
                sound.playSuccess();
                onNavigateToScanner();
              }}
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Receipt className="w-4 h-4" />
              <span>Scan Bill (AI OCR)</span>
            </button>

            <button
              onClick={() => {
                sound.playSuccess();
                onOpenAddProduct();
              }}
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Expiring Today Banner */}
      {expiringTodayCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border-2 border-amber-400/80 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-pulse-subtle">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-amber-500/30">
              ⚡
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-950 flex items-center gap-2">
                Action Required: {expiringTodayCount} item{expiringTodayCount === 1 ? '' : 's'} expiring today!
              </h3>
              <p className="text-xs text-amber-800 font-medium mt-0.5">
                Consume, prepare, or freeze these items today to avoid food waste.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onOpenRecipes}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Recipe Ideas</span>
            </button>
            <button
              onClick={() => onNavigateToKitchen('expiring_today')}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 transition cursor-pointer flex items-center justify-center gap-1"
            >
              <span>View In Kitchen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 5 Interactive Status Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Inventory Health Status
          </h2>
          <span className="text-xs text-slate-400 font-medium">Click any card to open in Kitchen</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          
          {/* Total Products */}
          <div
            onClick={() => onNavigateToKitchen('all')}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-400 hover:shadow-md transition cursor-pointer group text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Items</span>
              <span className="p-2 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-slate-200 transition">
                <Package className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-['Outfit']">
                {totalCount}
              </span>
              <span className="text-xs text-slate-400 font-medium">active</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
              <span>View all in Kitchen</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>

          {/* 🟢 Fresh Products */}
          <div
            onClick={() => onNavigateToKitchen('fresh')}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-md hover:bg-emerald-50/20 transition cursor-pointer group text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                <span>🟢</span> Fresh
              </span>
              <span className="p-2 rounded-xl bg-emerald-100/80 text-emerald-700 group-hover:bg-emerald-200 transition">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-800 font-['Outfit']">
                {freshCount}
              </span>
              <span className="text-xs text-emerald-600 font-medium">good</span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-700 flex items-center gap-1">
              <span>&gt; 3 days remaining</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>

          {/* 🟠 Expiring Soon */}
          <div
            onClick={() => onNavigateToKitchen('expiring_soon')}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-orange-400 hover:shadow-md hover:bg-orange-50/20 transition cursor-pointer group text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-700 uppercase tracking-wider flex items-center gap-1">
                <span>🟠</span> Soon
              </span>
              <span className="p-2 rounded-xl bg-orange-100/80 text-orange-700 group-hover:bg-orange-200 transition">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-orange-800 font-['Outfit']">
                {expiringSoonCount}
              </span>
              <span className="text-xs text-orange-600 font-medium">items</span>
            </div>
            <p className="mt-1 text-[11px] text-orange-700 flex items-center gap-1">
              <span>Expires in 1-3 days</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>

          {/* ⚡ Expiring Today */}
          <div
            onClick={() => onNavigateToKitchen('expiring_today')}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-md hover:bg-amber-50/20 transition cursor-pointer group text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                <span>⚡</span> Today
              </span>
              <span className="p-2 rounded-xl bg-amber-100/80 text-amber-800 group-hover:bg-amber-200 transition">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-900 font-['Outfit']">
                {expiringTodayCount}
              </span>
              <span className="text-xs text-amber-700 font-medium">urgent</span>
            </div>
            <p className="mt-1 text-[11px] text-amber-800 flex items-center gap-1">
              <span>Expires today</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>

          {/* 🔴 Expired */}
          <div
            onClick={() => onNavigateToKitchen('expired')}
            className="col-span-2 sm:col-span-1 p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-rose-400 hover:shadow-md hover:bg-rose-50/20 transition cursor-pointer group text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                <span>🔴</span> Expired
              </span>
              <span className="p-2 rounded-xl bg-rose-100/80 text-rose-700 group-hover:bg-rose-200 transition">
                <XCircle className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-800 font-['Outfit']">
                {expiredCount}
              </span>
              <span className="text-xs text-rose-600 font-medium">items</span>
            </div>
            <p className="mt-1 text-[11px] text-rose-700 flex items-center gap-1">
              <span>Review or discard</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>

        </div>
      </div>

      {/* Two-Column Section: Urgent Attention Items + Storage Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left (2 cols): Most Urgent Items */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                Upcoming Expiries Requiring Attention
              </h3>
              <p className="text-xs text-slate-500">
                Prioritized by earliest expiration date
              </p>
            </div>

            <button
              onClick={() => onNavigateToKitchen('all')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({activeProducts.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {urgentItems.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No items currently tracked. Add products or scan a receipt!
              </div>
            ) : (
              urgentItems.map((item) => {
                const days = getDaysRemaining(item.expiryDate);
                const status = getProductStatus(item.expiryDate);
                const badge = getStatusBadgeInfo(status, days);
                const cat = CATEGORY_ICONS[item.category] || CATEGORY_ICONS.Other;
                const loc = LOCATION_ICONS[item.storageLocation] || LOCATION_ICONS.Other;

                return (
                  <div
                    key={item.id}
                    onClick={() => onNavigateToKitchen('all')}
                    className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-lg shrink-0 shadow-2xs">
                        {cat.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {item.name}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.pillBg}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.quantity} • {loc.icon} {item.storageLocation}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-slate-800">
                        {formatDateDisplay(item.expiryDate)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {badge.description}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right (1 col): Storage Locations Breakdown */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
              <Refrigerator className="w-5 h-5 text-emerald-600" />
              <span>Storage Zones</span>
            </h3>
            <p className="text-xs text-slate-500">
              Distribution of items across kitchen & home
            </p>
          </div>

          <div className="space-y-2">
            {(
              ['Fridge', 'Freezer', 'Pantry', 'Medicine Cabinet', 'Bathroom', 'Vanity', 'Kitchen Shelf', 'Other'] as StorageLocation[]
            ).map((locName) => {
              const count = locationCounts[locName] || 0;
              const meta = LOCATION_ICONS[locName] || { icon: '📦', label: locName };
              return (
                <div
                  key={locName}
                  onClick={() => onNavigateToKitchen('all', locName)}
                  className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between transition cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{meta.icon}</span>
                    <span className="font-semibold text-slate-700">{locName}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg font-bold ${
                    count > 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {count} item{count === 1 ? '' : 's'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
