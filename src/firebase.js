// Import fungsi yang dibutuhkan dari Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider, 
  initializeAuth, 
  indexedDBLocalPersistence, 
  browserLocalPersistence,
  browserPopupRedirectResolver 
} from "firebase/auth";

// Konfigurasi Firebase Web App milikmu
const firebaseConfig = {
  apiKey: "AIzaSyD1zHbpd3QSVZpkTbmosOQ3cA-QtO3oo-o",
  authDomain: "heal-app-83869.firebaseapp.com",
  projectId: "heal-app-83869",
  storageBucket: "heal-app-83869.firebasestorage.app",
  messagingSenderId: "79174316855",
  appId: "1:79174316855:web:b2140ae784b37ab50da0b2",
  measurementId: "G-MNJ9GCYWL0"
};

// Inisialisasi Firebase App
const app = initializeApp(firebaseConfig);

// Ekspor layanan database
export const db = getFirestore(app);

// Inisialisasi Auth dengan browserPopupRedirectResolver agar signInWithPopup berfungsi di Web/Capacitor
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    popupRedirectResolver: browserPopupRedirectResolver
  });
} catch (e) {
  authInstance = getAuth(app);
}
export const auth = authInstance;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });