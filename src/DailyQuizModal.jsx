import React, { useState } from 'react';
import { bankSoal } from './utils/quizData';
import { triggerFeedback } from './utils/feedback';

export default function DailyQuizModal({ currentUser, onClose, isDarkMode }) {
  // Pilih soal acak berdasarkan tanggal hari ini agar tetap konsisten untuk 1 hari tersebut
  const todayIndex = new Date().getDate() % bankSoal.length;
  const soalHariIni = bankSoal[todayIndex];

  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const quizStatusKey = `heal_quiz_done_${currentUser}_${new Date().toDateString()}`;
  const alreadyDone = localStorage.getItem(quizStatusKey) === 'true';

  if (alreadyDone && !isSubmitted) {
    return null; // Jika sudah dikerjakan hari ini, jangan tampilkan modal pop-up
  }

  const handleAnswerSubmit = () => {
    if (selectedOption === null) {
      alert("Pilih salah satu opsi jawaban terlebih dahulu!");
      return;
    }

    triggerFeedback();
    const correct = selectedOption === soalHariIni.jawaban;
    setIsCorrect(correct);
    setIsSubmitted(true);
    localStorage.setItem(quizStatusKey, 'true');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border space-y-4 ${
        isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-pink-100 text-gray-800'
      }`}>
        <div className="flex justify-between items-center">
          <span className="bg-pink-500/10 text-pink-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            🧠 Kuis Mindfulness Harian
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-sm">✕</button>
        </div>

        {!isSubmitted ? (
          <div className="space-y-4">
            <p className="text-sm font-bold leading-relaxed">{soalHariIni.soal}</p>

            <div className="space-y-2">
              {soalHariIni.opsi.map((opsiText, idx) => (
                <button
                  key={idx}
                  onClick={() => { triggerFeedback(); setSelectedOption(idx); }}
                  className={`w-full p-3 rounded-2xl text-left text-xs font-medium border transition-all flex items-center gap-3 ${
                    selectedOption === idx 
                      ? 'bg-pink-500 text-white border-pink-600 shadow-md' 
                      : isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    selectedOption === idx ? 'bg-white text-pink-500' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {['A', 'B', 'C', 'D'][idx]}
                  </span>
                  <span>{opsiText}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleAnswerSubmit}
              className="w-full bg-pink-500 text-white font-bold py-3 rounded-full text-xs shadow-md hover:bg-pink-600 transition-all mt-2"
            >
              Kirim Jawaban ✨
            </button>
          </div>
        ) : (
          <div className="text-center py-4 space-y-3">
            <span className="text-4xl">{isCorrect ? '🎉' : '💡'}</span>
            <h3 className="font-extrabold text-base">
              {isCorrect ? 'Jawaban Kamu Benar!' : 'Tetap Semangat Belajar!'}
            </h3>
            <p className="text-xs opacity-70 leading-relaxed">
              {isCorrect 
                ? 'Hebat! Kamu mendapatkan tambahan poin kesadaran diri hari ini.' 
                : `Jawaban yang tepat adalah: ${soalHariIni.opsi[soalHariIni.jawaban]}`}
            </p>
            <button
              onClick={onClose}
              className="w-full bg-pink-500 text-white font-bold py-3 rounded-full text-xs shadow-md hover:bg-pink-600 transition-all mt-2"
            >
              Lanjutkan Aktivitas ✨
            </button>
          </div>
        )}
      </div>
    </div>
  );
}