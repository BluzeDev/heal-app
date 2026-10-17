import React, { useState, useEffect } from 'react';
import { DISEASE_CATEGORIES, DISEASES_DATA, SYMPTOMS_LIST } from './data/diseasesData';
import { 
  Search, ArrowLeft, AlertCircle, ShieldCheck, HeartPulse, 
  Stethoscope, Sparkles, CheckCircle2, ChevronRight, AlertTriangle, RefreshCw
} from 'lucide-react';
import { triggerFeedback } from './utils/feedback';

export default function MedicineScreen({ onBack, isDarkMode, initialDiseaseId, initialTab = 'directory' }) {
  // Tab pilihan utama: 'symptom' (Cek Gejala) | 'directory' (Daftar Bank Penyakit)
  const [viewTab, setViewTab] = useState(initialDiseaseId ? 'directory' : initialTab);
  
  // State Bank Penyakit
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDisease, setSelectedDisease] = useState(null);

  // State Cek Gejala
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [symptomSearch, setSymptomSearch] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const recordDiseaseRead = (diseaseId) => {
    try {
      const user = localStorage.getItem('heal_active_user') || 'guest';
      const readKey = `heal_read_diseases_${user}`;
      const readSet = new Set(JSON.parse(localStorage.getItem(readKey) || '[]'));
      readSet.add(diseaseId);
      const updated = [...readSet];
      localStorage.setItem(readKey, JSON.stringify(updated));
      if (user !== 'guest') {
        import('./firebase').then(({ db }) => {
          import('firebase/firestore').then(({ doc, updateDoc }) => {
            updateDoc(doc(db, 'data_login', user), { read_diseases_count: updated.length }).catch(() => {});
          });
        });
      }
    } catch (e) {}
  };

  const handleOpenDisease = (disease) => {
    triggerFeedback();
    setSelectedDisease(disease);
    if (disease && disease.id) {
      recordDiseaseRead(disease.id);
    }
  };

  // Jika dipanggil dengan initialDiseaseId
  useEffect(() => {
    if (initialDiseaseId) {
      const match = DISEASES_DATA.find(d => d.id === initialDiseaseId || d.name.toLowerCase().includes(initialDiseaseId.toLowerCase()));
      if (match) {
        setSelectedDisease(match);
        recordDiseaseRead(match.id);
        setViewTab('directory');
      }
    }
  }, [initialDiseaseId]);

  // Filter daftar penyakit
  const filteredDiseases = DISEASES_DATA.filter((d) => {
    const matchCategory = activeCategory === 'Semua' || d.category === activeCategory;
    const matchSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.symptoms && d.symptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchCategory && matchSearch;
  });

  // Handler Cek Gejala
  const toggleSymptom = (sym) => {
    triggerFeedback();
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
    setAnalysisResult(null);
  };

  const handleAnalyzeSymptoms = () => {
    triggerFeedback();
    if (selectedSymptoms.length === 0) return;

    const scored = DISEASES_DATA.map((disease) => {
      const matchCount = disease.symptoms.filter((s) => selectedSymptoms.includes(s)).length;
      const score = disease.symptoms.length > 0 ? (matchCount / disease.symptoms.length) * 100 : 0;
      return {
        ...disease,
        matchCount,
        score: Math.round(score),
      };
    })
      .filter((d) => d.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount || b.score - a.score);

    const hasEmergency = scored.some(
      (d) => d.urgency === 'Darurat Medis' && d.matchCount >= 2
    );

    setAnalysisResult({
      matches: scored.slice(0, 6),
      hasEmergency,
    });
  };

  const filteredSymptomsList = SYMPTOMS_LIST.filter(s => 
    s.toLowerCase().includes(symptomSearch.toLowerCase())
  );

  const getUrgencyBadge = (urgency) => {
    if (urgency === 'Darurat Medis') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">
          🚨 Darurat Medis
        </span>
      );
    }
    if (urgency === 'Sedang / Konsultasi') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
          ⚠️ Konsultasi Dokter
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
        ✅ Pantau Mandiri
      </span>
    );
  };

  return (
    <div className={`flex-1 flex flex-col min-h-screen pb-24 transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-gray-100' : 'bg-gradient-to-b from-pink-50 via-rose-50 to-white text-gray-800'
    }`}>
      {/* Header */}
      <div className={`p-4 sticky top-0 z-30 flex items-center justify-between backdrop-blur-md border-b ${
        isDarkMode ? 'bg-black/85 border-gray-800' : 'bg-white/85 border-pink-200'
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              triggerFeedback();
              if (selectedDisease) {
                setSelectedDisease(null);
              } else {
                onBack();
              }
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all ${
              isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-pink-50'
            }`}
          >
            <ArrowLeft className="w-5 h-5 text-pink-600" />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-wide flex items-center gap-1.5">
              <span>🏥</span> Bank Penyakit & Cek Gejala
            </h1>
            <p className="text-[10px] opacity-60 font-semibold">Ensiklopedia Penyakit & Skrining Mandiri Remaja</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto w-full space-y-4">
        
        {/* ───────────── LANDING VIEW / TAB SWITCHER ───────────── */}
        <div className={`p-1.5 rounded-3xl border flex gap-1.5 shadow-sm ${
          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'
        }`}>
          <button
            onClick={() => { triggerFeedback(); setViewTab('symptom'); }}
            className={`flex-1 py-3 px-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
              viewTab === 'symptom'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md scale-102'
                : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Cek Gejala Kamu (Symptom Checker)</span>
          </button>

          <button
            onClick={() => { triggerFeedback(); setViewTab('directory'); }}
            className={`flex-1 py-3 px-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
              viewTab === 'directory'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md scale-102'
                : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>📚</span>
            <span>Daftar Bank Penyakit & Kategori</span>
          </button>
        </div>

        {/* ───────────── TAB 1: CEK GEJALA KAMU (SYMPTOM CHECKER) ───────────── */}
        {viewTab === 'symptom' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Banner Cek Gejala */}
            <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white p-5 rounded-3xl shadow-md relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <span className="bg-white/20 backdrop-blur-md text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Skrining Mandiri & Analisis Awal
                </span>
                <h2 className="text-lg font-black">Apa yang Sedang Kamu Rasakan?</h2>
                <p className="text-xs opacity-90 leading-relaxed max-w-lg">
                  Pilih beberapa gejala di bawah untuk mencari kemungkinan kondisi medis dan rekomendasi penanganan awal yang tepat.
                </p>
              </div>
            </div>

            {/* Pencarian Gejala & Chip Gejala */}
            <div className={`p-4 rounded-3xl border space-y-3 ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-teal-100 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs">Pilih Gejala yang Dirasakan:</h3>
                    <p className="text-[10px] opacity-60">Ketuk untuk memilih satu atau beberapa gejala</p>
                  </div>
                </div>

                {selectedSymptoms.length > 0 && (
                  <button
                    onClick={() => { setSelectedSymptoms([]); setAnalysisResult(null); }}
                    className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset ({selectedSymptoms.length})
                  </button>
                )}
              </div>

              {/* Input filter gejala */}
              <input
                type="text"
                value={symptomSearch}
                onChange={(e) => setSymptomSearch(e.target.value)}
                placeholder="🔍 Ketik untuk mencari gejala (misal: mual, demam, lelah)..."
                className={`w-full text-xs px-3.5 py-2.5 rounded-2xl border outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-teal-500' 
                    : 'bg-teal-50/50 border-teal-100 text-gray-800 placeholder-gray-400 focus:border-teal-400'
                }`}
              />

              {/* Grid Gejala */}
              <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1 pt-1">
                {filteredSymptomsList.map((symptom) => {
                  const isSelected = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 active:scale-95 ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                          : isDarkMode
                          ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-teal-50'
                      }`}
                    >
                      {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                      <span>{symptom}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tombol Analisis */}
              <button
                onClick={handleAnalyzeSymptoms}
                disabled={selectedSymptoms.length === 0}
                className="w-full mt-2 py-3.5 rounded-2xl font-black text-xs text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 bg-gradient-to-r from-teal-500 to-emerald-600 hover:opacity-95 active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Analisis {selectedSymptoms.length > 0 ? `(${selectedSymptoms.length}) Gejala Sekarang` : 'Gejala'}</span>
              </button>
            </div>

            {/* Hasil Analisis Gejala */}
            {analysisResult && (
              <div className="space-y-3 animate-fadeIn pt-1">
                {analysisResult.hasEmergency && (
                  <div className="p-4 rounded-3xl bg-red-500/10 border-2 border-red-500 text-red-600 dark:text-red-400 flex items-start gap-3 shadow-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-black text-sm">Peringatan Kondisi Darurat Terdeteksi</p>
                      <p className="opacity-90 leading-relaxed">
                        Kombinasi gejala yang kamu pilih mengarah pada kondisi darurat medis. Segera hubungi fasilitas kesehatan atau gunakan menu darurat PSC 119 di aplikasi.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm flex items-center gap-1.5">
                    <span>🩺</span> Kemungkinan Kondisi Terkait:
                  </h3>
                  <span className="text-[11px] font-bold opacity-60">
                    Ditemukan {analysisResult.matches.length} penyakit
                  </span>
                </div>

                {analysisResult.matches.length === 0 ? (
                  <div className={`p-6 rounded-3xl text-center border text-xs opacity-70 ${
                    isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
                  }`}>
                    Tidak ada penyakit yang cocok secara spesifik dengan kombinasi gejala ini. Silakan periksa kembali gejala atau konsultasikan ke tenaga medis.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analysisResult.matches.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleOpenDisease(item)}
                        className={`p-4 rounded-3xl border transition-all cursor-pointer hover:shadow-md space-y-3 group ${
                          isDarkMode 
                            ? 'bg-gray-900 border-gray-800 hover:border-teal-500 text-gray-200' 
                            : 'bg-white border-teal-50 hover:border-teal-300 text-gray-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl p-2 rounded-2xl bg-teal-50 dark:bg-gray-800">{item.icon}</span>
                            <div>
                              <h4 className="font-extrabold text-xs group-hover:text-teal-600 transition-colors">
                                {item.name}
                              </h4>
                              <p className="text-[10px] font-semibold opacity-60">{item.category}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                            {item.score}% Cocok
                          </span>
                        </div>

                        <p className="text-[11px] opacity-75 line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>

                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] font-bold text-teal-600">
                          <span>Lihat Panduan Obat & Penanganan</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ───────────── TAB 2: DAFTAR BANK PENYAKIT & KATEGORI ───────────── */}
        {viewTab === 'directory' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Banner Edukasi */}
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 text-white p-5 rounded-3xl shadow-md relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <span className="bg-white/20 backdrop-blur-md text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Pusat Informasi Kesehatan Remaja
                </span>
                <h2 className="text-lg font-black">Ensiklopedia Penyakit & Pengobatan</h2>
                <p className="text-xs opacity-90 leading-relaxed max-w-lg">
                  Pelajari berbagai kondisi kesehatan fisik dan psikologis secara lengkap. Ketahui langkah pertolongan pertama dan obat lazim di rumah.
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Cari nama penyakit, gejala (misal: maag, migrain, flu)..."
                className={`w-full border-2 rounded-2xl px-4 py-3 pl-11 text-xs outline-none shadow-sm transition-all ${
                  isDarkMode 
                    ? 'bg-gray-900 border-gray-800 text-gray-100 placeholder-gray-500 focus:border-pink-500' 
                    : 'bg-white border-pink-100 text-gray-800 placeholder-gray-400 focus:border-pink-400'
                }`}
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-3 text-xs text-gray-400 hover:text-gray-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Kategori Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['Semua', ...DISEASE_CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => { triggerFeedback(); setActiveCategory(cat); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-500/25 scale-105'
                      : isDarkMode
                      ? 'bg-gray-900 text-gray-300 border border-gray-800 hover:bg-gray-800'
                      : 'bg-white text-gray-600 border border-pink-100 hover:bg-pink-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid Daftar Penyakit */}
            {filteredDiseases.length === 0 ? (
              <div className={`p-8 rounded-3xl text-center border text-xs opacity-70 ${
                isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'
              }`}>
                Penyakit atau topik yang dicari tidak ditemukan. Silakan gunakan kata kunci lain.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredDiseases.map((disease) => (
                  <div
                    key={disease.id}
                    onClick={() => handleOpenDisease(disease)}
                    className={`rounded-3xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border flex flex-col justify-between group ${
                      isDarkMode
                        ? 'bg-gray-900 border-gray-800 hover:border-pink-900 text-gray-200'
                        : 'bg-white border-pink-50 hover:border-pink-300 text-gray-800'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-gray-800 border border-pink-100 dark:border-gray-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          {disease.icon}
                        </div>
                        {getUrgencyBadge(disease.urgency)}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-xs line-clamp-1 group-hover:text-pink-500 transition-colors">
                          {disease.name}
                        </h4>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 block truncate">
                          {disease.category}
                        </span>
                      </div>

                      <p className="text-[11px] opacity-70 line-clamp-2 leading-relaxed">
                        {disease.desc}
                      </p>

                      {disease.symptoms && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {disease.symptoms.slice(0, 3).map((sym, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              {sym}
                            </span>
                          ))}
                          {disease.symptoms.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md text-pink-500 font-bold">
                              +{disease.symptoms.length - 3} lainnya
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-pink-500 group-hover:translate-x-1 transition-transform">
                      <span>Lihat Penanganan & Obat ›</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ───────────── MODAL DETAIL PENYAKIT LENGKAP ───────────── */}
      {selectedDisease && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedDisease(null)}
        >
          <div 
            className={`rounded-3xl max-w-lg w-full max-h-[88vh] overflow-y-auto p-6 shadow-2xl border space-y-4 ${
              isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-pink-100 text-gray-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b pb-4 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-pink-100 dark:bg-pink-950 flex items-center justify-center text-3xl shadow-inner">
                  {selectedDisease.icon}
                </div>
                <div>
                  <h2 className="text-lg font-black">{selectedDisease.name}</h2>
                  <p className="text-xs text-pink-500 font-bold">{selectedDisease.category}</p>
                  <div className="mt-1">{getUrgencyBadge(selectedDisease.urgency)}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDisease(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center font-bold hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Deskripsi */}
            <div className="p-3.5 rounded-2xl bg-pink-50/60 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/50">
              <p className="text-xs leading-relaxed font-medium">{selectedDisease.desc}</p>
            </div>

            {/* Gejala Klinis */}
            {selectedDisease.details?.gejala && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-pink-500 flex items-center gap-1.5">
                  <span>🩺</span> Gejala yang Kerap Dirasakan:
                </h4>
                <p className="text-xs leading-relaxed opacity-90 pl-2 border-l-2 border-pink-400">
                  {selectedDisease.details.gejala}
                </p>
              </div>
            )}

            {/* Obat / Penanganan Medis */}
            {selectedDisease.details?.medicines && selectedDisease.details.medicines.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                  <span>💊</span> Obat / Terapi yang Lazim Digunakan:
                </h4>
                <div className="space-y-1.5">
                  {selectedDisease.details.medicines.map((med, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs p-2 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      <span className="font-semibold">{med}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Penanganan Mandiri / Pertolongan Pertama di Rumah */}
            {selectedDisease.details?.remedies && selectedDisease.details.remedies.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                  <span>🏡</span> Penanganan Mandiri & Pertolongan Pertama:
                </h4>
                <ul className="space-y-1.5">
                  {selectedDisease.details.remedies.map((rem, i) => (
                    <li key={i} className="text-xs flex items-start gap-2 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span className="leading-relaxed">{rem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pencegahan */}
            {selectedDisease.details?.prevention && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-teal-500 flex items-center gap-1.5">
                  <span>🛡️</span> Cara Pencegahan:
                </h4>
                <p className="text-xs leading-relaxed opacity-90 pl-2 border-l-2 border-teal-400">
                  {selectedDisease.details.prevention}
                </p>
              </div>
            )}

            {/* Catatan Dokter / Catatan Medis */}
            {selectedDisease.details?.note && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed font-medium">
                  <strong>Penting:</strong> {selectedDisease.details.note}
                </p>
              </div>
            )}

            <button
              onClick={() => setSelectedDisease(null)}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3 rounded-2xl shadow-md hover:opacity-95 text-xs transition-all"
            >
              Tutup Rincian Penyakit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}