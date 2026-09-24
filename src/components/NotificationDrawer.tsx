import React, { useState } from 'react';
import { X, Bell, Volume2, AlertTriangle, CheckCircle, Calendar, Sparkles, ExternalLink } from 'lucide-react';
import { NotificationItem } from '../types';
import { getStatusBadgeInfo, formatDateDisplay } from '../utils/dateUtils';
import { requestNotificationPermission, sound } from '../services/notificationService';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onSelectProduct: (productId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onSelectProduct
}) => {
  const [browserPushEnabled, setBrowserPushEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  if (!isOpen) return null;

  const handleEnablePush = async () => {
    const granted = await requestNotificationPermission();
    setBrowserPushEnabled(granted);
    if (granted) {
      sound.playSuccess();
      alert('Browser notifications enabled! ExpiryWise will alert you before items expire.');
    } else {
      alert('Notification permissions were not granted in browser settings.');
    }
  };

  const handleTestSound = () => {
    sound.playSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
                Expiry Alerts & Reminders
              </h2>
              <p className="text-xs text-slate-500">
                {notifications.length} item{notifications.length === 1 ? '' : 's'} require attention
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

        {/* Browser Push & Sound Controls */}
        <div className="p-4 bg-emerald-50/60 border-b border-emerald-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-xs">
              <p className="font-bold text-emerald-950">Desktop Reminders</p>
              <p className="text-emerald-700 text-[11px]">
                {browserPushEnabled ? 'Active and listening' : 'Enable system notifications'}
              </p>
            </div>
            {!browserPushEnabled ? (
              <button
                onClick={handleEnablePush}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                Enable
              </button>
            ) : (
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                Enabled
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-emerald-200/50">
            <span className="text-[11px] text-emerald-900 font-medium">Test sound chime:</span>
            <button
              onClick={handleTestSound}
              className="px-2.5 py-1 bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Chime</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 opacity-80" />
              <p className="text-sm font-bold text-slate-700">All clear!</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                No items are expiring today or within your reminder window.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const badge = getStatusBadgeInfo(item.status, item.daysRemaining);
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectProduct(item.productId);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-slate-50 transition cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{badge.emoji}</span>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                          {item.productName}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Category: {item.category} • Expiry: {formatDateDisplay(item.expiryDate)}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${badge.pillBg}`}>
                      {badge.description}
                    </span>
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
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  );
};
