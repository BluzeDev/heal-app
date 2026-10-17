import React, { useState, useEffect, useRef } from 'react';

export default function AmbientPlayer({ isDarkMode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundType, setSoundType] = useState('rain'); 
  const audioRef = useRef(null);

  const audioSources = {
    rain: "https://assets.mixkit.co/active_storage/sfx/1255/1255-preview.mp3",
    waves: "https://assets.mixkit.co/active_storage/sfx/1190/1190-preview.mp3"
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
    }
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.log("Audio play blocked:", err));
    }
  };

  const switchSound = (type) => {
    setSoundType(type);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setTimeout(() => {
        audioRef.current.play().catch(err => console.log(err));
      }, 100);
    }
  };

  return (
    <div className={`fixed bottom-20 right-6 z-40 flex items-center gap-2 p-2 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 border ${
      isDarkMode 
        ? 'bg-gray-900/90 border-gray-800 text-gray-200' 
        : 'bg-white/90 border-pink-100 text-gray-800'
    }`}>
      <audio ref={audioRef} src={audioSources[soundType]} />
      
      <button 
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-transform active:scale-95 ${
          isPlaying ? 'bg-pink-500 text-white animate-pulse' : 'bg-gray-200 text-gray-700'
        }`}
        title={isPlaying ? "Matikan Musik Relaksasi" : "Putar Musik Relaksasi"}
      >
        {isPlaying ? '🎵' : '🔇'}
      </button>

      {isPlaying && (
        <div className="flex items-center gap-1.5 pr-2 animate-fadeIn">
          <button 
            onClick={() => switchSound('rain')} 
            className={`text-[10px] px-2 py-1 rounded-full font-bold transition-all ${soundType === 'rain' ? 'bg-pink-500 text-white' : 'opacity-60'}`}
          >
            🌧️ Hujan
          </button>
          <button 
            onClick={() => switchSound('waves')} 
            className={`text-[10px] px-2 py-1 rounded-full font-bold transition-all ${soundType === 'waves' ? 'bg-pink-500 text-white' : 'opacity-60'}`}
          >
            🌊 Ombak
          </button>
        </div>
      )}
    </div>
  );
}