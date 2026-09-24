import React, { useState } from 'react';
import { Product } from '../types';
import { 
  X, 
  ShoppingCart, 
  RotateCcw, 
  Trash2, 
  Copy, 
  Check, 
  Plus, 
  Sparkles,
  TrendingUp,
  Leaf
} from 'lucide-react';
import { CATEGORY_ICONS } from '../services/shelfLifeData';
import { sound } from '../services/notificationService';

interface ReplenishDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onReAddProduct: (product: Product) => void;
  onPermanentlyDelete: (id: string) => void;
}

export const ReplenishDrawer: React.FC<ReplenishDrawerProps> = ({
  isOpen,
  onClose,
  products,
  onReAddProduct,
  onPermanentlyDelete
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pastItems = products.filter(p => p.isConsumed || p.isWasted);

  const handleCopyShoppingList = () => {
    const list = pastItems.map(p => `- ${p.name} (${p.quantity})`).join('\n');
    navigator.clipboard.writeText(list || 'No items in replenishment list.');
    setCopied(true);
    sound.playSuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
                Replenishment & Shopping List
              </h2>
              <p className="text-xs text-slate-500">
                Items used or discarded ready for restock
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            {pastItems.length} Past Item{pastItems.length === 1 ? '' : 's'}
          </span>
          <button
            onClick={handleCopyShoppingList}
            disabled={pastItems.length === 0}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy List</span>
              </>
            )}
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {pastItems.length === 0 ? (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <ShoppingCart className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No finished items yet</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                When you mark items as used or consumed, they will appear here for easy replenishment!
              </p>
            </div>
          ) : (
            pastItems.map((item) => {
              const cat = CATEGORY_ICONS[item.category] || CATEGORY_ICONS.Other;
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 transition flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">
                      {cat.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {item.quantity} • {item.isConsumed ? '✅ Used Up' : '⚠️ Wasted'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onReAddProduct(item)}
                      className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Re-add to current inventory"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-buy</span>
                    </button>

                    <button
                      onClick={() => onPermanentlyDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Remove permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
