import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, writeBatch } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("[FB] Init OK, project:", firebaseConfig.projectId);
} catch (e) {
  console.error("[FB] Init FAILED:", e.message);
}

// 5 separate documents to stay under Firestore 1MB limit
const KEYS = ["texts", "locations", "blog", "palmares", "config"];
const ref = (key) => doc(db, "aguia", key);

export async function loadAll() {
  if (!db) { console.error("[FB] No db"); return null; }
  try {
    const snaps = await Promise.all(KEYS.map(k => getDoc(ref(k))));
    const result = {};
    let found = false;
    KEYS.forEach((k, i) => {
      if (snaps[i].exists()) {
        result[k] = snaps[i].data().v;
        found = true;
      }
    });
    console.log("[FB] Load:", found ? "data found" : "empty (first visit)");
    return found ? result : null;
  } catch (e) {
    console.error("[FB] Load error:", e.code, e.message);
    return null;
  }
}

export async function saveAll(data) {
  if (!db) { console.error("[FB] No db"); return { ok: false, error: "Firebase non initialisé" }; }
  try {
    console.log("[FB] Saving 5 docs...");
    const batch = writeBatch(db);
    const ts = new Date().toISOString();
    KEYS.forEach(k => {
      if (data[k] !== undefined) {
        batch.set(ref(k), { v: data[k], t: ts });
      }
    });
    await batch.commit();
    console.log("[FB] Saved OK!");
    return { ok: true };
  } catch (e) {
    console.error("[FB] Save FAILED:", e.code, e.message);
    let msg = "Erreur inconnue";
    if (e.code === "permission-denied") msg = "Permission refusée — vérifiez les règles Firestore";
    else if (e.code === "resource-exhausted") msg = "Document trop volumineux — réduisez les images";
    else if (e.code === "unavailable") msg = "Firebase indisponible — vérifiez votre connexion";
    else if (e.message) msg = e.message;
    return { ok: false, error: msg };
  }
}
