import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function loadFromDB(key, defaultValue) {
  try {
    const snap = await getDoc(doc(db, "site", key));
    return snap.exists() ? snap.data().value : defaultValue;
  } catch (e) {
    console.error(`Load ${key}:`, e);
    return defaultValue;
  }
}

export async function saveToDB(key, data) {
  try {
    await setDoc(doc(db, "site", key), { value: data, updatedAt: new Date().toISOString() });
    return true;
  } catch (e) {
    console.error(`Save ${key}:`, e);
    return false;
  }
}
