import React from 'react';

export default function StreakWidget({ streakCount, isDarkMode }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm border font-bold text-xs transition-all ${
      isDarkMode 
        ? 'bg-gray-800/90 border-gray-700 text-orange-400' 
        : 'bg-white/90 border-orange-100 text-orange-500'
    }`} title="Runtutan Login & Aktivitas Berturut-turut">
      <span className="text-base animate-bounce">🔥</span>
      <span>{streakCount} Hari</span>
    </div>
  );
}