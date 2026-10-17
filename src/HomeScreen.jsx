import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { triggerFeedback } from './utils/feedback';
import InstallPWAButton from './InstallPWAButton'; // Import komponen tombol PWA permanen

const SPIRIT_QUOTES = [
  "Semangat menjalani hari ini!",
  "Hari baru, energi baru! Kamu pasti bisa melewati hari ini dengan hebat.",
  "Jangan lupa tersenyum ya, dunia butuh energi positifmu hari ini!",
  "Satu langkah kecil hari ini adalah awal dari pencapaian besarmu.",
  "Tetap semangat! Ingat untuk istirahat kalau kamu merasa lelah.",
  "Kamu lebih kuat dan hebat dari yang kamu bayangkan!",
  "Jadikan hari ini lebih baik dari hari kemarin, semangat ya!",
  "Jangan lupa bernapas lega, jalani hari ini dengan santai tapi pasti.",
  "Semoga harimu penuh dengan keberkahan dan hal-hal membahagiakan!",
  "Apapun tantangannya hari ini, percaya deh kamu pasti sanggup melaluinya."
];

const ALL_TOPICS_CATALOG = [
  { key: 'Stress', name: 'Stress & Cemas', icon: '🤯', bg: 'bg-orange-100', darkBg: 'bg-orange-950/40', text: 'text-orange-500' },
  { key: 'Mood', name: 'Mood Swing', icon: '🎭', bg: 'bg-pink-100', darkBg: 'bg-pink-950/40', text: 'text-pink-500' },
  { key: 'Sleep', name: 'Kualitas Tidur', icon: '😴', bg: 'bg-purple-100', darkBg: 'bg-purple-950/40', text: 'text-purple-500' },
  { key: 'Social', name: 'Hubungan Sosial', icon: '🤝', bg: 'bg-blue-100', darkBg: 'bg-blue-950/40', text: 'text-blue-500' },
  { key: 'Burnout', name: 'Burnout Belajar', icon: '🔥', bg: 'bg-red-100', darkBg: 'bg-red-950/40', text: 'text-red-500' },
  { key: 'Confidence', name: 'Kepercayaan Diri', icon: '✨', bg: 'bg-yellow-100', darkBg: 'bg-yellow-950/40', text: 'text-yellow-500' },
  { key: 'Overthinking', name: 'Overthinking', icon: '🌀', bg: 'bg-indigo-100', darkBg: 'bg-indigo-950/40', text: 'text-indigo-500' },
  { key: 'BodyImage', name: 'Body Image', icon: '🪞', bg: 'bg-rose-100', darkBg: 'bg-rose-950/40', text: 'text-rose-500' }
];

export default function HomeScreen({ user, onOpenProfile, onLogout, onSelectTopic, onNavigate, isDarkMode }) {
  const [randomGreeting, setRandomGreeting] = useState("Semangat menjalani hari ini!");
  const [displayedTopics, setDisplayedTopics] = useState([]);
  const [userAvatar, setUserAvatar] = useState('🌸');

  useEffect(() => {
    const randomQuoteIdx = Math.floor(Math.random() * SPIRIT_QUOTES.length);
    setRandomGreeting(SPIRIT_QUOTES[randomQuoteIdx]);

    const shuffledTopics = [...ALL_TOPICS_CATALOG].sort(() => 0.5 - Math.random());
    setDisplayedTopics(shuffledTopics.slice(0, 8));

    const fetchUserAvatar = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, 'data_login', user);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          if (data.avatar) setUserAvatar(data.avatar);
        }
      } catch (err) {
        console.error("Gagal load avatar:", err);
      }
    };
    fetchUserAvatar();
  }, [user]);

  const renderAvatarContent = (avatarVal, uname) => {
    if (avatarVal && (avatarVal.startsWith('data:image') || avatarVal.startsWith('http'))) {
      return <img src={avatarVal} alt="Avatar" className="w-full h-full object-cover" />;
    }
    if (avatarVal === 'initial_auto') {
      return uname ? uname.charAt(0).toUpperCase() : 'U';
    }
    return avatarVal;
  };

  return (
    <div className={`p-5 space-y-6 max-w-4xl mx-auto pb-24 transition-colors duration-300 ${isDarkMode ? 'bg-black text-gray-100' : 'bg-transparent text-gray-800'}`}>
      
      {/* Header Profile & Logout */}
      <div className={`p-4 rounded-3xl shadow-sm border flex items-center justify-between ${
        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white/70 border-white backdrop-blur-md'
      }`}>
        <div 
          onClick={() => { triggerFeedback(); onOpenProfile(); }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-pink-100 border-2 border-pink-300 text-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform overflow-hidden">
            {renderAvatarContent(userAvatar, user)}
          </div>
          <div>
            <h1 className={`font-extrabold text-base transition-colors ${isDarkMode ? 'text-gray-100 group-hover:text-pink-400' : 'text-gray-800 group-hover:text-pink-500'}`}>
              Hai, {user || 'Teman HEAL'}! 👋
            </h1>
            <p className="text-xs text-pink-400 font-medium mt-0.5 animate-pulse">
              ✨ {randomGreeting}
            </p>
          </div>
        </div>

        <button 
          onClick={() => { triggerFeedback(); onLogout(); }}
          className={`font-bold px-3 py-1.5 rounded-full text-xs transition-colors ${
            isDarkMode ? 'bg-red-950/60 text-red-400 border border-red-900 hover:bg-red-900/60' : 'bg-red-50 text-red-500 hover:bg-red-100'
          }`}
        >
          Keluar
        </button>
      </div>

      {/* Tombol Install PWA Permanen (Selalu Muncul & Interaktif) */}
      <InstallPWAButton isDarkMode={isDarkMode} />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-pink-500 to-orange-400 text-white p-6 rounded-3xl shadow-md space-y-3 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="bg-white/20 backdrop-blur-md text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Edukasi Remaja
          </span>
          <h2 className="text-lg font-bold">Kesehatan Mental itu Penting!</h2>
          <p className="text-xs opacity-90 leading-relaxed max-w-md">
            Jangan ragu untuk mengekspresikan perasaanmu. HEAL siap mendampingi perjalanan kesehatan fisik dan mentalmu setiap hari.
          </p>
          
          {/* Tombol Pintasan Cepat Emergency SOS */}
          {onNavigate && (
            <button
              onClick={() => { triggerFeedback(); onNavigate('sos'); }}
              className="mt-2 bg-white text-red-500 font-bold px-4 py-2 rounded-full text-xs shadow-md hover:bg-red-50 transition-all flex items-center gap-1.5 w-fit"
            >
              <span>🚨</span> Butuh Bantuan Darurat? (SOS)
            </button>
          )}
        </div>
      </div>

      {/* Topik */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <span>📚</span> Rekomendasi Topik Hari Ini
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {displayedTopics.map((item) => (
            <div 
              key={item.key}
              onClick={() => { triggerFeedback(); onSelectTopic(item.key); }}
              className={`rounded-3xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border flex flex-col items-center text-center space-y-2 group ${
                isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-200' : 'bg-white border-pink-50 text-gray-800'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl ${isDarkMode ? item.darkBg : item.bg} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-xs line-clamp-1">{item.name}</h4>
                <span className={`text-[10px] font-bold ${item.text} mt-0.5 block`}>
                  Pelajari ›
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}