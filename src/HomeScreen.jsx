import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { triggerFeedback } from './utils/feedback';
import InstallPWAButton from './InstallPWAButton';
import { DISEASES_DATA } from './data/diseasesData';
import { 
  ArrowRight, Sparkles, UserCheck, AlertCircle, Heart, Wind, 
  Droplets, Stethoscope, MessageCircle 
} from 'lucide-react';

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

export default function HomeScreen({ user, onOpenProfile, onLogout, onSelectTopic, onNavigate, isDarkMode }) {
  const [randomGreeting, setRandomGreeting] = useState("Semangat menjalani hari ini!");
  const [dailyDiseases, setDailyDiseases] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [showIncompleteBanner, setShowIncompleteBanner] = useState(false);


  useEffect(() => {
    // 1. Daily Deterministic Seed berbasis tanggal hari ini (contoh: "2026-10-17")
    const todaySeed = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < todaySeed.length; i++) {
      hash = (hash << 5) - hash + todaySeed.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    // Seeded shuffle dataset Bank Penyakit
    const seededDiseases = [...DISEASES_DATA].sort((a, b) => {
      const ha = (absHash + a.id.charCodeAt(0) * 17) % 97;
      const hb = (absHash + b.id.charCodeAt(0) * 17) % 97;
      return ha - hb;
    });

    // Ambil 6 topik penyakit harian
    setDailyDiseases(seededDiseases.slice(0, 6));

    const quoteIdx = absHash % SPIRIT_QUOTES.length;
    setRandomGreeting(SPIRIT_QUOTES[quoteIdx]);

    // 2. Fetch User Profile & Cek kelengkapan data
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, 'data_login', user);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUserProfile(data);

          // Pengecekan profil belum lengkap (Bio, Sekolah, No HP, IG, atau TikTok)
          const isBioEmpty = !data.bio || data.bio === 'Menjaga kesehatan fisik dan mental setiap hari. 🌸';
          const isSekolahEmpty = !data.sekolah_asal && !data.sekolahAsal;
          const isNoHpEmpty = !data.no_hp && !data.noHp && !data.noWhatsapp;
          const isIgEmpty = !data.username_ig && !data.usernameIg;

          if (isBioEmpty || isSekolahEmpty || isNoHpEmpty || isIgEmpty) {
            setShowIncompleteBanner(true);
          } else {
            setShowIncompleteBanner(false);
          }
        }
      } catch (err) {
        console.error("Gagal load profil user di HomeScreen:", err);
      }
    };

    fetchUserData();
  }, [user]);

  const renderAvatarContent = (avatarVal, uname) => {
    if (avatarVal && (avatarVal.startsWith('data:image') || avatarVal.startsWith('http'))) {
      return <img src={avatarVal} alt="Avatar" className="w-full h-full object-cover" />;
    }
    if (avatarVal === 'initial_auto' || !avatarVal) {
      return uname ? uname.charAt(0).toUpperCase() : 'U';
    }
    return avatarVal;
  };

  const userAvatar = userProfile?.avatar || '🌸';
  const displayName = userProfile?.nama_panggilan || userProfile?.namaPanggilan || userProfile?.nama_lengkap || user || 'Sobat HEAL';

  return (
    <div className={`p-4 md:p-6 space-y-5 max-w-4xl mx-auto pb-28 transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-gray-100' : 'bg-transparent text-gray-800'
    }`}>
      {/* ───────────── HEADER PROFIL & LOGOUT ───────────── */}
      <div className={`p-4 rounded-3xl shadow-sm border flex items-center justify-between ${
        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white/80 border-white backdrop-blur-md'
      }`}>
        <div 
          onClick={() => { triggerFeedback(); onOpenProfile(); }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-pink-100 border-2 border-pink-300 text-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform overflow-hidden">
            {renderAvatarContent(userAvatar, user)}
          </div>
          <div>
            <h1 className={`font-black text-sm md:text-base transition-colors ${
              isDarkMode ? 'text-gray-100 group-hover:text-pink-400' : 'text-gray-800 group-hover:text-pink-500'
            }`}>
              Hai, {displayName}! 👋
            </h1>
            <p className="text-[11px] text-pink-500 font-bold mt-0.5 animate-pulse line-clamp-1">
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

      {/* ───────────── ANNOUNCEMENT / BANNER PENGGUNA BARU ───────────── */}
      {showIncompleteBanner && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white p-4 rounded-3xl shadow-lg flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0">
              ✨
            </div>
            <div>
              <h3 className="font-black text-xs md:text-sm">Profil Kamu Belum Lengkap!</h3>
              <p className="text-[11px] opacity-90 leading-tight">
                Lengkapi Bio, Sekolah, No HP (WA), & Instagram agar teman-teman bisa terhubung denganmu.
              </p>
            </div>
          </div>

          <button
            onClick={() => { triggerFeedback(); onOpenProfile(); }}
            className="px-3.5 py-2 rounded-2xl bg-white text-orange-600 font-black text-xs shadow-md hover:bg-orange-50 transition-all shrink-0 whitespace-nowrap"
          >
            Lengkapi Sekarang ›
          </button>
        </div>
      )}

      {/* ───────────── TOMBOL INSTALL PWA PERMANEN ───────────── */}
      <InstallPWAButton isDarkMode={isDarkMode} />

      {/* ───────────── QUICK ACCESS SHORTCUTS WIDGETS ───────────── */}
      {onNavigate && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Calm Mode (Requirement 12) */}
          <button
            onClick={() => { triggerFeedback(); onNavigate('calm'); }}
            className="flex items-center gap-3 p-3.5 rounded-3xl bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md hover:-translate-y-1 transition-all text-left group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">🌬️</span>
            <div>
              <p className="font-black text-xs">Butuh Tenang?</p>
              <p className="text-[10px] opacity-80">Calm Mode (4-7-8)</p>
            </div>
          </button>

          {/* Daily Check-in (Requirement 10) */}
          <button
            onClick={() => { triggerFeedback(); onNavigate('wellness'); }}
            className="flex items-center gap-3 p-3.5 rounded-3xl bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-md hover:-translate-y-1 transition-all text-left group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">💧</span>
            <div>
              <p className="font-black text-xs">Daily Check-in</p>
              <p className="text-[10px] opacity-80">Mood & Hidrasi</p>
            </div>
          </button>

          {/* Cek Gejala Pintar (Requirement 9) */}
          <button
            onClick={() => { triggerFeedback(); onNavigate('symptom'); }}
            className="flex items-center gap-3 p-3.5 rounded-3xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md hover:-translate-y-1 transition-all text-left group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">🩺</span>
            <div>
              <p className="font-black text-xs">Cek Gejala</p>
              <p className="text-[10px] opacity-80">Analisis Awal</p>
            </div>
          </button>

          {/* Social Chat (Requirement 8) */}
          <button
            onClick={() => { triggerFeedback(); onNavigate('social'); }}
            className="flex items-center gap-3 p-3.5 rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:-translate-y-1 transition-all text-left group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">💬</span>
            <div>
              <p className="font-black text-xs">Social & Chat</p>
              <p className="text-[10px] opacity-80">Cari Teman HEAL</p>
            </div>
          </button>
        </div>
      )}


      {/* ───────────── HERO BANNER EDUKASI ───────────── */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 text-white p-6 rounded-3xl shadow-md space-y-3 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="bg-white/20 backdrop-blur-md text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Edukasi & Pendampingan Remaja
          </span>
          <h2 className="text-lg font-black">Kesehatan Fisik & Mental Dimulai Hari Ini</h2>
          <p className="text-xs opacity-90 leading-relaxed max-w-md">
            HEAL hadir menemani langkahmu. Pelajari ensiklopedia penyakit di Bank Penyakit, curahkan isi hati di Voicing Rights, dan temukan motivasi harian.
          </p>
          
          <div className="flex flex-wrap gap-2 pt-1">
            {onNavigate && (
              <button
                onClick={() => { triggerFeedback(); onNavigate('medicine'); }}
                className="bg-white text-pink-600 font-black px-4 py-2 rounded-full text-xs shadow-md hover:bg-pink-50 transition-all flex items-center gap-1.5"
              >
                <span>🏥</span> Buka Bank Penyakit ›
              </button>
            )}
            {onNavigate && (
              <button
                onClick={() => { triggerFeedback(); onNavigate('sos'); }}
                className="bg-red-600 hover:bg-red-700 text-white font-black px-4 py-2 rounded-full text-xs shadow-lg hover:shadow-red-500/40 transition-all flex items-center gap-1.5 border border-red-400 animate-pulse"
              >
                <span>🚑</span> Panggil Ambulans / PSC 119
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ───────────── REKOMENDASI TOPIK HARI INI (INTEGRASI BANK PENYAKIT) ───────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm flex items-center gap-2">
            <span>📚</span> Rekomendasi Topik Hari Ini
          </h3>
          <span className="text-[10px] font-bold text-pink-500 bg-pink-50 dark:bg-pink-950/60 px-2.5 py-0.5 rounded-full border border-pink-200 dark:border-pink-900">
            Auto-Refresh Harian
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {dailyDiseases.map((item) => (
            <div 
              key={item.id}
              onClick={() => {
                triggerFeedback();
                if (onNavigate) {
                  onNavigate('medicine', item.id);
                }
              }}
              className={`rounded-3xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border flex flex-col justify-between group ${
                isDarkMode 
                  ? 'bg-gray-900 border-gray-800 hover:border-pink-900 text-gray-200' 
                  : 'bg-white border-pink-50 hover:border-pink-300 text-gray-800'
              }`}
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-gray-800 border border-pink-100 dark:border-gray-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs line-clamp-1 group-hover:text-pink-500 transition-colors">
                    {item.name}
                  </h4>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 block truncate">
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] opacity-70 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[10px] font-bold text-pink-500 group-hover:translate-x-1 transition-transform">
                <span>Pelajari Detail</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}