import { Product, NotificationItem } from '../types';
import { getDaysRemaining, getProductStatus } from '../utils/dateUtils';

// Simple Web Audio tone synthesizer (no external audio assets needed!)
class SoundEffects {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playSuccess() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, this.ctx.currentTime + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, this.ctx.currentTime + 0.2); // G5

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch {
      // Audio playback ignored if blocked
    }
  }

  playAlert() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime); // A4
      osc.frequency.setValueAtTime(349.23, this.ctx.currentTime + 0.15); // F4

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch {
      // Audio playback ignored if blocked
    }
  }
}

export const sound = new SoundEffects();

export function generateNotifications(products: Product[]): NotificationItem[] {
  const notifications: NotificationItem[] = [];

  products.forEach(p => {
    if (p.isConsumed || p.isWasted) return;

    const daysRemaining = getDaysRemaining(p.expiryDate);
    const status = getProductStatus(p.expiryDate);
    const reminderDays = p.reminderPreference ?? 2;

    // Trigger notification if item is within reminder threshold, expiring today, or expired
    if (daysRemaining <= reminderDays) {
      notifications.push({
        id: `notif_${p.id}`,
        productId: p.id,
        productName: p.name,
        category: p.category,
        expiryDate: p.expiryDate,
        daysRemaining,
        status,
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  });

  return notifications.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

export function sendBrowserNotification(title: string, body: string, icon = '🌱') {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`ExpiryWise: ${title}`, {
        body,
        icon: `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${icon}</text></svg>`
      });
    } catch {
      // Ignored
    }
  }
}
