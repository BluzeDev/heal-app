/**
 * badgeSystem.js — Sistem Lencana Apresiasi (Gamifikasi) HEAL
 * Menghitung dan menyajikan status 4 lencana otomatis berdasarkan profil & aktivitas pengguna:
 * 1. ✅ Verified Sobat HEAL: Lengkapi seluruh kolom Edit Profil
 * 2. 🫂 Pendengar Empati: Berpartisipasi di Voicing Rights (posting / beri reaksi empati)
 * 3. 📚 Pembaca Medis: Membaca >= 3 topik penyakit di Bank Penyakit
 * 4. 💧 Pejuang Sehat: Menggunakan Kalkulator Kesehatan / Daily Wellness
 */

export function calculateUserBadges(userData = {}) {
  // 1. Cek Kelengkapan Profil
  const namaLengkap = userData.nama_lengkap || userData.namaLengkap || '';
  const namaPanggilan = userData.nama_panggilan || userData.namaPanggilan || '';
  const sekolahAsal = userData.sekolah_asal || userData.sekolahAsal || '';
  const kelas = userData.kelas || '';
  const bio = userData.bio || '';
  const noHp = userData.no_hp || userData.noHp || userData.noWhatsapp || '';
  const ig = userData.username_ig || userData.usernameIg || '';
  const tiktok = userData.username_tiktok || userData.usernameTiktok || '';

  const isVerified = Boolean(
    namaLengkap.trim() &&
    namaPanggilan.trim() &&
    sekolahAsal.trim() &&
    kelas.trim() &&
    bio.trim() &&
    noHp.trim() &&
    ig.trim() &&
    tiktok.trim()
  );

  // 2. Cek Pendengar Empati
  const isEmpathy = Boolean(
    userData.has_empathy ||
    userData.hasEmpathy ||
    userData.has_voiced ||
    userData.hasVoiced ||
    userData.voicing_count > 0 ||
    userData.empathy_count > 0
  );

  // 3. Cek Pembaca Medis (minimal 3 topik penyakit)
  const readCount = Number(userData.read_diseases_count || userData.readDiseasesCount || 0);
  const isMedicalReader = readCount >= 3;

  // 4. Cek Pejuang Sehat
  const isHealthFighter = Boolean(
    userData.has_health_calc ||
    userData.hasHealthCalc ||
    userData.health_metrics ||
    userData.last_calculated_bmi
  );

  return [
    {
      id: 'verified',
      title: 'Verified Sobat HEAL',
      icon: '✅',
      unlocked: isVerified,
      activeColor: 'from-emerald-500 to-teal-600',
      borderColor: 'border-emerald-400',
      badgeText: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      glowColor: 'shadow-emerald-500/30',
      desc: 'Profil lengkap dan terverifikasi dengan identitas sekolah serta media sosial aktif.',
      howToUnlock: 'Lengkapi semua data di Edit Profil (Nama Lengkap, Panggilan, Sekolah, Kelas, Bio, No HP, IG, dan TikTok).'
    },
    {
      id: 'empathy',
      title: 'Pendengar Empati',
      icon: '🫂',
      unlocked: isEmpathy,
      activeColor: 'from-purple-500 to-indigo-600',
      borderColor: 'border-purple-400',
      badgeText: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      glowColor: 'shadow-purple-500/30',
      desc: 'Sobat peduli yang aktif berbagi cerita dan memberikan reaksi empati bagi teman-teman di Voicing Rights.',
      howToUnlock: 'Posting cerita atau berikan reaksi peluk/semangat pada cerita teman di Voicing Rights.'
    },
    {
      id: 'medical',
      title: 'Pembaca Medis',
      icon: '📚',
      unlocked: isMedicalReader,
      activeColor: 'from-amber-500 to-orange-600',
      borderColor: 'border-amber-400',
      badgeText: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      glowColor: 'shadow-amber-500/30',
      desc: `Eksplorator literasi medis yang telah membaca ${readCount >= 3 ? readCount : 3} topik penyakit di Bank Penyakit.`,
      howToUnlock: 'Buka dan baca minimal 3 topik penyakit di ensiklopedia Bank Penyakit.'
    },
    {
      id: 'fighter',
      title: 'Pejuang Sehat',
      icon: '💧',
      unlocked: isHealthFighter,
      activeColor: 'from-cyan-500 to-blue-600',
      borderColor: 'border-cyan-400',
      badgeText: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      glowColor: 'shadow-cyan-500/30',
      desc: 'Remaja sadar kesehatan yang rutin memantau IMT, kebutuhan kalori, dan hidrasi harian.',
      howToUnlock: 'Gunakan Kalkulator Kesehatan (IMT/BMR/Air) di menu My Health Monitor.'
    }
  ];
}
