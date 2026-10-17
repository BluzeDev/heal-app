import { Capacitor } from '@capacitor/core';

/**
 * Membuka tautan eksternal (WhatsApp, YouTube, Google Maps, Instagram, TikTok, dan tel:119)
 * Kompatibel untuk Web Browser dan Android Native Capacitor WebView
 * Mencegah error ERR_UNKNOWN_URL_SCHEME pada skema tel:, whatsapp:, dan mailto:
 */
export async function openExternalLink(url) {
  if (!url) return;

  const trimmed = url.trim();

  // 1. Skema telepon (tel:), whatsapp langsung (whatsapp:), atau email (mailto:)
  if (trimmed.startsWith('tel:') || trimmed.startsWith('whatsapp:') || trimmed.startsWith('mailto:')) {
    window.location.href = trimmed;
    return;
  }

  // 2. Android Native Capacitor: Buka via System Browser / App Intent bawaan
  if (Capacitor.isNativePlatform()) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: trimmed, windowName: '_system' });
      return;
    } catch (e) {
      console.warn("Capacitor Browser open failed, fallback to window.open:", e);
    }
  }

  // 3. Fallback Web Browser biasa
  window.open(trimmed, '_blank', 'noopener,noreferrer');
}

// Alias untuk kompatibilitas kode yang sudah menggunakan openExternalUrl
export const openExternalUrl = openExternalLink;
