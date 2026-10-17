import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function FeatureScreen({ user, onOpenProfile, onLogout, onNavigate, isDarkMode }) {
  const [userAvatar, setUserAvatar] = useState('🌸');

  useEffect(() => {
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
    if (avatarVal === 'initial_auto') {
      return uname ? uname.charAt(0).toUpperCase() : 'U';
    }
    return avatarVal;
  };

  return (
    <div className={`flex-1 overflow-y-auto pb-20 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black text-gray-100' : 'bg-gradient-to-b from-pink-200 to-yellow-100 text-gray-800'}`}>
      
      {/* Header Profile */}
      <div className="p-4 flex items-center justify-between">
        <div 
          onClick={onOpenProfile}
          className={`flex items-center gap-3 cursor-pointer group px-4 py-2 rounded-3xl border shadow-sm transition-all ${
            isDarkMode ? 'bg-gray-900 border-gray-800 hover:bg-gray-800' : 'bg-white/30 border-white/50 backdrop-blur-md hover:bg-white/50'
          }`}
          title="Buka Profil Saya"
        >
          <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform border-2 border-pink-300 overflow-hidden">
            {renderAvatarContent(userAvatar, user)}
          </div>
          <div>
            <p className="text-xs font-semibold opacity-80">Hai,</p>
            <p className="font-black text-lg group-hover:text-pink-400 transition-colors">
              {user || 'Username'} 👋
            </p>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm transition-all border ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-red-400 hover:bg-gray-800' : 'bg-white/20 border-white/30 text-white hover:bg-white/35'
          }`}
          title="Keluar"
        >
          🚪
        </button>
      </div>

      {/* Grid Menu Fitur */}
      <div className="px-4 mt-2">
        <h3 className="font-bold text-xl mb-4 drop-shadow">🧩 Menu Fitur</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'animation', name: 'Heal Animation', icon: '🎬' },
            { key: 'counselor', name: 'Counselor', icon: '👩‍⚕️' },
            { key: 'schedule', name: 'Health Schedule', icon: '📅' },
            { key: 'voicing', name: 'Voicing Rights', icon: '🗣️' },
            { key: 'quotes', name: 'Quotes', icon: '💬' },
            { key: 'medicine', name: 'Medicine', icon: '💊' },
            { key: 'mood', name: 'Mood Tracker', icon: '🎭' },
            { key: 'sos', name: 'Emergency SOS', icon: '🚨' },
          ].map((item) => (
            <div 
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`rounded-3xl p-6 text-center cursor-pointer shadow-md hover:-translate-y-1 transition-all flex flex-col items-center justify-center border group ${
                isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100 hover:border-gray-700' : 'bg-white border-pink-50 text-gray-800'
              }`}
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
              <p className="font-bold text-base">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}