import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import SkeletonCard from './SkeletonCard';
import { triggerFeedback } from './utils/feedback';
import { compressImageFile } from './utils/imageCompressor';
import { 
  User, School, BookOpen, Phone, Music2, 
  ArrowLeft, Edit3, Camera, Save, X, ExternalLink 
} from 'lucide-react';

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function ProfileScreen({ currentUser, viewUser, onBack, isDarkMode, onProfileUpdated }) {
  const isSelf = !viewUser || viewUser === currentUser;
  const targetUser = isSelf ? currentUser : viewUser;

  const [profileData, setProfileData] = useState({
    username: targetUser,
    namaLengkap: '',
    namaPanggilan: targetUser,
    sekolahAsal: '',
    kelas: '',
    bio: 'Menjaga kesehatan fisik dan mental setiap hari. 🌸',
    noHp: '',
    usernameIg: '',
    usernameTiktok: '',
    avatar: '🌸',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Edit State
  const [editAvatar, setEditAvatar] = useState('🌸');
  const [editNamaLengkap, setEditNamaLengkap] = useState('');
  const [editNamaPanggilan, setEditNamaPanggilan] = useState('');
  const [editSekolahAsal, setEditSekolahAsal] = useState('');
  const [editKelas, setEditKelas] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editNoHp, setEditNoHp] = useState('');
  const [editUsernameIg, setEditUsernameIg] = useState('');
  const [editUsernameTiktok, setEditUsernameTiktok] = useState('');

  const avatarCategories = {
    "Tanpa Foto (Inisial)": ['initial_auto'],
    "Laki-Laki 👦": ['👦', '👨', '🧑', '🧔', '🧑‍💻', '🦸‍♂️', '🧙‍♂️', '⚽', '🏀', '🎮'],
    "Perempuan 👧": ['👧', '👩', '🧑‍🦰', '👩‍🦰', '🧕', '🦸‍♀️', '🧚‍♀️', '🌸', '💖', '🎀'],
    "Hewan Lucu 🐾": ['🐱', '🐶', '🦊', '🐼', '🦁', '🐸', '🐰', '🐨', '🐯', '🐧'],
    "Hobi & Objek ✨": ['🚀', '🎨', '🎧', '🎸', '📚', '☕', '🌟', '🎯', '🌿', '💻']
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userDocRef = doc(db, 'data_login', targetUser);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          const cleanData = {
            username: targetUser,
            namaLengkap: data.nama_lengkap || data.namaLengkap || '',
            namaPanggilan: data.nama_panggilan || data.namaPanggilan || targetUser,
            sekolahAsal: data.sekolah_asal || data.sekolahAsal || '',
            kelas: data.kelas || '',
            bio: data.bio || 'Menjaga kesehatan fisik dan mental setiap hari. 🌸',
            noHp: data.no_hp || data.noHp || data.noWhatsapp || '',
            usernameIg: data.username_ig || data.usernameIg || '',
            usernameTiktok: data.username_tiktok || data.usernameTiktok || '',
            avatar: data.avatar || '🌸',
          };
          setProfileData(cleanData);
          setEditAvatar(cleanData.avatar);
          setEditNamaLengkap(cleanData.namaLengkap);
          setEditNamaPanggilan(cleanData.namaPanggilan);
          setEditSekolahAsal(cleanData.sekolahAsal);
          setEditKelas(cleanData.kelas);
          setEditBio(cleanData.bio);
          setEditNoHp(cleanData.noHp);
          setEditUsernameIg(cleanData.usernameIg);
          setEditUsernameTiktok(cleanData.usernameTiktok);
        } else {
          setProfileData({
            username: targetUser,
            namaLengkap: targetUser,
            namaPanggilan: targetUser,
            sekolahAsal: '',
            kelas: '',
            bio: 'Menjaga kesehatan fisik dan mental setiap hari. 🌸',
            noHp: '',
            usernameIg: '',
            usernameTiktok: '',
            avatar: '🌸',
          });
        }
      } catch (err) {
        console.error("Gagal load profil:", err);
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };

    if (targetUser) {
      fetchProfile();
    }
  }, [targetUser]);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImageFile(file, 400, 400, 0.75);
      setEditAvatar(compressedDataUrl);
    } catch (err) {
      alert("Gagal memproses foto. Pastikan format file gambar valid.");
    }
  };

  const handleSaveProfile = async () => {
    triggerFeedback();
    setSaving(true);
    try {
      const userDocRef = doc(db, 'data_login', currentUser);
      const updatedFields = {
        avatar: editAvatar,
        nama_lengkap: editNamaLengkap.trim(),
        namaLengkap: editNamaLengkap.trim(),
        nama_panggilan: editNamaPanggilan.trim(),
        namaPanggilan: editNamaPanggilan.trim(),
        sekolah_asal: editSekolahAsal.trim(),
        sekolahAsal: editSekolahAsal.trim(),
        kelas: editKelas.trim(),
        bio: editBio.trim() || 'Menjaga kesehatan fisik dan mental setiap hari. 🌸',
        no_hp: editNoHp.trim(),
        noHp: editNoHp.trim(),
        username_ig: editUsernameIg.replace('@', '').trim(),
        usernameIg: editUsernameIg.replace('@', '').trim(),
        username_tiktok: editUsernameTiktok.replace('@', '').trim(),
        usernameTiktok: editUsernameTiktok.replace('@', '').trim(),
        terakhir_diperbarui: new Date().toISOString()
      };

      await updateDoc(userDocRef, updatedFields);

      setProfileData({
        ...profileData,
        ...updatedFields
      });
      setIsEditing(false);

      if (onProfileUpdated) {
        onProfileUpdated(updatedFields);
      }
      alert("Profil berhasil diperbarui! ✨");
    } catch (err) {
      console.error("Gagal update profil:", err);
      alert("Gagal menyimpan perubahan profil! Periksa koneksi internetmu.");
    } finally {
      setSaving(false);
    }
  };

  const renderAvatarContent = (avatarVal, usernameVal) => {
    if (avatarVal && (avatarVal.startsWith('data:image') || avatarVal.startsWith('http') || avatarVal.startsWith('blob:'))) {
      return <img src={avatarVal} alt="Profile" className="w-full h-full object-cover rounded-full" />;
    }
    if (avatarVal === 'initial_auto') {
      const initial = usernameVal ? usernameVal.charAt(0).toUpperCase() : 'U';
      return (
        <span className="w-full h-full rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center font-black text-3xl shadow-inner">
          {initial}
        </span>
      );
    }
    return avatarVal || '🌸';
  };

  const formatWaUrl = (noHp, name) => {
    if (!noHp) return null;
    let clean = noHp.replace(/[^0-9]/g, '');
    if (clean.startsWith('08')) {
      clean = '628' + clean.slice(2);
    } else if (clean.startsWith('8')) {
      clean = '62' + clean;
    }
    const template = `Halo ${name || 'Sobat HEAL'}, salam kenal! Aku melihat profilmu di aplikasi HEAL...`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(template)}`;
  };

  return (
    <div className={`flex-1 flex flex-col min-h-screen pb-24 transition-colors duration-300 ${
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
              isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-5 h-5 text-pink-500" />
          </button>
          <h1 className="text-xl font-black tracking-wide">
            {isSelf ? (isEditing ? 'Edit Profil' : 'Profil Saya') : `Profil ${profileData.namaPanggilan || targetUser}`}
          </h1>
        </div>

        {isSelf && !isEditing && (
          <button 
            onClick={() => { triggerFeedback(); setIsEditing(true); }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-pink-500 text-white shadow-md hover:bg-pink-600 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profil</span>
          </button>
        )}
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-4">
        {loading ? (
          <SkeletonCard isDarkMode={isDarkMode} />
        ) : !isEditing ? (
          /* ───────────── MODE LIHAT PROFIL ───────────── */
          <div className={`rounded-3xl p-6 shadow-md border text-center space-y-5 ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'
          }`}>
            <div className="relative inline-block mx-auto">
              <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center text-5xl shadow-md mx-auto overflow-hidden ${
                isDarkMode ? 'bg-gray-800 border-pink-500/50' : 'bg-pink-50 border-pink-300'
              }`}>
                {renderAvatarContent(profileData.avatar, profileData.namaPanggilan || profileData.username)}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black">{profileData.namaLengkap || profileData.username}</h2>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full font-bold bg-pink-50 text-pink-600 border border-pink-200 dark:bg-pink-950/50 dark:text-pink-300">
                  @{profileData.namaPanggilan || profileData.username}
                </span>
                {profileData.sekolahAsal && (
                  <span className="px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-pink-500" /> {profileData.sekolahAsal}
                  </span>
                )}
                {profileData.kelas && (
                  <span className="px-3 py-1 rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Kelas {profileData.kelas}
                  </span>
                )}
              </div>

              {/* Bio */}
              <p className={`text-xs p-3.5 rounded-2xl border max-w-md mx-auto italic leading-relaxed ${
                isDarkMode ? 'bg-gray-800/80 border-gray-700 text-gray-300' : 'bg-pink-50/50 border-pink-100 text-gray-600'
              }`}>
                "{profileData.bio}"
              </p>
            </div>

            {/* Social & Kontak Links */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-left">
                Kontak & Media Sosial
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {/* WhatsApp */}
                {profileData.noHp ? (
                  <a
                    href={formatWaUrl(profileData.noHp, profileData.namaLengkap || profileData.namaPanggilan)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all text-xs font-bold dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300"
                  >
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-500" />
                      <span>{profileData.noHp}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-gray-50 text-gray-400 border border-gray-200 text-xs dark:bg-gray-800/50 dark:border-gray-700">
                    <Phone className="w-4 h-4 opacity-50" />
                    <span>WhatsApp belum diisi</span>
                  </div>
                )}

                {/* Instagram */}
                {profileData.usernameIg ? (
                  <a
                    href={`https://instagram.com/${profileData.usernameIg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all text-xs font-bold dark:bg-purple-950/40 dark:border-purple-900 dark:text-purple-300"
                  >
                    <div className="flex items-center gap-2">
                      <InstagramIcon className="w-4 h-4 text-purple-500" />
                      <span>@{profileData.usernameIg}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-gray-50 text-gray-400 border border-gray-200 text-xs dark:bg-gray-800/50 dark:border-gray-700">
                    <InstagramIcon className="w-4 h-4 opacity-50" />
                    <span>Instagram belum diisi</span>
                  </div>
                )}

                {/* TikTok */}
                {profileData.usernameTiktok ? (
                  <a
                    href={`https://tiktok.com/@${profileData.usernameTiktok}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200 transition-all text-xs font-bold dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 col-span-1 sm:col-span-2"
                  >
                    <div className="flex items-center gap-2">
                      <Music2 className="w-4 h-4 text-pink-500" />
                      <span>@{profileData.usernameTiktok}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-gray-50 text-gray-400 border border-gray-200 text-xs dark:bg-gray-800/50 dark:border-gray-700 col-span-1 sm:col-span-2">
                    <Music2 className="w-4 h-4 opacity-50" />
                    <span>TikTok belum diisi</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ───────────── MODE EDIT PROFIL ───────────── */
          <div className={`rounded-3xl p-6 shadow-xl border space-y-5 animate-fadeIn ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
              <h2 className="font-extrabold text-base flex items-center gap-2">
                <span>✏️</span> Edit Informasi Profil
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-gray-400 hover:text-gray-600 font-bold"
              >
                Batal
              </button>
            </div>

            {/* Avatar Preview & Upload */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="relative group">
                <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-4xl shadow-md overflow-hidden ${
                  isDarkMode ? 'bg-gray-800 border-pink-500/50' : 'bg-pink-50 border-pink-300'
                }`}>
                  {renderAvatarContent(editAvatar, editNamaPanggilan || editNamaLengkap)}
                </div>
                <label className="absolute bottom-0 right-0 bg-pink-500 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-pink-600 transition-all">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                </label>
              </div>
              <p className="text-[11px] text-gray-400 font-medium text-center">
                Klik ikon kamera untuk mengunggah foto profil dari galeri HP atau pilih preset emoji di bawah.
              </p>
            </div>

            {/* Pilihan Preset Emoji */}
            <div className="space-y-2 border-t pt-3 dark:border-gray-800">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block">
                Atau Pilih Preset Avatar HEAL:
              </label>
              <div className="space-y-2">
                {Object.entries(avatarCategories).map(([categoryName, icons]) => (
                  <div key={categoryName} className="space-y-1">
                    <span className="text-[10px] font-bold text-pink-500">{categoryName}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {icons.map((icon, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { triggerFeedback(); setEditAvatar(icon); }}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-all ${
                            editAvatar === icon
                              ? 'bg-pink-500 text-white border-pink-500 scale-110 shadow-sm'
                              : isDarkMode
                              ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-200'
                              : 'bg-gray-50 border-gray-200 hover:bg-pink-50 text-gray-700'
                          }`}
                        >
                          {icon === 'initial_auto' ? '🅰️' : icon}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Forms */}
            <div className="space-y-3.5 border-t pt-3 dark:border-gray-800">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-pink-500" /> Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editNamaLengkap}
                  onChange={(e) => setEditNamaLengkap(e.target.value)}
                  placeholder="Contoh: Riyu Buyung"
                  className="w-full border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 p-2.5 rounded-2xl outline-none focus:border-pink-400 text-xs transition-all"
                />
              </div>

              {/* Nama Panggilan */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-pink-500" /> Nama Panggilan (Username)
                </label>
                <input
                  type="text"
                  value={editNamaPanggilan}
                  onChange={(e) => setEditNamaPanggilan(e.target.value)}
                  placeholder="Contoh: Riyu"
                  className="w-full border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 p-2.5 rounded-2xl outline-none focus:border-pink-400 text-xs transition-all"
                />
              </div>

              {/* Asal Sekolah */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-pink-500" /> Asal Sekolah
                </label>
                <input
                  type="text"
                  value={editSekolahAsal}
                  onChange={(e) => setEditSekolahAsal(e.target.value)}
                  placeholder="Contoh: SMAN 4 Bojonegoro"
                  className="w-full border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 p-2.5 rounded-2xl outline-none focus:border-pink-400 text-xs transition-all"
                />
              </div>

              {/* Kelas (Field Opsional Khusus Edit Profil) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-pink-500" /> Kelas (Opsional)
                  </span>
                  <span className="text-[10px] text-gray-400">Khusus Edit Profil</span>
                </label>
                <input
                  type="text"
                  value={editKelas}
                  onChange={(e) => setEditKelas(e.target.value)}
                  placeholder="Contoh: XII IPA 2 / XI IPS"
                  className="w-full border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 p-2.5 rounded-2xl outline-none focus:border-pink-400 text-xs transition-all"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Bio / Kutipan Semangat Kamu
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tuliskan bio singkat tentang dirimu..."
                  className="w-full border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 p-2.5 rounded-2xl outline-none focus:border-pink-400 text-xs transition-all resize-none"
                />
              </div>

              {/* Nomor HP / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" /> Nomor HP / WhatsApp (Awalan 08...)
                </label>
                <input
                  type="tel"
                  value={editNoHp}
                  onChange={(e) => setEditNoHp(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 p-2.5 rounded-2xl outline-none focus:border-pink-400 text-xs transition-all"
                />
              </div>

              {/* Username Instagram */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                  <InstagramIcon className="w-3.5 h-3.5 text-purple-500" /> Username Instagram (Tanpa @)
                </label>
                <input
                  type="text"
                  value={editUsernameIg}
                  onChange={(e) => setEditUsernameIg(e.target.value)}
                  placeholder="Contoh: riyubuyung"
                  className="w-full border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 p-2.5 rounded-2xl outline-none focus:border-pink-400 text-xs transition-all"
                />
              </div>

              {/* Username TikTok */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                  <Music2 className="w-3.5 h-3.5 text-pink-500" /> Username TikTok (Tanpa @)
                </label>
                <input
                  type="text"
                  value={editUsernameTiktok}
                  onChange={(e) => setEditUsernameTiktok(e.target.value)}
                  placeholder="Contoh: riyutiktok"
                  className="w-full border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 p-2.5 rounded-2xl outline-none focus:border-pink-400 text-xs transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 rounded-2xl border font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveProfile}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Profil'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}