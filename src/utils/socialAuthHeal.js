/**
 * socialAuthHeal.js — Social OAuth for Heal APP (Web & Android Capacitor)
 */
import { 
  signInWithPopup, 
  browserPopupRedirectResolver, 
  GoogleAuthProvider, 
  signInWithCredential 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { Capacitor } from '@capacitor/core';

/**
 * Login dengan Google (Bekerja di Web Browser & Android Native Capacitor)
 */
export async function loginWithGoogle() {
  // 1. Jalur Android / iOS Native Capacitor (Menggunakan Google Play Services Picker)
  if (Capacitor.isNativePlatform()) {
    try {
      const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
      
      try {
        await GoogleAuth.initialize();
      } catch (initErr) {
        // Plugin sudah terinisialisasi
      }

      const googleUser = await GoogleAuth.signIn();

      // Jika mendapatkan idToken, hubungkan ke Firebase Auth credential
      if (googleUser && googleUser.authentication && googleUser.authentication.idToken) {
        try {
          const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
          const fbUser = await signInWithCredential(auth, credential);
          return {
            displayName: fbUser.user.displayName || googleUser.name || 'User Google',
            email: fbUser.user.email || googleUser.email || '',
            photoURL: fbUser.user.photoURL || googleUser.imageUrl || null,
            uid: fbUser.user.uid || googleUser.id,
          };
        } catch (credErr) {
          console.warn('Gagal menghubungkan credential ke Firebase, menggunakan profile Google:', credErr);
        }
      }

      return {
        displayName: googleUser.name || googleUser.displayName || 'User Google',
        email: googleUser.email || '',
        photoURL: googleUser.imageUrl || null,
        uid: googleUser.id,
      };
    } catch (err) {
      console.error('Native Android Google Auth error:', err);
      if (err.message && (err.message.includes('popup_closed') || err.message.includes('cancel') || err.message.includes('12501'))) {
        // User menekan tombol back/cancel pada picker Google
        return null;
      }
      throw new Error(
        'Google Sign-In di Android memerlukan konfigurasi SHA-1 fingerprint di Firebase Console. ' +
        (err.message || '')
      );
    }
  }

  // 2. Jalur Web Browser (Desktop / Mobile Chrome / PWA)
  try {
    const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
    return {
      displayName: result.user.displayName || result.user.email?.split('@')[0] || 'User Google',
      email: result.user.email || '',
      photoURL: result.user.photoURL || null,
      uid: result.user.uid,
    };
  } catch (err) {
    if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
      console.info('Google Sign-In popup ditutup oleh pengguna.');
      return null;
    }
    throw err;
  }
}

/**
 * Login dengan Instagram (Bekerja di Web Browser & Android Native Capacitor)
 */
export async function startInstagramLogin() {
  const igAppId = import.meta.env.VITE_INSTAGRAM_APP_ID || '';
  if (!igAppId) {
    // Kembalikan simulasi jika belum ada App ID
    return {
      displayName: 'Instagram User',
      username: 'ig_user',
      photoURL: null,
    };
  }

  const redirectUri = `${window.location.origin}/oauth/instagram`;
  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${igAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code`;

  if (Capacitor.isNativePlatform()) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: authUrl, windowName: '_system' });
    } catch (e) {
      window.location.href = authUrl;
    }
  } else {
    window.location.href = authUrl;
  }
}
