import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Receipt, 
  Bell, 
  Leaf, 
  CheckCircle2, 
  ChefHat, 
  Lock
} from 'lucide-react';

interface WelcomeGuestViewProps {
  onOpenSignUp: () => void;
  onOpenLogin: () => void;
}

export const WelcomeGuestView: React.FC<WelcomeGuestViewProps> = ({
  onOpenSignUp,
  onOpenLogin
}) => {
  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 space-y-12 animate-in fade-in duration-300">
      
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200 shadow-2xs">
          <span>🌱 Smart Expiry Tracking & Waste Prevention</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] leading-tight">
          Know before it expires.<br />
          <span className="text-emerald-600">Waste less food & save money.</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          ExpiryWise tracks grocery bills, pantry items, medicine, and cosmetics with automated expiry countdowns, AI receipt OCR scanning, and zero-waste recipes.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={onOpenSignUp}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In to Your Account</span>
          </button>
        </div>
      </div>

      {/* 3 Core Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl">
            🟢
          </div>
          <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
            Urgency Expiry Indicators
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Color-coded status cards (Fresh, Expiring Soon, Expiring Today, Expired) keep you informed so you always use items on time.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Receipt className="w-6 h-6 text-teal-600" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
            AI Optical Bill Scanner
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Snap a photo or upload your grocery receipt to automatically extract product names, quantities, and smart shelf-life recommendations.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-amber-700" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
            Zero-Waste Kitchen Recipes
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Get instant cooking and preservation ideas for ingredients expiring today or soon to eliminate household food waste.
          </p>
        </div>

      </div>

      {/* Privacy Guarantee Box */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">100% Private & User-Scoped Data</h4>
            <p className="text-xs text-slate-400">
              Each user's inventory, receipt scans, and reminders are completely private.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSignUp}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer"
        >
          Get Started Free
        </button>
      </div>

    </div>
  );
};
