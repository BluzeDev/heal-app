import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import SkeletonCard from './SkeletonCard'; // Import Skeleton

export default function VoicingRightsScreen({ currentUser, onViewProfile, onBack, isDarkMode }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Postingan Baru
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [category, setCategory] = useState('Curhat');
  const [content, setContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // State Edit Postingan
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // State Komentar (postId -> teks komentar)
  const [commentInputs, setCommentInputs] = useState({});

  // State Pencarian & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Semua');

  const categoriesList = ['Curhat', 'Akademik', 'Sosial', 'Tips & Motivasi'];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "voicing_rights"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setPosts(fetched);
    } catch (err) {
      console.error("Gagal mengambil data Voicing Rights:", err);
    } finally {
      // Memberikan sedikit jeda animasi agar transisi skeleton terlihat halus
      setTimeout(() => setLoading(false), 600);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Kompresor Gambar Postingan (Maksimal 10 MB)
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

  // Kirim Postingan Baru
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !postImage) {
      alert("Tuliskan sesuatu atau sertakan gambar sebelum membagikan suaramu!");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "voicing_rights"), {
        author: isAnonymous ? 'Anonim 🌸' : currentUser,
        isAnonymous: isAnonymous,
        category: category,
        content: content,
        image: postImage || '',
        likes: [],       // Array menyimpan username yang menyukai
        comments: [],    // Array menyimpan objek komentar
        edited: false,
        createdAt: serverTimestamp(),
      });

      setContent('');
      setPostImage('');
      setIsAnonymous(false);
      setCategory('Curhat');
      fetchPosts();
    } catch (err) {
      console.error("Gagal memposting:", err);
      alert("Gagal membagikan postingan, periksa koneksi kamu.");
    } finally {
      setSubmitting(false);
    }
  };

  // Hapus Postingan
  const handleDeletePost = async (postId) => {
    if (window.confirm("Apakah kamu yakin ingin menghapus postingan ini?")) {
      try {
        await deleteDoc(doc(db, "voicing_rights", postId));
        fetchPosts();
      } catch (err) {
        console.error("Gagal menghapus postingan:", err);
        alert("Gagal menghapus postingan.");
      }
    }
  };

  // Simpan Edit Postingan
  const handleSaveEdit = async (postId) => {
    if (!editContent.trim()) {
      alert("Konten postingan tidak boleh kosong!");
      return;
    }

    try {
      const postRef = doc(db, "voicing_rights", postId);
      await updateDoc(postRef, {
        content: editContent,
        edited: true
      });
      setEditingPostId(null);
      setEditContent('');
      fetchPosts();
    } catch (err) {
      console.error("Gagal mengedit postingan:", err);
      alert("Gagal menyimpan perubahan.");
    }
  };

  // Toggle Like Postingan
  const handleLikePost = async (post) => {
    try {
      const postRef = doc(db, "voicing_rights", post.id);
      const currentLikes = post.likes || [];
      const hasLiked = currentLikes.includes(currentUser);

      if (hasLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser)
        });
      }
      fetchPosts();
    } catch (err) {
      console.error("Gagal menyukai postingan:", err);
    }
  };

  // Kirim Komentar
  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    try {
      const postRef = doc(db, "voicing_rights", postId);
      const newComment = {
        id: Date.now().toString(),
        author: currentUser,
        text: commentText.trim(),
        createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };

      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      });

      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchPosts();
    } catch (err) {
      console.error("Gagal mengirim komentar:", err);
      alert("Gagal mengirim komentar.");
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategoryFilter === 'Semua' || post.category === selectedCategoryFilter;
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`flex-1 flex flex-col min-h-screen pb-12 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-pink-200 text-gray-800'}`}>
      
      {/* Header */}
      <div className={`p-4 flex items-center justify-between border-b ${isDarkMode ? 'border-gray-800 bg-gray-900/80' : 'border-pink-300/40 bg-pink-200/80'} backdrop-blur-md sticky top-0 z-20`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all ${isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            ←
          </button>
          <h1 className="text-xl font-bold tracking-wide">
            🗣️ Voicing Rights
          </h1>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-5">
        
        {/* Kotak Buat Postingan Baru */}
        <div className={`rounded-3xl p-5 shadow-sm border space-y-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-pink-100'}`}>
          <h3 className="font-bold text-sm">Bagikan Suara & Perasaanmu</h3>
          
          <form onSubmit={handlePostSubmit} className="space-y-3">
            <textarea 
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ceritakan harimu, keresahan, atau tips semangat di sini..."
              className={`w-full border rounded-2xl p-3 text-xs outline-none focus:border-pink-400 transition-colors ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
            />

            {/* Pratinjau Gambar Postingan */}
            {postImage && (
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden border">
                <img src={postImage} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => setPostImage('')}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className={`cursor-pointer px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isDarkMode ? 'bg-gray-900 border-gray-700 hover:bg-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
              }`}>
                <span>🖼️</span> Lampirkan Gambar (Maks 10 MB)
                <input type="file" accept="image/*" onChange={(e) => handleCompressedImageUpload(e, (result) => setPostImage(result))} className="hidden" />
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-between items-center pt-1">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`border rounded-xl px-3 py-1.5 text-xs outline-none focus:border-pink-400 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-white border-gray-200'}`}
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <div className="flex items-center gap-1.5 text-xs">
                  <input 
                    type="checkbox" 
                    id="anon"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded accent-pink-500 cursor-pointer"
                  />
                  <label htmlFor="anon" className="cursor-pointer select-none text-[11px] opacity-80">Kirim Anonim</label>
                </div>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-pink-500 text-white font-bold px-5 py-2 rounded-full text-xs hover:bg-pink-600 shadow-md transition-all disabled:opacity-50"
              >
                {submitting ? 'Mengirim...' : 'Kirim Suara ✨'}
              </button>
            </div>
          </form>
        </div>

        {/* SEARCH BAR & FILTER KATEGORI */}
        <div className="space-y-2">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Cari curhatan atau penulis..."
            className={`w-full border rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-pink-400 shadow-sm transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border-pink-100 text-gray-800'}`}
          />

          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {['Semua', ...categoriesList].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
                  selectedCategoryFilter === cat 
                    ? 'bg-pink-500 text-white shadow-pink-500/30' 
                    : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700' : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* DAFTAR POSTINGAN DENGAN SKELETON */}
        <div className="space-y-4">
          {loading ? (
            <>
              <SkeletonCard isDarkMode={isDarkMode} />
              <SkeletonCard isDarkMode={isDarkMode} />
              <SkeletonCard isDarkMode={isDarkMode} />
            </>
          ) : filteredPosts.length === 0 ? (
            <div className={`rounded-3xl p-8 text-center border shadow-sm space-y-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-pink-100'}`}>
              <p className="text-3xl">📭</p>
              <p className="text-xs opacity-60 font-medium">Belum ada postingan yang sesuai.</p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isMyPost = post.author === currentUser && !post.isAnonymous;
              const hasLiked = (post.likes || []).includes(currentUser);

              return (
                <div key={post.id} className={`rounded-3xl p-5 shadow-sm border space-y-3 transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-pink-100'}`}>
                  
                  {/* Header Postingan */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🌸</span>
                      <div>
                        <span 
                          onClick={() => !post.isAnonymous && onViewProfile(post.author)}
                          className={`font-bold text-xs ${post.isAnonymous ? 'cursor-default opacity-80' : 'cursor-pointer hover:underline text-pink-500'}`}
                        >
                          {post.author}
                        </span>
                        <span className="text-[10px] opacity-40 ml-2">
                          {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Baru saja'}
                          {post.edited && <span className="ml-1 italic">(edited)</span>}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isDarkMode ? 'bg-pink-900/40 text-pink-300 border border-pink-800/50' : 'bg-pink-50 text-pink-500 border border-pink-100'}`}>
                        {post.category || 'Curhat'}
                      </span>

                      {/* Tombol Edit & Hapus (Hanya untuk pemilik postingan) */}
                      {isMyPost && (
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => { setEditingPostId(post.id); setEditContent(post.content); }}
                            className="text-[10px] opacity-60 hover:opacity-100 p-1"
                            title="Edit Postingan"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDeletePost(post.id)}
                            className="text-[10px] opacity-60 hover:text-red-500 p-1"
                            title="Hapus Postingan"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Konten Postingan / Form Edit */}
                  {editingPostId === post.id ? (
                    <div className="space-y-2 pt-1">
                      <textarea 
                        rows={3}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className={`w-full border rounded-2xl p-3 text-xs outline-none focus:border-pink-400 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                      />
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingPostId(null)}
                          className="px-3 py-1 rounded-full text-[11px] font-bold bg-gray-200 text-gray-600 hover:bg-gray-300"
                        >
                          Batal
                        </button>
                        <button 
                          onClick={() => handleSaveEdit(post.id)}
                          className="px-3 py-1 rounded-full text-[11px] font-bold bg-pink-500 text-white hover:bg-pink-600 shadow-sm"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  ) : (
                    post.content && (
                      <p className="text-xs leading-relaxed whitespace-pre-wrap pl-1 opacity-90">
                        {post.content}
                      </p>
                    )
                  )}

                  {/* Gambar Postingan */}
                  {post.image && (
                    <div className="rounded-2xl overflow-hidden border max-h-64 mt-2">
                      <img src={post.image} alt="Attachment" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Tombol Like & Info Komentar */}
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-100/10 text-xs">
                    <button 
                      onClick={() => handleLikePost(post)}
                      className={`flex items-center gap-1.5 font-bold transition-all ${hasLiked ? 'text-pink-500 scale-105' : 'opacity-60 hover:opacity-100'}`}
                    >
                      <span>{hasLiked ? '❤️' : '🤍'}</span>
                      <span>{(post.likes || []).length} Suka</span>
                    </button>
                    <div className="opacity-60 font-bold">
                      💬 {(post.comments || []).length} Komentar
                    </div>
                  </div>

                  {/* Daftar Komentar */}
                  {(post.comments || []).length > 0 && (
                    <div className={`space-y-2 pt-2 border-t ${isDarkMode ? 'border-gray-700/60' : 'border-pink-100'}`}>
                      {post.comments.map((comment) => (
                        <div key={comment.id} className={`p-2.5 rounded-2xl text-[11px] space-y-0.5 ${isDarkMode ? 'bg-gray-900/60' : 'bg-pink-50/60'}`}>
                          <div className="flex justify-between font-bold opacity-80">
                            <span>{comment.author}</span>
                            <span className="text-[9px] opacity-40">{comment.createdAt}</span>
                          </div>
                          <p className="opacity-90">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Form Kirim Komentar */}
                  <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex gap-2 pt-1">
                    <input 
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      placeholder="Tulis komentar atau dukungan..."
                      className={`flex-1 border rounded-full px-4 py-2 text-xs outline-none focus:border-pink-400 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                    />
                    <button 
                      type="submit"
                      className="bg-pink-500 text-white font-bold px-4 py-2 rounded-full text-xs hover:bg-pink-600 shadow-sm transition-all"
                    >
                      Kirim
                    </button>
                  </form>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}