import React, { useState, useEffect } from 'react';

export default function HealthScheduleScreen({ currentUser, onBack, isDarkMode }) {
  const [schedules, setSchedules] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [hari, setHari] = useState('Senin');
  const [tanggal, setTanggal] = useState('');
  const [dariJam, setDariJam] = useState('');
  const [sampaiJam, setSampaiJam] = useState('');
  const [aktivitas, setAktivitas] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏃');

  const iconsList = [
    '🏃', '🏋️', '🧘', '🚴', '🏊', '🚶', '🤸', '⚽',
    '💊', '🩺', '💉', '🩹', '🩻', '🧪', '🩸', '💧',
    '🥗', '🍎', '🥑', '🍌', '🥛', '🍵', '🍳', '🥩',
    '🛏️', '😴', '🧠', '❤️', '📖', '📝', '🎯', '✨'
  ];

  // Key penyimpanan unik untuk tiap pengguna
  const userScheduleKey = currentUser ? `heal_schedules_${currentUser}` : 'heal_schedules_guest';

  // Read dari localStorage khusus akun aktif saat komponen dibuka
  useEffect(() => {
    const savedSchedules = localStorage.getItem(userScheduleKey);
    if (savedSchedules) {
      try {
        setSchedules(JSON.parse(savedSchedules));
      } catch (e) {
        console.error("Gagal parse jadwal:", e);
        setSchedules([]);
      }
    } else {
      setSchedules([]);
    }
  }, [userScheduleKey]);

  const handleOpenAddForm = (defaultHari = 'Senin', defaultTanggal = '') => {
    setEditingId(null);
    setHari(defaultHari);
    setTanggal(defaultTanggal);
    setDariJam('');
    setSampaiJam('');
    setAktivitas('');
    setSelectedIcon('🏃');
    setShowAddForm(true);
  };

  const handleEditInit = (item) => {
    setEditingId(item.id);
    setHari(item.hari);
    setTanggal(item.rawTanggal || '');
    setDariJam(item.dariJam);
    setSampaiJam(item.sampaiJam);
    setAktivitas(item.aktivitas);
    setSelectedIcon(item.icon);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Yakin ingin menghapus jadwal ini?')) {
      const updated = schedules.filter((item) => item.id !== id);
      setSchedules(updated);
      localStorage.setItem(userScheduleKey, JSON.stringify(updated));
      window.dispatchEvent(new Event('scheduleUpdated'));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!aktivitas.trim() || !dariJam) {
      alert('Mohon isi jam dan nama aktivitas!');
      return;
    }

    let formattedDate = 'Setiap ' + hari;
    if (tanggal) {
      const dateObj = new Date(tanggal);
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      formattedDate = dateObj.toLocaleDateString('id-ID', options);
    }

    let updatedSchedules;

    if (editingId) {
      updatedSchedules = schedules.map((item) =>
        item.id === editingId
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

    setShowAddForm(false);
    setEditingId(null);
  };

  return (
    <div className={`flex-1 flex flex-col min-h-screen pb-10 transition-colors duration-300 ${isDarkMode ? 'bg-black text-gray-100' : 'bg-pink-200 text-gray-800'}`}>
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={showAddForm ? () => setShowAddForm(false) : onBack}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all ${
              isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ←
          </button>
          <h1 className="text-xl font-bold tracking-wide">
            {showAddForm ? (editingId ? 'Edit Jadwal' : 'Tambah Jadwal') : 'Health Schedule'}
          </h1>
        </div>

        {!showAddForm && (
          <button 
            onClick={() => handleOpenAddForm()}
            className={`w-10 h-10 rounded-full text-2xl font-bold flex items-center justify-center shadow-md transition-all ${
              isDarkMode ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-white text-pink-500 hover:bg-pink-50'
            }`}
          >
            +
          </button>
        )}
      </div>

      {/* Konten Utama */}
      <div className="p-4 flex-1 max-w-xl mx-auto w-full">
        {showAddForm ? (
          <div className={`rounded-3xl p-5 shadow-sm space-y-4 border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-pink-100 text-gray-700'}`}>
            <div>
              <label className="text-xs opacity-70 font-medium block mb-1">Hari</label>
              <select 
                value={hari}
                onChange={(e) => setHari(e.target.value)}
                className={`w-full border rounded-2xl px-4 py-2.5 text-sm outline-none ${
                  isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200'
                }`}
              >
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs opacity-70 font-medium block mb-1">Tanggal (Opsional)</label>
              <input 
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className={`w-full border rounded-2xl px-4 py-2.5 text-sm outline-none ${
                  isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs opacity-70 font-medium block mb-1">Dari Jam</label>
                <input 
                  type="time"
                  value={dariJam}
                  onChange={(e) => setDariJam(e.target.value)}
                  className={`w-full border rounded-2xl px-4 py-2.5 text-sm outline-none ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200'
                  }`}
                />
              </div>
              <div>
                <label className="text-xs opacity-70 font-medium block mb-1">Sampai Jam</label>
                <input 
                  type="time"
                  value={sampaiJam}
                  onChange={(e) => setSampaiJam(e.target.value)}
                  className={`w-full border rounded-2xl px-4 py-2.5 text-sm outline-none ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="text-xs opacity-70 font-medium block mb-1">Aktivitas</label>
              <input 
                type="text"
                placeholder="Nama aktivitas..."
                value={aktivitas}
                onChange={(e) => setAktivitas(e.target.value)}
                className={`w-full border rounded-2xl px-4 py-2.5 text-sm outline-none ${
                  isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200'
                }`}
              />
            </div>

            <div>
              <label className="text-xs opacity-70 font-medium block mb-2">Pilih Ikon Emoji</label>
              <div className={`grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1 border rounded-2xl ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                {iconsList.map((icon, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                      selectedIcon === icon 
                        ? 'bg-pink-500/30 border-2 border-pink-500 scale-110 shadow-sm' 
                        : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-3.5 rounded-full shadow-md hover:opacity-95 transition-all mt-4"
            >
              {editingId ? 'Simpan Perubahan' : 'Simpan Jadwal'}
            </button>
          </div>
        ) : schedules.length === 0 ? (
          <div className={`rounded-3xl p-12 text-center shadow-sm border flex flex-col items-center justify-center space-y-3 ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-white border-pink-100 text-gray-500'
          }`}>
            <div className="text-5xl mb-1">📅</div>
            <h3 className="font-medium text-sm">Belum ada jadwal</h3>
            <p className="text-xs opacity-60">Tap + untuk menambah jadwal baru</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((item) => (
              <div key={item.id} className={`rounded-3xl p-5 shadow-sm border space-y-3 relative group ${
                isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-pink-100 text-gray-800'
              }`}>
                <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📅</span>
                    <div>
                      <h3 className="font-bold text-sm">{item.hari}</h3>
                      <p className="text-xs opacity-50">{item.tanggal}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleOpenAddForm(item.hari, item.rawTanggal)}
                      className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        isDarkMode ? 'bg-pink-950/60 text-pink-400 border border-pink-900 hover:bg-pink-900/60' : 'bg-pink-50 text-pink-500 hover:bg-pink-100'
                      }`}
                    >
                      + Tambah
                    </button>
                    <button 
                      onClick={() => handleEditInit(item)}
                      className="p-1.5 opacity-60 hover:opacity-100 text-xs font-bold"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 opacity-60 hover:text-red-400 text-xs font-bold"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <span className={`text-3xl p-2 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-pink-50'}`}>{item.icon}</span>
                  <div>
                    <p className="font-semibold text-sm">{item.aktivitas}</p>
                    <p className="text-xs opacity-50">
                      {item.dariJam} {item.sampaiJam ? `- ${item.sampaiJam}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}