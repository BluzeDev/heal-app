import React, { useState, useEffect } from 'react';
import { triggerFeedback } from './utils/feedback';

export default function CookieConsentBanner({ isDarkMode }) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('heal_cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    triggerFeedback();
    localStorage.setItem('heal_cookie_consent', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/70 backdrop-blur-md flex justify-center items-center animate-fadeIn">
      <div className={`max-w-xl w-full rounded-3xl p-5 shadow-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-pink-100 text-gray-800'
      }`}>
        <div className="space-y-1 text-xs leading-relaxed text-center sm:text-left">
          <p className="font-bold flex items-center justify-center sm:justify-start gap-1.5">
            <span>🍪</span> Izin Penyimpanan & Sesi
          </p>
          <p className="opacity-80">
            HEAL menggunakan penyimpanan lokal (local storage) untuk menjaga sesi login kamu tetap aktif dan merekam progres harian tanpa hilang saat di-refresh.
          </p>
        </div>
        <button
          onClick={handleAccept}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-md shrink-0 transition-all cursor-pointer"
        >
          Terima & Lanjutkan ✨
        </button>
      </div>
    </div>
  );
}