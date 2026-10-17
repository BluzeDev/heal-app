import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export default function FeatureScreen({ user, onOpenProfile, onLogout, onNavigate, isDarkMode }) {
  const [userAvatar, setUserAvatar] = useState("🌸");

  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, "data_login", user);
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
    if (avatarVal && (avatarVal.startsWith("data:image") || avatarVal.startsWith("http"))) {
      return <img src={avatarVal} alt="Avatar" className="w-full h-full object-cover" />;
    }
    if (avatarVal === "initial_auto") {
      return uname ? uname.charAt(0).toUpperCase() : "U";
    }
    return avatarVal;
  };

  const features = [
    { key: "animation",  name: "Heal Animation",    icon: "🎬", color: "from-purple-500 to-indigo-600" },
    { key: "counselor",  name: "Counselor",          icon: "👩‍⚕️", color: "from-teal-400 to-emerald-500" },
    { key: "schedule",   name: "Health Schedule",    icon: "📅", color: "from-blue-400 to-cyan-500" },
    { key: "voicing",    name: "Voicing Rights",     icon: "🗣️", color: "from-orange-400 to-amber-500" },
    { key: "quotes",     name: "Quotes",             icon: "💬", color: "from-pink-400 to-rose-500" },
    { key: "medicine",   name: "Bank Penyakit",      icon: "🏥", color: "from-red-400 to-pink-500" },
    { key: "mood",       name: "Mood Tracker",       icon: "🎭", color: "from-yellow-400 to-orange-500" },
    { key: "sos",        name: "Panggil Ambulans / PSC 119", icon: "🚑", color: "from-red-600 to-rose-700" },
    { key: "social",     name: "Social Chat",        icon: "🌐", color: "from-violet-400 to-purple-600" },
    { key: "calm",       name: "Calm Corner",        icon: "🌬️", color: "from-sky-400 to-blue-500" },
    { key: "symptom",    name: "Cek Gejala",         icon: "🩺", color: "from-green-400 to-teal-500" },
    { key: "wellness",   name: "Daily Wellness",     icon: "💧", color: "from-cyan-400 to-sky-500" },
  ];

  return (
    <div className={`flex-1 overflow-y-auto pb-24 min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-black text-gray-100" : "bg-gradient-to-b from-pink-200 to-yellow-100 text-gray-800"}`}>
      <div className="p-4 flex items-center justify-between">
        <div
          onClick={onOpenProfile}
          className={`flex items-center gap-3 cursor-pointer group px-4 py-2 rounded-3xl border shadow-sm transition-all ${isDarkMode ? "bg-gray-900 border-gray-800 hover:bg-gray-800" : "bg-white/30 border-white/50 backdrop-blur-md hover:bg-white/50"}`}
        >
          <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform border-2 border-pink-300 overflow-hidden">
            {renderAvatarContent(userAvatar, user)}
          </div>
          <div>
            <p className="text-xs font-semibold opacity-80">Hai,</p>
            <p className="font-black text-lg group-hover:text-pink-400 transition-colors">{user || "Username"} 👋</p>
          </div>
        </div>
        <button onClick={onLogout} className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm transition-all border ${isDarkMode ? "bg-gray-900 border-gray-800 text-red-400 hover:bg-gray-800" : "bg-white/20 border-white/30 text-white hover:bg-white/35"}`} title="Keluar">
          🚪
        </button>
      </div>
      <div className="px-4 mt-2 pb-4">
        <h3 className="font-bold text-xl mb-4 drop-shadow">🧩 Menu Fitur</h3>
        <div className="grid grid-cols-2 gap-3">
          {features.map((item) => (
            <div
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`rounded-3xl p-5 text-center cursor-pointer shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all flex flex-col items-center justify-center group bg-gradient-to-br ${item.color} text-white`}
            >
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform drop-shadow-md">{item.icon}</div>
              <p className="font-bold text-sm leading-tight drop-shadow">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
