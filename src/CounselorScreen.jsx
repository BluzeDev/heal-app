import React, { useState, useEffect } from 'react';
import { subscribeToChat, sendChatMessage } from './utils/counselorService';
import { triggerFeedback } from './utils/feedback';

const COUNSELORS = [
  {
    id: 'narnia',
    name: 'Narnia',
    specialty: 'Konselor Sebaya & Stres Akademik',
    avatar: '🌸',
    whatsappNumber: '6282235116713',
    bio: 'Siap mendengarkan keluh kesahmu seputar sekolah dan keseharian.'
  },
  {
    id: 'charish',
    name: 'Charish',
    specialty: 'Spesialis Motivasi & Mood Swing',
    avatar: '✨',
    whatsappNumber: '6281259528699',
    bio: 'Teman cerita asyik buat mengembalikan energi positifmu.'
  },
  {
    id: 'mutiara',
    name: 'Mutiara',
    specialty: 'Pendamping Hubungan Sosial & Kecemasan',
    avatar: '💬',
    whatsappNumber: '6282266849823',
    bio: 'Mari bicarakan apa pun yang membuatmu overthinking dengan santai.'
  },
  {
    id: 'riyu',
    name: 'Riyu',
    specialty: 'Konselor Remaja & Manajemen Waktu',
    avatar: '🎧',
    whatsappNumber: '62895366922799',
    bio: 'Siap membantu kamu mencari solusi atas penatnya aktivitas harian.'
  }
];

export default function CounselorScreen({ currentUser, onBack, isDarkMode }) {
  const [mode, setMode] = useState('menu');
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const activeUser = currentUser || 'Teman';

  useEffect(() => {
    let unsubscribe = null;
    if (mode === 'human' && selectedCounselor) {
      unsubscribe = subscribeToChat(activeUser, selectedCounselor.id, (fetchedMessages) => {
        setMessages(fetchedMessages);
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [mode, selectedCounselor, activeUser]);

  const handleSendAI = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    triggerFeedback();
    const userMsg = inputText;
    const newMessages = [...messages, { sender: 'user', text: userMsg }];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      
      if (!apiKey) {
        throw new Error("VITE_GROQ_API_KEY belum disetel di file .env");
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            {
              role: 'system',
              content: `Kamu adalah HEAL AI Companion, asisten kesehatan mental dan konselor virtual yang sangat ramah, empatik, suportif, dan hangat layaknya teman sebaya remaja SMA untuk user bernama ${activeUser}. Berikan tanggapan yang menenangkan, santai, dan solutif.`
            },
            {
              role: 'user',
              content: userMsg
            }
          ]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Gagal terhubung ke server AI");
      }

      const aiReplyText = data.choices?.[0]?.message?.content || "Duh sori banget gue lagi ngeblank nih, coba ketik lagi dong.";

      setMessages([...newMessages, { sender: 'ai', text: aiReplyText }]);
    } catch (err) {
      console.error("Gagal memanggil API:", err);
      setMessages([
        ...newMessages,
        { sender: 'ai', text: `⚠️ Kendala AI: ${err.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendHuman = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedCounselor) return;

    triggerFeedback();
    const userMsg = inputText;
    setInputText('');

    await sendChatMessage(activeUser, selectedCounselor.id, 'user', userMsg);

    const encodedMessage = encodeURIComponent(`Halo ${selectedCounselor.name}, saya ${activeUser} dari aplikasi HEAL ingin berkonsultasi:\n\n"${userMsg}"`);
    const waUrl = `https://wa.me/${selectedCounselor.whatsappNumber}?text=${encodedMessage}`;

    window.open(waUrl, '_blank');
  };

  return (
    <div className={`p-5 max-w-4xl mx-auto pb-28 space-y-6 min-h-screen ${isDarkMode ? 'bg-black text-gray-100' : 'bg-transparent text-gray-800'}`}>
      
      <div className="flex items-center justify-between">
        <button 
          onClick={() => {
            if (mode !== 'menu') {
              setMode('menu');
              setSelectedCounselor(null);
            } else {
              onBack();
            }
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-200 hover:bg-gray-800' : 'bg-white border-pink-100 text-gray-700 hover:bg-pink-50'
          }`}
        >
          ← Kembali
        </button>
        <h2 className="font-extrabold text-base">💬 Ruang Konseling</h2>
        <div className="w-16"></div>
      </div>

      {mode === 'menu' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg space-y-3">
            <span className="bg-white/20 backdrop-blur-md text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Layanan Konsultasi Remaja
            </span>
            <h3 className="text-lg font-bold">Pilih Teman Berbicara</h3>
            <p className="text-xs opacity-90 leading-relaxed">
              Kamu bisa mengobrol instan dengan AI Companion atau memilih salah satu konselor pilihan untuk terhubung langsung via WhatsApp.
            </p>
          </div>

          <div 
            onClick={() => { 
              triggerFeedback(); 
              setMode('ai'); 
              setMessages([{ sender: 'ai', text: `Halo ${activeUser}! Aku AI Companion. Ada hal yang ingin kamu ceritakan atau keluhkan hari ini?` }]); 
            }}
            className={`p-5 rounded-3xl border shadow-sm cursor-pointer hover:scale-[1.01] transition-all flex items-center gap-4 ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl shrink-0">
              🤖
            </div>
            <div>
              <h4 className="font-bold text-sm">Konsultasi dengan AI Companion</h4>
              <p className="text-xs opacity-70 leading-relaxed">Respon cerdas otomatis 24/7, aman, dan siap mendengarkan kapan pun.</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider opacity-70 px-1">Pilih Konselor (Terhubung via WhatsApp):</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {COUNSELORS.map((counselor) => (
                <div 
                  key={counselor.id}
                  onClick={() => { triggerFeedback(); setSelectedCounselor(counselor); setMode('human'); }}
                  className={`p-4 rounded-3xl border shadow-sm cursor-pointer hover:scale-[1.02] transition-all space-y-2 ${
                    isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 text-xl flex items-center justify-center shadow-sm">
                      {counselor.avatar}
                    </div>
                    <div>
                      <h5 className="font-bold text-xs">{counselor.name}</h5>
                      <span className="text-[10px] text-pink-500 font-medium">{counselor.specialty}</span>
                    </div>
                  </div>
                  <p className="text-[11px] opacity-75 line-clamp-1">{counselor.bio}</p>
                  <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 pt-1">
                    <span>💬</span> Chat WhatsApp Langsung ›
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {mode !== 'menu' && (
        <div className={`rounded-3xl border shadow-sm flex flex-col h-[65vh] ${
          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'
        }`}>
          
          <div className="p-4 border-b flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-xl">
              {mode === 'ai' ? '🤖' : selectedCounselor.avatar}
            </div>
            <div>
              <h4 className="font-bold text-xs">{mode === 'ai' ? 'AI Companion' : selectedCounselor.name}</h4>
              <p className="text-[10px] text-pink-500 font-medium">
                {mode === 'ai' ? 'Online 24/7 • GPT-OSS-20B' : `${selectedCounselor.specialty} (WhatsApp)`}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-12 text-xs opacity-50 space-y-1">
                <p>Belum ada riwayat pesan tersimpan di akun ini.</p>
                <p>{mode === 'human' ? 'Ketik pesan di bawah untuk langsung membukanya di WhatsApp!' : ''}</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-pink-500 text-white rounded-br-none'
                    : isDarkMode ? 'bg-gray-800 text-gray-200 rounded-bl-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  <p className="font-semibold text-[9px] opacity-70 mb-0.5">
                    {msg.sender === 'user' ? 'Kamu' : mode === 'ai' ? 'AI Companion' : selectedCounselor?.name}
                  </p>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-gray-100 text-gray-500 text-xs animate-pulse">AI sedang merespons...</div>
              </div>
            )}
          </div>

          <form onSubmit={mode === 'ai' ? handleSendAI : handleSendHuman} className="p-3 border-t flex items-center gap-2">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={mode === 'ai' ? "Ketik pesan ke AI..." : `Ketik pesan untuk dikirim via WA ke ${selectedCounselor?.name}...`}
              className={`flex-1 px-4 py-2.5 rounded-full text-xs border outline-none ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}
            />
            <button 
              type="submit"
              className="bg-pink-500 text-white font-bold px-5 py-2.5 rounded-full text-xs shadow-md hover:bg-pink-600 transition-all shrink-0"
            >
              {mode === 'ai' ? 'Kirim ✈️' : 'Kirim ke WA 💬'}
            </button>
          </form>

        </div>
      )}

    </div>
  );
}