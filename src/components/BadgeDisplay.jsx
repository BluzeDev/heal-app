import React, { useState } from 'react';
import { calculateUserBadges } from '../utils/badgeSystem';
import { triggerFeedback } from '../utils/feedback';
import { Award, Lock, CheckCircle, Info, X } from 'lucide-react';

export default function BadgeDisplay({ userData, isDarkMode, compact = false }) {
  const badges = calculateUserBadges(userData);
  const [selectedBadge, setSelectedBadge] = useState(null);

  const handleBadgeClick = (badge) => {
    triggerFeedback();
    setSelectedBadge(badge);
  };

  return (
    <div className="w-full space-y-2">
      {/* Header section */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-black">
          <Award className="w-4 h-4 text-pink-500" />
          <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
            Lencana Apresiasi
          </span>
        </div>
        <span className="text-[10px] font-bold text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
          {badges.filter(b => b.unlocked).length} / {badges.length} Terbuka
        </span>
      </div>

      {/* Grid Badges */}
      <div className={`grid ${compact ? 'grid-cols-4 gap-2' : 'grid-cols-2 sm:grid-cols-4 gap-2.5'}`}>
        {badges.map((badge) => {
          return (
            <button
              key={badge.id}
              type="button"
              onClick={() => handleBadgeClick(badge)}
              className={`relative rounded-2xl p-2.5 flex flex-col items-center justify-center text-center transition-all duration-300 border group ${
                badge.unlocked
                  ? `bg-gradient-to-br ${badge.activeColor} text-white shadow-md hover:scale-105 ${badge.borderColor} ring-2 ring-white/30`
                  : isDarkMode
                  ? 'bg-gray-800/60 border-gray-700/60 text-gray-400 opacity-60 hover:opacity-90'
                  : 'bg-gray-100/90 border-gray-200 text-gray-500 opacity-60 hover:opacity-90'
              }`}
            >
              {/* Badge Icon */}
              <div className="relative text-2xl mb-1 filter drop-shadow">
                <span>{badge.icon}</span>
                {!badge.unlocked && (
                  <span className="absolute -bottom-1 -right-1 bg-gray-900/80 text-white rounded-full p-0.5 shadow">
                    <Lock className="w-2.5 h-2.5 text-gray-300" />
                  </span>
                )}
                {badge.unlocked && (
                  <span className="absolute -top-1 -right-1 bg-white text-emerald-600 rounded-full p-0.5 shadow">
                    <CheckCircle className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              {/* Badge Title */}
              <p className={`text-[11px] font-black leading-tight line-clamp-1 ${
                badge.unlocked ? 'text-white drop-shadow' : ''
              }`}>
                {badge.title}
              </p>

              {/* Status Pill */}
              <span className={`text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                badge.unlocked
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-gray-500/10 text-gray-400'
              }`}>
                {badge.unlocked ? 'Terbuka' : 'Terkunci'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Modal Tooltip Detail Lencana saat diklik */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border text-center space-y-4 relative ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-pink-100 text-gray-800'
          }`}>
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-lg border-2 ${
              selectedBadge.unlocked
                ? `bg-gradient-to-br ${selectedBadge.activeColor} text-white ${selectedBadge.borderColor}`
                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 border-gray-300 dark:border-gray-700'
            }`}>
              {selectedBadge.icon}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black mb-1.5 shadow-xs">
                {selectedBadge.unlocked ? (
                  <span className="text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    ✅ Lencana Terbuka
                  </span>
                ) : (
                  <span className="text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    🔒 Lencana Masih Terkunci
                  </span>
                )}
              </div>
              <h3 className="text-base font-black tracking-tight">{selectedBadge.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                {selectedBadge.desc}
              </p>
            </div>

            {/* Kotak Petunjuk Membuka */}
            <div className={`p-3 rounded-2xl text-left border text-xs space-y-1 ${
              selectedBadge.unlocked
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-200'
            }`}>
              <div className="flex items-center gap-1.5 font-bold text-[11px]">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>{selectedBadge.unlocked ? 'Selamat!' : 'Cara Membuka Lencana Ini:'}</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90 pl-5">
                {selectedBadge.howToUnlock}
              </p>
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2.5 rounded-2xl bg-pink-500 text-white font-bold text-xs shadow-md hover:bg-pink-600 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
