import React, { useState, useEffect } from "react";
import { ArrowLeft, Droplets, Moon, Smile, Sparkles, Check, Plus, Minus, Flame } from "lucide-react";
import { triggerFeedback } from "./utils/feedback";

const MOODS = [
  { emoji: "😄", label: "Sangat Senang", score: 5, color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
  { emoji: "🙂", label: "Baik", score: 4, color: "text-green-500", bg: "bg-green-50 border-green-200" },
  { emoji: "😐", label: "Biasa Saja", score: 3, color: "text-yellow-500", bg: "bg-yellow-50 border-yellow-200" },
  { emoji: "😔", label: "Lelah / Sedih", score: 2, color: "text-orange-500", bg: "bg-orange-50 border-orange-200" },
  { emoji: "😫", label: "Stres / Cemas", score: 1, color: "text-rose-500", bg: "bg-rose-50 border-rose-200" },
];

const COMFORT_QUOTES = [
  "Tidak apa-apa untuk merasa lelah hari ini. Jangan terlalu keras pada dirimu sendiri, kamu sudah bertahan sejauh ini.",
  "Tarik napas perlahan. Hari ini mungkin terasa berat, tetapi kamu jauh lebih kuat daripada beban yang sedang kamu pikul.",
  "Istirahat bukanlah tanda menyerah, melainkan persiapan agar jiwamu bisa melangkah lagi esok hari.",
  "Setiap badai pasti akan berlalu. Peluk dirimu sendiri, kamu sangat berharga dan tidak sendirian.",
  "Satu hari yang buruk bukan berarti seluruh hidupmu buruk. Bersabarlah pada proses pemulihan dirimu."
];

export default function WellnessScreen({ currentUser, onBack, isDarkMode }) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `heal_wellness_${currentUser || 'guest'}_${todayKey}`;

  const [data, setData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || null;
    } catch {
      return null;
    }
  });

  const [selectedMood, setSelectedMood] = useState(data?.mood ?? null);
  const [sleepHours, setSleepHours] = useState(data?.sleep ?? 7);
  const [waterGlasses, setWaterGlasses] = useState(data?.water ?? 4);
  const [comfortQuote, setComfortQuote] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Hitung streak check-in
  const calculateStreak = () => {
    let count = 0;
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const k = `heal_wellness_${currentUser || 'guest'}_${d.toISOString().slice(0, 10)}`;
      if (localStorage.getItem(k)) {
        count++;
      } else if (i > 0) {
        break;
      }
    }
    return count;
  };

  const streak = calculateStreak();

  // Trigger quote jika mood sedih / cemas
  const handleSelectMood = (score) => {
    triggerFeedback();
    setSelectedMood(score);
    if (score <= 2) {
      const randomQuote = COMFORT_QUOTES[Math.floor(Math.random() * COMFORT_QUOTES.length)];
      setComfortQuote(randomQuote);
    } else {
      setComfortQuote(null);
    }
  };

  const handleWaterAdd = () => {
    triggerFeedback();
    setWaterGlasses((prev) => Math.min(prev + 1, 16));
  };

  const handleWaterSubtract = () => {
    triggerFeedback();
    setWaterGlasses((prev) => Math.max(prev - 1, 0));
  };

  const handleSaveCheckin = () => {
    triggerFeedback();
    if (selectedMood === null) {
      alert("Silakan pilih perasaan (mood) kamu hari ini terlebih dahulu!");
      return;
    }

    const payload = {
      mood: selectedMood,
      sleep: sleepHours,
      water: waterGlasses,
      date: todayKey,
      savedAt: new Date().toLocaleTimeString("id-ID")
    };

    localStorage.setItem(storageKey, JSON.stringify(payload));
    setData(payload);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className={`flex flex-col min-h-screen pb-20 transition-colors duration-300 ${
      isDarkMode ? "bg-black text-gray-100" : "bg-gradient-to-b from-cyan-50 via-teal-50 to-pink-50 text-gray-800"
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b sticky top-0 z-30 backdrop-blur-md ${
        isDarkMode ? "bg-black/85 border-gray-800" : "bg-white/80 border-cyan-100"
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { triggerFeedback(); onBack(); }}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all ${
              isDarkMode ? "bg-gray-800 text-gray-200 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <ArrowLeft className="w-5 h-5 text-teal-600" />
          </button>
          <div>
            <h1 className="font-black text-lg flex items-center gap-1.5">
              <span>💧</span> Daily Wellness Check-in
            </h1>
            <p className="text-[10px] opacity-60">Pantau Mood, Jam Tidur & Hidrasi Harian</p>
          </div>
        </div>

        {/* Streak Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 text-white font-black text-xs shadow-md">
          <Flame className="w-4 h-4 fill-white" />
          <span>{streak} Hari</span>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto w-full space-y-4">
        {/* Banner Motivasi Check-in */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
            Tanggal: {new Date().toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <h2 className="text-base font-black">Bagaimana Kondisi Tubuh & Hatimu Hari Ini?</h2>
          <p className="text-xs opacity-90">
            Check-in setiap hari membantumu mengenali pola emosi dan menjaga kesehatan fisik remaja.
          </p>
        </div>

        {/* 1. Mood Tracker */}
        <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${
          isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-cyan-100"
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
              <Smile className="w-4 h-4" /> 1. Mood Tracker (Perasaan Hari Ini)
            </h3>
            {selectedMood && (
              <span className="text-xs font-bold text-teal-500">
                {MOODS.find(m => m.score === selectedMood)?.label}
              </span>
            )}
          </div>

          <div className="grid grid-cols-5 gap-2 pt-1">
            {MOODS.map((m) => {
              const isSelected = selectedMood === m.score;
              return (
                <button
                  key={m.score}
                  type="button"
                  onClick={() => handleSelectMood(m.score)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                    isSelected
                      ? "bg-teal-500 text-white border-teal-500 scale-105 shadow-md shadow-teal-500/30"
                      : isDarkMode
                      ? "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                      : "bg-gray-50 border-gray-100 text-gray-700 hover:bg-teal-50/50"
                  }`}
                >
                  <span className="text-3xl mb-1">{m.emoji}</span>
                  <span className="text-[9px] font-black leading-tight text-center">
                    {m.label.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quote Penyemangat Otomatis saat Sedih / Stres */}
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

        {/* 2. Water & Hydration Tracker */}
        <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${
          isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-cyan-100"
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
              <Droplets className="w-4 h-4 text-cyan-500" /> 2. Konsumsi Air Putih (Target 8 Gelas)
            </h3>
            <span className="text-xs font-black text-cyan-500">
              {waterGlasses} / 8 Gelas
            </span>
          </div>

          {/* Visual Glasses Display */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap py-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
              <span
                key={g}
                className={`text-2xl transition-all ${
                  waterGlasses >= g ? "scale-110 drop-shadow-sm opacity-100" : "opacity-25 grayscale"
                }`}
                title={`Gelas ke-${g}`}
              >
                🥛
              </span>
            ))}
          </div>

          {/* Quick Add Buttons */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleWaterSubtract}
              className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleWaterAdd}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+1 Gelas Air</span>
            </button>
          </div>
        </div>

        {/* 3. Sleep Tracker */}
        <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${
          isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-cyan-100"
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

          <div className="flex items-center justify-between text-[11px] opacity-70">
            <span>3 jam</span>
            <span className={`font-bold ${sleepHours >= 7 && sleepHours <= 9 ? "text-emerald-500" : "text-amber-500"}`}>
              {sleepHours >= 7 && sleepHours <= 9 ? "✅ Cukup & Sehat (7-9 Jam)" : sleepHours < 7 ? "⚠️ Kurang Tidur" : "😴 Tidur Berlebih"}
            </span>
            <span>12 jam</span>
          </div>
        </div>

        {/* Tombol Simpan Check-in */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSaveCheckin}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white font-black text-sm shadow-lg hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Check-in Hari Ini</span>
          </button>

          {savedSuccess && (
            <p className="text-xs text-center font-bold text-emerald-600 dark:text-emerald-400 mt-2 animate-fadeIn">
              ✓ Data check-in harianmu berhasil disimpan! Tetap jaga kesehatan ya.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
