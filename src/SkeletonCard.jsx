import React from 'react';

export default function SkeletonCard({ isDarkMode }) {
  return (
    <div className={`p-5 rounded-3xl shadow-sm mb-4 flex gap-4 w-full animate-pulse transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-pink-50'
    }`}>
      {/* Profil Avatar Skeleton */}
      <div className={`w-12 h-12 rounded-full shrink-0 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>

      {/* Konten Skeleton */}
      <div className="flex-1 space-y-3 py-1">
        {/* Header: Nama dan Waktu */}
        <div className="flex justify-between items-center">
          <div className={`h-3 w-1/3 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
          <div className={`h-2 w-1/5 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
        </div>
        
        {/* Baris Teks Paragraf */}
        <div className="space-y-2 mt-3">
          <div className={`h-2.5 w-full rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
          <div className={`h-2.5 w-5/6 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
          <div className={`h-2.5 w-4/6 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
        </div>

        {/* Footer: Tombol Aksi Skeleton */}
        <div className="flex gap-4 pt-3">
          <div className={`h-4 w-10 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
          <div className={`h-4 w-10 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
        </div>
      </div>
    </div>
  );
}