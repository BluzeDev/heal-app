import React, { useState, useEffect } from 'react';
import { DISEASE_CATEGORIES, DISEASES_DATA, SYMPTOMS_LIST } from './data/diseasesData';
import { Search, ArrowLeft, AlertCircle, ShieldCheck, HeartPulse, Stethoscope, Sparkles } from 'lucide-react';
import { triggerFeedback } from './utils/feedback';

export default function MedicineScreen({ onBack, onNavigateSymptomChecker, isDarkMode, initialDiseaseId }) {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDisease, setSelectedDisease] = useState(null);

  // Jika dipanggil dari Rekomendasi Topik Hari Ini dengan initialDiseaseId
  useEffect(() => {
    if (initialDiseaseId) {
      const match = DISEASES_DATA.find(d => d.id === initialDiseaseId || d.name.toLowerCase().includes(initialDiseaseId.toLowerCase()));
      if (match) {
        setSelectedDisease(match);
      }
    }
  }, [initialDiseaseId]);

  const filteredDiseases = DISEASES_DATA.filter((d) => {
    const matchCategory = activeCategory === 'Semua' || d.category === activeCategory;
    const matchSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.symptoms && d.symptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchCategory && matchSearch;
  });

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
    <div className={`flex-1 flex flex-col min-h-screen pb-20 transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-gray-100' : 'bg-pink-100 text-gray-800'
    }`}>
      {/* Header */}
      <div className={`p-4 sticky top-0 z-30 flex items-center justify-between backdrop-blur-md border-b ${
        isDarkMode ? 'bg-black/85 border-gray-800' : 'bg-white/80 border-pink-200'
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { triggerFeedback(); onBack(); }}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all ${
              isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-pink-50'
            }`}
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-black tracking-wide flex items-center gap-1.5">
              <span>🏥</span> Bank Penyakit
            </h1>
            <p className="text-[10px] opacity-60">Ensiklopedia Penyakit Fisik & Mental Remaja</p>
          </div>
        </div>

        {/* Shortcut ke Cek Gejala Pintar */}
        {onNavigateSymptomChecker && (
          <button
            onClick={() => { triggerFeedback(); onNavigateSymptomChecker(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Cek Gejala</span>
          </button>
        )}
      </div>

      <div className="p-4 max-w-4xl mx-auto w-full space-y-4">
        {/* Banner Edukasi & Cek Gejala */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="bg-white/20 backdrop-blur-md text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Pusat Informasi Kesehatan HEAL
            </span>
            <h2 className="text-lg font-black">Cari Gejala, Obat & Penanganan</h2>
            <p className="text-xs opacity-90 leading-relaxed max-w-lg">
              Pelajari berbagai kondisi kesehatan fisik dan psikologis secara lengkap. Ketahui langkah pertolongan pertama dan kapan harus berkonsultasi ke dokter.
            </p>
            {onNavigateSymptomChecker && (
              <button
                onClick={() => { triggerFeedback(); onNavigateSymptomChecker(); }}
                className="mt-1 bg-white text-pink-600 font-extrabold px-4 py-2 rounded-2xl text-xs shadow-md hover:bg-pink-50 transition-all flex items-center gap-2 w-fit"
              >
                <span>🔍</span> Bingung Gejalamu? Gunakan Cek Gejala Pintar ›
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Cari nama penyakit, gejala (misal: demam, cemas, lambung)..."
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
              className="absolute right-3.5 top-3 text-xs text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Kategori Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {DISEASE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { triggerFeedback(); setActiveCategory(cat); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                activeCategory === cat
                  ? 'bg-pink-500 text-white shadow-pink-500/30 scale-105'
                  : isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Total Hasil */}
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] font-semibold opacity-70">
            Menampilkan <span className="font-black text-pink-500">{filteredDiseases.length}</span> kondisi kesehatan di Bank Penyakit
          </p>
        </div>

        {/* List Penyakit Cards */}
        {filteredDiseases.length === 0 ? (
          <div className={`p-8 rounded-3xl text-center border shadow-sm space-y-2 ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'
          }`}>
            <p className="text-4xl">🔍</p>
            <h3 className="font-bold text-sm">Tidak Ditemukan Penyakit</h3>
            <p className="text-xs opacity-60 max-w-xs mx-auto">
              Tidak ada kondisi yang cocok dengan "{searchQuery}". Coba gunakan kata kunci lain atau periksa tab Semua Kategori.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredDiseases.map((disease) => (
              <div
                key={disease.id}
                onClick={() => { triggerFeedback(); setSelectedDisease(disease); }}
                className={`p-4 rounded-3xl border shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group ${
                  isDarkMode ? 'bg-gray-900 border-gray-800 hover:border-pink-900' : 'bg-white border-pink-100 hover:border-pink-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {disease.icon}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm group-hover:text-pink-500 transition-colors">
                          {disease.name}
                        </h3>
                        <span className="text-[10px] font-bold text-pink-500 uppercase tracking-wider block">
                          {disease.category}
                        </span>
                      </div>
                    </div>
                    {getUrgencyBadge(disease.urgency)}
                  </div>

                  <p className="text-xs opacity-70 line-clamp-2 leading-relaxed">
                    {disease.desc}
                  </p>

                  {/* Gejala Tags */}
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

      {/* Modal Detail Penyakit Lengkap */}
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
                <div className="w-14 h-14 rounded-2xl bg-pink-100 dark:bg-pink-950 flex items-center justify-center text-3xl">
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