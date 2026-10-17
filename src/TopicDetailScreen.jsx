import React, { useState } from 'react';

const masterTopicDetailCatalog = {
  'Stress': {
    icon: '😰',
    title: 'Stress',
    sections: {
      apa: { title: 'Apa itu Stress?', content: 'Stress adalah respons alami tubuh terhadap tekanan atau tantangan. Ini bisa berupa tekanan dari sekolah, keluarga, atau lingkungan sosial. Stress dalam jumlah kecil bisa membantu kita lebih fokus, tapi stress berlebihan dapat mengganggu kesehatan.' },
      gejala: { title: 'Gejala Stress', content: '• Sulit tidur atau tidur berlebihan\n• Mudah marah atau sensitif\n• Sakit kepala atau pusing\n• Sulit konsentrasi\n• Perubahan nafsu makan\n• Merasa lelah terus-menerus\n• Jantung berdebar-debar' },
      penyebab: { title: 'Penyebab Stress', content: '• Tekanan akademik\n• Masalah dengan teman atau keluarga\n• Perubahan dalam hidup\n• Terlalu banyak aktivitas\n• Kurang tidur\n• Masalah keuangan\n• Bullying atau tekanan sosial' },
      tips: { title: 'Tips & Trik', content: '• Atur waktu dengan baik\n• Istirahat yang cukup\n• Olahraga teratur\n• Ceritakan perasaanmu\n• Lakukan hobi yang disukai\n• Praktikkan pernapasan dalam\n• Batasi penggunaan gadget' },
      cara: { title: 'Cara Mengatasi', content: '1. Identifikasi sumber stress\n2. Buat daftar prioritas\n3. Belajar mengatakan "tidak"\n4. Luangkan waktu untuk diri sendiri\n5. Jaga pola makan sehat\n6. Praktikkan mindfulness\n7. Cari dukungan dari orang terdekat' },
      bantuan: { title: 'Bantuan Tambahan', content: 'Jika stress terasa sangat berat:\n• Hubungi konselor sekolah\n• Bicara dengan orang tua/wali\n• Gunakan fitur Counselor di HEAL\n• Hotline kesehatan jiwa: 119 ext 8\n• Jangan ragu minta bantuan profesional' }
    }
  },
  'Stunting': {
    icon: '📏',
    title: 'Stunting',
    sections: {
      apa: { title: 'Apa itu Stunting?', content: 'Stunting adalah kondisi gagal tumbuh pada anak akibat kekurangan gizi kronis, terutama di 1000 hari pertama kehidupan. Anak dengan stunting memiliki tinggi badan lebih pendek dari standar usia mereka.' },
      gejala: { title: 'Gejala Stunting', content: '• Tinggi badan di bawah standar\n• Berat badan rendah\n• Pertumbuhan terhambat\n• Mudah sakit\n• Perkembangan motorik lambat\n• Kemampuan belajar terganggu' },
      penyebab: { title: 'Penyebab Stunting', content: '• Kurang gizi saat hamil\n• ASI tidak eksklusif\n• MPASI tidak bergizi\n• Infeksi berulang\n• Sanitasi buruk\n• Akses kesehatan terbatas' },
      tips: { title: 'Tips & Trik', content: '• Konsumsi makanan bergizi seimbang\n• Minum susu secara teratur\n• Olahraga dan aktivitas fisik\n• Tidur yang cukup\n• Periksa kesehatan rutin\n• Jaga kebersihan' },
      cara: { title: 'Cara Mengatasi', content: '1. Konsultasi dengan dokter/ahli gizi\n2. Perbaiki pola makan\n3. Tingkatkan asupan protein\n4. Konsumsi vitamin D dan kalsium\n5. Aktivitas fisik teratur\n6. Monitor pertumbuhan berkala' },
      bantuan: { title: 'Bantuan Tambahan', content: '• Posyandu terdekat\n• Puskesmas\n• Dokter spesialis anak\n• Program gizi pemerintah\n• Konsultasi ahli gizi' }
    }
  },
  'Brainrot': {
    icon: '🧠',
    title: 'Brainrot',
    sections: {
      apa: { title: 'Apa itu Brainrot?', content: 'Brainrot adalah istilah yang menggambarkan kondisi mental akibat terlalu banyak mengonsumsi konten digital atau internet yang tidak berkualitas dan berlebihan.' },
      gejala: { title: 'Gejala Brainrot', content: '• Sulit fokus dalam waktu lama\n• Mudah bosan\n• Kecanduan scrolling media sosial\n• Penggunaan bahasa/meme internet berlebihan\n• Produktivitas menurun\n• Sulit tidur' },
      penyebab: { title: 'Penyebab Brainrot', content: '• Terlalu lama di depan layar (screen time)\n• Konsumsi video pendek berulang\n• Algoritma media sosial yang adiktif\n• Kurangnya aktivitas di dunia nyata' },
      tips: { title: 'Tips & Trik', content: '• Batasi waktu layar harian\n• Pilih tontonan yang edukatif\n• Lakukan detoks digital sesekali\n• Kembangkan hobi offline seperti membaca atau olahraga' },
      cara: { title: 'Cara Mengatasi', content: '1. Atur timer untuk aplikasi sosmed\n2. Buat zona bebas gadget di kamar tidur\n3. Alihkan perhatian ke aktivitas fisik' },
      bantuan: { title: 'Bantuan Tambahan', content: '• Diskusi dengan orang tua\n• Konseling digital wellness\n• Komunitas pendukung' }
    }
  },
  'Kista': {
    icon: '🩺',
    title: 'Kista',
    sections: {
      apa: { title: 'Apa itu Kista?', content: 'Kista adalah kantung berisi cairan atau bahan semisolid yang dapat tumbuh di berbagai bagian tubuh. Pada remaja putri, kista ovarium cukup sering ditemukan dan umumnya jinak.' },
      gejala: { title: 'Gejala Kista', content: '• Nyeri panggul atau perut bagian bawah\n• Perut terasa kembung atau penuh\n• Siklus haid tidak teratur\n• Nyeri berlebih saat menstruasi' },
      penyebab: { title: 'Penyebab Kista', content: '• Faktor ketidakseimbangan hormon\n• Pertumbuhan sel yang tidak normal\n• Faktor genetik atau riwayat keluarga' },
      tips: { title: 'Tips & Trik', content: '• Rutin mencatat siklus menstruasi\n• Konsumsi makanan bergizi seimbang\n• Hindari makanan tinggi lemak jenuh' },
      cara: { title: 'Cara Mengatasi', content: '1. Pemeriksaan USG ke dokter spesialis\n2. Pemantauan berkala\n3. Pengobatan medis atau tindakan bedah jika diperlukan' },
      bantuan: { title: 'Bantuan Tambahan', content: '• Dokter spesialis obstetri dan ginekologi (Obgin)\n• Klinik kesehatan wanita' }
    }
  },
  'Diabetes': {
    icon: '🍬',
    title: 'Diabetes',
    sections: {
      apa: { title: 'Apa itu Diabetes?', content: 'Diabetes adalah kondisi kronis ketika tubuh tidak dapat memproduksi cukup insulin atau tidak dapat menggunakan insulin dengan efektif, sehingga kadar gula darah meningkat.' },
      gejala: { title: 'Gejala Diabetes', content: '• Sering merasa haus dan lapar\n• Sering buang air kecil (terutama malam hari)\n• Penurunan berat badan drastis tanpa sebab\n• Mudah lelah dan lemas' },
      penyebab: { title: 'Penyebab Diabetes', content: '• Faktor genetik/keturunan\n• Pola makan tinggi gula dan karbohidrat olahan\n• Kurang aktivitas fisik atau obesitas' },
      tips: { title: 'Tips & Trik', content: '• Kurangi konsumsi minuman manis kemasan\n• Rutin berolahraga ringan\n• Perbanyak konsumsi serat dan air putih' },
      cara: { title: 'Cara Mengatasi', content: '1. Cek kadar gula darah rutin\n2. Konsultasi dengan dokter gizi atau endokrin\n3. Pengaturan pola makan ketat' },
      bantuan: { title: 'Bantuan Tambahan', content: '• Dokter spesialis anak/penyakit dalam\n• Ahli gizi klinis' }
    }
  },
  'Trauma': {
    icon: '💔',
    title: 'Trauma',
    sections: {
      apa: { title: 'Apa itu Trauma?', content: 'Trauma adalah respons emosional yang mendalam akibat pengalaman atau kejadian yang sangat menakutkan, mengancam, atau menekan mental seseorang.' },
      gejala: { title: 'Gejala Trauma', content: '• Kilas balik (flashback) kejadian buruk\n• Mimpi buruk berulang\n• Menghindari tempat atau orang tertentu\n• Kecemasan berlebihan' },
      penyebab: { title: 'Penyebab Trauma', content: '• Mengalami kekerasan atau bullying\n• Kecelakaan atau bencana\n• Kehilangan orang terdekat secara mendadak' },
      tips: { title: 'Tips & Trik', content: '• Jangan memendam emosi sendirian\n• Lakukan teknik grounding saat cemas\n• Menulis jurnal perasaan' },
      cara: { title: 'Cara Mengatasi', content: '1. Menerima dan mengakui perasaan\n2. Melakukan terapi psikologis (CBT/konseling)\n3. Dukungan sosial dari orang terdekat' },
      bantuan: { title: 'Bantuan Tambahan', content: '• Psikolog atau Psikiater\n• Layanan hotline kesehatan mental HEAL' }
    }
  },
  'Anemia': {
    icon: '🩸',
    title: 'Anemia',
    sections: {
      apa: { title: 'Apa itu Anemia?', content: 'Anemia adalah kondisi ketika tubuh kekurangan sel darah merah yang sehat atau hemoglobin, sehingga oksigen tidak menyebar dengan baik ke seluruh tubuh (sering dialami remaja putri).' },
      gejala: { title: 'Gejala Anemia', content: '• Sering merasa lemas, letih, dan lesu\n• Pusing atau sakit kepala\n• Wajah dan kelopak mata tampak pucat\n• Sulit berkonsentrasi saat belajar' },
      penyebab: { title: 'Penyebab Anemia', content: '• Kekurangan zat besi\n• Kehilangan banyak darah saat menstruasi\n• Kurang konsumsi makanan sumber protein hewani' },
      tips: { title: 'Tips & Trik', content: '• Rutin minum Tablet Tambah Darah (TTD)\n• Konsumsi daging merah, hati, atau sayuran hijau\n• Hindari minum teh/kopi bersamaan dengan makan karena menghambat penyerapan zat besi' },
      cara: { title: 'Cara Mengatasi', content: '1. Periksa kadar hemoglobin (Hb)\n2. Suplementasi zat besi sesuai anjuran\n3. Perbaikan pola nutrisi harian' },
      bantuan: { title: 'Bantuan Tambahan', content: '• Puskesmas terdekat\n• Dokter umum' }
    }
  },
  'Depresi': {
    icon: '🌧️',
    title: 'Depresi',
    sections: {
      apa: { title: 'Apa itu Depresi?', content: 'Depresi adalah gangguan suasana hati serius yang menyebabkan perasaan sedih berkepanjangan dan hilangnya minat dalam melakukan aktivitas sehari-hari.' },
      gejala: { title: 'Gejala Depresi', content: '• Sedih atau hampa berkepanjangan\n• Kehilangan minat pada hobi\n• Gangguan pola tidur dan nafsu makan\n• Muncul pikiran negatif atau putus asa' },
      penyebab: { title: 'Penyebab Depresi', content: '• Faktor kimiawi otak\n• Tekanan hidup atau trauma masa lalu\n• Faktor genetik dan lingkungan sosial' },
      tips: { title: 'Tips & Trik', content: '• Berbicara dengan orang tepercaya\n• Lakukan aktivitas fisik ringan secara berkala\n• Hindari isolasi diri' },
      cara: { title: 'Cara Mengatasi', content: '1. Konsultasi profesional kesehatan mental\n2. Psikoterapi secara rutin\n3. Dukungan penuh dari keluarga/lingkungan' },
      bantuan: { title: 'Bantuan Tambahan', content: '• Psikolog / Psikiater\n• Layanan darurat kesehatan jiwa (119 ext 8)' }
    }
  },
  'Gastritis': {
    icon: '🍽️',
    title: 'Gastritis (Maag)',
    sections: {
      apa: { title: 'Apa itu Gastritis?', content: 'Gastritis adalah peradangan pada dinding lambung yang sering dipicu oleh pola makan yang tidak teratur atau stres berlebih pada remaja.' },
      gejala: { title: 'Gejala Gastritis', content: '• Nyeri atau perih di ulu hati\n• Mual dan muntah\n• Perut kembung dan terasa cepat kenyang' },
      penyebab: { title: 'Penyebab Gastritis', content: '• Sering terlambat makan\n• Konsumsi makanan pedas, asam, atau berkafein berlebih\n• Infeksi bakteri' },
      tips: { title: 'Tips & Trik', content: '• Makan tepat waktu dengan porsi kecil tapi sering\n• Hindari pemicu asam lambung tinggi\n• Kelola stres dengan baik' },
      cara: { title: 'Cara Mengatasi', content: '1. Minum obat antasida sesuai anjuran\n2. Perbaiki jadwal makan\n3. Istirahat cukup' },
      bantuan: { title: 'Bantuan Tambahan', content: '• Dokter umum\n• Apoteker terdekat' }
    }
  },
  'Insomnia': {
    icon: '🌙',
    title: 'Insomnia',
    sections: {
      apa: { title: 'Insomnia', content: 'Insomnia adalah gangguan tidur yang membuat seseorang kesulitan untuk tidur, sering terbangun di malam hari, atau merasa tidak segar saat bangun pagi.' },
      gejala: { title: 'Gejala Insomnia', content: '• Sulit tidur malam\n• Sering terbangun dan susah tidur kembali\n• Mengantuk dan mudah lelah di siang hari\n• Emosi tidak stabil' },
      penyebab: { title: 'Penyebab Insomnia', content: '• Paparan layar gadget sebelum tidur (blue light)\n• Stres dan pikiran berlebih\n• Kebiasaan jam tidur yang tidak teratur' },
      tips: { title: 'Tips & Trik', content: '• Terapkan sleep hygiene (matikan lampu/gadget 1 jam sebelum tidur)\n• Hindari kafein di sore/malam hari\n• Buat jadwal tidur yang konsisten' },
      cara: { title: 'Cara Mengatasi', content: '1. Relaksasi sebelum tidur\n2. Perbaiki rutinitas malam hari\n3. Konsultasi dokter jika berlanjut' },
      bantuan: { title: 'Bantuan Tambahan', content: '• Konselor kesehatan\n• Klinik tidur' }
    }
  },
  'Obesitas': {
    icon: '⚖️',
    title: 'Obesitas',
    sections: {
      apa: { title: 'Apa itu Obesitas?', content: 'Obesitas adalah penumpukan lemak berlebih di dalam tubuh akibat ketidakseimbangan antara energi yang masuk (makanan) dan energi yang keluar (aktivitas fisik).' },
      gejala: { title: 'Gejala Obesitas', content: '• Indeks Massa Tubuh (BMI) di atas batas normal\n• Mudah merasa sesak napas saat beraktivitas\n• Cepat lelah dan nyeri sendi' },
      penyebab: { title: 'Penyebab Obesitas', content: '• Konsumsi junk food dan minuman manis berlebih\n• Kurang aktivitas fisik / terlalu banyak duduk\n• Faktor genetik' },
      tips: { title: 'Tips & Trik', content: '• Perbanyak konsumsi sayur dan buah\n• Rutin berolahraga minimal 30 menit sehari\n• Kurangi makanan berkalori tinggi' },
      cara: { title: 'Cara Mengatasi', content: '1. Mengatur defisit kalori sehat\n2. Konsultasi dengan ahli gizi\n3. Meningkatkan aktivitas fisik secara konsisten' },
      bantuan: { title: 'Bantuan Tambahan', content: '• Ahli Gizi (Nutrisionis)\n• Dokter Spesialis Gizi Klinik' }
    }
  },
  'Alergi': {
    icon: '🤧',
    title: 'Alergi',
    sections: {
      apa: { title: 'Apa itu Alergi?', content: 'Alergi adalah reaksi sistem kekebalan tubuh terhadap zat tertentu (alergen) yang biasanya dianggap tidak berbahaya bagi orang lain.' },
      gejala: { title: 'Gejala Alergi', content: '• Bersin-bersin dan hidung tersumbat\n• Gatal-gatal atau muncul ruam pada kulit\n• Mata berair dan kemerahan' },
      penyebab: { title: 'Penyebab Alergi', content: '• Debu, bulu hewan, serbuk sari\n• Jenis makanan tertentu (seperti seafood atau kacang)\n• Perubahan suhu atau cuaca' },
      tips: { title: 'Tips & Trik', content: '• Menjaga kebersihan kamar dari debu\n• Menghindari makanan atau zat pemicu alergi\n• Membaca label komposisi makanan' },
      cara: { title: 'Cara Mengatasi', content: '1. Mengonsumsi antihistamin atas resep dokter\n2. Menjauhi sumber alergen\n3. Tes alergi jika diperlukan' },
      bantuan: { title: 'Bantuan Tambahan', content: '• Dokter Spesialis Kulit & Kelamin / Alergi' }
    }
  },
  'Skoliosis': {
    icon: '🦴',
    title: 'Skoliosis',
    sections: {
      apa: { title: 'Apa itu Skoliosis?', content: 'Skoliosis adalah kelengkungan lateral (menyamping) pada tulang belakang yang paling sering didiagnosis selama masa pertumbuhan remaja.' },
      gejala: { title: 'Gejala Skoliosis', content: '• Bahu tidak simetris / sebelah lebih tinggi\n• Posisi kepala tidak berada tepat di tengah panggul\n• Nyeri punggung ringan' },
      penyebab: { title: 'Penyebab Skoliosis', content: '• Idiopatik (penyebab pastinya sering tidak diketahui)\n• Faktor bawaan lahir\n• Postur tubuh yang buruk dalam jangka panjang' },
      tips: { title: 'Tips & Trik', content: '• Jaga posisi duduk tegak saat belajar\n• Jangan membawa tas terlalu berat di satu sisi bahu saja\n• Rutin berolahraga seperti berenang' },
      cara: { title: 'Cara Mengatasi', content: '1. Pemeriksaan rontgen tulang belakang\n2. Fisioterapi khusus skoliosis\n3. Penggunaan brace medis jika kurva cukup besar' },
      bantuan: { title: 'Bantuan Tambahan', content: '• Dokter Spesialis Orthopedi\n• Fisioterapis' }
    }
  },
  'Jerawat': {
    icon: '🧴',
    title: 'Jerawat Parah',
    sections: {
      apa: { title: 'Apa itu Jerawat?', content: 'Jerawat adalah kondisi kulit yang terjadi ketika folikel rambut tersumbat oleh minyak dan sel kulit mati, sering meradang akibat hormon masa pubertas.' },
      gejala: { title: 'Gejala Jerawat', content: '• Muncul komedo, bintik merah, atau nanah di wajah, dada, atau punggung\n• Kulit meradang dan terasa nyeri' },
      penyebab: { title: 'Penyebab Jerawat', content: '• Perubahan hormon masa remaja\n• Produksi minyak (sebum) berlebih\n• Kebersihan wajah yang kurang terjaga' },
      tips: { title: 'Tips & Trik', content: '• Cuci muka maksimal 2 kali sehari\n• Jangan memencet jerawat dengan tangan kotor\n• Pilih produk skincare non-comedogenic' },
      cara: { title: 'Cara Mengatasi', content: '1. Gunakan obat jerawat yang mengandung salycilic acid / benzoyl peroxide\n2. Konsultasi ke dokter kulit (dermatologist)' },
      bantuan: { title: 'Bantuan Tambahan', content: '• Dokter Spesialis Kulit (Sp.KK / Dermatologist)' }
    }
  }
};

export default function TopicDetailScreen({ selectedTopic, onBack, isDarkMode }) {
  const currentTopicData = masterTopicDetailCatalog[selectedTopic] || masterTopicDetailCatalog['Stress'];
  const [activeSection, setActiveSection] = useState(null);

  const subMenus = [
    { key: 'apa', icon: '❓', label: 'Apa itu?' },
    { key: 'gejala', icon: '🤒', label: 'Gejala' },
    { key: 'penyebab', icon: '🔍', label: 'Penyebab' },
    { key: 'tips', icon: '💡', label: 'Tips & Trik' },
    { key: 'cara', icon: '🛠️', label: 'Cara Mengatasi' },
    { key: 'bantuan', icon: '🆘', label: 'Bantuan Tambahan' },
  ];

  return (
    <div className={`flex-1 overflow-y-auto pb-20 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black text-gray-100' : 'bg-gradient-to-b from-pink-200 to-yellow-100 text-gray-800'}`}>
      
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <button 
          onClick={onBack} 
          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm transition-all ${
            isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white/80 text-gray-700 hover:bg-white'
          }`}
        >
          ←
        </button>
        <h2 className="text-xl font-bold drop-shadow-sm">
          {currentTopicData.icon} {currentTopicData.title}
        </h2>
      </div>

      {!activeSection ? (
        <div className="px-4 space-y-3 max-w-xl mx-auto w-full">
          <div className={`rounded-2xl p-4 mb-2 text-center shadow-sm border ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white/60 border-white/50 backdrop-blur-sm'
          }`}>
            <p className="text-xs opacity-60 font-semibold uppercase tracking-wider">Topik Kesehatan Remaja</p>
            <p className="text-lg font-bold">{currentTopicData.title}</p>
          </div>

          {subMenus.map((menu) => (
            <div 
              key={menu.key}
              onClick={() => setActiveSection(menu.key)}
              className={`rounded-2xl p-4 flex items-center gap-4 shadow-sm cursor-pointer hover:translate-x-1 transition-all border ${
                isDarkMode ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-white border-transparent'
              }`}
            >
              <span className="text-2xl">{menu.icon}</span>
              <span className="font-semibold text-sm">{menu.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 max-w-xl mx-auto w-full">
          <div className={`rounded-2xl p-6 shadow-sm border ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-transparent'
          }`}>
            <div className={`flex items-center justify-between mb-4 pb-2 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <h3 className="text-lg font-bold">
                {currentTopicData.sections[activeSection]?.title}
              </h3>
              <button 
                onClick={() => setActiveSection(null)} 
                className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                  isDarkMode ? 'bg-pink-950/60 text-pink-300 border border-pink-900 hover:bg-pink-900' : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                }`}
              >
                Kembali
              </button>
            </div>
            <p className={`text-sm whitespace-pre-line leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {currentTopicData.sections[activeSection]?.content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}