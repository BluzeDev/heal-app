import React, { useState } from 'react';
import { triggerFeedback } from './utils/feedback';
import { ArrowLeft, Play, X, Sparkles, CheckCircle2 } from 'lucide-react';

// Katalog daftar video animasi kesehatan dengan YouTube Video ID
const animationVideos = [
  {
    id: 1,
    title: 'Mengelola Stress Sehari-hari',
    description: 'Tips praktis untuk remaja menghadapi tekanan dan menjaga kedamaian pikiran.',
    duration: '5:30',
    progress: '45%',
    gradient: 'from-blue-600 to-indigo-600',
    youtubeId: 'hnpQrMqDoqE',
  },
  {
    id: 2,
    title: 'Self-Care untuk Pemula',
    description: 'Langkah mudah merawat diri, kebiasaan baik, dan kesehatan mental remaja.',
    duration: '4:15',
    progress: '0%',
    gradient: 'from-pink-500 to-orange-400',
    youtubeId: 'W6s-QpcqH68',
  },
  {
    id: 3,
    title: 'Mindfulness untuk Remaja',
    description: 'Teknik relaksasi sederhana untuk menjernihkan pikiran dan fokus belajar.',
    duration: '6:45',
    progress: '80%',
    gradient: 'from-teal-500 to-emerald-600',
    youtubeId: 'ZToicYcHIOU',
  },
  {
    id: 4,
    title: 'Pentingnya Tidur Cukup bagi Kesehatan Otak',
    description: 'Kenapa begadang bisa merusak konsentrasi belajarmu dan cara memperbaikinya.',
    duration: '4:50',
    progress: '20%',
    gradient: 'from-purple-600 to-pink-600',
    youtubeId: 'gedoSZZuFOw',
  },
  {
    id: 5,
    title: 'Cara Mengatasi Kecanduan Gadget (Digital Detox)',
    description: 'Lepas sejenak dari layar demi kesehatan mental dan kualitas istirahat.',
    duration: '7:10',
    progress: '10%',
    gradient: 'from-amber-500 to-rose-500',
    youtubeId: 'Pq85KddbVpQ',
  },
  {
    id: 6,
    title: 'Membangun Rasa Percaya Diri (Self-Esteem)',
    description: 'Berhenti merasa insecure dan mulai cintai keunikan dirimu sendiri.',
    duration: '5:15',
    progress: '60%',
    gradient: 'from-cyan-500 to-blue-600',
    youtubeId: 'w-HYZv6HzAs',
  }
];

export default function HealAnimationScreen({ onBack, isDarkMode }) {
  const [activeVideo, setActiveVideo] = useState(null);

  const handleSelectVideo = (video) => {
    triggerFeedback();
    setActiveVideo(video);
  };

  const handleClosePlayer = () => {
    triggerFeedback();
    setActiveVideo(null);
  };

  return (
    <div className={`flex-1 overflow-y-auto pb-24 min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-gray-100' : 'bg-gradient-to-b from-pink-100 via-rose-50 to-yellow-50 text-gray-800'
    }`}>
      
      {/* Header */}
      <div className={`p-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md border-b ${
        isDarkMode ? 'bg-black/80 border-gray-800' : 'bg-white/80 border-pink-100'
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { triggerFeedback(); onBack(); }} 
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm transition-all ${
              isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-pink-50'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-black tracking-tight flex items-center gap-1.5">
              <span>🎬</span> Heal Animation
            </h2>
            <p className="text-[10px] opacity-60 font-semibold">Video edukasi kesehatan mental & fisik</p>
          </div>
        </div>
      </div>

      {/* ───────────── IN-APP EMBEDDED VIDEO PLAYER MODAL ───────────── */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative flex flex-col">
            
            {/* Embedded Player Frame Container */}
            <div className="relative w-full aspect-video bg-black overflow-hidden select-none">
              <iframe
                title={activeVideo.title}
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&playsinline=1`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />

              {/* Lapisan transparan / elemen penutup di area atas iframe untuk menyembunyikan logo YouTube & judul eksternal */}
              <div 
                className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-auto z-10 flex items-center justify-between px-3.5"
                style={{ touchAction: 'none' }}
              >
                <div className="flex items-center gap-2 text-white text-xs font-black truncate max-w-[80%] drop-shadow">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping shrink-0" />
                  <span className="truncate">{activeVideo.title}</span>
                </div>

                <button
                  onClick={handleClosePlayer}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center font-bold text-sm transition-all shrink-0"
                  title="Tutup Pemutar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Lapisan transparan di sudut kanan bawah untuk mencegah klik logo watermark */}
              <div 
                className="absolute bottom-0 right-0 w-24 h-12 bg-transparent pointer-events-auto z-10" 
                style={{ touchAction: 'none' }}
              />
            </div>

            {/* Video Meta & Close Button */}
            <div className="p-4 bg-gray-950 text-white space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-sm md:text-base text-pink-400">
                    {activeVideo.title}
                  </h3>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    {activeVideo.description}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-gray-200 shrink-0">
                  ⏱️ {activeVideo.duration}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
                <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Diputar langsung di aplikasi HEAL</span>
                </span>
                <button
                  onClick={handleClosePlayer}
                  className="px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-md hover:opacity-90 transition-all"
                >
                  Selesai Menonton
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Daftar Video Kartu */}
      <div className="p-4 space-y-4 max-w-xl mx-auto w-full">
        <div className="space-y-1">
          <h3 className="text-sm font-black flex items-center gap-1.5">
            <span>✨</span> Pustaka Video Animasi Edukatif
          </h3>
          <p className="text-[11px] opacity-70">
            Pilih topik untuk menonton video langsung di dalam aplikasi tanpa beralih ke aplikasi lain.
          </p>
        </div>

        {animationVideos.map((video) => (
          <div 
            key={video.id}
            onClick={() => handleSelectVideo(video)}
            className={`rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group border ${
              isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100 hover:border-pink-900' : 'bg-white border-pink-100 text-gray-800 hover:border-pink-300'
            }`}
          >
            {/* Thumbnail */}
            <div className={`h-36 bg-gradient-to-r ${video.gradient} flex items-center justify-center relative overflow-hidden`}>
              <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 ml-1 text-gray-900 fill-gray-900" />
              </div>
              <span className="absolute bottom-2.5 right-3 bg-black/70 backdrop-blur-sm text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                {video.duration}
              </span>
            </div>

            {/* Bagian Teks & Progress */}
            <div className="p-4 space-y-2">
              <h4 className={`font-bold text-sm transition-colors ${isDarkMode ? 'group-hover:text-pink-400' : 'group-hover:text-pink-600'}`}>
                {video.title}
              </h4>
              <p className={`text-xs ${isDarkMode ? 'opacity-65' : 'text-gray-500'} leading-relaxed`}>
                {video.description}
              </p>

              {/* Progress bar */}
              <div className={`h-1.5 rounded-full mt-2 overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-yellow-400 rounded-full" 
                  style={{ width: video.progress }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}