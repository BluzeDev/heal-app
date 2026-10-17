import React, { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import {
  collection, addDoc, onSnapshot, query, orderBy, doc, getDoc, setDoc, serverTimestamp, getDocs, where
} from "firebase/firestore";
import { ArrowLeft, Search, Send, Users, Phone, Music2, MessageCircle, Clock, Check, CheckCheck } from "lucide-react";
import { triggerFeedback } from "./utils/feedback";

export default function SocialScreen({ currentUser, onBack, isDarkMode }) {
  const [tab, setTab] = useState("discover"); // discover | inbox | chat
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  // Chat States
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [inbox, setInbox] = useState([]);
  const [partnerStatus, setPartnerStatus] = useState({ isOnline: false, lastSeen: '' });
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const chatId = (a, b) => [a, b].sort().join("__");

  // 1. Maintain currentUser's online presence / heartbeat
  useEffect(() => {
    if (!currentUser) return;
    const updateActivePresence = async () => {
      try {
        await setDoc(doc(db, "data_login", currentUser), {
          lastActive: serverTimestamp(),
          isOnline: true
        }, { merge: true });
      } catch (e) {}
    };

    updateActivePresence();
    const heartbeat = setInterval(updateActivePresence, 30000); // 30 detik
    return () => clearInterval(heartbeat);
  }, [currentUser]);

  // 2. Search users across Multi-Kriteria
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

  // Real-time debounce search effect
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

  // 3. Load inbox (recent chats) - Tanpa orderBy di query Firestore agar tidak memicu composite index error
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
          // Sorting array secara lokal di JavaScript untuk menjamin urutan terbaru
          chats.sort((a, b) => {
            const timeA = a.lastTime?.toMillis ? a.lastTime.toMillis() : (a.lastTime?.seconds ? a.lastTime.seconds * 1000 : 0);
            const timeB = b.lastTime?.toMillis ? b.lastTime.toMillis() : (b.lastTime?.seconds ? b.lastTime.seconds * 1000 : 0);
            return timeB - timeA;
          });
          setInbox(chats);
        },
        (err) => {
          console.warn("Inbox snapshot notice:", err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn("Error setting up inbox listener:", e);
    }
  }, [currentUser]);

  // 4. Buka Room Chat dengan Target User
  const openChat = (targetUser) => {
    triggerFeedback();
    setActiveChat(targetUser);
    setTab("chat");
  };

  // 5. Pantau Status Online & Last Seen Lawan Bicara
  useEffect(() => {
    if (!activeChat?.id) return;
    try {
      const unsub = onSnapshot(doc(db, "data_login", activeChat.id), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const lastActiveTime = data.lastActive?.toMillis 
            ? data.lastActive.toMillis() 
            : (data.lastActive?.seconds ? data.lastActive.seconds * 1000 : null);

          const isRecent = lastActiveTime && (Date.now() - lastActiveTime < 90000); // Aktif 90 detik terakhir
          let lastSeenText = '';
          if (lastActiveTime) {
            lastSeenText = new Date(lastActiveTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          }
          setPartnerStatus({
            isOnline: !!isRecent,
            lastSeen: lastSeenText
          });
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn("Error tracking partner status:", e);
    }
  }, [activeChat?.id]);

  // 6. Pantau Typing Indicator Lawan Bicara
  useEffect(() => {
    if (!activeChat || !currentUser) return;
    const cid = chatId(currentUser, activeChat.id);
    try {
      const unsub = onSnapshot(doc(db, "direct_chats", cid), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const partnerTyping = data.typing?.[activeChat.id];
          setIsPartnerTyping(!!partnerTyping);
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn("Error tracking typing status:", e);
    }
  }, [activeChat, currentUser]);

  // 7. Load messages in real-time & Update Read Receipt (Tanda Dibaca)
  useEffect(() => {
    if (!activeChat || !currentUser) return;
    const cid = chatId(currentUser, activeChat.id);
    const q = query(collection(db, "direct_chats", cid, "messages"), orderBy("timestamp", "asc"));
    
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(list);

      // Read Receipt: Tandai pesan dari lawan bicara sebagai sudah dibaca (read: true)
      snap.docs.forEach((docItem) => {
        const m = docItem.data();
        if (m.sender === activeChat.id && !m.read) {
          setDoc(docItem.ref, { read: true }, { merge: true }).catch(() => {});
        }
      });

      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsub();
  }, [activeChat, currentUser]);

  // 8. Handle Input Mengetik (Typing Indicator)
  const handleInputChange = (e) => {
    const val = e.target.value;
    setMsgInput(val);
    if (!activeChat || !currentUser) return;
    const cid = chatId(currentUser, activeChat.id);

    // Kirim status mengetik: true
    setDoc(doc(db, "direct_chats", cid), {
      typing: { [currentUser]: true }
    }, { merge: true }).catch(() => {});

    // Debounce 2 detik untuk ubah status mengetik kembali ke false
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setDoc(doc(db, "direct_chats", cid), {
        typing: { [currentUser]: false }
      }, { merge: true }).catch(() => {});
    }, 2000);
  };

  // 9. Send message
  const sendMessage = async () => {
    if (!msgInput.trim() || !activeChat) return;
    triggerFeedback();
    const cid = chatId(currentUser, activeChat.id);
    const text = msgInput.trim();
    setMsgInput("");

    // Reset status mengetik segera
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setDoc(doc(db, "direct_chats", cid), {
      typing: { [currentUser]: false }
    }, { merge: true }).catch(() => {});

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
        read: false // Default belum dibaca
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
            onClick={() => { triggerFeedback(); setTab("inbox"); }}
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
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            <p className="text-[10px] opacity-60 px-1">
              💡 Mendukung pencarian instan nama lengkap, nama panggilan, sosial media, & telepon.
            </p>
          </div>

          {/* Hasil Pencarian */}
          <div className="space-y-2.5">
            {searching ? (
              <div className="text-center py-8 text-xs opacity-60 animate-pulse">
                Mencari pengguna... 🌸
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((usr) => (
                <div
                  key={usr.id}
                  className={`p-3.5 rounded-3xl border transition-all shadow-sm flex items-center justify-between gap-3 ${
                    isDarkMode ? "bg-gray-900 border-gray-800 hover:border-purple-600" : "bg-white border-purple-100 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xl shadow-md shrink-0">
                      {usr.avatar && usr.avatar.length <= 4 ? usr.avatar : "🌸"}
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs truncate">{usr.namaLengkap}</span>
                        {usr.namaPanggilan && (
                          <span className="text-[10px] font-bold text-purple-500 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.2 rounded-md">
                            @{usr.namaPanggilan}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] opacity-60 truncate">
                        {usr.sekolahAsal || "Sobat HEAL"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openChat({ id: usr.id, namaLengkap: usr.namaLengkap })}
                    className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>
                </div>
              ))
            ) : searchQuery.trim().length >= 1 ? (
              <div className={`p-6 rounded-3xl text-center border text-xs opacity-60 ${
                isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-purple-100"
              }`}>
                Pengguna dengan kata kunci "{searchQuery}" tidak ditemukan.
              </div>
            ) : (
              <div className={`p-6 rounded-3xl text-center border text-xs space-y-1.5 ${
                isDarkMode ? "bg-gray-900 border-gray-800 opacity-60" : "bg-white/80 border-purple-100 text-gray-500"
              }`}>
                <p className="font-bold">Ketik nama teman untuk memulai percakapan</p>
                <p className="text-[11px] opacity-75">HEAL menghubungkan remaja untuk saling mendukung kesehatan mental & fisik.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────── TAB 2: INBOX CHAT ───────────── */}
      {tab === "inbox" && (
        <div className="px-4 max-w-xl mx-auto w-full space-y-2.5 pt-1">
          {inbox.length === 0 ? (
            <div className={`p-8 rounded-3xl text-center border space-y-2 ${
              isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-purple-100"
            }`}>
              <span className="text-3xl">💌</span>
              <p className="font-bold text-xs">Belum ada obrolan aktif</p>
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
          
          {/* Chat Partner Header Card (Indikator Online / Last Seen) */}
          <div className={`p-3 rounded-2xl border mb-3 flex items-center justify-between shadow-sm ${
            isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-purple-100"
          }`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-inner shrink-0">
                  {(activeChat.namaLengkap || activeChat.id).charAt(0).toUpperCase()}
                </div>
                {/* Green badge if online */}
                {partnerStatus.isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900" />
                )}
              </div>

              <div className="overflow-hidden">
                <p className="font-extrabold text-xs truncate">
                  {activeChat.namaLengkap || activeChat.id}
                </p>
                
                {/* Status Online atau Waktu Terakhir Aktif */}
                {partnerStatus.isOnline ? (
                  <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Online</span>
                  </p>
                ) : partnerStatus.lastSeen ? (
                  <p className="text-[10px] opacity-60 font-medium">
                    Terakhir aktif {partnerStatus.lastSeen}
                  </p>
                ) : (
                  <p className="text-[10px] opacity-60 font-medium">
                    Offline
                  </p>
                )}
              </div>
            </div>

            <div className="text-[10px] font-bold text-purple-500 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-full">
              Ruang Chat Langsung
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

                    {/* Status Pengiriman & Tanda Dibaca (Read Receipt) */}
                    <div className="flex items-center gap-1 text-[9px] px-1 mt-0.5">
                      {isMe ? (
                        <>
                          {msg.read ? (
                            <span className="text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                              <CheckCheck className="w-3 h-3" />
                              <span>Dibaca</span>
                            </span>
                          ) : (
                            <span className="opacity-50 flex items-center gap-0.5">
                              <Check className="w-3 h-3" />
                              <span>Terkirim</span>
                            </span>
                          )}
                          {timeStr && <span className="opacity-40">• {timeStr}</span>}
                        </>
                      ) : (
                        timeStr && <span className="opacity-40">{timeStr}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Typing Indicator */}
          {isPartnerTyping && (
            <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] text-purple-600 dark:text-purple-400 font-bold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>
              <span>{activeChat.namaLengkap || activeChat.id} sedang mengetik...</span>
            </div>
          )}

          {/* Message Input Box */}
          <div className="pt-2">
            <div className={`flex items-center gap-2 p-2 border-2 rounded-3xl shadow-md ${
              isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-purple-100"
            }`}>
              <input
                type="text"
                value={msgInput}
                onChange={handleInputChange}
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
