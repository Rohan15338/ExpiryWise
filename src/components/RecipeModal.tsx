import React from 'react';
import { X, Sparkles, Clock, ChefHat, CheckCircle2, ArrowRight } from 'lucide-react';
import { findRecipesForExpiringItems, ZERO_WASTE_RECIPES, RecipeIdea } from '../services/recipeSuggestions';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  expiringItemNames: string[];
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  expiringItemNames
}) => {
  if (!isOpen) return null;

  const recipes = findRecipesForExpiringItems(expiringItemNames);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
              <ChefHat className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                <span>Zero-Waste Kitchen Recipes</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </h2>
              <p className="text-xs text-slate-500">
                Delicious ways to use up ingredients before they expire
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

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="p-5 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {recipe.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{recipe.prepTime}</span>
                </div>
              </div>

              {/* Steps */}
              <div className="bg-white/80 rounded-xl p-3 border border-amber-100 space-y-2 text-xs text-slate-700">
                <span className="font-bold text-amber-950 uppercase tracking-wider text-[10px] block">
                  Quick Instructions:
                </span>
                {recipe.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition cursor-pointer"
          >
            Got it, Let's Cook!
          </button>
        </div>

      </div>
    </div>
  );
};
