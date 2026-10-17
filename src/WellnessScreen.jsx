import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Droplets, Moon, Smile, Sparkles, Check, Plus, Minus, 
  Flame, Bell, Calendar, Clock, History, Trash2, Heart, Award, 
  CheckCircle2, AlertCircle, Info, ChevronRight, X
} from "lucide-react";
import { triggerFeedback } from "./utils/feedback";

// Daftar Mood Lengkap dengan Skor, Emoji, & Warna
const MOODS = [
  { emoji: "😄", label: "Sangat Senang", score: 5, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30", gradient: "from-emerald-400 to-teal-500" },
  { emoji: "😊", label: "Baik & Tenang", score: 4.5, color: "text-teal-500", bg: "bg-teal-500/10 border-teal-500/30", gradient: "from-teal-400 to-cyan-500" },
  { emoji: "🙂", label: "Cukup Baik", score: 4, color: "text-sky-500", bg: "bg-sky-500/10 border-sky-500/30", gradient: "from-sky-400 to-blue-500" },
  { emoji: "😐", label: "Biasa Saja", score: 3, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30", gradient: "from-amber-400 to-yellow-500" },
  { emoji: "😔", label: "Lelah / Sedih", score: 2, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/30", gradient: "from-orange-400 to-rose-400" },
  { emoji: "😰", label: "Cemas / Stres", score: 1.5, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/30", gradient: "from-purple-500 to-indigo-600" },
  { emoji: "😠", label: "Marah / Kesal", score: 1, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/30", gradient: "from-rose-500 to-red-600" },
];

// Quote Penyemangat / Peluk Hangat Otomatis
const COMFORT_QUOTES = [
  "Tidak apa-apa untuk merasa lelah hari ini. Jangan terlalu keras pada dirimu sendiri, kamu sudah bertahan sejauh ini.",
  "Tarik napas perlahan. Hari ini mungkin terasa berat, tetapi kamu jauh lebih kuat daripada beban yang sedang kamu pikul.",
  "Istirahat bukanlah tanda menyerah, melainkan persiapan agar jiwamu bisa melangkah lagi esok hari.",
  "Setiap badai pasti akan berlalu. Peluk dirimu sendiri, kamu sangat berharga dan tidak sendirian.",
  "Satu hari yang buruk bukan berarti seluruh hidupmu buruk. Bersabarlah pada proses pemulihan dirimu.",
  "Emosi yang kamu rasakan itu valid. Luapkan jika perlu, dan ingatlah besok selalu ada harapan baru."
];

export default function WellnessScreen({ currentUser, onBack, isDarkMode }) {
  const userKey = currentUser || 'guest';
  const todayKey = new Date().toISOString().slice(0, 10);
  
  // Storage Keys Terpadu
  const storageTodayKey = `heal_wellness_${userKey}_${todayKey}`;
  const storageHistoryKey = `heal_checkin_history_${userKey}`;
  const storageWaterTargetKey = `heal_water_target_${userKey}`;
  const storageWaterKey = `heal_water_${userKey}`;
  const storageReminderKey = `heal_checkin_reminder_enabled_${userKey}`;
  const storageReminderTimeKey = `heal_checkin_reminder_time_${userKey}`;
  const legacyMoodKey = `heal_moods_${userKey}`;

  // Tab: 'checkin' | 'history'
  const [activeTab, setActiveTab] = useState('checkin');

  // Load Saved Data Hari Ini
  const [todayData, setTodayData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageTodayKey)) || null;
    } catch {
      return null;
    }
  });

  // State Form Check-in
  const [selectedMood, setSelectedMood] = useState(todayData?.mood ?? null);
  const [moodNote, setMoodNote] = useState(todayData?.note || "");
  const [sleepHours, setSleepHours] = useState(todayData?.sleep ?? 7.5);

  // Water Target & Intake (Dari Kalkulator Gizi atau Default 8 Gelas)
  const [waterTargetGlasses, setWaterTargetGlasses] = useState(() => {
    try {
      const saved = localStorage.getItem(storageWaterTargetKey);
      return saved ? parseInt(saved, 10) : 8;
    } catch {
      return 8;
    }
  });

  const [waterGlasses, setWaterGlasses] = useState(() => {
    try {
      if (todayData && typeof todayData.water === 'number') return todayData.water;
      const savedWater = localStorage.getItem(storageWaterKey);
      return savedWater ? parseInt(savedWater, 10) : 4;
    } catch {
      return 4;
    }
  });

  const [comfortQuote, setComfortQuote] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // State Riwayat Log Harian
  const [historyList, setHistoryList] = useState([]);

  // State Pengingat Harian (Reminder)
  const [reminderEnabled, setReminderEnabled] = useState(() => {
    return localStorage.getItem(storageReminderKey) === 'true';
  });
  const [reminderTime, setReminderTime] = useState(() => {
    return localStorage.getItem(storageReminderTimeKey) || '20:00';
  });
  const [showReminderSettings, setShowReminderSettings] = useState(false);

  // Load History & Migrasi dari Legacy Moods jika ada
  useEffect(() => {
    loadHistory();
  }, [userKey]);

  const loadHistory = () => {
    try {
      let entries = JSON.parse(localStorage.getItem(storageHistoryKey)) || [];

      // Jika riwayat kosong, coba cek legacy mood tracker
      if (entries.length === 0) {
        const legacyMoods = JSON.parse(localStorage.getItem(legacyMoodKey)) || [];
        if (legacyMoods.length > 0) {
          entries = legacyMoods.map((m) => ({
            id: m.id || Date.now() + Math.random(),
            date: m.date || 'Riwayat Lampau',
            dateKey: m.dateKey || todayKey,
            mood: m.score || (MOODS.find(x => x.emoji === m.emoji)?.score || 4),
            emoji: m.emoji || '😊',
            label: m.label || (MOODS.find(x => x.emoji === m.emoji)?.label || 'Baik'),
            note: m.note || '',
            water: 8,
            waterTarget: 8,
            sleep: 7.5,
            savedAt: '12:00'
          }));
          localStorage.setItem(storageHistoryKey, JSON.stringify(entries));
        }
      }

      setHistoryList(entries);
    } catch (e) {
      setHistoryList([]);
    }
  };

  // Hitung Streak Check-in Berturut-turut
  const calculateStreak = () => {
    let count = 0;
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const k = `heal_wellness_${userKey}_${d.toISOString().slice(0, 10)}`;
      if (localStorage.getItem(k)) {
        count++;
      } else if (i > 0) {
        break;
      }
    }
    return count;
  };

  const streak = calculateStreak();

  // Trigger Quote saat mood lelah / sedih / cemas / marah
  const handleSelectMood = (moodObj) => {
    triggerFeedback();
    setSelectedMood(moodObj.score);
    if (moodObj.score <= 2) {
      const randomQuote = COMFORT_QUOTES[Math.floor(Math.random() * COMFORT_QUOTES.length)];
      setComfortQuote(randomQuote);
    } else {
      setComfortQuote(null);
    }
  };

  // Water Handlers
  const handleWaterAdd = () => {
    triggerFeedback();
    setWaterGlasses((prev) => {
      const updated = Math.min(prev + 1, 16);
      localStorage.setItem(storageWaterKey, updated.toString());
      return updated;
    });
  };

  const handleWaterSubtract = () => {
    triggerFeedback();
    setWaterGlasses((prev) => {
      const updated = Math.max(prev - 1, 0);
      localStorage.setItem(storageWaterKey, updated.toString());
      return updated;
    });
  };

  const handleSetWaterDirect = (glassIndex) => {
    triggerFeedback();
    setWaterGlasses(() => {
      const updated = Math.min(glassIndex, 16);
      localStorage.setItem(storageWaterKey, updated.toString());
      return updated;
    });
  };

  // Toggle Reminder & Notifikasi
  const handleToggleReminder = async () => {
    triggerFeedback();
    const nextState = !reminderEnabled;

    if (nextState) {
      // Minta izin notifikasi browser / webview jika belum
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
              alert('⚠️ Izin notifikasi belum diaktifkan di browsermu. Tetap kami aktifkan pengingat di aplikasi.');
            }
          } catch (e) {}
        }
      }
      setReminderEnabled(true);
      localStorage.setItem(storageReminderKey, 'true');
      alert(`🔔 Pengingat check-in harian berhasil diaktifkan setiap pukul ${reminderTime} WIB!`);
    } else {
      setReminderEnabled(false);
      localStorage.setItem(storageReminderKey, 'false');
      alert('🔕 Pengingat check-in harian dinonaktifkan.');
    }
  };

  const handleSaveReminderTime = (newTime) => {
    setReminderTime(newTime);
    localStorage.setItem(storageReminderTimeKey, newTime);
  };

  // Simpan Check-in Hari Ini
  const handleSaveCheckin = (e) => {
    if (e) e.preventDefault();
    triggerFeedback();

    if (selectedMood === null) {
      alert("Silakan pilih perasaan / mood kamu hari ini terlebih dahulu! ✨");
      return;
    }

    const matchedMood = MOODS.find(m => m.score === selectedMood) || MOODS[2];
    const todayFormatted = new Date().toLocaleDateString("id-ID", { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    const newEntry = {
      id: Date.now(),
      dateKey: todayKey,
      date: todayFormatted,
      mood: selectedMood,
      emoji: matchedMood.emoji,
      label: matchedMood.label,
      note: moodNote.trim() || "Hari ini berjalan dengan baik.",
      water: waterGlasses,
      waterTarget: waterTargetGlasses,
      sleep: sleepHours,
      savedAt: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })
    };

    // 1. Simpan ke data hari ini
    localStorage.setItem(storageTodayKey, JSON.stringify(newEntry));
    localStorage.setItem(storageWaterKey, waterGlasses.toString());
    setTodayData(newEntry);

    // 2. Simpan / perbarui ke array riwayat (Update entry hari ini jika sudah ada atau tambah baru)
    const existingHistory = JSON.parse(localStorage.getItem(storageHistoryKey)) || [];
    const filteredHistory = existingHistory.filter(item => item.dateKey !== todayKey);
    const updatedHistory = [newEntry, ...filteredHistory];
    
    localStorage.setItem(storageHistoryKey, JSON.stringify(updatedHistory));
    setHistoryList(updatedHistory);

    // 3. Simpan juga ke legacy mood tracker agar data tetap sinkron
    const legacyEntries = JSON.parse(localStorage.getItem(legacyMoodKey)) || [];
    const updatedLegacy = [
      { id: newEntry.id, date: newEntry.date, emoji: newEntry.emoji, note: newEntry.note },
      ...legacyEntries.filter(item => item.date !== newEntry.date)
    ];
    localStorage.setItem(legacyMoodKey, JSON.stringify(updatedLegacy));

    // Animasi sukses
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
    alert("✨ Catatan Daily Check-in & Mood hari ini berhasil disimpan! Tetap semangat ya. 🌸");
  };

  // Hapus entri riwayat
  const handleDeleteHistoryItem = (id) => {
    triggerFeedback();
    if (window.confirm("Apakah kamu yakin ingin menghapus catatan riwayat hari ini?")) {
      const updated = historyList.filter(item => item.id !== id);
      setHistoryList(updated);
      localStorage.setItem(storageHistoryKey, JSON.stringify(updated));
    }
  };

  // Evaluasi hidrasi harian
  const isWaterTargetAchieved = waterGlasses >= waterTargetGlasses;

  // Evaluasi jam tidur
  const sleepEvaluation = sleepHours >= 7 && sleepHours <= 9 
    ? { text: "Ideal & Cukup (7-9 Jam)", color: "text-emerald-500", bg: "bg-emerald-500/10" }
    : sleepHours < 7 
    ? { text: "Kurang Tidur (< 7 Jam)", color: "text-amber-500", bg: "bg-amber-500/10" }
    : { text: "Tidur Berlebih (> 9 Jam)", color: "text-purple-500", bg: "bg-purple-500/10" };

  return (
    <div className={`flex flex-col min-h-screen pb-24 transition-colors duration-300 ${
      isDarkMode ? "bg-black text-gray-100" : "bg-gradient-to-b from-teal-50/70 via-cyan-50/50 to-pink-50/70 text-gray-800"
    }`}>
      {/* ───────────── HEADER ───────────── */}
      <div className={`flex items-center justify-between p-4 border-b sticky top-0 z-30 backdrop-blur-md ${
        isDarkMode ? "bg-black/85 border-gray-800" : "bg-white/85 border-teal-100"
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { triggerFeedback(); onBack(); }}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all ${
              isDarkMode ? "bg-gray-800 text-gray-200 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <ArrowLeft className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </button>
          <div>
            <h1 className="font-black text-base md:text-lg flex items-center gap-1.5">
              <span>✨</span> Daily Check-in & Mood
            </h1>
            <p className="text-[10px] opacity-60">Pantau Mood, Hidrasi, & Tidur Harian Remaja</p>
          </div>
        </div>

        {/* Streak & Reminder Controls */}
        <div className="flex items-center gap-2">
          {/* Tombol Pengingat Harian */}
          <button
            onClick={() => { triggerFeedback(); setShowReminderSettings(true); }}
            className={`p-2 rounded-2xl border text-xs flex items-center gap-1 font-bold transition-all ${
              reminderEnabled 
                ? "bg-amber-500/15 border-amber-500/30 text-amber-500" 
                : isDarkMode ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-white border-gray-200 text-gray-500"
            }`}
            title="Atur Pengingat Harian"
          >
            <Bell className={`w-4 h-4 ${reminderEnabled ? "fill-amber-500 text-amber-500 animate-bounce" : ""}`} />
            <span className="hidden sm:inline text-[11px]">
              {reminderEnabled ? reminderTime : "Ingatkan"}
            </span>
          </button>

          {/* Badge Streak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 text-white font-black text-xs shadow-md">
            <Flame className="w-3.5 h-3.5 fill-white" />
            <span>{streak} Hari</span>
          </div>
        </div>
      </div>

      {/* ───────────── TAB NAVIGASI: CHECK-IN VS RIWAYAT ───────────── */}
      <div className="max-w-lg mx-auto w-full px-4 pt-3">
        <div className={`p-1 rounded-2xl border flex gap-1 ${
          isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white/80 border-teal-100 shadow-sm"
        }`}>
          <button
            onClick={() => { triggerFeedback(); setActiveTab('checkin'); }}
            className={`flex-1 py-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'checkin'
                ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md scale-[1.01]"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <span>✏️</span> Check-in Hari Ini
          </button>

          <button
            onClick={() => { triggerFeedback(); setActiveTab('history'); }}
            className={`flex-1 py-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md scale-[1.01]"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <span>📅</span> Riwayat Harian ({historyList.length})
          </button>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto w-full space-y-4">
        {/* ───────────── BANNER STATUS PENGINGAT HARIAN JIKA BELUM CHECK-IN ───────────── */}
        {!todayData && (
          <div className={`p-3.5 rounded-2xl border flex items-center gap-3 animate-fadeIn ${
            isDarkMode ? "bg-amber-950/30 border-amber-800/50 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-800"
          }`}>
            <span className="text-2xl">🔔</span>
            <div className="flex-1">
              <p className="font-black text-xs">Belum Check-in Hari Ini</p>
              <p className="text-[10px] opacity-80">Luangkan 1 menit yuk untuk mencatat suasana hati, air minum, dan jam tidurmu!</p>
            </div>
            {reminderEnabled && (
              <span className="text-[10px] font-bold bg-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
                Alarm {reminderTime}
              </span>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 1: CHECK-IN HARI INI
        ══════════════════════════════════════════════════ */}
        {activeTab === 'checkin' && (
          <form onSubmit={handleSaveCheckin} className="space-y-4">
            
            {/* Banner Motivasi Tanggal */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 text-white shadow-md space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  {new Date().toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                {todayData && (
                  <span className="text-[10px] font-bold bg-white/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-200" /> Sudah Check-in
                  </span>
                )}
              </div>
              <h2 className="text-base font-black">Bagaimana Kondisi Tubuh & Hatimu Hari Ini?</h2>
              <p className="text-xs opacity-90">
                Pencatatan harian membantumu mengenali pola suasana hati dan menjaga gaya hidup sehat.
              </p>
            </div>

            {/* 1. SEKSI MOOD TRACKER & JURNAL EMOSI */}
            <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${
              isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-teal-100"
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                  <Smile className="w-4 h-4 text-teal-500" /> 1. Mood Tracker (Perasaan Hari Ini)
                </h3>
                {selectedMood !== null && (
                  <span className="text-xs font-black text-teal-500">
                    {MOODS.find(m => m.score === selectedMood)?.label}
                  </span>
                )}
              </div>

              {/* Grid Pilihan Mood */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 pt-1">
                {MOODS.map((m) => {
                  const isSelected = selectedMood === m.score;
                  return (
                    <button
                      key={m.score}
                      type="button"
                      onClick={() => handleSelectMood(m)}
                      className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${
                        isSelected
                          ? "bg-gradient-to-b from-teal-500 to-emerald-600 text-white border-teal-500 scale-105 shadow-md shadow-teal-500/30"
                          : isDarkMode
                          ? "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                          : "bg-gray-50/70 border-gray-100 text-gray-700 hover:bg-teal-50/40"
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl mb-1">{m.emoji}</span>
                      <span className="text-[9px] font-black leading-tight text-center line-clamp-1">
                        {m.label.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Catatan / Alasan Suasana Hati */}
              <div className="pt-2">
                <label className="text-[11px] font-bold opacity-75 block mb-1">
                  Catatan / Cerita Singkat Perasaanmu:
                </label>
                <textarea
                  rows={2}
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  placeholder="Ceritakan sedikit apa yang sedang kamu rasakan atau alami hari ini... (opsional)"
                  className={`w-full border rounded-2xl p-3 text-xs outline-none focus:border-teal-400 transition-all ${
                    isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-800"
                  }`}
                />
              </div>

              {/* Quote Peluk Hangat Otomatis jika sedih / stres */}
              {comfortQuote && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 space-y-1 animate-fadeIn">
                  <span className="font-bold flex items-center gap-1 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Peluk Hangat untuk Kamu:
                  </span>
                  <p className="italic leading-relaxed font-serif pl-1">
                    "{comfortQuote}"
                  </p>
                </div>
              )}
            </div>

            {/* 2. SEKSI HIDRASI & MINUM AIR (PINDAHAN DARI MY HEALTH MONITOR) */}
            <div className={`p-5 rounded-3xl border shadow-sm space-y-3.5 ${
              isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-cyan-100"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                    <Droplets className="w-4 h-4 text-cyan-500" /> 2. Konsumsi Air Putih (Target Hidrasi)
                  </h3>
                  <p className="text-[10px] opacity-60">Target: {waterTargetGlasses} Gelas (± {(waterTargetGlasses * 0.25).toFixed(1)} Liter)</p>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-black ${isWaterTargetAchieved ? "text-emerald-500" : "text-cyan-500"}`}>
                    {waterGlasses} / {waterTargetGlasses} Gelas
                  </span>
                  <span className="text-[10px] opacity-60 block">
                    ({(waterGlasses * 0.25).toFixed(1)} Liter)
                  </span>
                </div>
              </div>

              {/* Progress Bar Hidrasi */}
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    isWaterTargetAchieved 
                      ? "bg-gradient-to-r from-emerald-400 to-teal-500" 
                      : "bg-gradient-to-r from-cyan-400 to-blue-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.round((waterGlasses / waterTargetGlasses) * 100))}%` }}
                />
              </div>

              {/* Barisan Gelas Visual Interaktif (Klik gelas untuk isi cepat) */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold opacity-60 block">
                  Ketuk ikon gelas untuk mencatat langsung:
                </span>
                <div className="flex items-center justify-center gap-1.5 flex-wrap py-1.5">
                  {Array.from({ length: Math.min(16, Math.max(8, waterTargetGlasses)) }).map((_, idx) => {
                    const glassNum = idx + 1;
                    const isFilled = waterGlasses >= glassNum;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSetWaterDirect(glassNum)}
                        className={`text-2xl sm:text-3xl transition-transform active:scale-90 hover:scale-110 ${
                          isFilled ? "opacity-100 drop-shadow-sm scale-105" : "opacity-25 grayscale"
                        }`}
                        title={`Gelas ke-${glassNum}`}
                      >
                        🥛
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kontrol Cepat Tambah / Kurang Gelas */}
              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] font-bold">
                  {isWaterTargetAchieved ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Target hidrasi hari ini tercapai!
                    </span>
                  ) : (
                    <span className="opacity-75">
                      Kurang {Math.max(0, waterTargetGlasses - waterGlasses)} gelas lagi untuk capai target
                    </span>
                  )}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleWaterSubtract}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-sm transition-all ${
                      isDarkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300" : "bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleWaterAdd}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+1 Gelas</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. SEKSI DURASI TIDUR SEMALAM */}
            <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${
              isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-indigo-100"
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <Moon className="w-4 h-4 text-indigo-500" /> 3. Durasi Tidur Semalam
                </h3>
                <span className="text-sm font-black text-indigo-500">
                  {sleepHours} Jam
                </span>
              </div>

              <input
                type="range"
                min="3"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />

              <div className="flex items-center justify-between text-[11px]">
                <span className="opacity-60">3 Jam</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full ${sleepEvaluation.bg} ${sleepEvaluation.color}`}>
                  {sleepEvaluation.text}
                </span>
                <span className="opacity-60">12 Jam</span>
              </div>
            </div>

            {/* TOMBOL SIMPAN CHECK-IN */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 text-white font-black text-sm shadow-lg hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                <span>Simpan Check-in Hari Ini ✨</span>
              </button>

              {savedSuccess && (
                <div className="p-3 mt-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center animate-fadeIn flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Data check-in harianmu berhasil disimpan! Riwayat telah diperbarui.</span>
                </div>
              )}
            </div>
          </form>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 2: RIWAYAT & JURNAL HARIAN ("perharinya gimana")
        ══════════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            
            {/* STATISTIK RINGKASAN */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className={`p-3.5 rounded-2xl border text-center ${
                isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-orange-100 shadow-sm"
              }`}>
                <span className="text-xl">🔥</span>
                <p className="text-lg font-black text-orange-500">{streak} Hari</p>
                <p className="text-[10px] opacity-60 font-bold">Streak Harian</p>
              </div>

              <div className={`p-3.5 rounded-2xl border text-center ${
                isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-cyan-100 shadow-sm"
              }`}>
                <span className="text-xl">💧</span>
                <p className="text-lg font-black text-cyan-500">
                  {historyList.length > 0 
                    ? (historyList.reduce((acc, curr) => acc + (curr.water || 0), 0) / historyList.length).toFixed(1)
                    : waterGlasses}
                  <span className="text-[10px] font-normal opacity-60"> Gls</span>
                </p>
                <p className="text-[10px] opacity-60 font-bold">Rata-rata Air</p>
              </div>

              <div className={`p-3.5 rounded-2xl border text-center ${
                isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-indigo-100 shadow-sm"
              }`}>
                <span className="text-xl">😴</span>
                <p className="text-lg font-black text-indigo-500">
                  {historyList.length > 0
                    ? (historyList.reduce((acc, curr) => acc + (curr.sleep || 0), 0) / historyList.length).toFixed(1)
                    : sleepHours}
                  <span className="text-[10px] font-normal opacity-60"> Jam</span>
                </p>
                <p className="text-[10px] opacity-60 font-bold">Rata-rata Tidur</p>
              </div>
            </div>

            {/* DAFTAR KARTU RIWAYAT PER HARI */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5 opacity-80">
                  <Calendar className="w-4 h-4 text-teal-500" /> Log Check-in Setiap Hari
                </h3>
                <span className="text-[10px] opacity-60">Total: {historyList.length} Catatan</span>
              </div>

              {historyList.length === 0 ? (
                <div className={`p-8 rounded-3xl border text-center space-y-2 ${
                  isDarkMode ? "bg-gray-900 border-gray-800 text-gray-400" : "bg-white border-teal-100 text-gray-500 shadow-sm"
                }`}>
                  <span className="text-4xl block">📓</span>
                  <p className="font-bold text-xs">Belum ada catatan riwayat check-in</p>
                  <p className="text-[11px] opacity-70">
                    Mulai isi kondisi hari ini di tab "Check-in Hari Ini" untuk melacak mood, air, dan tidurmu!
                  </p>
                  <button
                    type="button"
                    onClick={() => { triggerFeedback(); setActiveTab('checkin'); }}
                    className="mt-2 px-4 py-2 rounded-full bg-teal-500 text-white font-bold text-xs shadow-md"
                  >
                    Check-in Sekarang ✨
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyList.map((item, idx) => {
                    const isToday = item.dateKey === todayKey;
                    return (
                      <div 
                        key={item.id || idx}
                        className={`p-4 rounded-3xl border transition-all space-y-3 ${
                          isDarkMode 
                            ? "bg-gray-900 border-gray-800 hover:border-gray-700" 
                            : "bg-white border-teal-100/70 shadow-sm hover:shadow-md"
                        }`}
                      >
                        {/* Baris Tanggal & Badge */}
                        <div className="flex items-center justify-between border-b pb-2 border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black">{item.date}</span>
                            {isToday && (
                              <span className="text-[9px] font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-full">
                                Hari Ini
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {item.savedAt && (
                              <span className="text-[10px] opacity-50 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {item.savedAt}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteHistoryItem(item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              title="Hapus catatan ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Mood & Catatan Hari Itu */}
                        <div className="flex items-start gap-3">
                          <span className="text-3xl p-2 rounded-2xl bg-teal-500/10 shrink-0">
                            {item.emoji}
                          </span>
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-xs">{item.label}</h4>
                              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/60 dark:text-teal-300 px-2 py-0.2 rounded-full">
                                Skor: {item.mood}/5
                              </span>
                            </div>
                            <p className="text-xs opacity-80 leading-relaxed font-sans italic bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                              "{item.note || 'Hari ini berjalan dengan baik.'}"
                            </p>
                          </div>
                        </div>

                        {/* Indikator Air & Jam Tidur Hari Itu */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100 dark:border-gray-800 text-xs">
                          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/50">
                            <Droplets className="w-4 h-4 text-cyan-500 shrink-0" />
                            <div>
                              <span className="text-[10px] opacity-60 block">Minum Air</span>
                              <span className="font-black text-cyan-600 dark:text-cyan-400 text-[11px]">
                                {item.water || 4} Gelas (± {((item.water || 4) * 0.25).toFixed(1)}L)
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                            <Moon className="w-4 h-4 text-indigo-500 shrink-0" />
                            <div>
                              <span className="text-[10px] opacity-60 block">Durasi Tidur</span>
                              <span className="font-black text-indigo-600 dark:text-indigo-400 text-[11px]">
                                {item.sleep || 7.5} Jam Semalam
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ───────────── MODAL PENGATURAN PENGINGAT HARIAN (REMINDER) ───────────── */}
      {showReminderSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl space-y-4 ${
            isDarkMode ? "bg-gray-900 border-gray-800 text-gray-100" : "bg-white border-teal-100 text-gray-800"
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔔</span>
                <div>
                  <h3 className="font-black text-sm">Pengingat Check-in Harian</h3>
                  <p className="text-[10px] opacity-60">Bantu kamu konsisten merawat diri</p>
                </div>
              </div>
              <button
                onClick={() => setShowReminderSettings(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Toggle Switch */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <div>
                  <p className="font-bold text-xs">Aktifkan Notifikasi</p>
                  <p className="text-[10px] opacity-60">Ingatkan jika belum mengisi hari ini</p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleReminder}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    reminderEnabled ? "bg-teal-500 justify-end" : "bg-gray-300 dark:bg-gray-600 justify-start"
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {/* Pilihan Jam Pengingat */}
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-1.5">
                <label className="text-[11px] font-bold block opacity-75">
                  Waktu Pengingat Setiap Hari:
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => handleSaveReminderTime(e.target.value)}
                  disabled={!reminderEnabled}
                  className={`w-full p-2.5 rounded-xl border font-bold text-sm outline-none ${
                    isDarkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-800"
                  } ${!reminderEnabled ? "opacity-40 cursor-not-allowed" : ""}`}
                />
                <p className="text-[10px] opacity-60">
                  Rekomendasi: Pukul 20:00 (malam hari sebelum tidur untuk refleksi harian).
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/50 text-[11px] text-teal-800 dark:text-teal-300 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Tips Konsistensi
                </p>
                <p className="text-[10px] opacity-80 leading-relaxed">
                  Melakukan check-in rutin selama 7 hari dapat membangun kebiasaan refleksi positif dan menjaga hidrasi tubuh tetap optimal.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerFeedback();
                setShowReminderSettings(false);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-xs shadow-md"
            >
              Simpan & Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
