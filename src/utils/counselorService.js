import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';

// 1. Fungsi untuk mendengarkan pesan secara Real-time (Auto-sync)
export function subscribeToChat(username, counselorId, callback) {
  const chatDocId = `${username}_${counselorId}`;
  const docRef = doc(db, 'counselor_chats', chatDocId);

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().messages || []);
    } else {
      callback([]);
    }
  });
}

// 2. Fungsi untuk menyimpan pesan ke Firebase saat dikirim ke WhatsApp
export async function sendChatMessage(username, counselorId, sender, text) {
  try {
    const chatDocId = `${username}_${counselorId}`;
    const docRef = doc(db, 'counselor_chats', chatDocId);
    
    const newMessage = {
      sender: sender, // 'user' atau 'counselor'
      text: text,
      timestamp: new Date().toISOString()
    };

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        username: username,
        counselorId: counselorId,
        messages: [newMessage]
      });
    } else {
      await updateDoc(docRef, {
        messages: arrayUnion(newMessage)
      });
    }
  } catch (err) {
    console.error("Gagal menyimpan pesan:", err);
  }
}