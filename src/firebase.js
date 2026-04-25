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
const db = getFirestore(app);
const DOC_REF = doc(db, "site", "all");

export async function loadAll() {
  try {
    const snap = await getDoc(DOC_REF);
    if (snap.exists()) {
      console.log("[Firebase] Loaded OK");
      return snap.data();
    }
    console.log("[Firebase] No data yet");
    return null;
  } catch (e) {
    console.error("[Firebase] Load error:", e.message);
    return null;
  }
}

export async function saveAll(data) {
  try {
    console.log("[Firebase] Saving...");
    await setDoc(DOC_REF, {
      texts: data.texts,
      locations: data.locations,
      blog: data.blog,
      palmares: data.palmares,
      config: data.config,
      updatedAt: new Date().toISOString(),
    });
    console.log("[Firebase] Saved OK!");
    return true;
  } catch (e) {
    console.error("[Firebase] Save FAILED:", e.message);
    return false;
  }
}
