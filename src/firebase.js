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

let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("[FB] OK project:", firebaseConfig.projectId);
} catch (e) {
  console.error("[FB] Init fail:", e.message);
}

const KEYS = ["texts", "locations", "blog", "palmares", "config"];
const r = (k) => doc(db, "aguia", k);

// Timeout wrapper
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout — Firebase ne répond pas")), ms))
  ]);
}

export async function loadAll() {
  if (!db) return null;
  try {
    const snaps = await withTimeout(Promise.all(KEYS.map(k => getDoc(r(k)))), 8000);
    const res = {};
    let found = false;
    KEYS.forEach((k, i) => { if (snaps[i].exists()) { res[k] = snaps[i].data().v; found = true; } });
    return found ? res : null;
  } catch (e) {
    console.error("[FB] Load:", e.message);
    return null;
  }
}

export async function saveAll(data) {
  if (!db) return { ok: false, error: "Firebase non initialisé — vérifiez les variables d'environnement" };
  
  const errors = [];
  const ts = new Date().toISOString();

  // Save each document individually with 6s timeout each
  for (const k of KEYS) {
    if (data[k] === undefined) continue;
    try {
      console.log(`[FB] Saving ${k}...`);
      await withTimeout(setDoc(r(k), { v: data[k], t: ts }), 6000);
      console.log(`[FB] ${k} OK`);
    } catch (e) {
      console.error(`[FB] ${k} FAILED:`, e.code || "", e.message);
      let msg = k + ": ";
      if (e.message?.includes("Timeout")) msg += "délai dépassé";
      else if (e.code === "permission-denied") msg += "permission refusée";
      else if (e.code === "resource-exhausted" || e.message?.includes("1 MiB")) msg += "trop volumineux (réduisez les images)";
      else msg += e.message || "erreur";
      errors.push(msg);
    }
  }

  if (errors.length === 0) return { ok: true };
  return { ok: false, error: errors.join(" | ") };
}

