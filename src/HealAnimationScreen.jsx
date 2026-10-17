import React from 'react';
import { openExternalUrl } from './utils/openExternalUrl';

// Katalog daftar video animasi kesehatan dengan link YouTube asli yang relevan
const animationVideos = [
  {
    id: 1,
    title: 'Mengelola Stress Sehari-hari',
    description: 'Tips praktis untuk remaja menghadapi tekanan.',
    duration: '5:30',
    progress: '45%',
    gradient: 'from-blue-600 to-indigo-600',
    youtubeUrl: 'https://www.youtube.com/watch?v=hnpQrMqDoqE'
  },
  {
    id: 2,
    title: 'Self-Care untuk Pemula',
    description: 'Langkah mudah merawat diri dan kesehatan mental.',
    duration: '4:15',
    progress: '0%',
    gradient: 'from-pink-500 to-orange-400',
    youtubeUrl: 'https://www.youtube.com/watch?v=W6s-QpcqH68'
  },
  {
    id: 3,
    title: 'Mindfulness untuk Remaja',
    description: 'Teknik relaksasi sederhana untuk menjernihkan pikiran.',
    duration: '6:45',
    progress: '80%',
    gradient: 'from-teal-500 to-emerald-600',
    youtubeUrl: 'https://www.youtube.com/watch?v=ZToicYcHIOU'
  },
  {
    id: 4,
    title: 'Pentingnya Tidur Cukup bagi Kesehatan Otak',
    description: 'Kenapa begadang bisa merusak konsentrasi belajarmu.',
    duration: '4:50',
    progress: '20%',
    gradient: 'from-purple-600 to-pink-600',
    youtubeUrl: 'https://www.youtube.com/watch?v=gedoSZZuFOw'
  },
  {
    id: 5,
    title: 'Cara Mengatasi Kecanduan Gadget (Digital Detox)',
    description: 'Lepas sejenak dari layar demi kesehatan mental.',
    duration: '7:10',
    progress: '10%',
    gradient: 'from-amber-500 to-rose-500',
    youtubeUrl: 'https://www.youtube.com/watch?v=Pq85KddbVpQ'
  },
  {
    id: 6,
    title: 'Membangun Rasa Percaya Diri (Self-Esteem)',
    description: 'Berhenti insecure dan mulai cintai dirimu sendiri.',
    duration: '5:15',
    progress: '60%',
    gradient: 'from-cyan-500 to-blue-600',
    youtubeUrl: 'https://www.youtube.com/watch?v=w-HYZv6HzAs'
  }
];

export default function HealAnimationScreen({ onBack, isDarkMode }) {
  const handleWatchVideo = (url) => {
    openExternalUrl(url);
  };

  return (
    <div className={`flex-1 overflow-y-auto pb-24 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black text-gray-100' : 'bg-gradient-to-b from-pink-200 to-yellow-100 text-gray-800'}`}>
      
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <button 
          onClick={onBack} 
          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm transition-all ${
            isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white/80 text-gray-700 hover:bg-white'
          }`}
        >
          ←
        </button>
        <h2 className="text-xl font-bold drop-shadow-sm">
          🎬 Heal Animation
        </h2>
      </div>

      {/* Daftar Video Kartu */}
      <div className="px-4 space-y-4 max-w-xl mx-auto w-full">
        {animationVideos.map((video) => (
          <div 
            key={video.id}
            onClick={() => handleWatchVideo(video.youtubeUrl)}
            className={`rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group border ${
              isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-pink-50 text-gray-800'
            }`}
          >
            {/* Thumbnail */}
            <div className={`h-36 bg-gradient-to-r ${video.gradient} flex items-center justify-center relative`}>
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <span className="text-lg ml-0.5 text-gray-800">▶️</span>
              </div>
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded font-medium">
                {video.duration}
              </span>
            </div>

            {/* Bagian Teks & Progress */}
            <div className="p-4">
              <h4 className={`font-bold text-base transition-colors ${isDarkMode ? 'group-hover:text-pink-400' : 'group-hover:text-pink-600'}`}>
                {video.title}
              </h4>
              <p className={`text-xs mt-1 ${isDarkMode ? 'opacity-60' : 'text-gray-500'}`}>
                {video.description}
              </p>

              {/* Progress bar */}
              <div className={`h-1.5 rounded-full mt-3 overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-yellow-400 rounded-full" 
                  style={{ width: video.progress }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}