import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Receipt, 
  Bell, 
  Search, 
  LogOut, 
  Settings, 
  LayoutDashboard,
  Refrigerator,
  ScanLine,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { NotificationItem } from '../types';
import { sound } from '../services/notificationService';

export type ActiveTab = 'overview' | 'kitchen' | 'scan';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddProduct: () => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  notifications: NotificationItem[];
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenAddProduct,
  onOpenProfile,
  onOpenNotifications,
  notifications,
  onOpenAuth
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const unreadCount = notifications.length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => onTabChange('overview')}
            className="flex items-center gap-3 shrink-0 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">🌱</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-['Outfit']">
                  Expiry<span className="text-emerald-600">Wise</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  v2.0
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 font-medium tracking-tight">
                Know before it expires. Waste less.
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (3 Main Pages) */}
          <nav className="hidden md:flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/60 shadow-2xs">
            <button
              onClick={() => {
                sound.playSuccess();
                onTabChange('overview');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-600" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => {
                sound.playSuccess();
                onTabChange('kitchen');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'kitchen'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Refrigerator className="w-4 h-4 text-emerald-600" />
              <span>My Products / Kitchen</span>
            </button>

            <button
              onClick={() => {
                sound.playSuccess();
                onTabChange('scan');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'scan'
                  ? 'bg-white text-teal-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ScanLine className="w-4 h-4 text-teal-600" />
              <span>Bill Scanning</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-teal-100 text-teal-800">
                AI OCR
              </span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Add Product Button */}
            <button
              onClick={() => {
                sound.playSuccess();
                onOpenAddProduct();
              }}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-subtle shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pl-2 text-left rounded-xl hover:bg-slate-100 transition cursor-pointer border border-transparent hover:border-slate-200"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-emerald-500/30 bg-emerald-50"
                  />
                  <div className="hidden lg:block text-left pr-1">
                    <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[100px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-none">
                      {user.email.split('@')[0]}
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenProfile();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Account & Preferences
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenNotifications();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Bell className="w-4 h-4 text-slate-400" />
                      Expiry Alerts ({notifications.length})
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 flex flex-col gap-1.5">
            <button
              onClick={() => {
                onTabChange('overview');
                setMobileMenuOpen(false);
              }}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 ${
                activeTab === 'overview' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-600" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => {
                onTabChange('kitchen');
                setMobileMenuOpen(false);
              }}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 ${
                activeTab === 'kitchen' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Refrigerator className="w-4 h-4 text-emerald-600" />
              <span>My Products / Kitchen</span>
            </button>

            <button
              onClick={() => {
                onTabChange('scan');
                setMobileMenuOpen(false);
              }}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 ${
                activeTab === 'scan' ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ScanLine className="w-4 h-4 text-teal-600" />
              <span>Bill Scanning</span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
