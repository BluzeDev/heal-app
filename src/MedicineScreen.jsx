import React, { useState } from 'react';

export default function MedicineScreen({ onBack, isDarkMode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDisease, setSelectedDisease] = useState(null);

  const diseasesList = [
    {
      id: 1,
      name: 'Demam',
      desc: 'Suhu tubuh tinggi',
      icon: '🤒',
      details: {
        medicines: ['Paracetamol', 'Ibuprofen'],
        remedies: ['Minum air putih secukupnya', 'Istirahat total', 'Kompres hangat di dahi atau lipatan ketiak'],
        note: 'Jika demam melebihi 39°C atau berlangsung lebih dari 3 hari, segera hubungi dokter.'
      }
    },
    {
      id: 2,
      name: 'Batuk',
      desc: 'Gangguan saluran pernapasan',
      icon: '🤧',
      details: {
        medicines: ['Obat Batuk Hitam (OBH)', 'Dextromethorphan (Batuk Kering)', 'Guaifenesin / Ekspektoran (Batuk Berdahak)'],
        remedies: ['Minum air hangat bercampur madu dan lemon', 'Hindari es dan makanan berminyak', 'Gunakan humidifier'],
        note: 'Jika batuk disertai darah atau sesak napas berat, segera periksakan ke dokter.'
      }
    },
    {
      id: 3,
      name: 'Flu / Pilek',
      desc: 'Infeksi virus influenza ringan',
      icon: '😰',
      details: {
        medicines: ['Decolgen', 'Ultraflu', 'Inza', 'Nasal Spray Saline (Pencuci Hidung)'],
        remedies: ['Hirup uap air hangat', 'Cukup tidur', 'Konsumsi makanan bergizi dan Vitamin C'],
        note: 'Gunakan masker agar tidak menulari orang sekitarmu.'
      }
    },
    {
      id: 4,
      name: 'Sakit Kepala',
      desc: 'Nyeri di area kepala',
      icon: '🤕',
      details: {
        medicines: ['Paracetamol', 'Aspirin', 'Ibuprofen'],
        remedies: ['Pijat lembut area pelipis', 'Istirahat di ruangan redup dan tenang', 'Cukupi konsumsi air minum'],
        note: 'Waspadai jika sakit kepala terjadi secara mendadak dan sangat hebat.'
      }
    },
    {
      id: 5,
      name: 'Maag / Asam Lambung',
      desc: 'Nyeri atau perih di ulu hati',
      icon: '🤢',
      details: {
        medicines: ['Antasida Doen', 'Mylanta', 'Polysilane'],
        remedies: ['Makan dalam porsi kecil tapi sering', 'Hindari makanan pedas, asam, dan kafein', 'Jangan langsung berbaring setelah makan'],
        note: 'Konsumsi antasida 1 jam sebelum makan atau 2 jam setelah makan.'
      }
    },
    {
      id: 6,
      name: 'Sariawan',
      desc: 'Luka kecil di area mulut atau bibir',
      icon: '👄',
      details: {
        medicines: ['Aloclair Plus', 'Kenalog in Orabase', 'Obat Kumur Antiseptik (Minosep/Betadine Mulut)'],
        remedies: ['Kumur dengan air garam hangat', 'Perbanyak konsumsi vitamin C dan B12', 'Hindari makanan tajam/keras'],
        note: 'Sariawan biasanya sembuh sendiri dalam 1–2 minggu.'
      }
    },
    {
      id: 7,
      name: 'Diare Ringan',
      desc: 'Buang air besar encer secara berulang',
      icon: '💩',
      details: {
        medicines: ['Oralit', 'Attapulgite (Entrostop)', 'Zinc'],
        remedies: ['Cukupi cairan tubuh dengan Oralit agar tidak dehidrasi', 'Makan makanan lunak seperti bubur', 'Hindari susu dan makanan berserat tinggi dulu'],
        note: 'Fokus utama diare adalah pencegahan dehidrasi.'
      }
    }
  ];

  const filteredDiseases = diseasesList.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex-1 flex flex-col min-h-screen pb-12 transition-colors duration-300 ${isDarkMode ? 'bg-black text-gray-100' : 'bg-pink-200 text-gray-800'}`}>
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all ${
              isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ←
          </button>
          <h1 className="text-xl font-bold tracking-wide">Medicine</h1>
        </div>
      </div>

      {/* Area Pencarian */}
      <div className="px-4 pb-4 max-w-3xl mx-auto w-full">
        <div className={`rounded-full px-4 py-2.5 flex items-center gap-2 shadow-sm border ${
          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'
        }`}>
          <span className="opacity-50">🔍</span>
          <input 
            type="text"
            placeholder="Cari penyakit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-sm outline-none bg-transparent ${isDarkMode ? 'text-gray-100 placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
          />
        </div>
      </div>

      {/* Daftar Kartu Penyakit */}
      <div className="px-4 flex-1 space-y-3 max-w-3xl mx-auto w-full">
        {filteredDiseases.length === 0 ? (
          <div className={`rounded-3xl p-8 text-center text-sm ${isDarkMode ? 'bg-gray-900 text-gray-400 border border-gray-800' : 'bg-white text-gray-400'}`}>
            Penyakit tidak ditemukan.
          </div>
        ) : (
          filteredDiseases.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedDisease(item)}
              className={`rounded-2xl p-4 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-all border ${
                isDarkMode ? 'bg-gray-900 border-gray-800 hover:border-pink-500' : 'bg-white border-transparent hover:border-pink-300'
              }`}
            >
              <div className={`text-3xl w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-gray-800' : 'bg-pink-50'}`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">{item.name}</h3>
                <p className="text-xs opacity-50 mt-0.5">{item.desc}</p>
              </div>
              <span className="opacity-40 font-bold">›</span>
            </div>
          ))
        )}

        {/* Disclaimer Box */}
        <div className={`rounded-2xl p-4 mt-6 text-xs flex items-start gap-2 shadow-sm border ${
          isDarkMode ? 'bg-amber-950/30 border-amber-900/50 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <span className="text-base shrink-0">⚠️</span>
          <div>
            <strong className="font-bold">Disclaimer:</strong> Informasi ini hanya untuk edukasi. Selalu konsultasikan dengan dokter untuk diagnosis dan pengobatan yang tepat.
          </div>
        </div>
      </div>

      {/* MODAL / POP-UP DETAIL PENYAKIT */}
      {selectedDisease && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className={`rounded-3xl p-6 max-w-lg w-full space-y-4 max-h-[85vh] overflow-y-auto border ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-gray-100 text-gray-800'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedDisease.icon}</span>
                <div>
                  <h3 className="font-bold text-base">{selectedDisease.name}</h3>
                  <p className="text-xs opacity-50">{selectedDisease.desc}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDisease(null)}
                className={`w-8 h-8 rounded-full font-bold flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-2">💊 Obat Bebas (OTC) yang Umum</h4>
              <ul className={`list-disc list-inside text-xs space-y-1 p-3 rounded-2xl ${isDarkMode ? 'bg-gray-800/60 text-gray-200' : 'bg-pink-50/50 text-gray-700'}`}>
                {selectedDisease.details.medicines.map((med, i) => (
                  <li key={i}>{med}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-2">🏡 Penanganan Mandiri</h4>
              <ul className={`list-disc list-inside text-xs space-y-1 p-3 rounded-2xl ${isDarkMode ? 'bg-gray-800/60 text-gray-200' : 'bg-gray-50 text-gray-700'}`}>
                {selectedDisease.details.remedies.map((rem, i) => (
                  <li key={i}>{rem}</li>
                ))}
              </ul>
            </div>

            <div className={`text-[11px] p-3 rounded-2xl border ${
              isDarkMode ? 'bg-amber-950/30 border-amber-900/50 text-amber-300' : 'bg-amber-50 border-amber-100 text-gray-600'
            }`}>
              💡 <strong>Catatan:</strong> {selectedDisease.details.note}
            </div>

            <button 
              onClick={() => setSelectedDisease(null)}
              className="w-full bg-pink-500 text-white font-bold py-3 rounded-full text-xs hover:bg-pink-600 transition-colors shadow-md"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}