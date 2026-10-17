import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import SkeletonCard from './SkeletonCard';
import { triggerFeedback } from './utils/feedback';

export default function ProfileScreen({ currentUser, viewUser, onBack, isDarkMode }) {
  const isSelf = !viewUser || viewUser === currentUser;
  const targetUser = isSelf ? currentUser : viewUser;

  const [profileData, setProfileData] = useState({
    username: targetUser,
    bio: 'Menjaga kesehatan fisik dan mental setiap hari. 🌸',
    avatar: '🌸',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('🌸');
  const [loading, setLoading] = useState(true);

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
          setProfileData(data);
          setEditBio(data.bio || 'Menjaga kesehatan fisik dan mental setiap hari. 🌸');
          setEditAvatar(data.avatar || '🌸');
        } else {
          setProfileData({
            username: targetUser,
            bio: 'Menjaga kesehatan fisik dan mental setiap hari. 🌸',
            avatar: '🌸',
          });
          setEditBio('Menjaga kesehatan fisik dan mental setiap hari. 🌸');
          setEditAvatar('🌸');
        }
      } catch (err) {
        console.error("Gagal load profil:", err);
      } finally {
        setTimeout(() => setLoading(false), 500); // Jeda untuk skeleton
      }
    };

    if (targetUser) {
      fetchProfile();
    }
  }, [targetUser]);

  const handleCompressedImageUpload = (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Mohon unggah file gambar yang valid!");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran gambar terlalu besar! Maksimal 10 MB.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        callback(compressedDataUrl);
      };
    };
  };

  const handleSaveProfile = async () => {
    triggerFeedback();
    try {
      const userDocRef = doc(db, 'data_login', currentUser);
      await updateDoc(userDocRef, {
        bio: editBio,
        avatar: editAvatar
      });

      setProfileData({
        ...profileData,
        bio: editBio,
        avatar: editAvatar
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Gagal update profil:", err);
      alert("Gagal menyimpan perubahan profil! Pastikan koneksi atau Rules Firestore aman.");
    }
  };

  const renderAvatarContent = (avatarVal, usernameVal) => {
    if (avatarVal && (avatarVal.startsWith('data:image') || avatarVal.startsWith('http') || avatarVal.startsWith('blob:'))) {
      return <img src={avatarVal} alt="Profile" className="w-full h-full object-cover rounded-full" />;
    }
    if (avatarVal === 'initial_auto') {
      const initial = usernameVal ? usernameVal.charAt(0).toUpperCase() : 'U';
      return (
        <span className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-black text-3xl shadow-inner">
          {initial}
        </span>
      );
    }
    return avatarVal;
  };

  return (
    <div className={`flex-1 flex flex-col min-h-screen pb-12 transition-colors duration-300 ${isDarkMode ? 'bg-black text-gray-100' : 'bg-pink-200 text-gray-800'}`}>
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { triggerFeedback(); onBack(); }}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all ${
              isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ←
          </button>
          <h1 className="text-xl font-bold tracking-wide">
            {isSelf ? 'Profil Saya' : `Profil ${targetUser}`}
          </h1>
        </div>

        {isSelf && !isEditing && (
          <button 
            onClick={() => { triggerFeedback(); setIsEditing(true); }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors ${
              isDarkMode ? 'bg-pink-950/80 text-pink-300 border border-pink-900 hover:bg-pink-900' : 'bg-white text-pink-500 hover:bg-pink-50'
            }`}
          >
            ✏️ Edit Profil
          </button>
        )}
      </div>

      {/* Detail Profil */}
      <div className="p-4 max-w-xl mx-auto w-full space-y-4">
        {loading ? (
          <SkeletonCard isDarkMode={isDarkMode} />
        ) : (
          <div className={`rounded-3xl p-6 shadow-sm border text-center space-y-4 ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'
          }`}>
            <div className="relative inline-block">
              <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-5xl shadow-inner mx-auto overflow-hidden ${
                isDarkMode ? 'bg-gray-800 border-pink-600/50' : 'bg-pink-100 border-pink-300'
              }`}>
                {renderAvatarContent(isEditing ? editAvatar : profileData.avatar, profileData.namaPanggilan || profileData.username)}
              </div>
            </div>

            {!isEditing ? (
              <div className="space-y-2">
                <h2 className="text-xl font-extrabold">{profileData.namaLengkap || profileData.username}</h2>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold ${isDarkMode ? 'bg-pink-950/60 text-pink-300 border border-pink-900' : 'bg-pink-50 text-pink-600 border border-pink-100'}`}>
                    @{profileData.namaPanggilan || profileData.username}
                  </span>
                  {profileData.sekolahAsal && (
                    <span className={`px-2.5 py-0.5 rounded-full font-medium ${isDarkMode ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                      🏫 {profileData.sekolahAsal}
                    </span>
                  )}
                </div>
                <p className={`text-xs p-3 rounded-2xl border max-w-md mx-auto italic ${
                  isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-500'
                }`}>
                  "{profileData.bio}"
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-left pt-2">
                <div>
                  <label className="text-xs opacity-70 font-bold block mb-2">Pilih Foto Profil dari Galeri HP (Maks 10 MB)</label>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCompressedImageUpload(e, (result) => setEditAvatar(result))}
                    className={`w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-500 file:text-white hover:file:bg-pink-600 cursor-pointer ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs opacity-70 font-bold block mb-2">Atau Pilih Emoji / Avatar Bawaan</label>
                  
                  <div className={`space-y-3 max-h-48 overflow-y-auto p-2 border rounded-2xl ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                    {Object.entries(avatarCategories).map(([categoryName, items]) => (
                      <div key={categoryName} className="space-y-1">
                        <p className="text-[10px] font-bold opacity-50 uppercase tracking-wider">{categoryName}</p>
                        <div className="grid grid-cols-5 gap-2">
                          {items.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => { triggerFeedback(); setEditAvatar(item); }}
                              className={`h-10 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${
                                editAvatar === item 
                                  ? 'bg-pink-500/30 border-2 border-pink-500 scale-105 shadow-sm' 
                                  : isDarkMode ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700' : 'bg-white border border-gray-100 hover:bg-gray-100'
                              }`}
                            >
                              {item === 'initial_auto' ? (
                                <span className={`text-xs font-extrabold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Inisial</span>
                              ) : (
                                <span className="text-xl">{item}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs opacity-70 font-bold block mb-1">Bio Profil</label>
                  <textarea 
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className={`w-full border rounded-2xl p-3 text-xs outline-none focus:border-pink-400 ${
                      isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}
                    placeholder="Tuliskan bio milikmu..."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => { triggerFeedback(); setIsEditing(false); }}
                    className={`flex-1 font-bold py-2.5 rounded-full text-xs transition-colors ${
                      isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    className="flex-1 bg-pink-500 text-white font-bold py-2.5 rounded-full text-xs hover:bg-pink-600 shadow-md"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}