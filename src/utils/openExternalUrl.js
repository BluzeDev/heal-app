import { Capacitor } from '@capacitor/core';

/**
 * Membuka tautan eksternal (WhatsApp, YouTube, Google Maps, dll.)
 * Bekerja mulus baik di Web Browser maupun Android Native Capacitor
 */
export async function openExternalUrl(url) {
  if (!url) return;
  if (Capacitor.isNativePlatform()) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url, windowName: '_system' });
      return;
    } catch (e) {
      console.warn("Capacitor Browser open failed, fallback to window.open:", e);
    }
  }
  window.open(url, '_blank');
}
