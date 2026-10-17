import React, { useState, useEffect } from 'react';
import SkeletonCard from './SkeletonCard';
import { triggerFeedback } from './utils/feedback';

export default function MoodTrackerScreen({ currentUser, onBack, isDarkMode }) {
  const [selectedMood, setSelectedMood] = useState('😊');
  const [moodNote, setMoodNote] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const userMoodKey = currentUser ? `heal_moods_${currentUser}` : 'heal_moods_guest';

  const moodsList = [
    { emoji: '😄', label: 'Sangat Senang', color: 'bg-green-100 text-green-600 border-green-300' },
    { emoji: '😊', label: 'Baik / Tenang', color: 'bg-blue-100 text-blue-600 border-blue-300' },
    { emoji: '😐', label: 'Biasa Saja', color: 'bg-yellow-100 text-yellow-600 border-yellow-300' },
    { emoji: '😰', label: 'Cemas / Stress', color: 'bg-orange-100 text-orange-600 border-orange-300' },
    { emoji: '😢', label: 'Sedih / Down', color: 'bg-purple-100 text-purple-600 border-purple-300' },
    { emoji: '😠', label: 'Marah / Kesal', color: 'bg-red-100 text-red-600 border-red-300' },
  ];

  useEffect(() => {
    setLoading(true);
    // Tambahkan sedikit jeda agar animasi skeleton terlihat smooth
    setTimeout(() => {
      const saved = localStorage.getItem(userMoodKey);
      if (saved) {
        try {
          setMoodHistory(JSON.parse(saved));
        } catch (e) {
          setMoodHistory([]);
        }
      }
      setLoading(false);
    }, 600);
  }, [userMoodKey]);

  const handleSaveMood = (e) => {
    e.preventDefault();
    triggerFeedback();
    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const newEntry = {
      id: Date.now(),
      date: todayStr,
      emoji: selectedMood,
      note: moodNote.trim() || 'Tanpa catatan khusus.'
    };

    const updated = [newEntry, ...moodHistory];
    setMoodHistory(updated);
    localStorage.setItem(userMoodKey, JSON.stringify(updated));
    setMoodNote('');
    alert('Mood hari ini berhasil dicatat! Tetap semangat ya. ✨');
  };

  return (
    <div className={`flex-1 flex flex-col min-h-screen pb-12 transition-colors duration-300 ${isDarkMode ? 'bg-black text-gray-100' : 'bg-pink-200 text-gray-800'}`}>
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { triggerFeedback(); onBack(); }}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all ${
              isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ←
          </button>
          <h1 className="text-xl font-bold tracking-wide">🎭 Mood Tracker</h1>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-5">
        
        {/* Form Catat Mood Hari Ini */}
        <div className={`rounded-3xl p-5 shadow-sm border space-y-4 ${
          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'
        }`}>
          <h3 className="font-bold text-sm">Bagaimana perasaanmu hari ini?</h3>

          <form onSubmit={handleSaveMood} className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {moodsList.map((m) => (
                <button
                  key={m.emoji}
                  type="button"
                  onClick={() => { triggerFeedback(); setSelectedMood(m.emoji); }}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all ${
                    selectedMood === m.emoji 
                      ? 'bg-pink-500 text-white border-pink-600 scale-105 shadow-md' 
                      : isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] font-bold line-clamp-1">{m.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs opacity-70 font-medium block mb-1">Catatan / Alasan (Opsional)</label>
              <textarea 
                rows={2}
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="Ceritakan sedikit kenapa kamu merasa seperti ini..."
                className={`w-full border rounded-2xl p-3 text-xs outline-none focus:border-pink-400 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-3 rounded-full text-xs shadow-md hover:opacity-95 transition-all"
            >
              Simpan Mood Hari Ini ✨
            </button>
          </form>
        </div>

        {/* Riwayat Mood */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <span>📅</span> Riwayat Suasana Hati
          </h3>

          {loading ? (
            <div className="space-y-3 mt-2">
              <SkeletonCard isDarkMode={isDarkMode} />
              <SkeletonCard isDarkMode={isDarkMode} />
            </div>
          ) : moodHistory.length === 0 ? (
            <div className={`rounded-3xl p-8 text-center border shadow-sm ${
              isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-white border-pink-100 text-gray-500'
            }`}>
              <p className="text-xs">Belum ada riwayat mood yang tercatat. Yuk catat hari ini!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {moodHistory.map((item) => (
                <div key={item.id} className={`rounded-2xl p-4 shadow-sm border flex items-center justify-between ${
                  isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl bg-pink-500/10 p-2 rounded-2xl">{item.emoji}</span>
                    <div>
                      <p className="text-xs font-bold">{item.date}</p>
                      <p className="text-xs opacity-60 mt-0.5">{item.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}