import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL, // khusus Realtime
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,     // wajib untuk Firestore
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Init App
const app = initializeApp(firebaseConfig);

// Export dua instance (beda service)
export const dbFirestore = getFirestore(app);  // Cloud Firestore
export const dbRealtime = getDatabase(app);    // Realtime Database
