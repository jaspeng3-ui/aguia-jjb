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
    if (snap.exists()) {
      console.log("Firebase: data loaded OK");
      return snap.data();
    }
    console.log("Firebase: no data yet, using defaults");
    return null;
  } catch (e) {
    console.error("Firebase LOAD error:", e);
    return null;
  }
}

export async function saveAll(data) {
  console.log("Firebase: saving...");
  await setDoc(DOC_REF, { ...data, updatedAt: new Date().toISOString() });
  console.log("Firebase: saved OK");
  return true;
}
