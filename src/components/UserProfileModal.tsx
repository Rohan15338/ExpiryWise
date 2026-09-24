import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  User, 
  Settings, 
  Download, 
  ShieldCheck, 
  Bell, 
  Volume2, 
  Trash2, 
  Save,
  DollarSign,
  Database
} from 'lucide-react';
import { exportUserDataAsCSV } from '../services/storageService';
import { sound } from '../services/notificationService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onResetData
}) => {
  const { user, updateUserProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || '$');
  const [reminderDaysDefault, setReminderDaysDefault] = useState(user?.reminderDaysDefault ?? 2);
  const [soundEnabled, setSoundEnabled] = useState(user?.soundEnabled ?? true);
  const [isSavedToast, setIsSavedToast] = useState(false);

  if (!isOpen || !user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim() || user.name,
      currency,
      reminderDaysDefault: Number(reminderDaysDefault),
      soundEnabled
    });
    sound.playSuccess();
    setIsSavedToast(true);
    setTimeout(() => {
      setIsSavedToast(false);
      onClose();
    }, 600);
  };

  const handleExportCSV = () => {
    const csvContent = exportUserDataAsCSV(user.id);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ExpiryWise_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    sound.playSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Settings className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                Account & Preferences
              </h2>
              <p className="text-xs text-slate-500">
                Manage your settings and data privacy
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
        <form onSubmit={handleSave} className="p-6 space-y-5">
          
          {/* User Info */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
              alt={user.name}
              className="w-14 h-14 rounded-2xl object-cover bg-emerald-100 ring-2 ring-emerald-500/30"
            />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900">{user.name}</h3>
              <p className="text-xs text-slate-500">{user.email}</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold mt-1">
                <ShieldCheck className="w-3 h-3" />
                Data private & isolated
              </span>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden font-medium"
            />
          </div>

          {/* Default Reminder Days & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Alert Days
              </label>
              <select
                value={reminderDaysDefault}
                onChange={(e) => setReminderDaysDefault(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden"
              >
                <option value={1}>1 day before</option>
                <option value={2}>2 days before (Recommended)</option>
                <option value={3}>3 days before</option>
                <option value={7}>1 week before</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Currency Symbol
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden"
              >
                <option value="$">$ (USD / CAD / AUD)</option>
                <option value="₹">₹ (INR)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="¥">¥ (JPY / CNY)</option>
              </select>
            </div>
          </div>

          {/* Sound Notification Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-800">Sound Chimes</span>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          {/* Export Data Button */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Data Management & Backup
            </label>
            <button
              type="button"
              onClick={handleExportCSV}
              className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-2xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Inventory as CSV Spreadsheet</span>
            </button>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
            >
              Log Out
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
