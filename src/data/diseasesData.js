/**
 * diseasesData.js — Bank Penyakit HEAL App
 * Dataset komprehensif kesehatan fisik & mental remaja & umum
 */

export const DISEASE_CATEGORIES = [
  "Semua",
  "Penyakit Infeksi & Tropis",
  "Kesehatan Mental & Psikologis",
  "Kardiovaskular & Sirkulasi",
  "Pernapasan",
  "Pencernaan",
  "Neurologi & Saraf",
  "Kulit & Estetika",
  "Kesehatan Remaja",
  "Gizi & Metabolisme"
];

export const SYMPTOMS_LIST = [
  "Demam", "Batuk", "Pilek / Hidung Tersumbat", "Sakit Tenggorokan", "Sesak Napas",
  "Sakit Kepala / Pusing", "Mual / Muntah", "Nyeri Ulu Hati / Perih Lambung", "Diare",
  "Cemas Berlebih / Panik", "Sulit Tidur / Insomnia", "Mood Cepat Berubah", "Murung / Putus Asa",
  "Lemas & Cepat Lelah", "Gatal / Ruam Kulit", "Nyeri Dada", "Jantung Berdebar",
  "Nyeri Haid Berat", "Wajah Berjerawat", "Nafsu Makan Hilang"
];

export const DISEASES_DATA = [
  // 1. Penyakit Infeksi & Tropis
  {
    id: "inf-1",
    name: "Demam Berdarah Dengue (DBD)",
    category: "Penyakit Infeksi & Tropis",
    desc: "Infeksi virus dengue yang ditularkan oleh gigitan nyamuk Aedes aegypti.",
    icon: "🦟",
    urgency: "Darurat Medis",
    urgencyColor: "red",
    symptoms: ["Demam", "Sakit Kepala / Pusing", "Mual / Muntah", "Lemas & Cepat Lelah", "Gatal / Ruam Kulit"],
    details: {
      gejala: "Demam tinggi mendadak (39-40°C) selama 2-7 hari, nyeri sendi dan otot di belakang mata, bintik merah pada kulit, penurunan trombosit drastis.",
      medicines: ["Paracetamol (HINDARI Aspirin dan Ibuprofen karena memicu pendarahan)", "Cairan Elektrolit / Oralit", "Infus Cairan di RS"],
      remedies: [
        "Minum air putih, jus jambu merah, atau air kelapa minimal 2-3 liter per hari",
        "Istirahat total di tempat tidur",
        "Kompres hangat jika demam tinggi",
        "Pantau kadar trombosit dan hematokrit secara berkala di laboratorium"
      ],
      prevention: "Gerakan 3M Plus: Menguras tempat penampungan air, Menutup rapat wadah air, Mendaur ulang barang bekas, dan memakai lotion anti nyamuk.",
      note: "Waspadai fase kritis di hari ke-3 sampai ke-5 saat demam turun tapi risiko syok meningkat."
    }
  },
  {
    id: "inf-2",
    name: "Demam Tifoid (Tipes)",
    category: "Penyakit Infeksi & Tropis",
    desc: "Infeksi bakteri Salmonella typhi yang menyerang saluran pencernaan akibat makanan/minuman terkontaminasi.",
    icon: "🧫",
    urgency: "Sedang / Konsultasi",
    urgencyColor: "amber",
    symptoms: ["Demam", "Nyeri Ulu Hati / Perih Lambung", "Diare", "Lemas & Cepat Lelah", "Nafsu Makan Hilang"],
    details: {
      gejala: "Demam bertahap yang makin tinggi terutama di malam hari, lidah berselaput putih kotor, gangguan BAB (diare atau konstipasi), lemas ekstrem.",
      medicines: ["Antibiotik resep dokter (Kloramfenikol, Ciprofloksasin, atau Azitromisin)", "Paracetamol penurun panas"],
      remedies: [
        "Konsumsi makanan bertekstur lunak (bubur saring, sup bening rendah serat)",
        "Hindari makanan pedas, asam, berminyak, dan minuman bersoda",
        "Bed rest total untuk mencegah komplikasi perforasi usus"
      ],
      prevention: "Cuci tangan pakai sabun sebelum makan, konsumsi air matang, hindari jajan di tempat kurang higienis, dan vaksinasi tifoid.",
      note: "Antibiotik dari dokter harus dihabiskan tuntas agar bakteri tidak menjadi kebal."
    }
  },
  {
    id: "inf-3",
    name: "Tuberkulosis (TBC Paru)",
    category: "Penyakit Infeksi & Tropis",
    desc: "Infeksi bakteri Mycobacterium tuberculosis yang menyerang organ paru-paru.",
    icon: "🫁",
    urgency: "Sedang / Konsultasi",
    urgencyColor: "amber",
    symptoms: ["Batuk", "Sesak Napas", "Demam", "Lemas & Cepat Lelah", "Nafsu Makan Hilang"],
    details: {
      gejala: "Batuk terus menerus lebih dari 2 minggu (bisa berdahak atau berdarah), demam meriang di malam hari disertai keringat dingin, berat badan turun drastis.",
      medicines: ["Paket Obat Anti Tuberkulosis (OAT) kombinasi 4 macam obat selama minimal 6 bulan"],
      remedies: [
        "Jalani pengobatan rutin tanpa putus obat satu hari pun",
        "Gunakan masker medis untuk mencegah penularan ke keluarga",
        "Tingkatkan ventilasi kamar agar sirkulasi udara dan cahaya matahari lancar"
      ],
      prevention: "Imunisasi BCG saat bayi, etika batuk yang benar, dan pastikan rumah memiliki sirkulasi udara baik.",
      note: "Pengobatan TBC gratis di Puskesmas di seluruh Indonesia."
    }
  },
  {
    id: "inf-4",
    name: "Cacar Air (Varicella)",
    category: "Penyakit Infeksi & Tropis",
    desc: "Infeksi virus Varicella zoster yang menyebabkan lenting gatal berisi cairan di sekujur tubuh.",
    icon: "🫧",
    urgency: "Ringan / Pantau Mandiri",
    urgencyColor: "emerald",
    symptoms: ["Demam", "Gatal / Ruam Kulit", "Lemas & Cepat Lelah", "Sakit Kepala / Pusing"],
    details: {
      gejala: "Demam ringan diikuti munculnya bintik merah yang berubah jadi lenting berair gatal di dada, punggung, lalu menyebar ke wajah dan tangan.",
      medicines: ["Lotion Calamine pereda gatal", "Paracetamol pereda demam", "Antivirus Acyclovir (jika dianjurkan dokter)"],
      remedies: [
        "Jangan menggaruk lenting agar tidak terjadi infeksi sekunder dan bekas luka bopeng",
        "Mandi dengan air hangat suam-suam kuku tanpa menggosok kulit secara keras",
        "Gunting kuku anak atau remaja agar tetap pendek dan bersih"
      ],
      prevention: "Vaksinasi Varicella dan isolasi diri dari orang lain hingga lenting mengering menjadi keropeng.",
      note: "Penyakit ini sangat menular melalui udara dan kontak langsung cairan lenting."
    }
  },

  // 2. Kesehatan Mental & Psikologis
  {
    id: "men-1",
    name: "Gangguan Kecemasan Umum (GAD)",
    category: "Kesehatan Mental & Psikologis",
    desc: "Kondisi rasa cemas, khawatir, dan tegang yang intens dan berlebihan terhadap hal sehari-hari secara berkelanjutan.",
    icon: "🌀",
    urgency: "Sedang / Konsultasi",
    urgencyColor: "amber",
    symptoms: ["Cemas Berlebih / Panik", "Sulit Tidur / Insomnia", "Jantung Berdebar", "Lemas & Cepat Lelah", "Sakit Kepala / Pusing"],
    details: {
      gejala: "Selalu memikirkan skenario terburuk (catastrophizing), otot leher dan pundak tegang, napas pendek, sulit konsentrasi, gelisah tak beralasan.",
      medicines: ["Terapi Psikologis (CBT / Terapi Perilaku Kognitif)", "Obat anxiolitik/antidepresan hanya atas resep Psikiater"],
      remedies: [
        "Latihan pernapasan 4-7-8 secara teratur di fitur Calm Corner HEAL",
        "Teknik Grounding 5-4-3-2-1 saat serangan kecemasan datang",
        "Kurangi konsumsi kafein (kopi, matcha pekat, minuman berenergi)",
        "Batasi scrolling media sosial pemicu overthinking"
      ],
      prevention: "Terapkan jurnalisme emosi, rutin berolahraga ringan, dan terbuka bercerita pada orang terpercaya atau konselor.",
      note: "Kamu tidak sendirian. Mengakui kecemasan adalah tanda keberanian, bukan kelemahan."
    }
  },
  {
    id: "men-2",
    name: "Serangan Panik (Panic Attack)",
    category: "Kesehatan Mental & Psikologis",
    desc: "Gelombang ketakutan yang mendadak dan luar biasa intens, disertai reaksi fisik seolah sedang mengalami ancaman kematian.",
    icon: "⚡",
    urgency: "Ringan / Pantau Mandiri",
    urgencyColor: "emerald",
    symptoms: ["Cemas Berlebih / Panik", "Jantung Berdebar", "Sesak Napas", "Sakit Kepala / Pusing"],
    details: {
      gejala: "Jantung berdegup sangat kencang, sensasi tercekik atau sulit bernapas, telapak tangan berkeringat dingin, gemetar, rasa terlepas dari realitas (depersonalisasi).",
      medicines: ["Konsultasi psikolog klinis / psikiater untuk terapi jangka panjang"],
      remedies: [
        "Ingat mantra: 'Ini hanya serangan panik, tubuhku aman, ini akan berlalu dalam 10-15 menit'",
        "Gunakan kantong kertas atau tangan untuk menstabilkan ritme pernapasan",
        "Sentuh benda dingin seperti es batu atau cuci muka dengan air dingin untuk merangsang saraf vagus"
      ],
      prevention: "Kelola stres harian, cukup tidur, dan pelajari sinyal peringatan awal tubuhmu.",
      note: "Serangan panik terasa menakutkan namun secara medis tidak mematikan organ jantung."
    }
  },
  {
    id: "men-3",
    name: "Burnout Akademik & Emosional",
    category: "Kesehatan Mental & Psikologis",
    desc: "Keadaan kelelahan fisik, emosional, dan mental yang parah akibat stres belajar atau tekanan hidup berkepanjangan.",
    icon: "🔥",
    urgency: "Ringan / Pantau Mandiri",
    urgencyColor: "emerald",
    symptoms: ["Lemas & Cepat Lelah", "Sulit Tidur / Insomnia", "Murung / Putus Asa", "Mood Cepat Berubah"],
    details: {
      gejala: "Kehilangan motivasi belajar, merasa sinis terhadap sekolah/tugas, penurunan konsentrasi, merasa tidak berharga, dan kelelahan kronis meski sudah tidur.",
      medicines: ["Istirahat restoratif", "Konseling edukasi"],
      remedies: [
        "Tetapkan batasan tegas antara waktu belajar dan waktu bersenang-senang (rest boundaries)",
        "Luangkan waktu untuk hobi tanpa rasa bersalah",
        "Bicarakan beban tugas dengan guru BK atau orang tua untuk mencari solusi penjadwalan"
      ],
      prevention: "Hindari sistem kebut semalam (SKS), gunakan teknik Pomodoro (25 menit belajar, 5 menit istirahat).",
      note: "Istirahat bukanlah hadiah setelah lelah, melainkan hak biologis tubuhmu."
    }
  },
  {
    id: "men-4",
    name: "Insomnia Akut & Gangguan Tidur",
    category: "Kesehatan Mental & Psikologis",
    desc: "Ketidakmampuan untuk memulai atau mempertahankan tidur nyenyak yang memengaruhi fungsi kognitif di siang hari.",
    icon: "🌙",
    urgency: "Ringan / Pantau Mandiri",
    urgencyColor: "emerald",
    symptoms: ["Sulit Tidur / Insomnia", "Sakit Kepala / Pusing", "Lemas & Cepat Lelah", "Mood Cepat Berubah"],
    details: {
      gejala: "Membutuhkan waktu lebih dari 30 menit untuk tertidur, sering terbangun di tengah malam, bangun pagi merasa lesu, mudah marah dan mengantuk di kelas.",
      medicines: ["Suplemen Melatonin (konsultasikan dosis), teh chamomile hangat"],
      remedies: [
        "Sleep Hygiene: Matikan layar HP/laptop minimal 45 menit sebelum tidur",
        "Pastikan kamar tidur sejuk, gelap, dan hening",
        "Jangan berada di tempat tidur jika tidak bisa tidur lebih dari 20 menit — bangun dan baca buku fisik berlampu redup"
      ],
      prevention: "Bangun dan tidur di jam yang sama setiap hari termasuk saat akhir pekan.",
      note: "Hindari tidur siang lebih dari 30 menit agar rasa kantuk alami terjaga di malam hari."
    }
  },

  // 3. Kardiovaskular & Sirkulasi
  {
    id: "kardio-1",
    name: "Hipotensi (Tekanan Darah Rendah)",
    category: "Kardiovaskular & Sirkulasi",
    desc: "Kondisi di mana tekanan darah berada di bawah 90/60 mmHg yang menyebabkan suplai oksigen ke otak berkurang sesaat.",
    icon: "🩸",
    urgency: "Ringan / Pantau Mandiri",
    urgencyColor: "emerald",
    symptoms: ["Sakit Kepala / Pusing", "Lemas & Cepat Lelah", "Mual / Muntah"],
    details: {
      gejala: "Pandangan berkunang-kunang saat bangkit dari duduk atau tidur (hipotensi ortostatik), pusing melayang, pucat, dan telapak tangan dingin.",
      medicines: ["Oralit / elektrolit", "Suplemen penambah darah jika diiringi anemia"],
      remedies: [
        "Minum air putih lebih banyak (minimal 8-10 gelas sehari)",
        "Tambahkan sedikit asupan garam dalam batas wajar pada makanan",
        "Bangun secara perlahan dari posisi berbaring ke posisi berdiri"
      ],
      prevention: "Hindari berdiri terlalu lama di bawah terik matahari dan jangan lewatkan sarapan pagi.",
      note: "Jika pingsan berulang kali, segera periksakan fungsi jantung ke dokter."
    }
  },
  {
    id: "kardio-2",
    name: "Hipertensi Remaja & Usia Muda",
    category: "Kardiovaskular & Sirkulasi",
    desc: "Tekanan darah sistolik di atas 130 mmHg atau diastolik di atas 80 mmHg yang sering kali dipicu stres dan pola makan tinggi garam.",
    icon: "🫀",
    urgency: "Sedang / Konsultasi",
    urgencyColor: "amber",
    symptoms: ["Sakit Kepala / Pusing", "Nyeri Dada", "Jantung Berdebar"],
    details: {
      gejala: "Tengkuk leher terasa kaku dan berat, sakit kepala berdenyut, telinga berdenging, dan mudah lelah saat beraktivitas.",
      medicines: ["Obat antihipertensi dari dokter spesialis jantung/penyakit dalam"],
      remedies: [
        "Kurangi konsumsi makanan cepat saji, mie instan, camilan asin berpengawet",
        "Lakukan aktivitas kardio ringan (jalan cepat, jogging, renang) minimal 30 menit sehari",
        "Kelola stres akademik dan emosional"
      ],
      prevention: "Batasi konsumsi garam maksimal 1 sendok teh per hari dan perbanyak makan buah serta sayuran kaya kalium (pisang, bayam).",
      note: "Hipertensi dijuluki 'The Silent Killer' karena kerap tanpa gejala nyata di tahap awal."
    }
  },
  {
    id: "kardio-3",
    name: "Anemia Defisiensi Besi",
    category: "Kardiovaskular & Sirkulasi",
    desc: "Kurangnya sel darah merah sehat akibat kekurangan zat besi, sangat lazim terjadi pada remaja putri.",
    icon: "🧪",
    urgency: "Sedang / Konsultasi",
    urgencyColor: "amber",
    symptoms: ["Lemas & Cepat Lelah", "Sakit Kepala / Pusing", "Jantung Berdebar"],
    details: {
      gejala: "Prinsip 5L: Lemah, Letih, Lesu, Lelah, Lalai. Bibir dan kelopak mata bawah pucat, kuku rapuh, dan sering pusing saat berdiri.",
      medicines: ["Tablet Tambah Darah (TTD) / Sulfas Ferosus 1 tablet per minggu untuk remaja"],
      remedies: [
        "Konsumsi hati ayam, daging merah, bayam, brokoli, dan kacang-kacangan",
        "Minum vitamin C bersamaan dengan suplemen zat besi untuk meningkatkan penyerapan",
        "Hindari minum teh atau kopi langsung setelah makan karena tanin menghambat serapan zat besi"
      ],
      prevention: "Rutin minum Tablet Tambah Darah bagi remaja putri saat masa menstruasi.",
      note: "Pemeriksaan kadar Hemoglobin (Hb) bisa dilakukan dengan mudah di Puskesmas."
    }
  },

  // 4. Pernapasan
  {
    id: "resp-1",
    name: "Asma Bronkial",
    category: "Pernapasan",
    desc: "Penyempitan dan peradangan saluran napas kronis yang menyebabkan sesak napas dan mengi.",
    icon: "🌬️",
    urgency: "Darurat Medis",
    urgencyColor: "red",
    symptoms: ["Sesak Napas", "Batuk", "Nyeri Dada"],
    details: {
      gejala: "Sesak napas berulang, terdengar bunyi 'ngik-ngik' (mengi) saat menghembuskan napas, dada terasa tertekan, dan batuk kering di malam/pagi hari.",
      medicines: ["Inhaler Pelega (Salbutamol / Ventolin)", "Inhaler Pengontrol Steroid resep dokter"],
      remedies: [
        "Duduk tegak dan jangan panik saat serangan asma muncul",
        "Gunakan inhaler sesuai petunjuk dokter (1-2 hisapan)",
        "Jauhkan diri segera dari faktor pemicu (asap rokok, debu, bulu hewan, udara dingin)"
      ],
      prevention: "Gunakan masker saat membersihkan ruangan, hindari polusi, dan jaga kebersihan kasur dari tungau debu.",
      note: "Selalu bawa inhaler ke mana pun kamu bepergian jika memiliki riwayat asma."
    }
  },
  {
    id: "resp-2",
    name: "Faringitis Akut (Radang Tenggorokan)",
    category: "Pernapasan",
    desc: "Peradangan pada dinding faring yang menyebabkan rasa sakit dan perih saat menelan makanan atau air liur.",
    icon: "🗣️",
    urgency: "Ringan / Pantau Mandiri",
    urgencyColor: "emerald",
    symptoms: ["Sakit Tenggorokan", "Demam", "Batuk", "Sakit Kepala / Pusing"],
    details: {
      gejala: "Tenggorokan merah dan nyeri hebat saat menelan, amandel membengkak, suara serak, demam meriang.",
      medicines: ["Permen pelega tenggorokan (Degirol / Strepsils)", "Ibuprofen / Paracetamol", "Obat kumur antiseptik"],
      remedies: [
        "Kumur air garam hangat 3-4 kali sehari (1/2 sendok teh garam dalam segelas air hangat)",
        "Minum air putih hangat dengan campuran madu dan perasan lemon",
        "Hindari gorengan dan makanan bersantan pekat untuk sementara waktu"
      ],
      prevention: "Cuci tangan teratur dan jangan berbagi sedotan atau botol minum dengan teman.",
      note: "Jika muncul bercak nanah putih di amandel, periksakan ke dokter untuk kemungkinan infeksi bakteri Streptococcus."
    }
  },
  {
    id: "resp-3",
    name: "Rinitis Alergi (Bersin Pagi Hari)",
    category: "Pernapasan",
    desc: "Reaksi alergi saluran hidung terhadap alergen lingkungan seperti debu, serbuk sari, atau suhu dingin.",
    icon: "🤧",
    urgency: "Ringan / Pantau Mandiri",
    urgencyColor: "emerald",
    symptoms: ["Pilek / Hidung Tersumbat", "Batuk", "Sakit Kepala / Pusing"],
    details: {
      gejala: "Bersin beruntun di pagi hari, hidung meler berair jernih, hidung dan mata gatal, serta lingkaran hitam di bawah mata (allergic shiners).",
      medicines: ["Antihistamin (Cetirizine / Loratadine)", "Semprot hidung saline"],
      remedies: [
        "Cuci hidung dengan larutan saline (NaCl 0.9%) untuk membersihkan alergen",
        "Gunakan pakaian hangat atau jaket saat suhu dingin",
        "Ganti sprei dan sarung bantal minimal 1-2 minggu sekali"
      ],
      prevention: "Identifikasi dan hindari pemicu alergi spesifikmu.",
      note: "Rinitis alergi tidak menular ke orang lain karena merupakan reaksi sistem kekebalan tubuh sendiri."
    }
  },

  // 5. Pencernaan
  {
    id: "penc-1",
    name: "GERD & Asam Lambung Naik",
    category: "Pencernaan",
    desc: "Kelemahan katup esofagus bawah yang membuat asam lambung berbalik naik ke kerongkongan.",
    icon: "🔥",
    urgency: "Sedang / Konsultasi",
    urgencyColor: "amber",
    symptoms: ["Nyeri Ulu Hati / Perih Lambung", "Mual / Muntah", "Nyeri Dada", "Sakit Tenggorokan"],
    details: {
      gejala: "Sensasi terbakar di dada (heartburn), mulut terasa asam atau pahit, sering sendawa, rasa mengganjal di kerongkongan saat menelan.",
      medicines: ["Antasida (Mylanta/Polysilane)", "Penghambat Pompa Proton (Omeprazole/Lansoprazole resep dokter)"],
      remedies: [
        "Makan dengan porsi kecil tetapi lebih sering (misal 4-5 kali sehari)",
        "Jangan langsung berbaring atau tidur minimal 2-3 jam setelah makan",
        "Tinggikan posisi kepala saat tidur menggunakan bantal tambahan"
      ],
      prevention: "Hindari kopi, minuman bersoda, cokelat, makanan pedas, dan jangan merokok.",
      note: "Sensasi panas di dada akibat GERD terkadang mirip nyeri jantung, periksakan bila disertai sesak berat."
    }
  },
  {
    id: "penc-2",
    name: "Gastritis Akut (Maag)",
    category: "Pencernaan",
    desc: "Peradangan atau iritasi pada dinding mukosa lambung akibat telat makan atau stres tinggi.",
    icon: "🤢",
    urgency: "Ringan / Pantau Mandiri",
    urgencyColor: "emerald",
    symptoms: ["Nyeri Ulu Hati / Perih Lambung", "Mual / Muntah", "Nafsu Makan Hilang"],
    details: {
      gejala: "Nyeri perih menusuk di perut bagian atas, perut kembung dan begah setelah makan sedikit, mual hingga muntah cairan bening/kekuningan.",
      medicines: ["Antasida Doen kunyah 1 jam sebelum makan atau 2 jam setelah makan", "Sukralfat suspensi"],
      remedies: [
        "Makan teratur tepat waktu, jangan biarkan lambung kosong terlalu lama",
        "Konsumsi makanan lembut dan hangat seperti bubur ayam atau oatmeal",
        "Kompres hangat pada perut yang kram"
      ],
      prevention: "Kelola beban stres dan hindari konsumsi obat anti-nyeri NSAID tanpa resep.",
      note: "Maag yang dibiarkan menahun dapat berkembang menjadi tukak lambung (luka berdarah)."
    }
  },
  {
    id: "penc-3",
    name: "Gastroenteritis (Flu Perut / Diare Akut)",
    category: "Pencernaan",
    desc: "Infeksi lambung dan usus oleh bakteri atau virus yang memicu diare cair berulang.",
    icon: "💩",
    urgency: "Sedang / Konsultasi",
    urgencyColor: "amber",
    symptoms: ["Diare", "Mual / Muntah", "Demam", "Lemas & Cepat Lelah"],
    details: {
      gejala: "BAB cair lebih dari 3 kali sehari, kram perut melilit, muntah-muntah, dan rasa haus berlebihan tanda dehidrasi.",
      medicines: ["Oralit setiap kali selesai BAB cair", "Tablet Zinc 20 mg selama 10 hari", "Attapulgite pereda diare"],
      remedies: [
        "Fokus utama: Gantikan cairan tubuh yang hilang secepat mungkin dengan Oralit",
        "Makan makanan rendah serat (nasi putih, roti tawar, pisang)",
        "Hindari produk susu sapi dan makanan pedas selama masa pemulihan"
      ],
      prevention: "Selalu mencuci tangan dengan sabun sebelum memegang makanan dan pastikan air minum higienis.",
      note: "Waspadai tanda dehidrasi berat: mata cekung, kulit tidak elastis saat dicubit, dan air kencing sedikit atau pekat."
    }
  },

  // 6. Neurologi & Saraf
  {
    id: "neuro-1",
    name: "Migrain (Sakit Kepala Sebelah)",
    category: "Neurologi & Saraf",
    desc: "Gangguan saraf yang menyebabkan nyeri kepala berdenyut hebat di salah satu sisi kepala.",
    icon: "🤕",
    urgency: "Ringan / Pantau Mandiri",
    urgencyColor: "emerald",
    symptoms: ["Sakit Kepala / Pusing", "Mual / Muntah"],
    details: {
      gejala: "Sakit kepala berdenyut hebat di satu sisi, sangat sensitif terhadap cahaya terang dan suara bising (fotofobia/fonofobia), terkadang diawali kilatan cahaya di mata (aura).",
      medicines: ["Paracetamol", "Ibuprofen", "Kombinasi Paracetamol + Kafein"],
      remedies: [
        "Istirahat di ruangan yang gelap, hening, dan sejuk",
        "Kompres dingin atau es batu di kening atau belakang leher",
        "Pijat lembut area pelipis dan minum air putih hangat"
      ],
      prevention: "Catat pemicu migrain pribadimu (kurang tidur, MSG tinggi, aroma menyengat, atau perubahan cuaca).",
      note: "Segera ke dokter bila sakit kepala terasa seperti 'petir menyambar' yang belum pernah dialami sebelumnya."
    }
  },
  {
    id: "neuro-2",
    name: "Tension Headache (Sakit Kepala Tegang)",
    category: "Neurologi & Saraf",
    desc: "Jenis sakit kepala paling umum yang terasa seperti ada tali kencang mengikat sekeliling kepala.",
    icon: "🧠",
    urgency: "Ringan / Pantau Mandiri",
    urgencyColor: "emerald",
    symptoms: ["Sakit Kepala / Pusing", "Lemas & Cepat Lelah"],
    details: {
      gejala: "Rasa tertekan konstan di dahi, pelipis, dan belakang kepala, disertai ketegangan pada otot leher dan pundak akibat menatap layar terlalu lama.",
      medicines: ["Paracetamol 500 mg", "Balsem atau minyak angin aromaterapi di pelipis"],
      remedies: [
        "Lakukan peregangan leher dan bahu setiap 1 jam belajar",
        "Terapkan aturan 20-20-20 untuk mata saat di depan komputer/HP",
        "Mandi dengan air hangat untuk mengendurkan otot-otot yang kaku"
      ],
      prevention: "Perbaiki postur duduk belajar dan cukupi tidur malam minimal 7-8 jam.",
      note: "Sering dipicu oleh kebiasaan begadang dan stres menjelang ujian sekolah."
    }
  },
  {
    id: "neuro-3",
    name: "Vertigo Posisi Paroksismal Jinak (BPPV)",
    category: "Neurologi & Saraf",
    desc: "Gangguan telinga bagian dalam yang menyebabkan sensasi diri atau ruangan terasa berputar-putar hebat.",
    icon: "💫",
    urgency: "Sedang / Konsultasi",
    urgencyColor: "amber",
    symptoms: ["Sakit Kepala / Pusing", "Mual / Muntah"],
    details: {
      gejala: "Sensasi ruangan berputar mendadak saat mengubah posisi kepala (misal saat menoleh, bangun tidur, atau membungkuk), mual hebat, kehilangan keseimbangan.",
      medicines: ["Betahistine Mesylate (sesuai anjuran dokter)", "Dimenhidrinat pereda mual"],
      remedies: [
        "Segera duduk atau berpegangan pada benda kokoh agar tidak jatuh",
        "Lakukan manuver Epley atau latihan Brandt-Daroff sesuai panduan tenaga medis",
        "Hindari gerakan kepala yang terlalu mendadak"
      ],
      prevention: "Gunakan dua bantal saat tidur dan bangun perlahan di pagi hari.",
      note: "Vertigo bukan penyakit mata, melainkan gangguan pusat keseimbangan di telinga dalam."
    }
  },

  // 7. Kulit & Estetika
  {
    id: "kulit-1",
    name: "Acne Vulgaris (Jerawat Remaja)",
    category: "Kulit & Estetika",
    desc: "Penyumbatan pori-pori kulit oleh minyak berlebih dan sel kulit mati yang terinfeksi bakteri Cutibacterium acnes.",
    icon: "✨",
    urgency: "Ringan / Pantau Mandiri",
    urgencyColor: "emerald",
    symptoms: ["Wajah Berjerawat", "Gatal / Ruam Kulit"],
    details: {
      gejala: "Muncul komedo putih, komedo hitam, papul merah, atau pustul bernanah di wajah, punggung, atau dada, sering kali terasa perih atau berdenyut.",
      medicines: ["Salep Salicylic Acid 2%", "Benzoyl Peroxide 2.5%", "Gel Clindamycin untuk jerawat radang"],
      remedies: [
        "Cuci muka 2 kali sehari dengan pembersih wajah berformula lembut tanpa scrub kasar",
        "JANGAN memencet atau menusuk jerawat dengan tangan kotor karena bisa memicu bopeng permanen",
        "Ganti sarung bantal minimal sekali seminggu"
      ],
      prevention: "Gunakan tabir surya (sunscreen) berlabel non-comedogenic dan kurangi konsumsi makanan tinggi gula/susu berlebih.",
      note: "Jerawat adalah bagian normal dari lonjakan hormon pubertas remaja."
    }
  },
  {
    id: "kulit-2",
    name: "Dermatitis Kontak Alergi",
    category: "Kulit & Estetika",
    desc: "Reaksi radang kulit akibat kontak langsung dengan zat pemicu alergi seperti sabun wangi, kosmetik, perhiasan nikel, atau tanaman.",
    icon: "🌸",
    urgency: "Ringan / Pantau Mandiri",
    urgencyColor: "emerald",
    symptoms: ["Gatal / Ruam Kulit"],
    details: {
      gejala: "Kulit memerah, terasa gatal menyengat, kering bersisik, atau melepuh di area yang bersentuhan dengan bahan pemicu.",
      medicines: ["Krim Hidrokortison 1%", "Antihistamin oral pereda gatal"],
      remedies: [
        "Segera bilas kulit dengan air mengalir dan sabun lembut tanpa pewangi",
        "Oleskan pelembap hipoalergenik tebal untuk memperbaiki skin barrier",
        "Kompres dingin untuk meredakan rasa gatal menyengat"
      ],
      prevention: "Hentikan pemakaian produk kosmetik atau sabun baru yang dicurigai.",
      note: "Jangan garuk area yang gatal agar tidak meninggalkan bekas hiperpigmentasi hitam."
    }
  },

  // 8. Kesehatan Remaja
  {
    id: "remaja-1",
    name: "Dismenore Primer (Nyeri Haid Berat)",
    category: "Kesehatan Remaja",
    desc: "Kram dan nyeri hebat di perut bagian bawah menjelang atau selama periode menstruasi akibat pelepasan prostaglandin.",
    icon: "🩸",
    urgency: "Ringan / Pantau Mandiri",
    urgencyColor: "emerald",
    symptoms: ["Nyeri Haid Berat", "Mual / Muntah", "Sakit Kepala / Pusing", "Mood Cepat Berubah"],
    details: {
      gejala: "Kram berdenyut di perut bawah menjalar ke pinggang dan paha, lemas, pusing, emosi sensitif, mual di hari pertama dan kedua haid.",
      medicines: ["Asam Mefenamat 500 mg", "Ibuprofen 400 mg (diminum sesaat sebelum atau saat kram mulai terasa)"],
      remedies: [
        "Kompres botol kaca berisi air hangat atau koyo hangat pada perut bawah",
        "Minum air jahe hangat atau teh kunyit asam",
        "Lakukan peregangan yoga ringan posisi Child's Pose untuk merelaksasi panggul"
      ],
      prevention: "Rutin berolahraga aerobik di luar siklus haid dan hindari konsumsi kafein berlebih saat menjelang menstruasi.",
      note: "Jika nyeri haid sangat menyiksa hingga pingsan atau tidak mempan obat, periksakan ke dokter kandungan untuk skrining endometriosis."
    }
  },
  {
    id: "remaja-2",
    name: "Sindrom Kelelahan Kronis Remaja (Fatigue)",
    category: "Kesehatan Remaja",
    desc: "Kondisi kelelahan fisik ekstrem yang menetap dan tidak membaik meski sudah istirahat cukup.",
    icon: "🔋",
    urgency: "Sedang / Konsultasi",
    urgencyColor: "amber",
    symptoms: ["Lemas & Cepat Lelah", "Sulit Tidur / Insomnia", "Sakit Kepala / Pusing"],
    details: {
      gejala: "Tubuh terasa berat seperti tidak bertenaga sepanjang hari, kabut otak (brain fog), kesulitan mengingat materi pelajaran, nyeri otot ringan.",
      medicines: ["Multivitamin B Kompleks, Vitamin D3, dan Zinc"],
      remedies: [
        "Evaluasi pola gizi harian (apakah cukup protein dan kalori bergizi)",
        "Terapkan istirahat berkala dan jangan begadang untuk urusan yang tidak mendesak",
        "Cek darah lengkap di Puskesmas untuk mengecek kadar hemoglobin dan tiroid"
      ],
      prevention: "Jaga keseimbangan antara ambisi belajar, aktivitas ekstrakurikuler, dan waktu rekreasi.",
      note: "Kelelahan yang berkepanjangan adalah sinyal tubuhmu meminta perlambatan tempo."
    }
  },

  // 9. Gizi & Metabolisme
  {
    id: "gizi-1",
    name: "Dehidrasi Ringan hingga Sedang",
    category: "Gizi & Metabolisme",
    desc: "Kondisi tubuh kehilangan lebih banyak cairan dan elektrolit dibandingkan yang masuk ke dalam tubuh.",
    icon: "💧",
    urgency: "Ringan / Pantau Mandiri",
    urgencyColor: "emerald",
    symptoms: ["Sakit Kepala / Pusing", "Lemas & Cepat Lelah", "Sulit Tidur / Insomnia"],
    details: {
      gejala: "Warna air seni kuning pekat atau jingga, bibir dan mulut terasa kering pecah-pecah, sakit kepala ringan, jarang buang air kecil, kulit kering.",
      medicines: ["Air mineral alami", "Larutan Oralit atau air kelapa segar"],
      remedies: [
        "Minum air putih sedikit demi sedikit secara konsisten (jangan langsung meneguk sebotol besar sekaligus)",
        "Konsumsi buah dengan kadar air tinggi seperti semangka, melon, jeruk, dan mentimun",
        "Hindari minuman manis boba, kopi, dan minuman energi yang justru memperparah dehidrasi"
      ],
      prevention: "Bawa botol minum pribadi ke sekolah dan pasang target 8 gelas (2 liter) air per hari.",
      note: "Gunakan warna air kencing sebagai indikator: bening atau kuning muda berarti tubuhmu terhidrasi dengan baik!"
    }
  }
];
