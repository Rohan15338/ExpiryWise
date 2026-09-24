import React from 'react';
import { Product } from '../types';
import { 
  getDaysRemaining, 
  getProductStatus, 
  getStatusBadgeInfo, 
  formatDateDisplay 
} from '../utils/dateUtils';
import { CATEGORY_ICONS, LOCATION_ICONS } from '../services/shelfLifeData';
import { 
  Check, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Calendar, 
  CheckCircle2 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../services/notificationService';

interface ProductListItemProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onMarkConsumed: (id: string) => void;
  onMarkWasted: (id: string) => void;
  onShowRecipeForProduct?: (productName: string) => void;
}

export const ProductListItem: React.FC<ProductListItemProps> = ({
  product,
  onEdit,
  onDelete,
  onMarkConsumed,
  onMarkWasted,
  onShowRecipeForProduct
}) => {
  const daysRemaining = getDaysRemaining(product.expiryDate);
  const status = getProductStatus(product.expiryDate);
  const badgeInfo = getStatusBadgeInfo(status, daysRemaining);
  const categoryInfo = CATEGORY_ICONS[product.category] || CATEGORY_ICONS.Other;
  const locationInfo = LOCATION_ICONS[product.storageLocation] || LOCATION_ICONS.Other;

  const handleConsume = () => {
    sound.playSuccess();
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#10B981', '#059669', '#FBBF24']
    });
    onMarkConsumed(product.id);
  };

  const isFoodOrBeverage = product.category === 'Food' || product.category === 'Beverages';

  return (
    <div className={`px-4 py-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
      product.isConsumed
        ? 'bg-slate-50 border-slate-200 opacity-60'
        : status === 'expired'
        ? 'bg-rose-50/50 border-rose-200'
        : status === 'expiring_today'
        ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300'
        : status === 'expiring_soon'
        ? 'bg-orange-50/40 border-orange-200'
        : 'bg-white border-slate-200 hover:border-emerald-300'
    }`}>
      
      {/* Left: Product Icon & Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0 border border-slate-200">
          {categoryInfo.icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {product.name}
            </h4>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeInfo.pillBg}`}>
              {badgeInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            {product.brand && <span>{product.brand} •</span>}
            <span>{product.quantity}</span>
            <span>• {locationInfo.icon} {product.storageLocation}</span>
          </div>
        </div>
      </div>

      {/* Right: Dates & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        
        <div className="text-right">
          <div className="text-xs font-bold text-slate-800">
            {formatDateDisplay(product.expiryDate)}
          </div>
          <div className="text-[11px] text-slate-500">
            {badgeInfo.description}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isFoodOrBeverage && onShowRecipeForProduct && (status === 'expiring_today' || status === 'expiring_soon') && (
            <button
              onClick={() => onShowRecipeForProduct(product.name)}
              className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition cursor-pointer"
              title="View Recipe"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
            </button>
          )}

          {!product.isConsumed && (
            <button
              onClick={handleConsume}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Mark as Consumed"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Used</span>
            </button>
          )}

          <button
            onClick={() => onEdit(product)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(product.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
