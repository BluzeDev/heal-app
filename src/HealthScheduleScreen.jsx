import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { triggerFeedback } from './utils/feedback';
import { 
  ArrowLeft, Plus, Check, Clock, Trash2, Edit3, 
  Pill, AlertCircle, Calendar, Sparkles, CheckCircle2, Circle, Sun, Moon, Sunrise 
} from 'lucide-react';

const TIME_SLOTS = [
  { id: 'Pagi', label: 'Pagi', icon: '🌅', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  { id: 'Siang', label: 'Siang', icon: '☀️', color: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  { id: 'Malam', label: 'Malam', icon: '🌙', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30' },
  { id: 'Spesifik', label: 'Jam Khusus', icon: '⏰', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30' }
];

const MED_ICONS = ['💊', '🧪', '🩸', '🌿', '💉', '🩹', '💧', '✨'];

const DOSAGE_PRESETS = [
  '1x sehari sesudah makan',
  '2x sehari sesudah makan',
  '1x sehari sebelum makan',
  '1 tablet seminggu sekali (TTD Remaja)',
  'Diminum saat keluhan kambuh'
];

export default function HealthScheduleScreen({ currentUser, onBack, isDarkMode }) {
  const userKey = currentUser ? currentUser : 'guest';
  const userScheduleKey = `heal_schedules_${userKey}`;
  const userMedsKey = `heal_meds_${userKey}`;

  // Tab State: 'meds' (Kotak Obat) atau 'activity' (Jadwal Aktivitas)
  const [activeTab, setActiveTab] = useState('meds');

  // ────────────── STATE KOTAK OBAT & VITAMIN ──────────────
  const [medications, setMedications] = useState([]);
  const [showMedForm, setShowMedForm] = useState(false);
  const [editingMedId, setEditingMedId] = useState(null);
  const [medFilter, setMedFilter] = useState('Semua');

  // Form Meds
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState(DOSAGE_PRESETS[0]);
  const [medTimeSlot, setMedTimeSlot] = useState('Pagi');
  const [medSpecificTime, setMedSpecificTime] = useState('07:00');
  const [medIcon, setMedIcon] = useState('💊');

  // ────────────── STATE JADWAL AKTIVITAS SEHAT ──────────────
  const [schedules, setSchedules] = useState([]);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState(null);

  // Form Activity
  const [hari, setHari] = useState('Senin');
  const [tanggal, setTanggal] = useState('');
  const [dariJam, setDariJam] = useState('');
  const [sampaiJam, setSampaiJam] = useState('');
  const [aktivitas, setAktivitas] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏃');

  const activityIcons = [
    '🏃', '🏋️', '🧘', '🚴', '🏊', '🚶', '🤸', '⚽',
    '🥗', '🍎', '🥑', '🍌', '🥛', '🍵', '🍳', '🥩',
    '🛏️', '😴', '🧠', '❤️', '📖', '📝', '🎯', '✨'
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  // Load Data
  useEffect(() => {
    // 1. Load Meds
    const savedMeds = localStorage.getItem(userMedsKey);
    if (savedMeds) {
      try {
        setMedications(JSON.parse(savedMeds));
      } catch (e) {
        setMedications([]);
      }
    } else {
      // Default rekomendasi obat/vitamin ramah remaja jika belum ada
      const defaultMeds = [
        {
          id: 'med_1',
          name: 'Vitamin C & Zinc',
          dosage: '1x sehari sesudah sarapan',
          timeSlot: 'Pagi',
          specificTime: '07:30',
          icon: '💊',
          takenDates: []
        },
        {
          id: 'med_2',
          name: 'Tablet Tambah Darah (TTD)',
          dosage: '1 tablet per minggu untuk cegah anemia',
          timeSlot: 'Malam',
          specificTime: '20:00',
          icon: '🩸',
          takenDates: []
        }
      ];
      setMedications(defaultMeds);
      localStorage.setItem(userMedsKey, JSON.stringify(defaultMeds));
    }

    // 2. Load Schedules
    const savedSchedules = localStorage.getItem(userScheduleKey);
    if (savedSchedules) {
      try {
        setSchedules(JSON.parse(savedSchedules));
      } catch (e) {
        setSchedules([]);
      }
    }
  }, [userKey]);

  // Simpan Meds ke LocalStorage & Firestore
  const saveMedicationsToStorage = (updatedList) => {
    setMedications(updatedList);
    localStorage.setItem(userMedsKey, JSON.stringify(updatedList));
    if (currentUser && currentUser !== 'guest') {
      try {
        updateDoc(doc(db, 'data_login', currentUser), {
          medications_tracker: updatedList
        }).catch(() => {});
      } catch (e) {}
    }
  };

  // Toggle checklist harian ("Sudah diminum hari ini")
  const handleToggleMedTaken = (medId) => {
    triggerFeedback();
    const updated = medications.map((med) => {
      if (med.id !== medId) return med;
      const currentTakenDates = Array.isArray(med.takenDates) ? med.takenDates : [];
      const isAlreadyTaken = currentTakenDates.includes(todayStr);

      const nextTakenDates = isAlreadyTaken
        ? currentTakenDates.filter(d => d !== todayStr)
        : [...currentTakenDates, todayStr];

      return {
        ...med,
        takenDates: nextTakenDates
      };
    });

    saveMedicationsToStorage(updated);
  };

  // Hitung persentase kepatuhan minum obat hari ini
  const totalMeds = medications.length;
  const takenMedsCount = medications.filter(m => (m.takenDates || []).includes(todayStr)).length;
  const compliancePercent = totalMeds > 0 ? Math.round((takenMedsCount / totalMeds) * 100) : 100;

  // Buka Form Tambah Med
  const handleOpenMedForm = () => {
    triggerFeedback();
    setEditingMedId(null);
    setMedName('');
    setMedDosage(DOSAGE_PRESETS[0]);
    setMedTimeSlot('Pagi');
    setMedSpecificTime('07:00');
    setMedIcon('💊');
    setShowMedForm(true);
  };

  const handleEditMedInit = (med) => {
    triggerFeedback();
    setEditingMedId(med.id);
    setMedName(med.name);
    setMedDosage(med.dosage);
    setMedTimeSlot(med.timeSlot || 'Pagi');
    setMedSpecificTime(med.specificTime || '07:00');
    setMedIcon(med.icon || '💊');
    setShowMedForm(true);
  };

  const handleDeleteMed = (id) => {
    triggerFeedback();
    if (window.confirm('Hapus obat/vitamin ini dari jadwal pengingat?')) {
      const updated = medications.filter(m => m.id !== id);
      saveMedicationsToStorage(updated);
    }
  };

  const handleSaveMed = (e) => {
    e.preventDefault();
    triggerFeedback();
    if (!medName.trim()) {
      alert('Masukkan nama obat atau vitamin!');
      return;
    }

    let updatedList;
    if (editingMedId) {
      updatedList = medications.map(m =>
        m.id === editingMedId
          ? {
              ...m,
              name: medName.trim(),
              dosage: medDosage.trim(),
              timeSlot: medTimeSlot,
              specificTime: medSpecificTime,
              icon: medIcon
            }
          : m
      );
    } else {
      const newMed = {
        id: 'med_' + Date.now(),
        name: medName.trim(),
        dosage: medDosage.trim(),
        timeSlot: medTimeSlot,
        specificTime: medSpecificTime,
        icon: medIcon,
        takenDates: []
      };
      updatedList = [newMed, ...medications];
    }

    saveMedicationsToStorage(updatedList);
    setShowMedForm(false);
  };

  // ────────────── HANDLE SCHEDULE AKTIVITAS ──────────────
  const handleOpenActivityForm = (defaultHari = 'Senin', defaultTanggal = '') => {
    triggerFeedback();
    setEditingActivityId(null);
    setHari(defaultHari);
    setTanggal(defaultTanggal);
    setDariJam('');
    setSampaiJam('');
    setAktivitas('');
    setSelectedIcon('🏃');
    setShowActivityForm(true);
  };

  const handleEditActivityInit = (item) => {
    triggerFeedback();
    setEditingActivityId(item.id);
    setHari(item.hari);
    setTanggal(item.rawTanggal || '');
    setDariJam(item.dariJam);
    setSampaiJam(item.sampaiJam);
    setAktivitas(item.aktivitas);
    setSelectedIcon(item.icon);
    setShowActivityForm(true);
  };

  const handleDeleteActivity = (id) => {
    triggerFeedback();
    if (window.confirm('Yakin ingin menghapus jadwal ini?')) {
      const updated = schedules.filter((item) => item.id !== id);
      setSchedules(updated);
      localStorage.setItem(userScheduleKey, JSON.stringify(updated));
      window.dispatchEvent(new Event('scheduleUpdated'));
    }
  };

  const handleSaveActivity = (e) => {
    e.preventDefault();
    triggerFeedback();
    if (!aktivitas.trim() || !dariJam) {
      alert('Mohon isi jam dan nama aktivitas!');
      return;
    }

    let formattedDate = 'Setiap ' + hari;
    if (tanggal) {
      const dateObj = new Date(tanggal);
      formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    let updatedSchedules;
    if (editingActivityId) {
      updatedSchedules = schedules.map((item) =>
        item.id === editingActivityId
          ? {
              ...item,
              hari,
              tanggal: formattedDate,
              rawTanggal: tanggal,
              dariJam,
              sampaiJam,
              aktivitas,
              icon: selectedIcon,
            }
          : item
      );
    } else {
      const newSchedule = {
        id: Date.now(),
        hari,
        tanggal: formattedDate,
        rawTanggal: tanggal,
        dariJam,
        sampaiJam,
        aktivitas,
        icon: selectedIcon,
      };
      updatedSchedules = [...schedules, newSchedule];
    }

    setSchedules(updatedSchedules);
    localStorage.setItem(userScheduleKey, JSON.stringify(updatedSchedules));
    window.dispatchEvent(new Event('scheduleUpdated'));
    setShowActivityForm(false);
  };

  // Filter Meds
  const filteredMeds = medications.filter(m => {
    if (medFilter === 'Semua') return true;
    return m.timeSlot === medFilter;
  });

  return (
    <div className={`flex-1 flex flex-col min-h-screen pb-24 transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-gray-100' : 'bg-gradient-to-b from-blue-100 via-pink-50 to-amber-50 text-gray-800'
    }`}>
      {/* Header */}
      <div className={`p-4 sticky top-0 z-30 flex items-center justify-between backdrop-blur-md border-b ${
        isDarkMode ? 'bg-black/85 border-gray-800' : 'bg-white/80 border-blue-200'
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { triggerFeedback(); onBack(); }}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all ${
              isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-pink-50'
            }`}
          >
            <ArrowLeft className="w-5 h-5 text-blue-600" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-wide flex items-center gap-1.5">
              <span>📅</span> Jadwal & Kotak Obat
            </h1>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
              Pengingat Rutin Vitamin, Obat & Pola Hidup Sehat
            </p>
          </div>
        </div>

        <button
          onClick={activeTab === 'meds' ? handleOpenMedForm : () => handleOpenActivityForm()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === 'meds' ? 'Tambah Obat' : 'Tambah Jadwal'}</span>
        </button>
      </div>

      <div className="p-4 max-w-2xl mx-auto w-full space-y-4">
        {/* Switcher Tab Menu */}
        <div className={`p-1.5 rounded-2xl border flex gap-1.5 shadow-xs ${
          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white/80 border-blue-100'
        }`}>
          <button
            onClick={() => { triggerFeedback(); setActiveTab('meds'); }}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'meds'
                ? 'bg-blue-600 text-white shadow-md scale-100'
                : isDarkMode
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <span>💊</span> Kotak Obat & Vitamin
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {medications.length}
            </span>
          </button>

          <button
            onClick={() => { triggerFeedback(); setActiveTab('activity'); }}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'activity'
                ? 'bg-blue-600 text-white shadow-md scale-100'
                : isDarkMode
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <span>🏃</span> Jadwal Aktivitas ({schedules.length})
          </button>
        </div>

        {/* ───────────── TAB 1: KOTAK OBAT & VITAMIN ───────────── */}
        {activeTab === 'meds' && (
          <div className="space-y-4">
            {/* Kartu Progress Kepatuhan Hari Ini */}
            <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-blue-100'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">
                    Kepatuhan Minum Hari Ini
                  </span>
                  <h3 className="text-xl font-black">
                    {takenMedsCount} dari {totalMeds} Obat/Vitamin Diminum
                  </h3>
                </div>
                <div className={`text-2xl font-black px-3.5 py-1 rounded-2xl border ${
                  compliancePercent === 100
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                }`}>
                  {compliancePercent}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    compliancePercent === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }`}
                  style={{ width: `${compliancePercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] opacity-70 pt-1">
                <span>🔄 Otomatis di-reset setiap berganti hari</span>
                <span className="font-bold text-blue-500">
                  {compliancePercent === 100 ? '🎉 Semua obat selesai diminum!' : 'Ayo jaga rutinitas sehatmu!'}
                </span>
              </div>
            </div>

            {/* Filter Waktu Pengingat */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {['Semua', 'Pagi', 'Siang', 'Malam', 'Spesifik'].map((slot) => (
                <button
                  key={slot}
                  onClick={() => { triggerFeedback(); setMedFilter(slot); }}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                    medFilter === slot
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : isDarkMode
                      ? 'bg-gray-900 border-gray-800 text-gray-300'
                      : 'bg-white border-blue-100 text-gray-600'
                  }`}
                >
                  {slot === 'Semua' ? 'Semua Waktu' : slot}
                </button>
              ))}
            </div>

            {/* List Obat / Vitamin */}
            {filteredMeds.length === 0 ? (
              <div className={`p-10 rounded-3xl text-center border shadow-sm space-y-3 ${
                isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-blue-100'
              }`}>
                <span className="text-4xl">💊</span>
                <h4 className="font-bold text-sm">Tidak Ada Obat di Waktu Ini</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Belum ada jadwal obat atau vitamin yang didaftarkan.
                </p>
                <button
                  onClick={handleOpenMedForm}
                  className="px-4 py-2 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-md"
                >
                  + Tambah Obat Baru
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMeds.map((med) => {
                  const isTakenToday = (med.takenDates || []).includes(todayStr);

                  return (
                    <div
                      key={med.id}
                      className={`p-4 rounded-3xl border shadow-sm space-y-3 transition-all ${
                        isTakenToday
                          ? isDarkMode
                            ? 'bg-emerald-950/20 border-emerald-900/40 text-gray-200'
                            : 'bg-emerald-50/60 border-emerald-200 text-gray-800'
                          : isDarkMode
                          ? 'bg-gray-900 border-gray-800 text-gray-100'
                          : 'bg-white border-blue-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${
                            isTakenToday
                              ? 'bg-emerald-500/20 border-emerald-500/30'
                              : isDarkMode
                              ? 'bg-gray-800 border-gray-700'
                              : 'bg-blue-50 border-blue-100'
                          }`}>
                            {med.icon || '💊'}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm">{med.name}</h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                                {med.timeSlot} • {med.specificTime}
                              </span>
                            </div>
                            <p className="text-xs opacity-75 mt-0.5">{med.dosage}</p>
                          </div>
                        </div>

                        {/* Edit & Delete Action */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditMedInit(med)}
                            className="p-1.5 rounded-full text-gray-400 hover:text-blue-500"
                            title="Edit Obat"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMed(med.id)}
                            className="p-1.5 rounded-full text-gray-400 hover:text-red-500"
                            title="Hapus Obat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Tombol Checklist Harian */}
                      <button
                        type="button"
                        onClick={() => handleToggleMedTaken(med.id)}
                        className={`w-full py-2.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                          isTakenToday
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                            : isDarkMode
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                        }`}
                      >
                        {isTakenToday ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Sudah diminum hari ini ✅</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-4 h-4" />
                            <span>Belum diminum • Klik jika sudah diminum</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ───────────── TAB 2: JADWAL AKTIVITAS SEHAT ───────────── */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            {schedules.length === 0 ? (
              <div className={`p-10 rounded-3xl text-center border shadow-sm space-y-3 ${
                isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-blue-100'
              }`}>
                <span className="text-4xl">🏃</span>
                <h4 className="font-bold text-sm">Belum Ada Jadwal Aktivitas</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Tambahkan jadwal olahraga, jalan santai, belajar atau istirahat harianmu.
                </p>
                <button
                  onClick={() => handleOpenActivityForm()}
                  className="px-4 py-2 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-md"
                >
                  + Tambah Jadwal Baru
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-3xl p-4 shadow-sm border space-y-3 ${
                      isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-blue-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b pb-2.5 dark:border-gray-800">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">📅</span>
                        <div>
                          <h4 className="font-black text-xs">{item.hari}</h4>
                          <p className="text-[10px] opacity-60">{item.tanggal}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditActivityInit(item)}
                          className="p-1.5 opacity-60 hover:opacity-100 text-xs font-bold"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(item.id)}
                          className="p-1.5 opacity-60 hover:text-red-400 text-xs font-bold"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <span className={`text-2xl p-2.5 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                        {item.icon}
                      </span>
                      <div>
                        <p className="font-bold text-sm">{item.aktivitas}</p>
                        <p className="text-xs opacity-60 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-500" />
                          {item.dariJam} {item.sampaiJam ? `- ${item.sampaiJam}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ───────────── MODAL FORM OBAT & VITAMIN ───────────── */}
      {showMedForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-4 max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-blue-100 text-gray-800'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
              <h3 className="font-black text-base flex items-center gap-2">
                <span>💊</span> {editingMedId ? 'Edit Obat / Vitamin' : 'Tambah Obat & Vitamin Baru'}
              </h3>
              <button
                onClick={() => setShowMedForm(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMed} className="space-y-3.5">
              {/* Nama Obat */}
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">
                  Nama Obat / Vitamin
                </label>
                <input
                  type="text"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="Contoh: Vitamin C 500mg / Tablet Fe"
                  className={`w-full border-2 rounded-2xl p-2.5 text-xs outline-none focus:border-blue-500 font-semibold ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                  required
                />
              </div>

              {/* Dosis & Aturan Pakai */}
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">
                  Dosis / Aturan Pakai
                </label>
                <input
                  type="text"
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  placeholder="Contoh: 1x sehari sesudah makan"
                  className={`w-full border-2 rounded-2xl p-2.5 text-xs outline-none focus:border-blue-500 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                  required
                />
                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {DOSAGE_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { triggerFeedback(); setMedDosage(p); }}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Waktu Pengingat */}
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">
                  Waktu Minum
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => { triggerFeedback(); setMedTimeSlot(slot.id); }}
                      className={`p-2 rounded-2xl text-center border transition-all text-xs font-bold ${
                        medTimeSlot === slot.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-300'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}
                    >
                      <span className="text-base block mb-0.5">{slot.icon}</span>
                      <span className="text-[10px]">{slot.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Jam Spesifik */}
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">
                  Jam Spesifik (Alarm/Pengingat)
                </label>
                <input
                  type="time"
                  value={medSpecificTime}
                  onChange={(e) => setMedSpecificTime(e.target.value)}
                  className={`w-full border-2 rounded-2xl p-2.5 text-xs outline-none focus:border-blue-500 font-bold ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                  required
                />
              </div>

              {/* Ikon */}
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">
                  Pilih Ikon
                </label>
                <div className="flex gap-2">
                  {MED_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => { triggerFeedback(); setMedIcon(ic); }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-all ${
                        medIcon === ic
                          ? 'bg-blue-600 text-white border-blue-600 scale-110 shadow-sm'
                          : isDarkMode
                          ? 'bg-gray-800 border-gray-700'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMedForm(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-black shadow-md hover:bg-blue-700"
                >
                  Simpan Obat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────── MODAL FORM AKTIVITAS ───────────── */}
      {showActivityForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-4 max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-blue-100 text-gray-800'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
              <h3 className="font-black text-base flex items-center gap-2">
                <span>🏃</span> {editingActivityId ? 'Edit Jadwal Aktivitas' : 'Tambah Jadwal Aktivitas'}
              </h3>
              <button
                onClick={() => setShowActivityForm(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">Hari</label>
                <select
                  value={hari}
                  onChange={(e) => setHari(e.target.value)}
                  className={`w-full border-2 rounded-2xl p-2.5 text-xs outline-none focus:border-blue-500 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                >
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">Tanggal Spesifik (Opsional)</label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className={`w-full border-2 rounded-2xl p-2.5 text-xs outline-none focus:border-blue-500 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">Dari Jam</label>
                  <input
                    type="time"
                    value={dariJam}
                    onChange={(e) => setDariJam(e.target.value)}
                    className={`w-full border-2 rounded-2xl p-2.5 text-xs outline-none focus:border-blue-500 ${
                      isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">Sampai Jam</label>
                  <input
                    type="time"
                    value={sampaiJam}
                    onChange={(e) => setSampaiJam(e.target.value)}
                    className={`w-full border-2 rounded-2xl p-2.5 text-xs outline-none focus:border-blue-500 ${
                      isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">Nama Aktivitas</label>
                <input
                  type="text"
                  value={aktivitas}
                  onChange={(e) => setAktivitas(e.target.value)}
                  placeholder="Contoh: Jogging Pagi / Belajar Biologi"
                  className={`w-full border-2 rounded-2xl p-2.5 text-xs outline-none focus:border-blue-500 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">Pilih Ikon</label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
                  {activityIcons.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => { triggerFeedback(); setSelectedIcon(ic); }}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-base border transition-all ${
                        selectedIcon === ic
                          ? 'bg-blue-600 text-white border-blue-600 scale-110 shadow-sm'
                          : isDarkMode
                          ? 'bg-gray-800 border-gray-700'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowActivityForm(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-black shadow-md hover:bg-blue-700"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}