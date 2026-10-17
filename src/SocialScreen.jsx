import React, { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import {
  collection, addDoc, onSnapshot, query, orderBy, doc, getDoc, setDoc, serverTimestamp, getDocs, where
} from "firebase/firestore";
import { ArrowLeft, Search, Send, Users, Phone, Music2, MessageCircle, Clock } from "lucide-react";
import { triggerFeedback } from "./utils/feedback";

export default function SocialScreen({ currentUser, onBack, isDarkMode }) {
  const [tab, setTab] = useState("discover"); // discover | inbox | chat
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [inbox, setInbox] = useState([]);
  const bottomRef = useRef(null);

  const chatId = (a, b) => [a, b].sort().join("__");

  // Search users across Multi-Kriteria: Nama (Lengkap/Panggilan), Username IG, TikTok, No HP
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const snap = await getDocs(collection(db, "data_login"));
      const results = [];
      const q = searchQuery.toLowerCase().replace('@', '').trim();
      const qCleanNo = searchQuery.replace(/[^0-9]/g, '');

      snap.forEach((d) => {
        if (d.id === currentUser) return;
        const data = d.data();
        const namaLengkap = (data.nama_lengkap || data.namaLengkap || "").toLowerCase();
        const namaPanggilan = (data.nama_panggilan || data.namaPanggilan || d.id || "").toLowerCase();
        const ig = (data.username_ig || data.usernameIg || "").toLowerCase();
        const tiktok = (data.username_tiktok || data.usernameTiktok || "").toLowerCase();
        const rawNoHp = data.no_hp || data.noHp || data.noWhatsapp || "";
        const cleanNoHp = rawNoHp.replace(/[^0-9]/g, '');

        const isMatch =
          d.id.toLowerCase().includes(q) ||
          namaLengkap.includes(q) ||
          namaPanggilan.includes(q) ||
          ig.includes(q) ||
          tiktok.includes(q) ||
          (qCleanNo.length >= 3 && cleanNoHp.includes(qCleanNo));

        if (isMatch) {
          results.push({
            id: d.id,
            namaLengkap: data.nama_lengkap || data.namaLengkap || d.id,
            namaPanggilan: data.nama_panggilan || data.namaPanggilan || d.id,
            sekolahAsal: data.sekolah_asal || data.sekolahAsal || '',
            kelas: data.kelas || '',
            noHp: rawNoHp,
            usernameIg: data.username_ig || data.usernameIg || '',
            usernameTiktok: data.username_tiktok || data.usernameTiktok || '',
            avatar: data.avatar || '🌸',
            bio: data.bio || ''
          });
        }
      });
      setSearchResults(results);
    } catch (err) {
      console.error("Search error in SocialScreen:", err);
    } finally {
      setSearching(false);
    }
  };

  // Real-time search effect
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      if (searchQuery.trim().length >= 1) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delayTimer);
  }, [searchQuery]);

  // Load inbox (recent chats)
  useEffect(() => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, "direct_chats"),
        where("participants", "array-contains", currentUser)
      );
      const unsub = onSnapshot(
        q, 
        (snap) => {
          const chats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          chats.sort((a, b) => {
            const timeA = a.lastTime?.toMillis ? a.lastTime.toMillis() : (a.lastTime?.seconds ? a.lastTime.seconds * 1000 : 0);
            const timeB = b.lastTime?.toMillis ? b.lastTime.toMillis() : (b.lastTime?.seconds ? b.lastTime.seconds * 1000 : 0);
            return timeB - timeA;
          });
          setInbox(chats);
        },
        (err) => {
          console.warn("Inbox snapshot warning:", err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn("Error setting up inbox listener:", e);
    }
  }, [currentUser]);

  // Open chat with target user
  const openChat = (targetUser) => {
    triggerFeedback();
    setActiveChat(targetUser);
    setTab("chat");
  };

  // Load messages in real-time
  useEffect(() => {
    if (!activeChat || !currentUser) return;
    const cid = chatId(currentUser, activeChat.id);
    const q = query(collection(db, "direct_chats", cid, "messages"), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsub();
  }, [activeChat, currentUser]);

  // Send message
  const sendMessage = async () => {
    if (!msgInput.trim() || !activeChat) return;
    triggerFeedback();
    const cid = chatId(currentUser, activeChat.id);
    const text = msgInput.trim();
    setMsgInput("");
    try {
      await setDoc(doc(db, "direct_chats", cid), {
        participants: [currentUser, activeChat.id],
        lastMessage: text,
        lastTime: serverTimestamp(),
        userNames: {
          [currentUser]: currentUser,
          [activeChat.id]: activeChat.namaLengkap || activeChat.id
        },
      }, { merge: true });

      await addDoc(collection(db, "direct_chats", cid, "messages"), {
        sender: currentUser,
        text,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Gagal mengirim pesan chat:", err);
      alert("Gagal mengirim pesan. Pastikan koneksi stabil.");
    }
  };

  return (
    <div className={`flex flex-col min-h-screen pb-16 transition-colors duration-300 ${
      isDarkMode ? "bg-black text-gray-100" : "bg-gradient-to-b from-purple-50 via-pink-50 to-white text-gray-800"
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b sticky top-0 z-30 backdrop-blur-md ${
        isDarkMode ? "bg-black/85 border-gray-800" : "bg-white/80 border-purple-100"
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              triggerFeedback();
              if (tab === "chat") {
                setTab("inbox");
              } else {
                onBack();
              }
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all ${
              isDarkMode ? "bg-gray-800 text-gray-200 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <ArrowLeft className="w-5 h-5 text-purple-600" />
          </button>
          <div>
            <h1 className="font-black text-lg flex items-center gap-1.5">
              <span>💬</span> Social & Chat HEAL
            </h1>
            <p className="text-[10px] opacity-60">Cari teman & kirim pesan langsung di aplikasi</p>
          </div>
        </div>

        {tab === "chat" && (
          <button
            onClick={() => setTab("inbox")}
            className="text-xs font-bold text-purple-500 hover:underline px-3 py-1 bg-purple-50 dark:bg-purple-950/60 rounded-full"
          >
            ← Inbox
          </button>
        )}
      </div>

      {/* Tabs Switcher */}
      {tab !== "chat" && (
        <div className="flex gap-2 px-4 pt-3 pb-2 max-w-xl mx-auto w-full">
          <button
            onClick={() => { triggerFeedback(); setTab("discover"); }}
            className={`flex-1 py-2.5 rounded-2xl font-black text-xs transition-all shadow-sm ${
              tab === "discover"
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-purple-500/25 scale-102"
                : isDarkMode
                ? "bg-gray-900 text-gray-400 hover:bg-gray-800"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-purple-100"
            }`}
          >
            🔍 Cari Pengguna
          </button>
          <button
            onClick={() => { triggerFeedback(); setTab("inbox"); }}
            className={`flex-1 py-2.5 rounded-2xl font-black text-xs transition-all shadow-sm relative ${
              tab === "inbox"
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-purple-500/25 scale-102"
                : isDarkMode
                ? "bg-gray-900 text-gray-400 hover:bg-gray-800"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-purple-100"
            }`}
          >
            💌 Inbox Chat
            {inbox.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 text-[10px] rounded-full bg-pink-500 text-white font-bold">
                {inbox.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ───────────── TAB 1: DISCOVER & MULTI-CRITERIA SEARCH ───────────── */}
      {tab === "discover" && (
        <div className="px-4 max-w-xl mx-auto w-full space-y-4 pt-1">
          {/* Smart Search Bar */}
          <div className="space-y-1">
            <div className={`flex items-center gap-2 border-2 rounded-2xl px-3.5 py-2.5 shadow-sm transition-all ${
              isDarkMode 
                ? "bg-gray-900 border-gray-800 focus-within:border-purple-500 text-white" 
                : "bg-white border-purple-100 focus-within:border-purple-400 text-gray-800"
            }`}>
              <Search className="w-4 h-4 text-purple-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Cari nama, IG, TikTok, atau nomor WhatsApp..."
                className="flex-1 bg-transparent outline-none text-xs font-medium placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-gray-400 hover:text-gray-600 font-bold px-1"
                >
                  ✕
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-400 px-1">
              ✨ Ketik nama panggilan, @instagram, @tiktok, atau nomor HP (contoh: 08...)
            </p>
          </div>

          {searching && (
            <div className="text-center py-6 text-xs text-purple-500 font-bold animate-pulse">
              Sedang mencari pengguna HEAL...
            </div>
          )}

          {/* Results List */}
          <div className="space-y-2.5">
            {searchResults.map((u) => (
              <div
                key={u.id}
                onClick={() => openChat(u)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer hover:shadow-md flex items-center justify-between gap-3 group ${
                  isDarkMode 
                    ? "bg-gray-900 border-gray-800 hover:border-purple-500" 
                    : "bg-white border-purple-50 hover:border-purple-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-black text-lg overflow-hidden shadow-md shrink-0">
                    {u.avatar && (u.avatar.startsWith("data:") || u.avatar.startsWith("http")) ? (
                      <img src={u.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      u.avatar || u.id.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-xs group-hover:text-purple-600 transition-colors">
                      {u.namaLengkap}
                    </p>
                    <p className="text-[11px] text-purple-500 font-bold">@{u.namaPanggilan}</p>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] opacity-70">
                      {u.sekolahAsal && <span>🏫 {u.sekolahAsal}</span>}
                      {u.usernameIg && <span>📸 @{u.usernameIg}</span>}
                      {u.noHp && <span>📱 {u.noHp}</span>}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1 shrink-0"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>
              </div>
            ))}
          </div>

          {!searching && searchResults.length === 0 && searchQuery && (
            <div className={`p-8 rounded-3xl text-center border shadow-sm space-y-2 ${
              isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-purple-100"
            }`}>
              <p className="text-3xl">👥</p>
              <h4 className="font-bold text-xs">Tidak Ada Pengguna Ditemukan</h4>
              <p className="text-[11px] opacity-60">
                Coba gunakan kata kunci lain, nama lengkap, atau username IG.
              </p>
            </div>
          )}

          {!searchQuery && (
            <div className={`p-8 rounded-3xl text-center border shadow-sm space-y-2 ${
              isDarkMode ? "bg-gray-900/60 border-gray-800" : "bg-white/70 border-purple-100"
            }`}>
              <div className="text-4xl mb-2">🤝</div>
              <h3 className="font-extrabold text-sm text-purple-600">Temukan Sobat HEAL Lainnya</h3>
              <p className="text-xs opacity-70 max-w-xs mx-auto leading-relaxed">
                Gunakan kotak pencarian di atas untuk mencari teman berdasarkan nama, username Instagram, TikTok, atau nomor WhatsApp.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ───────────── TAB 2: INBOX LIST ───────────── */}
      {tab === "inbox" && (
        <div className="px-4 max-w-xl mx-auto w-full space-y-2.5 pt-1">
          {inbox.length === 0 ? (
            <div className={`p-10 rounded-3xl text-center border shadow-sm space-y-2 ${
              isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-purple-100"
            }`}>
              <div className="text-4xl mb-2">💌</div>
              <h3 className="font-bold text-sm">Belum Ada Percakapan Aktif</h3>
              <p className="text-xs opacity-60 max-w-xs mx-auto">
                Mulai obrolan dengan temanmu sekarang melalui tab "Cari Pengguna"!
              </p>
              <button
                onClick={() => setTab("discover")}
                className="mt-3 px-4 py-2 rounded-full bg-purple-500 text-white font-bold text-xs shadow-md hover:bg-purple-600 transition-all inline-block"
              >
                Cari Teman Sekarang
              </button>
            </div>
          ) : (
            inbox.map((chat) => {
              const otherId = chat.participants?.find((p) => p !== currentUser) || "";
              const otherName = chat.userNames?.[otherId] || otherId;
              const formattedTime = chat.lastTime?.toDate
                ? new Date(chat.lastTime.toDate()).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                : "";

              return (
                <div
                  key={chat.id}
                  onClick={() => openChat({ id: otherId, namaLengkap: otherName })}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer hover:shadow-md flex items-center justify-between gap-3 ${
                    isDarkMode ? "bg-gray-900 border-gray-800 hover:border-purple-600" : "bg-white border-purple-50 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-base shadow-sm shrink-0">
                      {otherName.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <p className="font-extrabold text-xs">{otherName}</p>
                      <p className="text-[11px] opacity-60 truncate max-w-[200px]">
                        {chat.lastMessage || "Mulai percakapan..."}
                      </p>
                    </div>
                  </div>

                  {formattedTime && (
                    <div className="text-[10px] font-bold text-gray-400 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formattedTime}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ───────────── TAB 3: REAL-TIME ROOM CHAT ───────────── */}
      {tab === "chat" && activeChat && (
        <div className="flex flex-col flex-1 max-w-xl mx-auto w-full px-4">
          {/* Chat Partner Header Card */}
          <div className={`p-3 rounded-2xl border mb-3 flex items-center gap-3 shadow-sm ${
            isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-purple-100"
          }`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-inner shrink-0">
              {(activeChat.namaLengkap || activeChat.id).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-extrabold text-xs truncate">
                {activeChat.namaLengkap || activeChat.id}
              </p>
              <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
                <span>Ruang Chat Real-time</span>
              </p>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div
            className={`flex-1 overflow-y-auto p-4 rounded-3xl border space-y-2.5 shadow-inner ${
              isDarkMode ? "bg-gray-900/60 border-gray-800" : "bg-white/80 border-purple-100"
            }`}
            style={{ maxHeight: "calc(100vh - 280px)", minHeight: "350px" }}
          >
            {messages.length === 0 ? (
              <div className="text-center py-12 text-xs opacity-50">
                Belum ada pesan. Ucapkan salam untuk memulai obrolan! 👋
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender === currentUser;
                const timeStr = msg.timestamp?.toDate
                  ? new Date(msg.timestamp.toDate()).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                  : "";

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs max-w-[80%] leading-relaxed shadow-sm ${
                        isMe
                          ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-br-sm"
                          : isDarkMode
                          ? "bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-sm"
                          : "bg-purple-100 text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                    {timeStr && (
                      <span className="text-[9px] opacity-40 px-1 mt-0.5">{timeStr}</span>
                    )}
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Message Input Box */}
          <div className="pt-3">
            <div className={`flex items-center gap-2 p-2 border-2 rounded-3xl shadow-md ${
              isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-purple-100"
            }`}>
              <input
                type="text"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Tulis pesan kamu..."
                className="flex-1 bg-transparent px-3 py-1.5 text-xs outline-none font-medium"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!msgInput.trim()}
                className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
