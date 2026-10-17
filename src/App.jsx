import React, { useState, useEffect } from 'react';
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';
import FeatureScreen from './FeatureScreen';
import TopicDetailScreen from './TopicDetailScreen';
import HealAnimationScreen from './HealAnimationScreen';
import CounselorScreen from './CounselorScreen';
import HealthScheduleScreen from './HealthScheduleScreen';
import VoicingRightsScreen from './VoicingRightsScreen';
import QuotesScreen from './QuotesScreen';
import MedicineScreen from './MedicineScreen';
import HealHealthScreen from './HealHealthScreen';
import ProfileScreen from './ProfileScreen';
import MoodTrackerScreen from './MoodTrackerScreen';
import EmergencySOSScreen from './EmergencySOSScreen';
import BottomNav from './BottomNav';
import ScrollToTop from './ScrollToTop';
import NetworkStatusBanner from './NetworkStatusBanner';
import AmbientPlayer from './AmbientPlayer';
import StreakWidget from './StreakWidget';
import DailyQuizModal from './DailyQuizModal';
import CookieConsentBanner from './CookieConsentBanner'; // Banner izin cookie untuk browser HP
import { checkAndUpdateStreak } from './utils/quizData';
import { triggerFeedback } from './utils/feedback';
import { initDeviceActivityTracker } from './utils/sleepTracker';

export default function App() {
  // Inisialisasi pelacak aktivitas layar untuk analisis tidur remaja
  useEffect(() => {
    initDeviceActivityTracker();
  }, []);
  // 🔓 Ambil data user dari localStorage dengan aman agar tidak ter-reset di HP saat di-refresh
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('heal_active_user');
      return savedUser && savedUser !== 'undefined' ? savedUser : null;
    } catch (e) {
      console.error("Gagal membaca storage di HP:", e);
      return null;
    }
  });

  const [currentTab, setCurrentTab] = useState('home');
  const [subScreen, setSubScreen] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('Stress');
  const [viewUserProfile, setViewUserProfile] = useState(null);

  // QoL: Streak & Daily Quiz States
  const [streakCount, setStreakCount] = useState(0);
  const [showQuizModal, setShowQuizModal] = useState(false);

  // QoL: Quick Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // State Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('heal_dark_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('heal_dark_mode', isDarkMode);
  }, [isDarkMode]);

  // Fungsi Login & Simpan ke localStorage
  const handleLogin = (nama) => {
    triggerFeedback();
    setUser(nama);
    localStorage.setItem('heal_active_user', nama);
  };

  // Fungsi Logout & Hapus dari localStorage
  const handleLogout = () => {
    triggerFeedback();
    setUser(null);
    setCurrentTab('home');
    setSubScreen(null);
    localStorage.removeItem('heal_active_user');
  };

  // QoL: Cek & Hitung Streak serta Trigger Kuis Harian saat Login
  useEffect(() => {
    if (user) {
      const currentStreak = checkAndUpdateStreak(user);
      setStreakCount(currentStreak);

      const quizStatusKey = `heal_quiz_done_${user}_${new Date().toDateString()}`;
      if (localStorage.getItem(quizStatusKey) !== 'true') {
        setShowQuizModal(true);
      }
    }
  }, [user]);

  // QoL: Session Timeout / Auto-Logout setelah 15 menit tidak aktif
  useEffect(() => {
    if (!user) return;
    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 15 menit = 15 * 60 * 1000 ms
      timeoutId = setTimeout(() => {
        alert('🔒 Sesi Anda telah berakhir karena tidak aktif selama 15 menit demi keamanan privasi.');
        handleLogout();
      }, 15 * 60 * 1000);
    };

    // Pantau aktivitas layar
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user]);

  const toggleDarkMode = () => {
    triggerFeedback();
    setIsDarkMode(!isDarkMode);
  };

  const handleSelectTopic = (topicKey) => {
    triggerFeedback();
    setSelectedTopic(topicKey);
    setSubScreen('topic-detail');
  };

  const handleFeatureNavigate = (featureKey) => {
    triggerFeedback();
    setSubScreen(featureKey);
  };

  const handleOpenUserProfile = (targetUsername) => {
    triggerFeedback();
    setViewUserProfile(targetUsername);
    setSubScreen('profile');
  };

  return (
    <div className={`font-sans w-full h-screen relative overflow-hidden flex flex-col transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-gray-100' : 'bg-gradient-to-b from-pink-200 to-yellow-100 text-gray-800'
    }`}>
      
      {/* 🌐 Detektor Status Jaringan (Online / Offline) */}
      <NetworkStatusBanner />

      {/* 🍪 Banner Persetujuan Cookie / Storage untuk Browser HP */}
      <CookieConsentBanner isDarkMode={isDarkMode} />

      {!user ? (
        <LoginScreen onLogin={handleLogin} isDarkMode={isDarkMode} />
      ) : (
        <>
          {/* 🧠 Modal Kuis Harian Otomatis */}
          {showQuizModal && (
            <DailyQuizModal currentUser={user} onClose={() => setShowQuizModal(false)} isDarkMode={isDarkMode} />
          )}

          {/* Top Bar: Streak Widget, Quick Search, & Dark Mode Toggle */}
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            <StreakWidget streakCount={streakCount} isDarkMode={isDarkMode} />

            <button
              onClick={() => { triggerFeedback(); setIsSearching(!isSearching); }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-base shadow-md transition-all ${
                isDarkMode ? 'bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              title="Pencarian Cepat"
            >
              🔍
            </button>

            <button
              onClick={toggleDarkMode}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md transition-all ${
                isDarkMode ? 'bg-gray-800 text-yellow-400 border border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              title={isDarkMode ? "Ubah ke Light Mode" : "Ubah ke Dark Mode"}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>

          {/* 🔎 Global Quick Search Bar Overlay */}
          {isSearching && (
            <div className={`absolute top-16 left-4 right-4 z-50 p-3 rounded-2xl shadow-xl backdrop-blur-md border animate-fadeIn flex items-center gap-2 ${
              isDarkMode ? 'bg-gray-900/95 border-gray-800 text-white' : 'bg-white/95 border-pink-200 text-gray-800'
            }`}>
              <span className="text-lg pl-2">🔍</span>
              <input 
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari fitur, quotes, topik..."
                className="w-full bg-transparent border-none outline-none text-sm font-medium"
              />
              <button 
                onClick={() => { triggerFeedback(); setSearchQuery(''); setIsSearching(false); }}
                className="text-xs font-bold px-3 py-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Tutup
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto pb-20 relative" id="main-scroll-container">
            {subScreen === 'topic-detail' ? (
              <TopicDetailScreen 
                selectedTopic={selectedTopic} 
                onBack={() => { triggerFeedback(); setSubScreen(null); }} 
                isDarkMode={isDarkMode}
              />
            ) : subScreen === 'animation' ? (
              <HealAnimationScreen 
                onBack={() => { triggerFeedback(); setSubScreen(null); }} 
                isDarkMode={isDarkMode}
              />
            ) : subScreen === 'counselor' ? (
              <CounselorScreen 
                onBack={() => { triggerFeedback(); setSubScreen(null); }} 
                isDarkMode={isDarkMode}
              />
            ) : subScreen === 'schedule' ? (
              <HealthScheduleScreen 
                currentUser={user}
                onBack={() => { triggerFeedback(); setSubScreen(null); }} 
                isDarkMode={isDarkMode}
              />
            ) : subScreen === 'voicing' ? (
              <VoicingRightsScreen 
                currentUser={user}
                onViewProfile={handleOpenUserProfile}
                onBack={() => { triggerFeedback(); setSubScreen(null); }} 
                isDarkMode={isDarkMode}
              />
            ) : subScreen === 'quotes' ? (
              <QuotesScreen 
                onBack={() => { triggerFeedback(); setSubScreen(null); }} 
                isDarkMode={isDarkMode}
              />
            ) : subScreen === 'medicine' ? (
              <MedicineScreen 
                onBack={() => { triggerFeedback(); setSubScreen(null); }} 
                isDarkMode={isDarkMode}
              />
            ) : subScreen === 'mood' ? (
              <MoodTrackerScreen 
                currentUser={user}
                onBack={() => { triggerFeedback(); setSubScreen(null); }} 
                isDarkMode={isDarkMode}
              />
            ) : subScreen === 'sos' ? (
              <EmergencySOSScreen 
                onBack={() => { triggerFeedback(); setSubScreen(null); }} 
                isDarkMode={isDarkMode}
              />
            ) : subScreen === 'profile' ? (
              <ProfileScreen 
                currentUser={user}
                viewUser={viewUserProfile}
                onBack={() => { triggerFeedback(); setSubScreen(null); setViewUserProfile(null); }} 
                isDarkMode={isDarkMode}
              />
            ) : (
              <>
                {currentTab === 'home' && (
                  <HomeScreen 
                    user={user} 
                    onOpenProfile={() => { triggerFeedback(); setViewUserProfile(user); setSubScreen('profile'); }}
                    onLogout={handleLogout} 
                    onSelectTopic={handleSelectTopic} 
                    onNavigate={handleFeatureNavigate} 
                    isDarkMode={isDarkMode}
                  />
                )}

                {currentTab === 'fitur' && (
                  <FeatureScreen 
                    user={user} 
                    onOpenProfile={() => { triggerFeedback(); setViewUserProfile(user); setSubScreen('profile'); }}
                    onLogout={handleLogout} 
                    onNavigate={handleFeatureNavigate} 
                    isDarkMode={isDarkMode}
                  />
                )}

                {currentTab === 'musehealth' && (
                  <HealHealthScreen user={user} isDarkMode={isDarkMode} />
                )}
              </>
            )}

            {/* 🎵 Widget Ambient Player di sudut */}
            <AmbientPlayer isDarkMode={isDarkMode} />

            {/* 🚀 Tombol Melayang Scroll to Top */}
            <ScrollToTop isDarkMode={isDarkMode} />
          </div>

          {!subScreen && (
            <BottomNav 
              currentTab={currentTab} 
              onTabChange={(tab) => {
                triggerFeedback();
                setCurrentTab(tab);
                setSubScreen(null);
              }} 
              isDarkMode={isDarkMode}
            />
          )}
        </>
      )}
    </div>
  );
}