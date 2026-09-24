import { differenceInCalendarDays, parseISO, format, addDays, isValid } from 'date-fns';
import { ProductStatus } from '../types';

export function getDaysRemaining(expiryDateStr: string): number {
  try {
    if (!expiryDateStr) return 0;
    const expiry = parseISO(expiryDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return differenceInCalendarDays(expiry, today);
  } catch {
    return 0;
  }
}

export function getProductStatus(expiryDateStr: string, expiringSoonThresholdDays = 3): ProductStatus {
  const days = getDaysRemaining(expiryDateStr);
  if (days < 0) {
    return 'expired';
  } else if (days === 0) {
    return 'expiring_today';
  } else if (days <= expiringSoonThresholdDays) {
    return 'expiring_soon';
  }
  return 'fresh';
}

export function getStatusBadgeInfo(status: ProductStatus, daysRemaining?: number) {
  switch (status) {
    case 'expired':
      return {
        label: 'Expired',
        emoji: '🔴',
        bg: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300',
        badgeColor: 'bg-rose-500',
        pillBg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
        description: daysRemaining !== undefined ? `Expired ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} ago` : 'Expired'
      };
    case 'expiring_today':
      return {
        label: 'Expiring Today',
        emoji: '⚡',
        bg: 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/50 dark:border-amber-700 dark:text-amber-200',
        badgeColor: 'bg-amber-500 animate-pulse',
        pillBg: 'bg-amber-100 text-amber-900 font-semibold dark:bg-amber-900/60 dark:text-amber-200',
        description: 'Expires by end of day today!'
      };
    case 'expiring_soon':
      return {
        label: 'Expiring Soon',
        emoji: '🟠',
        bg: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300',
        badgeColor: 'bg-orange-500',
        pillBg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
        description: daysRemaining !== undefined ? `Expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}` : 'Expiring soon'
      };
    case 'fresh':
    default:
      return {
        label: 'Fresh',
        emoji: '🟢',
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300',
        badgeColor: 'bg-emerald-500',
        pillBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
        description: daysRemaining !== undefined ? `${daysRemaining} days remaining` : 'Good condition'
      };
  }
}

export function formatDateDisplay(dateStr: string): string {
  try {
    if (!dateStr) return '—';
    const parsed = parseISO(dateStr);
    if (!isValid(parsed)) return dateStr;
    return format(parsed, 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function calculateDateOffset(days: number, fromDateStr?: string): string {
  try {
    const base = fromDateStr ? parseISO(fromDateStr) : new Date();
    return format(addDays(base, days), 'yyyy-MM-dd');
  } catch {
    return format(addDays(new Date(), days), 'yyyy-MM-dd');
  }
}
