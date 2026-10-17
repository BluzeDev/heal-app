import React from 'react';

export default function EmergencySOSScreen({ onBack, isDarkMode }) {
  const handleOpenWhatsApp = () => {
    window.open('https://wa.me/6281132277119?text=Halo%20Tim%20HEAL%20Darurat,%20saya%20butuh%20bantuan%20segera%20terkait%20kesehatan%20mental/fisik.', '_blank');
  };

  return (
    <div className={`flex-1 flex flex-col min-h-screen pb-12 transition-colors duration-300 ${isDarkMode ? 'bg-black text-gray-100' : 'bg-pink-200 text-gray-800'}`}>
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all ${
              isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ←
          </button>
          <h1 className="text-xl font-bold tracking-wide">🚨 Emergency SOS</h1>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-5 text-center">
        
        <div className={`rounded-3xl p-8 shadow-sm border space-y-4 ${
          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'
        }`}>
          <div className="w-20 h-20 rounded-full bg-red-500/20 text-red-500 text-4xl flex items-center justify-center mx-auto animate-pulse">
            🚨
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-black text-red-500">Butuh Bantuan Mendesak?</h2>
            <p className="text-xs leading-relaxed opacity-80 max-w-sm mx-auto">
              Jika kamu mengalami krisis emosional berat, kecemasan ekstrem, atau butuh pertolongan darurat segera, jangan ragu untuk menghubungi layanan bantuan cepat kami.
            </p>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleOpenWhatsApp}
              className="w-full bg-green-500 text-white font-bold py-4 rounded-full text-sm shadow-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
            >
              <span className="text-xl">💬</span> Hubungi Hotline Darurat (WhatsApp)
            </button>
          </div>

          <div className={`text-[11px] p-3 rounded-2xl border text-left space-y-1 ${
            isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
          }`}>
            <p className="font-bold">ℹ️ Informasi Penting:</p>
            <p>• Layanan ini siap mendampingi remaja yang berada dalam situasi darurat.</p>
            <p>• Segala kerahasiaan dan privasi cerita kamu dijamin aman.</p>
          </div>
        </div>

      </div>
    </div>
  );
}