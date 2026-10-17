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
import SocialScreen from './SocialScreen';
import CalmCornerScreen from './CalmCornerScreen';
import SymptomCheckerScreen from './SymptomCheckerScreen';
import WellnessScreen from './WellnessScreen';
import PrivateJournalScreen from './PrivateJournalScreen';
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
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

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
  const [selectedDiseaseId, setSelectedDiseaseId] = useState(null);
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


  // 📱 Penanganan Tombol Back HP Android (Capacitor Hardware Back & Browser popstate)
  useEffect(() => {
    // 1. Web popstate listener untuk mode Browser / PWA
    const handlePopState = () => {
      if (isSearching) {
        setIsSearching(false);
        return;
      }
      if (showQuizModal) {
        setShowQuizModal(false);
        return;
      }
      if (subScreen) {
        setSubScreen(null);
        setSelectedDiseaseId(null);
        setViewUserProfile(null);
        return;
      }
      if (currentTab !== 'home') {
        setCurrentTab('home');
      }
    };
    window.addEventListener('popstate', handlePopState);

    // 2. Capacitor Android Hardware Back Button listener
    let capBackListener = null;
    if (Capacitor.isNativePlatform()) {
      CapApp.addListener('backButton', () => {
        if (isSearching) {
          setIsSearching(false);
          return;
        }
        if (showQuizModal) {
          setShowQuizModal(false);
          return;
        }
        if (subScreen) {
          triggerFeedback();
          setSubScreen(null);
          setSelectedDiseaseId(null);
          setViewUserProfile(null);
          return;
        }
        if (currentTab !== 'home') {
          triggerFeedback();
          setCurrentTab('home');
          return;
        }
        // Jika sudah di Home tanpa modal & subScreen, keluar dari APK
        CapApp.exitApp();
      }).then(listener => {
        capBackListener = listener;
      });
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (capBackListener && capBackListener.remove) {
        capBackListener.remove();
      }
    };
  }, [subScreen, currentTab, isSearching, showQuizModal]);

  const toggleDarkMode = () => {
    triggerFeedback();
    setIsDarkMode(!isDarkMode);
  };

  const handleSelectTopic = (topicKey) => {
    triggerFeedback();
    setSelectedTopic(topicKey);
    window.history.pushState({ subScreen: 'topic-detail' }, '');
    setSubScreen('topic-detail');
  };

  const handleFeatureNavigate = (featureKey, extraData) => {
    triggerFeedback();
    if (extraData) {
      setSelectedDiseaseId(extraData);
    }
    window.history.pushState({ subScreen: featureKey }, '');
    setSubScreen(featureKey);
  };

  const handleOpenUserProfile = (targetUsername) => {
    triggerFeedback();
    setViewUserProfile(targetUsername);
    window.history.pushState({ subScreen: 'profile' }, '');
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

          {/* Top Bar: Streak Widget, Quick Search, Social Chat & Dark Mode Toggle */}
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            <StreakWidget streakCount={streakCount} isDarkMode={isDarkMode} />

            {/* Tombol Social & Chat di Header Bar */}
            <button
              onClick={() => { triggerFeedback(); setSubScreen('social'); }}
              className={`h-10 px-3.5 rounded-full flex items-center gap-1.5 text-xs font-black shadow-md transition-all ${
                isDarkMode ? 'bg-purple-950/80 text-purple-300 border border-purple-800 hover:bg-purple-900' : 'bg-white text-purple-600 hover:bg-purple-50'
              }`}
              title="Social & Chat HEAL"
            >
              <span className="text-base">💬</span>
              <span className="hidden sm:inline">Social</span>
            </button>

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
            ) : subScreen === 'journal' ? (
              <PrivateJournalScreen 
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
                initialDiseaseId={selectedDiseaseId}
                onNavigateSymptomChecker={() => setSubScreen('symptom')}
                onBack={() => { triggerFeedback(); setSubScreen(null); setSelectedDiseaseId(null); }} 
                isDarkMode={isDarkMode}
              />
            ) : subScreen === 'mood' ? (
              <WellnessScreen 
                currentUser={user}
                onBack={() => { triggerFeedback(); setSubScreen(null); }} 
                isDarkMode={isDarkMode}
              />
            ) : subScreen === 'sos' ? (
              <EmergencySOSScreen 
                currentUser={user}
                onBack={() => { triggerFeedback(); setSubScreen(null); }} 
                isDarkMode={isDarkMode}
              />
            ) : subScreen === 'social' ? (
              <SocialScreen
                currentUser={user}
                onBack={() => { triggerFeedback(); setSubScreen(null); }}
                isDarkMode={isDarkMode}
              />
            ) : subScreen === 'calm' ? (
              <CalmCornerScreen
                onBack={() => { triggerFeedback(); setSubScreen(null); }}
                isDarkMode={isDarkMode}
              />
            ) : subScreen === 'symptom' ? (
              <MedicineScreen
                initialTab="symptom"
                onBack={() => { triggerFeedback(); setSubScreen(null); }}
                isDarkMode={isDarkMode}
              />
            ) : subScreen === 'wellness' ? (
              <WellnessScreen
                currentUser={user}
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