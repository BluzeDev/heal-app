import React, { useState, useEffect } from 'react';

export default function ScrollToTop({ isDarkMode }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-40 p-3.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center font-bold ${
        isDarkMode 
          ? 'bg-pink-600 text-white hover:bg-pink-500 shadow-pink-900/30' 
          : 'bg-white text-pink-500 hover:bg-pink-50 shadow-pink-500/20 border border-pink-100'
      }`}
      title="Kembali ke atas"
    >
      ↑
    </button>
  );
}