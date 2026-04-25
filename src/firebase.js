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

const DOC_REF = doc(db, "site", "all");

export async function loadAll() {
  try {
    const snap = await getDoc(DOC_REF);
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error("Load error:", e);
    return null;
  }
}

export async function saveAll(data) {
  try {
    await setDoc(DOC_REF, { ...data, updatedAt: new Date().toISOString() });
    return true;
  } catch (e) {
    console.error("Save error:", e);
    return false;
  }
}
