import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, CheckCircle2, Stethoscope, ChevronRight, Info } from 'lucide-react';
import { DISEASES_DATA, SYMPTOMS_LIST } from './data/diseasesData';
import { triggerFeedback } from './utils/feedback';

export default function SymptomCheckerScreen({ onBack, onSelectDisease, onNavigate, isDarkMode }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);

  const toggleSymptom = (sym) => {
    triggerFeedback();
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
    setAnalysisResult(null);
  };

  const handleAnalyze = () => {
    triggerFeedback();
    if (selectedSymptoms.length === 0) return;

    // Filter & hitung kecocokan gejala dengan DISEASES_DATA
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
      matches: scored.slice(0, 5),
      hasEmergency,
    });
  };

  const getUrgencyBadge = (urgency) => {
    if (urgency === 'Darurat Medis') {
      return (
        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">
          🚨 Darurat Medis
        </span>
      );
    }
    if (urgency === 'Sedang / Konsultasi') {
      return (
        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
          ⚠️ Butuh Konsultasi
        </span>
      );
    }
    return (
      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
        ✅ Pantau Mandiri
      </span>
    );
  };

  return (
    <div
      className={`flex-1 flex flex-col min-h-screen pb-20 transition-colors duration-300 ${
        isDarkMode ? 'bg-black text-gray-100' : 'bg-gradient-to-b from-teal-50 via-emerald-50 to-pink-50 text-gray-800'
      }`}
    >
      {/* Header */}
      <div
        className={`p-4 sticky top-0 z-30 flex items-center justify-between backdrop-blur-md border-b ${
          isDarkMode ? 'bg-black/85 border-gray-800' : 'bg-white/80 border-teal-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => { triggerFeedback(); onBack(); }}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all ${
              isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-black tracking-wide flex items-center gap-1.5">
              <span>🩺</span> Cek Gejala Pintar
            </h1>
            <p className="text-[10px] opacity-60">Analisis kemungkinan kondisi & tingkat urgensi</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto w-full space-y-4">
        {/* Disclaimer Medis */}
        <div
          className={`p-3.5 rounded-2xl border flex items-start gap-2.5 shadow-sm ${
            isDarkMode ? 'bg-amber-950/40 border-amber-800 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed font-medium">
            <strong>Disclaimer Medis:</strong> Fitur Cek Gejala ini dirancang sebagai panduan edukatif awal, bukan pengganti diagnosis medis resmi oleh dokter. Jika kamu mengalami nyeri dada hebat atau sesak napas berat, segera hubungi fasilitas darurat.
          </p>
        </div>

        {/* Petunjuk Pemilihan */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Pilih Gejala yang Sedang Kamu Rasakan:
            </h2>
            <span className="text-xs font-bold text-teal-500">
              {selectedSymptoms.length} dipilih
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {SYMPTOMS_LIST.map((sym) => {
              const isSelected = selectedSymptoms.includes(sym);
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => toggleSymptom(sym)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20 scale-105'
                      : isDarkMode
                      ? 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                      : 'bg-white border-teal-100 text-gray-700 hover:bg-teal-50/50'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {sym}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tombol Analisis */}
        <div>
          <button
            type="button"
            disabled={selectedSymptoms.length === 0}
            onClick={handleAnalyze}
            className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
              selectedSymptoms.length > 0
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:opacity-95 active:scale-98 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            {selectedSymptoms.length > 0
              ? `Analisis ${selectedSymptoms.length} Gejala Terpilih`
              : 'Pilih Minimal 1 Gejala di Atas'}
          </button>
        </div>

        {/* Hasil Analisis */}
        {analysisResult && (
          <div
            className={`rounded-3xl p-5 border shadow-lg space-y-4 animate-fadeIn ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-teal-100'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
              <h3 className="font-black text-base flex items-center gap-2">
                <span>📊</span> Hasil Analisis Gejala
              </h3>
              <span className="text-xs font-bold text-teal-500">
                {analysisResult.matches.length} Kondisi Relevan
              </span>
            </div>

            {/* Alert Darurat jika ada kondisi berisiko tinggi */}
            {analysisResult.hasEmergency && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-bounce" />
                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="text-xs font-bold text-red-700 dark:text-red-300">
                      Perhatian: Gejala Menunjukkan Kondisi Darurat Medis
                    </h4>
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5 leading-relaxed">
                      Beberapa gejala yang kamu pilih mengindikasikan kondisi serius yang membutuhkan evaluasi medis segera. Jika kondisi terus memburuk, segera panggil ambulans atau kunjungi IGD terdekat.
                    </p>
                  </div>

                  {onNavigate && (
                    <button
                      onClick={() => {
                        triggerFeedback();
                        onNavigate('sos');
                      }}
                      className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold px-3.5 py-1.5 rounded-full text-[11px] shadow-sm transition-all"
                    >
                      <span>🚑</span> Panggil Ambulans / PSC 119 ›
                    </button>
                  )}
                </div>
              </div>
            )}

            {analysisResult.matches.length === 0 ? (
              <div className="text-center py-6 text-xs opacity-70">
                Tidak ditemukan kecocokan spesifik dalam database. Istirahatlah dan perbanyak minum air putih.
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs opacity-70">
                  Berikut kemungkinan kondisi yang paling sesuai dengan gejala yang kamu rasakan:
                </p>

                {analysisResult.matches.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onSelectDisease) {
                        triggerFeedback();
                        onSelectDisease(item.id);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer hover:shadow-md flex items-center justify-between gap-3 group ${
                      isDarkMode
                        ? 'bg-gray-800/80 border-gray-700 hover:border-teal-500'
                        : 'bg-teal-50/40 border-teal-100 hover:border-teal-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center text-xl shadow-inner shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs group-hover:text-teal-500 transition-colors">
                            {item.name}
                          </h4>
                          {getUrgencyBadge(item.urgency)}
                        </div>
                        <p className="text-[10px] opacity-70 mt-0.5">
                          Cocok <span className="font-black text-teal-600 dark:text-teal-400">{item.matchCount}</span> dari {item.symptoms.length} gejala · {item.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-teal-500 shrink-0">
                      <span className="hidden sm:inline">Rincian</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] opacity-70">
              <span>💡 Klik salah satu kondisi untuk membaca penanganan & obat</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedSymptoms([]);
                  setAnalysisResult(null);
                }}
                className="text-pink-500 font-bold hover:underline"
              >
                Reset Gejala
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
