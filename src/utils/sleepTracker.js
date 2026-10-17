/**
 * sleepTracker.js — Device activity detection & sleep analysis for teenagers
 */
import { Capacitor } from '@capacitor/core';

export function getTodayDateKey() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Catat event aktif / inaktif layar
 */
export function logDeviceActivity(type) {
  try {
    const dateKey = getTodayDateKey();
    const storageKey = `heal_sleep_events_${dateKey}`;
    const events = JSON.parse(localStorage.getItem(storageKey) || '[]');
    events.push({
      type,
      timestamp: Date.now(),
    });
    localStorage.setItem(storageKey, JSON.stringify(events));
  } catch (e) {
    console.warn('Gagal mencatat aktivitas perangkat:', e);
  }
}

/**
 * Inisialisasi listener deteksi aktivitas ponsel
 */
export function initDeviceActivityTracker() {
  // 1. Web visibility change
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      const state = document.visibilityState === 'visible' ? 'active' : 'inactive';
      logDeviceActivity(state);
    });
  }

  // 2. Native Capacitor App State
  if (Capacitor.isNativePlatform()) {
    (async () => {
      try {
        const appPlugin = '@capacitor/app';
        const { App } = await import(/* @vite-ignore */ appPlugin);
        App.addListener('appStateChange', ({ isActive }) => {
          logDeviceActivity(isActive ? 'active' : 'inactive');
        });
      } catch (err) {
        console.warn('Capacitor App state tracking unavail:', err);
      }
    })();
  }

  // Log awal saat aplikasi dibuka
  logDeviceActivity('active');
}

/**
 * Analisis kualitas tidur dari rekaman event
 */
export function analyzeDeviceSleep(dateKey = getTodayDateKey()) {
  try {
    const storageKey = `heal_sleep_events_${dateKey}`;
    const events = JSON.parse(localStorage.getItem(storageKey) || '[]');

    if (!events || events.length < 2) {
      // Default perkiraan jika data baru
      return {
        hasData: false,
        durationHours: 7.5,
        bedtimeStr: '22:30',
        wakeTimeStr: '06:00',
        interruptions: 0,
        quality: 'Baik',
        qualityBadge: '✨ Ideal (7.5 Jam)',
      };
    }

    // Urutkan event
    const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);

    // Cari jeda inaktif terpanjang
    let longestInactiveMs = 0;
    let bedtime = null;
    let wakeTime = null;
    let interruptions = 0;

    for (let i = 0; i < sorted.length - 1; i++) {
      const curr = sorted[i];
      const next = sorted[i + 1];

      if (curr.type === 'inactive' && next.type === 'active') {
        const diffMs = next.timestamp - curr.timestamp;
        if (diffMs > longestInactiveMs) {
          longestInactiveMs = diffMs;
          bedtime = new Date(curr.timestamp);
          wakeTime = new Date(next.timestamp);
        }
        // Hitung gangguan jika ada jeda singkat aktif di malam hari
        if (diffMs > 3 * 60 * 60 * 1000) {
          // durasi tidur utama
        } else if (diffMs > 30 * 60 * 1000) {
          interruptions++;
        }
      }
    }

    const durationHours = longestInactiveMs > 0 
      ? Math.round((longestInactiveMs / (1000 * 60 * 60)) * 10) / 10 
      : 7.5;

    let quality = 'Baik';
    let qualityBadge = '👍 Cukup Baik';
    if (durationHours >= 8) {
      quality = 'Sangat Baik';
      qualityBadge = '✨ Sangat Ideal (≥8 Jam)';
    } else if (durationHours >= 7) {
      quality = 'Baik';
      qualityBadge = '👍 Cukup Baik (7-8 Jam)';
    } else if (durationHours >= 5) {
      quality = 'Cukup';
      qualityBadge = '⚠️ Cukup (5-7 Jam)';
    } else {
      quality = 'Kurang';
      qualityBadge = '🚨 Kurang Tidur (<5 Jam)';
    }

    const formatHour = (d) => {
      if (!d) return '--:--';
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    return {
      hasData: longestInactiveMs > 0,
      durationHours,
      bedtimeStr: bedtime ? formatHour(bedtime) : '22:30',
      wakeTimeStr: wakeTime ? formatHour(wakeTime) : '06:00',
      interruptions,
      quality,
      qualityBadge,
    };
  } catch (err) {
    console.warn('Gagal menganalisis tidur:', err);
    return {
      hasData: false,
      durationHours: 7.5,
      bedtimeStr: '22:30',
      wakeTimeStr: '06:00',
      interruptions: 0,
      quality: 'Baik',
      qualityBadge: '✨ Ideal (7.5 Jam)',
    };
  }
}
