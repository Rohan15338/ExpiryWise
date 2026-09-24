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
  MapPin, 
  Tag, 
  AlertCircle,
  MoreVertical,
  XCircle,
  CheckCircle,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../services/notificationService';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onMarkConsumed: (id: string) => void;
  onMarkWasted: (id: string) => void;
  onShowRecipeForProduct?: (productName: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
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
    // Launch delightful confetti burst
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10B981', '#059669', '#34D399', '#FBBF24']
    });
    onMarkConsumed(product.id);
  };

  const handleWaste = () => {
    sound.playAlert();
    onMarkWasted(product.id);
  };

  const isFoodOrBeverage = product.category === 'Food' || product.category === 'Beverages';

  return (
    <div className={`rounded-3xl border p-4 sm:p-5 transition-all duration-200 relative overflow-hidden flex flex-col justify-between group ${
      product.isConsumed
        ? 'bg-slate-50/70 border-slate-200 opacity-60'
        : product.isWasted
        ? 'bg-rose-50/40 border-rose-200 opacity-60'
        : status === 'expired'
        ? 'bg-white border-rose-200 hover:border-rose-400 hover:shadow-md'
        : status === 'expiring_today'
        ? 'bg-white border-amber-300 ring-2 ring-amber-400/20 shadow-sm hover:shadow-md'
        : status === 'expiring_soon'
        ? 'bg-white border-orange-200 hover:border-orange-400 hover:shadow-md'
        : 'bg-white border-slate-200/80 hover:border-emerald-300 hover:shadow-md'
    }`}>

      {/* Top Bar: Status Badge & Category */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          
          {/* Status Indicator */}
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${badgeInfo.bg}`}>
            <span className="text-xs">{badgeInfo.emoji}</span>
            <span>{badgeInfo.label}</span>
          </div>

          {/* Category Tag */}
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-100/80 px-2 py-0.5 rounded-lg">
            <span>{categoryInfo.icon}</span>
            <span className="truncate max-w-[80px]">{product.category}</span>
          </div>
        </div>

        {/* Product Image & Main Details */}
        <div className="flex items-start gap-3.5 mb-3">
          {product.photoUrl ? (
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
              <img
                src={product.photoUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-50 border border-slate-200/80 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
              {categoryInfo.icon}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate group-hover:text-emerald-700 transition-colors">
              {product.name}
            </h3>
            
            {product.brand && (
              <p className="text-xs text-slate-500 font-medium truncate">
                by {product.brand}
              </p>
            )}

            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-700">
                {product.quantity}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <span>{locationInfo.icon}</span>
                <span>{product.storageLocation}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Date Timeline Indicator */}
        <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 space-y-1.5 mb-3 text-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Expires:</span>
            </span>
            <span className={`font-bold ${
              status === 'expired'
                ? 'text-rose-600'
                : status === 'expiring_today'
                ? 'text-amber-700 font-extrabold'
                : status === 'expiring_soon'
                ? 'text-orange-600'
                : 'text-emerald-700'
            }`}>
              {formatDateDisplay(product.expiryDate)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Countdown:</span>
            <span className="font-semibold text-slate-700">
              {badgeInfo.description}
            </span>
          </div>

          {product.notes && (
            <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60 truncate">
              "{product.notes}"
            </p>
          )}
        </div>
      </div>

      {/* Bottom Actions Toolbar */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        
        {/* Zero-waste Recipe Helper */}
        {isFoodOrBeverage && onShowRecipeForProduct && (status === 'expiring_today' || status === 'expiring_soon') && (
          <button
            onClick={() => onShowRecipeForProduct(product.name)}
            className="px-2.5 py-1.5 text-[11px] font-bold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 flex items-center gap-1 transition cursor-pointer"
            title="Get recipes for this expiring item"
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Recipe</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Mark Consumed / Used */}
          {!product.isConsumed && (
            <button
              onClick={handleConsume}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 transition flex items-center gap-1 cursor-pointer active:scale-95"
              title="Mark as used / consumed (Zero-waste win!)"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Used</span>
            </button>
          )}

          {/* Edit */}
          <button
            onClick={() => onEdit(product)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Edit item"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(product.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
            title="Delete item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
