import React, { useState, useEffect } from 'react';

export default function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showAlert && isOnline) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 text-center py-2 px-4 text-xs font-bold shadow-md transition-all duration-300 ${
      isOnline 
        ? 'bg-emerald-500 text-white' 
        : 'bg-amber-500 text-white animate-pulse'
    }`}>
      {isOnline 
        ? '✨ Koneksi internet kembali terhubung.' 
        : '⚠️ Anda sedang offline. Beberapa fitur yang memerlukan sinkronisasi mungkin terbatas.'}
    </div>
  );
}