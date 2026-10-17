import React, { useState, useEffect } from 'react';
import { triggerFeedback } from './utils/feedback';

export default function InstallPWAButton({ isDarkMode }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleClick = async () => {
    triggerFeedback();
    if (deferredPrompt) {
      // Jika browser mendukung instalasi otomatis
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Jika tidak (misal di HP dengan browser tertentu atau iOS), tampilkan panduan manual
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold p-4 rounded-3xl shadow-lg flex items-center justify-center gap-2 text-xs animate-bounce cursor-pointer hover:opacity-95 transition-all"
      >
        <span className="text-base">📱</span> Install Aplikasi HEAL ke Layar Utama HP
      </button>

      {/* Modal Panduan Jika Event Otomatis Tidak Didukung Langsung oleh Browser */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border space-y-4 ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-pink-100 text-gray-800'
          }`}>
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <span>📲</span> Cara Install Aplikasi HEAL
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-sm">✕</button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed opacity-90">
              <p>Agar aplikasi HEAL menempel di layar utama HP kamu seperti aplikasi biasa:</p>
              <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20 space-y-2">
                <p className="font-bold text-pink-500">Google Chrome (Android):</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Ketuk ikon <b>titik tiga (⋮)</b> di pojok kanan atas browser.</li>
                  <li>Pilih opsi <b>"Tambahkan ke layar utama"</b> atau <b>"Install app"</b>.</li>
                  <li>Ketuk <b>Install</b>. Selesai!</li>
                </ol>
              </div>
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                <p className="font-bold text-purple-500">Safari (iPhone / iOS):</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Ketuk ikon <b>Bagikan (Share)</b> di bagian bawah browser.</li>
                  <li>Pilih opsi <b>"Tambahkan ke Layar Utama" (Add to Home Screen)</b>.</li>
                  <li>Ketuk <b>Tambah</b>.</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-pink-500 text-white font-bold py-2.5 rounded-full text-xs shadow-md hover:bg-pink-600 transition-all"
            >
              Mengerti, Terima Kasih ✨
            </button>
          </div>
        </div>
      )}
    </>
  );
}