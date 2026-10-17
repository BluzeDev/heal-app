import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { triggerFeedback } from './utils/feedback';
import { 
  ArrowLeft, Lock, Unlock, KeyRound, Plus, Trash2, Edit3, 
  Search, Shield, Heart, Sparkles, Calendar, Smile, Check, X, Eye, EyeOff 
} from 'lucide-react';

const MOOD_LIST = [
  { emoji: '🥰', label: 'Bersyukur', color: 'from-pink-500 to-rose-500' },
  { emoji: '😊', label: 'Senang', color: 'from-amber-400 to-orange-500' },
  { emoji: '😌', label: 'Tenang', color: 'from-emerald-400 to-teal-500' },
  { emoji: '✨', label: 'Semangat', color: 'from-indigo-500 to-purple-500' },
  { emoji: '😔', label: 'Sedih', color: 'from-blue-400 to-cyan-500' },
  { emoji: '😣', label: 'Cemas', color: 'from-yellow-500 to-amber-600' },
  { emoji: '😤', label: 'Kesal', color: 'from-red-500 to-rose-600' },
  { emoji: '😴', label: 'Lelah', color: 'from-gray-400 to-slate-500' },
];

const CATEGORIES = [
  'Gratitude / Rasa Syukur 🙏',
  'Curhat Rahasia 💭',
  'Target & Harapan 🎯',
  'Refleksi Diri 🪞',
  'Catatan Harian 📝'
];

export default function PrivateJournalScreen({ currentUser, onBack, isDarkMode }) {
  const userKey = currentUser || 'guest';
  const pinStorageKey = `heal_journal_pin_${userKey}`;
  const localJournalKey = `heal_private_journals_${userKey}`;

  // State PIN & Kunci Keamanan
  const [hasPin, setHasPin] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPinSetupModal, setShowPinSetupModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [setupError, setSetupError] = useState('');

  // State Jurnal
  const [journals, setJournals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('Semua');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJournalId, setEditingJournalId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [selectedMood, setSelectedMood] = useState(MOOD_LIST[0]);
  const [saving, setSaving] = useState(false);

  // Cek apakah user sudah mengaktifkan PIN
  useEffect(() => {
    const savedPin = localStorage.getItem(pinStorageKey);
    if (savedPin) {
      setHasPin(true);
      setIsUnlocked(false);
    } else {
      setHasPin(false);
      setIsUnlocked(true); // Jika belum ada PIN, langsung bisa akses
    }
    loadJournals();
  }, [userKey]);

  // Load jurnal dari Firestore atau LocalStorage
  const loadJournals = async () => {
    try {
      // 1. Ambil dari LocalStorage terlebih dahulu (offline first)
      const localData = localStorage.getItem(localJournalKey);
      let list = localData ? JSON.parse(localData) : [];

      // 2. Jika login, sync dari Firestore sub-koleksi privat user
      if (currentUser && currentUser !== 'guest') {
        try {
          const snap = await getDocs(collection(db, 'data_login', currentUser, 'private_journals'));
          if (!snap.empty) {
            const firestoreList = snap.docs.map(d => ({
              id: d.id,
              ...d.data()
            }));
            // Gabungkan unik berdasarkan id
            const mergedMap = new Map();
            [...firestoreList, ...list].forEach(item => mergedMap.set(item.id, item));
            list = Array.from(mergedMap.values());
          }
        } catch (e) {
          console.warn("Offline / Firestore read fallback to local:", e);
        }
      }

      // Urutkan terbaru di atas
      list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      setJournals(list);
      localStorage.setItem(localJournalKey, JSON.stringify(list));
    } catch (e) {
      console.error("Gagal load jurnal:", e);
    }
  };

  // Verifikasi PIN
  const handleVerifyPin = (digit) => {
    triggerFeedback();
    const nextPin = pinInput + digit;
    if (nextPin.length <= 4) {
      setPinInput(nextPin);
      setPinError('');
      if (nextPin.length === 4) {
        const savedPin = localStorage.getItem(pinStorageKey);
        if (btoa(nextPin) === savedPin) {
          setIsUnlocked(true);
          setPinInput('');
        } else {
          setPinError('PIN salah! Silakan coba lagi.');
          setTimeout(() => setPinInput(''), 600);
        }
      }
    }
  };

  const handleBackspacePin = () => {
    triggerFeedback();
    setPinInput(prev => prev.slice(0, -1));
    setPinError('');
  };

  // Simpan / Ubah PIN Baru
  const handleSaveNewPin = () => {
    triggerFeedback();
    if (newPin.length !== 4) {
      setSetupError('PIN harus tepat 4 angka!');
      return;
    }
    if (newPin !== confirmPin) {
      setSetupError('Konfirmasi PIN tidak cocok!');
      return;
    }
    localStorage.setItem(pinStorageKey, btoa(newPin));
    setHasPin(true);
    setIsUnlocked(true);
    setShowPinSetupModal(false);
    setNewPin('');
    setConfirmPin('');
    setSetupError('');
    alert('🔒 PIN 4-Digit berhasil diaktifkan untuk Jurnal Pribadi!');
  };

  // Hapus / Nonaktifkan PIN
  const handleRemovePin = () => {
    triggerFeedback();
    if (window.confirm('Apakah kamu yakin ingin menonaktifkan kunci PIN pada Jurnal Pribadi?')) {
      localStorage.removeItem(pinStorageKey);
      setHasPin(false);
      setIsUnlocked(true);
      alert('Kunci PIN dinonaktifkan.');
    }
  };

  // Simpan atau Edit Catatan Jurnal
  const handleSaveJournal = async (e) => {
    e.preventDefault();
    triggerFeedback();
    if (!title.trim() || !content.trim()) {
      alert('Mohon isi judul dan cerita jurnalmu.');
      return;
    }

    setSaving(true);
    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

      const journalEntry = {
        title: title.trim(),
        content: content.trim(),
        category,
        mood: selectedMood,
        date: now.toISOString(),
        dateDisplay: `${dateStr} • ${timeStr}`
      };

      let updatedList = [];

      if (editingJournalId) {
        // Edit mode
        updatedList = journals.map(j => j.id === editingJournalId ? { ...j, ...journalEntry } : j);
        if (currentUser && currentUser !== 'guest') {
          try {
            await updateDoc(doc(db, 'data_login', currentUser, 'private_journals', editingJournalId), journalEntry);
          } catch (e) {}
        }
      } else {
        // New mode
        const newId = 'j_' + Date.now();
        const newDoc = { id: newId, ...journalEntry };
        updatedList = [newDoc, ...journals];
        if (currentUser && currentUser !== 'guest') {
          try {
            await addDoc(collection(db, 'data_login', currentUser, 'private_journals'), journalEntry);
          } catch (e) {}
        }
      }

      setJournals(updatedList);
      localStorage.setItem(localJournalKey, JSON.stringify(updatedList));

      // Reset form & modal
      setShowAddModal(false);
      setEditingJournalId(null);
      setTitle('');
      setContent('');
      alert(editingJournalId ? 'Catatan jurnal berhasil diperbarui! 🌸' : 'Catatan jurnal tersimpan dengan aman di ruang rahasiamu. ✨');
    } catch (e) {
      console.error("Gagal simpan jurnal:", e);
      alert('Gagal menyimpan jurnal, coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJournal = async (id) => {
    triggerFeedback();
    if (window.confirm('Yakin ingin menghapus catatan jurnal ini? Tindakan ini tidak dapat dibatalkan.')) {
      const updated = journals.filter(j => j.id !== id);
      setJournals(updated);
      localStorage.setItem(localJournalKey, JSON.stringify(updated));
      if (currentUser && currentUser !== 'guest') {
        try {
          await deleteDoc(doc(db, 'data_login', currentUser, 'private_journals', id));
        } catch (e) {}
      }
    }
  };

  const handleEditClick = (journal) => {
    triggerFeedback();
    setEditingJournalId(journal.id);
    setTitle(journal.title);
    setContent(journal.content);
    setCategory(journal.category || CATEGORIES[0]);
    setSelectedMood(journal.mood || MOOD_LIST[0]);
    setShowAddModal(true);
  };

  // Filter journals
  const filteredJournals = journals.filter(j => {
    const matchCat = selectedFilterCategory === 'Semua' || j.category === selectedFilterCategory;
    const matchSearch = j.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        j.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className={`flex-1 flex flex-col min-h-screen pb-24 transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-gray-100' : 'bg-gradient-to-b from-purple-100 via-pink-50 to-amber-50 text-gray-800'
    }`}>
      {/* Header */}
      <div className={`p-4 sticky top-0 z-30 flex items-center justify-between backdrop-blur-md border-b ${
        isDarkMode ? 'bg-black/85 border-gray-800' : 'bg-white/80 border-purple-200'
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { triggerFeedback(); onBack(); }}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all ${
              isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-pink-50'
            }`}
          >
            <ArrowLeft className="w-5 h-5 text-purple-600" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-wide flex items-center gap-1.5">
              <span>📓</span> Jurnal Pribadi & Syukur
            </h1>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">100% Rahasia • Safe Space Pribadi</p>
          </div>
        </div>

        {/* Tombol Atur PIN */}
        <div className="flex items-center gap-2">
          {hasPin ? (
            <button
              onClick={() => { triggerFeedback(); handleRemovePin(); }}
              className="text-[10px] font-bold px-2.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center gap-1"
              title="PIN Aktif. Klik untuk menonaktifkan."
            >
              <Lock className="w-3 h-3" />
              <span className="hidden sm:inline">PIN Aktif</span>
            </button>
          ) : (
            <button
              onClick={() => { triggerFeedback(); setShowPinSetupModal(true); }}
              className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-purple-500 text-white shadow-sm hover:bg-purple-600 flex items-center gap-1"
            >
              <KeyRound className="w-3 h-3" />
              <span>Kunci PIN</span>
            </button>
          )}
        </div>
      </div>

      {/* ───────────── TAMPILAN TERKUNCI PIN (LOCK SCREEN) ───────────── */}
      {hasPin && !isUnlocked ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-xl border-4 border-white/20 animate-bounce">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight">Jurnal Pribadi Terkunci</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Masukkan PIN 4-Digit kamu untuk membuka ruang catatan rahasiamu.
            </p>
          </div>

          {/* 4 Digit Indicators */}
          <div className="flex items-center gap-3 my-2">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  pinInput.length > idx
                    ? 'bg-purple-600 border-purple-600 scale-125'
                    : isDarkMode
                    ? 'border-gray-700 bg-gray-800'
                    : 'border-purple-200 bg-white'
                }`}
              />
            ))}
          </div>

          {pinError && (
            <p className="text-xs text-red-500 font-bold animate-shake">{pinError}</p>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] pt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleVerifyPin(digit.toString())}
                className={`h-14 rounded-2xl font-black text-xl border shadow-sm transition-all active:scale-90 ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700'
                    : 'bg-white border-purple-100 text-gray-800 hover:bg-purple-50'
                }`}
              >
                {digit}
              </button>
            ))}
            <div />
            <button
              type="button"
              onClick={() => handleVerifyPin('0')}
              className={`h-14 rounded-2xl font-black text-xl border shadow-sm transition-all active:scale-90 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700'
                  : 'bg-white border-purple-100 text-gray-800 hover:bg-purple-50'
              }`}
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspacePin}
              className={`h-14 rounded-2xl font-black text-sm border shadow-sm transition-all active:scale-90 flex items-center justify-center ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  : 'bg-white border-purple-100 text-gray-600 hover:bg-purple-50'
              }`}
            >
              ⌫
            </button>
          </div>
        </div>
      ) : (
        /* ───────────── TAMPILAN UTAMA JURNAL (UNLOCKED) ───────────── */
        <div className="p-4 max-w-2xl mx-auto w-full space-y-4">
          {/* Banner Safe Space */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-md flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                🔒 Safe Space Pribadi
              </span>
              <h2 className="text-base font-black">Ruang Rahasia Hati & Syukur</h2>
              <p className="text-xs opacity-90 leading-relaxed max-w-sm">
                Tuliskan apa pun tanpa takut dihakimi. Catatan ini hanya bisa dibaca oleh dirimu sendiri.
              </p>
            </div>
            <button
              onClick={() => {
                triggerFeedback();
                setEditingJournalId(null);
                setTitle('');
                setContent('');
                setSelectedMood(MOOD_LIST[0]);
                setCategory(CATEGORIES[0]);
                setShowAddModal(true);
              }}
              className="bg-white text-purple-700 font-black px-4 py-3 rounded-2xl text-xs shadow-lg hover:bg-purple-50 transition-all flex items-center gap-1.5 shrink-0 hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Tulis Jurnal</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-2">
            <div className={`p-2.5 rounded-2xl border shadow-xs flex items-center gap-2 ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-purple-100'
            }`}>
              <Search className="w-4 h-4 text-purple-500 ml-1" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari catatan jurnal atau syukur..."
                className="w-full bg-transparent border-none outline-none text-xs font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-xs text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Chips Kategori */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {['Semua', ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => { triggerFeedback(); setSelectedFilterCategory(cat); }}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                    selectedFilterCategory === cat
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : isDarkMode
                      ? 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800'
                      : 'bg-white border-purple-100 text-gray-600 hover:bg-purple-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* List Catatan Jurnal */}
          {filteredJournals.length === 0 ? (
            <div className={`p-8 rounded-3xl text-center border shadow-xs space-y-3 ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-purple-100'
            }`}>
              <span className="text-5xl">✍️</span>
              <h3 className="font-extrabold text-sm">Belum Ada Catatan Jurnal</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                {searchQuery
                  ? `Tidak ada catatan yang cocok dengan "${searchQuery}".`
                  : 'Mulai tuliskan rasa syukur, isi hati, atau refleksi harimu hari ini. Ruang ini aman untukmu.'}
              </p>
              <button
                onClick={() => {
                  triggerFeedback();
                  setEditingJournalId(null);
                  setTitle('');
                  setContent('');
                  setShowAddModal(true);
                }}
                className="mt-2 px-5 py-2 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700"
              >
                + Tulis Cerita Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJournals.map((journal) => (
                <div
                  key={journal.id}
                  className={`p-5 rounded-3xl border shadow-sm space-y-3 transition-all ${
                    isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-purple-100'
                  }`}
                >
                  {/* Top Bar: Mood & Kategori & Tanggal */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg">
                        {journal.mood?.emoji || '🌸'}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                          {journal.category || 'Curhat Pribadi'}
                        </span>
                        <span className="text-[10px] opacity-60">
                          Mood: {journal.mood?.label || 'Biasa'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditClick(journal)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-gray-800"
                        title="Edit Jurnal"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteJournal(journal.id)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-800"
                        title="Hapus Jurnal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Judul & Isi */}
                  <div className="space-y-1.5">
                    <h3 className="font-black text-sm">{journal.title}</h3>
                    <p className="text-xs opacity-85 leading-relaxed whitespace-pre-wrap">
                      {journal.content}
                    </p>
                  </div>

                  {/* Footer Tanggal */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[10px] opacity-60">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-purple-500" />
                      {journal.dateDisplay || new Date(journal.date).toLocaleDateString('id-ID')}
                    </span>
                    <span className="font-bold text-purple-500">🔒 Hanya Kamu yang Tahu</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────── MODAL TULIS / EDIT JURNAL ───────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border space-y-4 max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-purple-100 text-gray-800'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
              <h2 className="font-black text-base flex items-center gap-2">
                <span>✍️</span> {editingJournalId ? 'Edit Catatan Jurnal' : 'Tulis Jurnal Pribadi Baru'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveJournal} className="space-y-4">
              {/* Pilihan Mood */}
              <div>
                <label className="block text-xs font-bold mb-1.5 opacity-80">
                  Bagaimana suasana hatimu saat ini?
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {MOOD_LIST.map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => { triggerFeedback(); setSelectedMood(m); }}
                      className={`p-2 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                        selectedMood.label === m.label
                          ? 'bg-purple-500 text-white border-purple-500 scale-105 shadow-sm'
                          : isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-purple-50'
                      }`}
                    >
                      <span className="text-xl mb-0.5">{m.emoji}</span>
                      <span className="text-[9px] font-bold">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Kategori Jurnal */}
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">
                  Jenis Catatan
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full border-2 rounded-2xl p-2.5 text-xs outline-none focus:border-purple-500 transition-all ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Judul Catatan */}
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">
                  Judul Catatan
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Hal baik yang kusyukuri hari ini..."
                  className={`w-full border-2 rounded-2xl p-3 text-xs outline-none focus:border-purple-500 transition-all font-semibold ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                  required
                />
              </div>

              {/* Isi Cerita / Catatan */}
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">
                  Cerita Lengkap (Keluh kesah, syukur, atau renunganmu)
                </label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Ceritakan dengan bebas tanpa ragu. Tulisan ini tersimpan secara rahasia..."
                  className={`w-full border-2 rounded-2xl p-3 text-xs outline-none focus:border-purple-500 transition-all leading-relaxed ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 font-bold text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-md hover:opacity-90 flex items-center justify-center gap-1.5"
                >
                  {saving ? 'Menyimpan...' : '💾 Simpan Jurnal Rahasia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────── MODAL ATUR PIN 4-DIGIT ───────────── */}
      {showPinSetupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border space-y-4 text-center ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-purple-100 text-gray-800'
          }`}>
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 mx-auto flex items-center justify-center text-2xl">
              <KeyRound className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-black">Atur Kunci PIN 4-Digit</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Amankan catatan rahasiamu dari siapapun yang meminjam ponselmu.
              </p>
            </div>

            {setupError && (
              <p className="text-xs text-red-500 font-bold">{setupError}</p>
            )}

            <div className="space-y-3 text-left">
              <div>
                <label className="block text-[11px] font-bold mb-1 opacity-80">Masukkan PIN Baru (4 Angka)</label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="****"
                  className={`w-full border-2 rounded-2xl p-2.5 text-center text-lg font-black tracking-widest outline-none focus:border-purple-500 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1 opacity-80">Konfirmasi PIN Baru</label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="****"
                  className={`w-full border-2 rounded-2xl p-2.5 text-center text-lg font-black tracking-widest outline-none focus:border-purple-500 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setShowPinSetupModal(false); setNewPin(''); setConfirmPin(''); setSetupError(''); }}
                className="flex-1 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 font-bold text-xs text-gray-600 dark:text-gray-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveNewPin}
                className="flex-1 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md"
              >
                Simpan PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
