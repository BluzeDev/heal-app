import React, { useState } from 'react';

export default function QuotesScreen({ onBack, isDarkMode }) {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [toastMessage, setToastMessage] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const quotesData = [
    { id: 1, text: "Banyak hal yang bisa menjatuhkanmu. Tapi satu-satunya hal yang benar-benar dapat menjatuhkanmu adalah sikapmu sendiri.", author: "R.A. Kartini", category: "Pahlawan Nasional" },
    { id: 2, text: "Gantungkan cita-citamu setinggi langit! Jika engkau jatuh, engkau akan jatuh di antara bintang-bintang.", author: "Ir. Soekarno", category: "Pahlawan Nasional" },
    { id: 3, text: "Kurang cerdas dapat diperbaiki dengan belajar, kurang kecakapan dapat dihilangkan dengan pengalaman. Namun jujur tidak akan mudah ditanamkan bila sudah hilang.", author: "Mohammad Hatta", category: "Pahlawan Nasional" },
    { id: 4, text: "Robek-robeklah badanku, potong-potonglah jasadku ini, tetapi jiwaku yang dilindungi benteng Merah Putih akan tetap hidup.", author: "Jenderal Soedirman", category: "Pahlawan Nasional" },
    { id: 5, text: "Setiap orang menjadi guru, setiap rumah menjadi sekolah.", author: "Ki Hajar Dewantara", category: "Pahlawan Nasional" },
    { id: 6, text: "Satu-satunya cara untuk melakukan pekerjaan besar adalah dengan mencintai apa yang kamu lakukan.", author: "Steve Jobs", category: "Tokoh Dunia" },
    { id: 7, text: "Hal terbaik dan terindah di dunia ini tidak dapat dilihat atau bahkan disentuh. Itu harus dirasakan dengan hati.", author: "Helen Keller", category: "Tokoh Dunia" },
    { id: 8, text: "Pendidikan adalah senjata paling ampuh yang dapat kamu gunakan untuk mengubah dunia.", author: "Nelson Mandela", category: "Tokoh Dunia" },
    { id: 9, text: "Sukses bukanlah kunci kebahagiaan. Kebahagiaan adalah kunci kesuksesan. Jika kamu mencintai apa yang kamu kerjakan, kamu akan sukses.", author: "Albert Schweitzer", category: "Tokoh Dunia" },
    { id: 10, text: "Masa depan dimiliki oleh mereka yang percaya pada keindahan mimpi-mimpi mereka.", author: "Eleanor Roosevelt", category: "Tokoh Dunia" },
    { id: 11, text: "Imajinasi lebih penting daripada pengetahuan. Pengetahuan itu terbatas, sedangkan imajinasi melingkupi seluruh dunia.", author: "Albert Einstein", category: "Scientist" },
    { id: 12, text: "Ingatlah untuk melihat ke atas, ke bintang-bintang, dan bukan ke bawah, ke kaki Anda. Cobalah untuk memahami apa yang Anda lihat.", author: "Stephen Hawking", category: "Scientist" },
    { id: 13, text: "Kita tidak perlu takut pada apa pun dalam hidup ini, kita hanya perlu memahaminya. Sekarang saatnya paham lebih banyak agar kita bisa kurang takut.", author: "Marie Curie", category: "Scientist" },
    { id: 14, text: "Di suatu tempat, sesuatu yang luar biasa sedang menunggu untuk diketahui.", author: "Carl Sagan", category: "Scientist" },
    { id: 15, text: "Jika saya telah melihat lebih jauh dari yang lain, itu terjadi karena saya berdiri di atas bahu para raksasa.", author: "Isaac Newton", category: "Scientist" },
    { id: 16, text: "Bertepuk tanganlah untuk dirimu sendiri yang telah bertahan sejauh ini, meski dunia sering kali lupa bersikap ramah.", author: "Bumi Manusia (Pramoedya Ananta Toer)", category: "Novel & Literatur" },
    { id: 17, text: "Ketika kamu menginginkan sesuatu, seluruh alam semesta akan bersinkronisasi untuk membantumu mencapainya.", author: "The Alchemist (Paulo Coelho)", category: "Novel & Literatur" },
    { id: 18, text: "Pilihan kitalah yang menunjukkan siapa kita sebenarnya, jauh lebih banyak daripada kemampuan kita.", author: "Harry Potter and the Chamber of Secrets (J.K. Rowling)", category: "Novel & Literatur" },
    { id: 19, text: "Hanya dengan hati seseorang dapat melihat dengan benar; apa yang terpenting tidak terlihat oleh mata.", author: "The Little Prince (Antoine de Saint-Exupéry)", category: "Novel & Literatur" },
    { id: 20, text: "Orang dewasa tidak pernah memahami apa pun sendirian, dan sangat lelah bagi anak-anak untuk selalu menjelaskan segalanya kepada mereka.", author: "The Little Prince", category: "Novel & Literatur" },
    { id: 21, text: "Kamu tidak harus mengendalikan pikiranmu. Kamu hanya harus berhenti membiarkan pikiranmu mengendalikanmu.", author: "Self Love", category: "Mental Health" },
    { id: 22, text: "Tidak apa-apa untuk merasa tidak baik-baik saja. Menangis dan beristirahat bukan tanda kelemahan, melainkan tanda bahwa kamu manusia.", author: "Mental Health", category: "Mental Health" },
    { id: 23, text: "Jangan bandingkan Bab 1 milikmu dengan Bab 20 milik orang lain. Setiap perjalanan memiliki temponya sendiri.", author: "Life Journey", category: "Mental Health" },
    { id: 24, text: "Beristirahatlah. Dunia bisa menunggu. Kesehatan mental dan kedamaian pikiranmu jauh lebih utama.", author: "Self Care", category: "Mental Health" }
  ];

  const categories = ["Semua", "Pahlawan Nasional", "Tokoh Dunia", "Scientist", "Novel & Literatur", "Mental Health"];

  const filteredQuotes = activeCategory === "Semua" 
    ? quotesData 
    : quotesData.filter(q => q.category === activeCategory);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const handleCopy = (text, author) => {
    navigator.clipboard.writeText(`"${text}" — ${author}`);
    showToast("Teks berhasil disalin ke clipboard! ✨");
  };

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
      showToast("Dihapus dari favorit 🤍");
    } else {
      setFavorites([...favorites, id]);
      showToast("Ditambahkan ke favorit ❤️");
    }
  };

  return (
    <div className={`flex-1 flex flex-col min-h-screen pb-12 transition-colors duration-300 relative ${isDarkMode ? 'bg-black text-gray-100' : 'bg-pink-200 text-gray-800'}`}>
      
      {/* Toast Notification Mengambang */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xl backdrop-blur-md animate-bounce">
          {toastMessage}
        </div>
      )}

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
          <h1 className="text-xl font-bold tracking-wide">Quotes & Motivasi</h1>
        </div>
      </div>

      {/* Filter Kategori */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              activeCategory === cat 
                ? isDarkMode ? 'bg-pink-600 text-white scale-105' : 'bg-white text-pink-500 scale-105' 
                : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700' : 'bg-white/40 text-gray-700 hover:bg-white/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Daftar Quote Card */}
      <div className="p-4 flex-1 space-y-4 max-w-3xl mx-auto w-full">
        {filteredQuotes.map((item) => {
          const isFav = favorites.includes(item.id);
          return (
            <div key={item.id} className={`rounded-3xl p-5 shadow-sm space-y-3 relative group transition-all hover:shadow-md border ${
              isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-pink-50 text-gray-800'
            }`}>
              <p className={`text-sm italic leading-relaxed font-serif ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                "{item.text}"
              </p>

              <div className={`flex items-center justify-between border-t pt-3 ${isDarkMode ? 'border-gray-800' : 'border-pink-50'}`}>
                <div>
                  <h4 className="font-bold text-pink-400 text-xs">— {item.author}</h4>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full mt-1 inline-block border ${
                    isDarkMode ? 'bg-pink-950/40 text-pink-300 border-pink-900' : 'bg-pink-50 text-pink-500 border-pink-100'
                  }`}>
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleCopy(item.text, item.author)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-50 hover:bg-pink-50 text-gray-500 hover:text-pink-500'
                    }`}
                  >
                    📋 Salin
                  </button>
                  <button 
                    onClick={() => toggleFavorite(item.id)}
                    className="p-1.5 text-base hover:scale-110 transition-transform"
                  >
                    {isFav ? "❤️" : "🤍"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}