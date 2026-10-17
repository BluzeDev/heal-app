// Bank 100 Soal Singkat Kesehatan & Mindfulness
export const bankSoal = [
  { id: 1, soal: "Berapa jam waktu tidur ideal yang disarankan untuk remaja setiap malam?", opsi: ["4-5 jam", "6 jam", "8-10 jam", "12 jam lebih"], jawaban: 2 },
  { id: 2, soal: "Apa manfaat utama dari teknik pernapasan dalam (deep breathing)?", opsi: ["Meningkatkan kecemasan", "Menurunkan detak jantung & menenangkan pikiran", "Membuat tubuh lemas", "Menambah nafsu makan"], jawaban: 1 },
  { id: 3, soal: "Vitamin apa yang paling banyak diserap tubuh dari paparan sinar matahari pagi?", opsi: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], jawaban: 3 },
  { id: 4, soal: "Manakah yang merupakan gejala umum dari stres berlebih?", opsi: ["Sakit kepala & sulit tidur", "Tubuh terasa sangat ringan", "Sering tertawa terbahak-bahak", "Nafsu makan hilang total selamanya"], jawaban: 0 },
  { id: 5, soal: "Apa yang dimaksud dengan 'Mindfulness'?", opsi: ["Memikirkan masa lalu terus-menerus", "Fasih berbahasa asing", "Kesadaran penuh pada saat ini tanpa menghakimi", "Berolahraga maraton setiap hari"], jawaban: 2 },
  { id: 6, soal: "Berapa gelas air putih yang dianjurkan untuk diminum setiap hari secara umum?", opsi: ["2 gelas", "4 gelas", "8 gelas", "20 gelas"], jawaban: 2 },
  { id: 7, soal: "Apa dampak positif dari mencatat suasana hati (mood journaling)?", opsi: ["Mengenali pola emosi diri", "Membuat memori hilang", "Menaikkan berat badan", "Membuang waktu percuma"], jawaban: 0 },
  { id: 8, soal: "Manakah makanan yang baik untuk menjaga kesehatan otak dan suasana hati?", opsi: ["Makanan cepat saji berminyak", "Sayuran hijau, buah, & kacang-kacangan", "Minuman bersoda tinggi gula", "Makanan instan berpengawet"], jawaban: 1 },
  { id: 9, soal: "Apa yang sebaiknya dilakukan saat menghadapi kecemasan yang mendadak?", opsi: ["Panik dan berlari", "Mengatur napas perlahan & grounding", "Marah kepada orang sekitar", "Menutup diri selamanya"], jawaban: 1 },
  { id: 10, soal: "Aktivitas fisik ringan seperti berjalan kaki selama berapa menit sehari sudah cukup menyehatkan?", opsi: ["5 menit", "30 menit", "5 jam", "Tidak perlu olahraga"], jawaban: 1 },
  // (Catatan: Anda bisa memperluas array ini hingga 100 soal dengan pola serupa)
];

// Fungsi untuk mengecek dan memperbarui streak harian
export const checkAndUpdateStreak = (username) => {
  if (!username) return 0;
  const streakKey = `heal_streak_${username}`;
  const lastLoginKey = `heal_last_login_${username}`;
  
  const today = new Date().toDateString();
  const lastLogin = localStorage.getItem(lastLoginKey);
  let currentStreak = parseInt(localStorage.getItem(streakKey) || '0', 10);

  if (lastLogin === today) {
    // Sudah dihitung hari ini, kembalikan streak saat ini
    return currentStreak;
  }

  if (lastLogin) {
    const lastDate = new Date(lastLogin);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Login berturut-turut keesokan harinya
      currentStreak += 1;
    } else if (diffDays > 1) {
      // Terlewat 1 hari atau lebih, streak reset ke 1
      currentStreak = 1;
    }
  } else {
    // Pertama kali login
    currentStreak = 1;
  }

  localStorage.setItem(streakKey, currentStreak);
  localStorage.setItem(lastLoginKey, today);
  return currentStreak;
};