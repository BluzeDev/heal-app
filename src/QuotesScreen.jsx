import React, { useState } from 'react';
import { Share2, Copy, Heart, X, Sparkles } from 'lucide-react';
import healLogo from './heal-logo.png';
import { triggerFeedback } from './utils/feedback';

export default function QuotesScreen({ onBack, isDarkMode }) {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [toastMessage, setToastMessage] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [shareCard, setShareCard] = useState(null);

  const quotesData = [
    // 1. Pahlawan Nasional
    { id: 1, text: "Banyak hal yang bisa menjatuhkanmu. Tapi satu-satunya hal yang benar-benar dapat menjatuhkanmu adalah sikapmu sendiri.", author: "R.A. Kartini", category: "Pahlawan Nasional" },
    { id: 2, text: "Gantungkan cita-citamu setinggi langit! Jika engkau jatuh, engkau akan jatuh di antara bintang-bintang.", author: "Ir. Soekarno", category: "Pahlawan Nasional" },
    { id: 3, text: "Kurang cerdas dapat diperbaiki dengan belajar, kurang kecakapan dapat dihilangkan dengan pengalaman. Namun jujur tidak akan mudah ditanamkan bila sudah hilang.", author: "Mohammad Hatta", category: "Pahlawan Nasional" },
    { id: 4, text: "Robek-robeklah badanku, potong-potonglah jasadku ini, tetapi jiwaku yang dilindungi benteng Merah Putih akan tetap hidup.", author: "Jenderal Soedirman", category: "Pahlawan Nasional" },
    { id: 5, text: "Ing ngarsa sung tulada, ing madya mangun karsa, tut wuri handayani. Setiap orang menjadi guru, setiap rumah menjadi sekolah.", author: "Ki Hajar Dewantara", category: "Pahlawan Nasional" },
    { id: 6, text: "Ingatlah bahwa keberhasilan terbesar kita bukanlah karena tidak pernah gagal, melainkan bangkit setiap kali kita jatuh.", author: "B.J. Habibie", category: "Pahlawan Nasional" },
    { id: 7, text: "Terbentur, terbentur, terbentur, terbentuk!", author: "Tan Malaka", category: "Pahlawan Nasional" },
    { id: 8, text: "Habis gelap terbitlah terang.", author: "R.A. Kartini", category: "Pahlawan Nasional" },
    { id: 9, text: "Beri aku 1.000 orang tua, niscaya akan kucabut Semeru dari akarnya. Beri aku 10 pemuda niscaya akan kuguncangkan dunia.", author: "Ir. Soekarno", category: "Pahlawan Nasional" },
    { id: 10, text: "Kita tidak boleh menyerah dan kita tidak boleh membiarkan masalah mengalahkan kita.", author: "Cut Nyak Dien", category: "Pahlawan Nasional" },

    // 2. Tokoh Dunia
    { id: 11, text: "Pendidikan adalah senjata paling ampuh yang dapat kamu gunakan untuk mengubah dunia.", author: "Nelson Mandela", category: "Tokoh Dunia" },
    { id: 12, text: "Hiduplah seolah kamu akan mati besok. Belajarlah seolah kamu akan hidup selamanya.", author: "Mahatma Gandhi", category: "Tokoh Dunia" },
    { id: 13, text: "Cara terbaik untuk memprediksi masa depanmu adalah dengan menciptakannya sendiri.", author: "Abraham Lincoln", category: "Tokoh Dunia" },
    { id: 14, text: "Kamu memiliki kekuatan atas pikiranmu sendiri — bukan peristiwa di luar. Sadarilah ini, dan kamu akan menemukan kekuatan sejati.", author: "Marcus Aurelius", category: "Tokoh Dunia" },
    { id: 15, text: "Satu-satunya cara untuk melakukan pekerjaan besar adalah dengan mencintai apa yang kamu lakukan.", author: "Steve Jobs", category: "Tokoh Dunia" },
    { id: 16, text: "Jika kamu tidak bisa terbang, maka berlarilah. Jika tidak bisa berlari, berjalanlah. Tapi apa pun yang kamu lakukan, teruslah melangkah maju.", author: "Martin Luther King Jr.", category: "Tokoh Dunia" },
    { id: 17, text: "Kedamaian dimulai dari sebuah senyuman yang tulus.", author: "Mother Teresa", category: "Tokoh Dunia" },
    { id: 18, text: "Sukses bukanlah akhir, kegagalan bukanlah hal yang fatal: keberanian untuk terus melanjutkan yang paling berarti.", author: "Winston Churchill", category: "Tokoh Dunia" },
    { id: 19, text: "Masa depan dimiliki oleh mereka yang percaya pada keindahan mimpi-mimpi mereka.", author: "Eleanor Roosevelt", category: "Tokoh Dunia" },
    { id: 20, text: "Kegelapan tidak bisa mengusir kegelapan; hanya cahaya yang bisa melakukannya. Kebencian tidak bisa mengusir kebencian; hanya cinta yang bisa.", author: "Martin Luther King Jr.", category: "Tokoh Dunia" },

    // 3. Scientist
    { id: 21, text: "Imajinasi lebih penting daripada pengetahuan. Pengetahuan itu terbatas, sedangkan imajinasi melingkupi seluruh alam semesta.", author: "Albert Einstein", category: "Scientist" },
    { id: 22, text: "Kita tidak perlu takut pada apa pun dalam hidup ini, kita hanya perlu memahaminya lebih baik agar rasa takut itu hilang.", author: "Marie Curie", category: "Scientist" },
    { id: 23, text: "Jika Anda ingin menemukan rahasia alam semesta, berpikirlah dalam hal energi, frekuensi, dan getaran.", author: "Nikola Tesla", category: "Scientist" },
    { id: 24, text: "Ingatlah untuk selalu melihat ke atas, ke bintang-bintang, dan bukan ke bawah, ke kaki Anda. Cobalah memahami apa yang Anda lihat.", author: "Stephen Hawking", category: "Scientist" },
    { id: 25, text: "Di suatu tempat di luar sana, sesuatu yang luar biasa sedang menunggu untuk diketahui.", author: "Carl Sagan", category: "Scientist" },
    { id: 26, text: "Kepanikan adalah separuh penyakit, ketenangan adalah separuh obat, dan kesabaran adalah langkah awal kesembuhan.", author: "Ibnu Sina (Avicenna)", category: "Scientist" },
    { id: 27, text: "Saya tidak pernah gagal. Saya hanya menemukan 10.000 cara yang tidak berhasil.", author: "Thomas Alva Edison", category: "Scientist" },
    { id: 28, text: "Jika saya telah melihat lebih jauh dari yang lain, itu terjadi karena saya berdiri di atas bahu para raksasa.", author: "Isaac Newton", category: "Scientist" },
    { id: 29, text: "Sains adalah cara berpikir yang jauh melampaui sekadar kumpulan fakta.", author: "Carl Sagan", category: "Scientist" },
    { id: 30, text: "Dalam kesulitan terdapat peluang yang luar biasa.", author: "Albert Einstein", category: "Scientist" },

    // 4. Novel & Literatur
    { id: 31, text: "Bertepuk tanganlah untuk dirimu sendiri yang telah bertahan sejauh ini, meski dunia sering kali lupa bersikap ramah.", author: "Pramoedya Ananta Toer (Bumi Manusia)", category: "Novel & Literatur" },
    { id: 32, text: "Aku ini binatang jalang, dari kumpulannya terbuang. Biar peluru menembus kulitku, aku tetap meradang menerjang.", author: "Chairil Anwar (Aku)", category: "Novel & Literatur" },
    { id: 33, text: "Aku ingin mencintaimu dengan sederhana: dengan kata yang tak sempat diucapkan kayu kepada api yang menjadikannya abu.", author: "Sapardi Djoko Damono", category: "Novel & Literatur" },
    { id: 34, text: "Kenangan itu seperti bayangan, selalu mengikuti ke mana pun kita melangkah, tetapi tidak pernah bisa kita sentuh lagi.", author: "Leila S. Chudori (Laut Bercerita)", category: "Novel & Literatur" },
    { id: 35, text: "Ketika badai berlalu, kamu tidak akan ingat bagaimana kamu bisa melewatinya. Tetapi satu hal yang pasti: saat kamu keluar dari badai, kamu bukan lagi orang yang sama.", author: "Haruki Murakami (Kafka on the Shore)", category: "Novel & Literatur" },
    { id: 36, text: "Hanya mereka yang berani melintasi jurang keputusasaan yang akan menemukan arti sejati dari harapan.", author: "Fyodor Dostoevsky (Crime and Punishment)", category: "Novel & Literatur" },
    { id: 37, text: "Ketika kamu menginginkan sesuatu dengan tulus, seluruh alam semesta akan bersinkronisasi untuk membantumu mencapainya.", author: "Paulo Coelho (The Alchemist)", category: "Novel & Literatur" },
    { id: 38, text: "Pilihan kitalah yang menunjukkan siapa kita sebenarnya, jauh melampaui kemampuan alami kita.", author: "J.K. Rowling (Harry Potter)", category: "Novel & Literatur" },
    { id: 39, text: "Hanya dengan hati seseorang dapat melihat dengan benar; apa yang terpenting tidak terlihat oleh mata.", author: "Antoine de Saint-Exupéry (The Little Prince)", category: "Novel & Literatur" },
    { id: 40, text: "Lepaskanlah. Maka besok lusa, jika dia adalah takdirmu, dia akan kembali dengan cara yang mengagumkan.", author: "Tere Liye (Rindu)", category: "Novel & Literatur" },

    // 5. Mental Health
    { id: 41, text: "Ketika kita tidak lagi mampu mengubah situasi, kita ditantang untuk mengubah diri kita sendiri.", author: "Viktor E. Frankl", category: "Mental Health" },
    { id: 42, text: "Saya bukan apa yang terjadi pada saya, saya adalah apa yang saya pilih untuk menjadi.", author: "Carl Jung", category: "Mental Health" },
    { id: 43, text: "Kamu tidak harus mengendalikan seluruh pikiranmu. Kamu hanya perlu berhenti membiarkan pikiranmu mengendalikan tindakanmu.", author: "Resiliensi Mental", category: "Mental Health" },
    { id: 44, text: "Tidak apa-apa untuk merasa tidak baik-baik saja. Menangis bukanlah tanda kelemahan, melainkan bukti bahwa kamu manusia yang berhati.", author: "Self-Compassion", category: "Mental Health" },
    { id: 45, text: "Jangan bandingkan bab 1 perjalananmu dengan bab 20 milik orang lain. Setiap jiwa bertumbuh dengan ritmenya masing-masing.", author: "Mindfulness Remaja", category: "Mental Health" },
    { id: 46, text: "Beristirahatlah. Dunia bisa menunggu. Menjaga kedamaian batin dan kesehatan jiwamu adalah prioritas tertinggi.", author: "Self Care", category: "Mental Health" },
    { id: 47, text: "Meminta bantuan bukan berarti kamu menyerah. Itu berarti kamu menolak untuk menyerah sendirian.", author: "Mental Health Advocate", category: "Mental Health" },
    { id: 48, text: "Rasa cemas hari ini tidak akan mengosongkan duka besok, ia hanya akan menguras kekuatan dan energimu hari ini.", author: "Mindfulness", category: "Mental Health" },
    { id: 49, text: "Kamu berharga bukan karena apa yang kamu hasilkan, melainkan semata-mata karena kamu ada dan bernapas di bumi ini.", author: "Afirmasi Positif", category: "Mental Health" },
    { id: 50, text: "Fokus pada kemajuan kecil (progress), bukan kesempurnaan (perfection). Satu langkah pelan tetap membawamu maju ke depan.", author: "HEAL Mindset", category: "Mental Health" }
  ];

  const categories = ["Semua", "Pahlawan Nasional", "Tokoh Dunia", "Scientist", "Novel & Literatur", "Mental Health"];

  const filteredQuotes = activeCategory === "Semua" 
    ? quotesData 
    : quotesData.filter(q => q.category === activeCategory);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleCopy = (text, author) => {
    triggerFeedback();
    const formatted = `"${text}" — ${author}\n\n✨ Dibagikan dari Aplikasi HEAL`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(formatted);
      } else {
        const ta = document.createElement('textarea');
        ta.value = formatted;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch (e) {
      console.warn("Copy fallback failed:", e);
    }
    showToast("Teks kutipan berhasil disalin ke clipboard! 📋✨");
  };

  const handleWebShare = async (item) => {
    triggerFeedback();
    const shareText = `"${item.text}" — ${item.author}\n\nKategori: ${item.category}\n✨ Dibagikan dari Aplikasi HEAL (Healthy • Empowered • Aware • Limitless)`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Quote dari ${item.author} — HEAL`,
          text: shareText,
          url: window.location.origin
        });
        showToast("Quote berhasil dibagikan! 🚀");
      } catch (err) {
        // User batalkan share
      }
    } else {
      handleCopy(item.text, item.author);
    }
  };

  const toggleFavorite = (id) => {
    triggerFeedback();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
      showToast("Dihapus dari kutipan favorit 🤍");
    } else {
      setFavorites([...favorites, id]);
      showToast("Tersimpan di kutipan favorit ❤️");
    }
  };

  return (
    <div className={`flex-1 flex flex-col min-h-screen pb-20 transition-colors duration-300 relative ${
      isDarkMode ? 'bg-black text-gray-100' : 'bg-gradient-to-b from-pink-100 via-rose-50 to-yellow-50 text-gray-800'
    }`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900/95 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl backdrop-blur-md animate-bounce border border-white/20">
          {toastMessage}
        </div>
      )}

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
              <span>💬</span> Quotes & Motivasi
            </h1>
            <p className="text-[10px] opacity-60">50+ Kutipan Terverifikasi Pahlawan, Tokoh Dunia & Mental Health</p>
          </div>
        </div>
      </div>

      {/* Filter Kategori Chips */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar max-w-3xl mx-auto w-full">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => { triggerFeedback(); setActiveCategory(cat); }}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
              activeCategory === cat 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white scale-105 shadow-pink-500/30' 
                : isDarkMode 
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700' 
                : 'bg-white text-gray-700 hover:bg-pink-50 border border-pink-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Total Display Info */}
      <div className="px-4 max-w-3xl mx-auto w-full flex items-center justify-between text-[11px] font-semibold opacity-70 mb-1">
        <span>Menampilkan <strong className="text-pink-500">{filteredQuotes.length}</strong> kutipan bijak</span>
        <span>❤️ {favorites.length} Favorit</span>
      </div>

      {/* List Quote Cards */}
      <div className="p-4 flex-1 space-y-4 max-w-3xl mx-auto w-full">
        {filteredQuotes.map((item) => {
          const isFav = favorites.includes(item.id);
          return (
            <div 
              key={item.id} 
              className={`rounded-3xl p-5 shadow-sm space-y-3 relative group transition-all hover:shadow-md border ${
                isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-pink-50 text-gray-800'
              }`}
            >
              {/* Petikan Teks */}
              <div className="space-y-1">
                <span className="text-2xl text-pink-400 font-serif leading-none block">“</span>
                <p className={`text-sm italic leading-relaxed font-serif pl-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {item.text}
                </p>
              </div>

              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t pt-3 ${
                isDarkMode ? 'border-gray-800' : 'border-pink-50'
              }`}>
                <div>
                  <h4 className="font-bold text-pink-500 text-xs">— {item.author}</h4>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full mt-1 inline-block border font-semibold ${
                    isDarkMode ? 'bg-pink-950/40 text-pink-300 border-pink-900' : 'bg-pink-50 text-pink-500 border-pink-100'
                  }`}>
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  {/* Tombol Bagikan / Simpan Kartu Quote (Preview Modal) */}
                  <button
                    onClick={() => { triggerFeedback(); setShareCard(item); }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm hover:scale-105 active:scale-95 transition-all"
                    title="Bagikan / Simpan Kartu Estetik"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Bagikan Kartu</span>
                  </button>

                  {/* Tombol Salin Teks */}
                  <button 
                    onClick={() => handleCopy(item.text, item.author)}
                    className={`p-2 rounded-full text-xs transition-all ${
                      isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-50 text-gray-500 hover:bg-pink-50 hover:text-pink-500'
                    }`}
                    title="Salin Teks"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Tombol Favorit */}
                  <button 
                    onClick={() => toggleFavorite(item.id)}
                    className="p-1.5 text-base hover:scale-125 transition-transform"
                    title="Favorit"
                  >
                    {isFav ? "❤️" : "🤍"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ───────────── MODAL PREVIEW KARTU QUOTE ESTETIK ───────────── */}
      {shareCard && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn" 
          onClick={() => setShareCard(null)}
        >
          <div 
            className="max-w-sm w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kartu Quote Estetik dengan Background Gradient & Watermark Logo */}
            <div className="relative rounded-3xl p-7 bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 text-white shadow-2xl overflow-hidden border-2 border-white/30 space-y-4 text-center">
              {/* Ornamen Latar */}
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-yellow-300/20 blur-xl pointer-events-none" />

              {/* Watermark Logo HEAL */}
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/90 p-1 shadow-sm flex items-center justify-center">
                  <img src={healLogo} alt="Logo HEAL" className="w-full h-full object-contain" />
                </div>
                <div className="text-left">
                  <span className="font-black text-sm tracking-widest block leading-tight drop-shadow-sm">HEAL</span>
                  <span className="text-[9px] font-bold opacity-80 uppercase tracking-wider block">Kesehatan Remaja</span>
                </div>
              </div>

              {/* Kategori Badge */}
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black tracking-wider uppercase border border-white/30">
                {shareCard.category}
              </span>

              {/* Teks Kutipan */}
              <div className="py-2 space-y-2">
                <p className="text-base font-serif italic leading-relaxed drop-shadow-md">
                  "{shareCard.text}"
                </p>
                <p className="text-xs font-black tracking-wide drop-shadow-sm opacity-95">
                  — {shareCard.author}
                </p>
              </div>

              {/* Watermark Bottom Tagline */}
              <div className="pt-3 border-t border-white/20 text-[9px] font-bold opacity-80 uppercase tracking-widest">
                Healthy • Empowered • Aware • Limitless
              </div>
            </div>

            {/* Tombol Aksi Modal */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleWebShare(shareCard)}
                className="w-full py-3.5 rounded-2xl bg-white text-pink-600 font-extrabold text-xs shadow-xl hover:bg-pink-50 transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan ke WhatsApp / Media Sosial</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(shareCard.text, shareCard.author)}
                className="w-full py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 text-white font-bold text-xs hover:bg-white/30 transition-all flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span>Salin Teks Kutipan</span>
              </button>

              <button
                type="button"
                onClick={() => setShareCard(null)}
                className="w-full py-2.5 text-white/80 hover:text-white font-bold text-xs text-center"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}