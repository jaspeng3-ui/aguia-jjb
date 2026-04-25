# Aguia JJB — Site Internet

Site web du club de Jiu-Jitsu Brésilien Aguia JJB avec base de données Firebase.

---

## 🔥 Étape 1 : Créer le projet Firebase (5 min)

1. Va sur **[console.firebase.google.com](https://console.firebase.google.com)**
2. Clique **"Ajouter un projet"** → Nom : `aguia-jjb` → Créer
3. Une fois le projet créé :

### Activer Firestore (base de données)
- Menu gauche → **"Firestore Database"** → **"Créer une base de données"**
- Choisir **"Mode test"** (on sécurisera après)
- Sélectionner la région **europe-west1** → Créer

### Activer Storage (stockage images)
- Menu gauche → **"Storage"** → **"Commencer"**
- Choisir **"Mode test"** → Suivant → Terminer

### Récupérer les clés
- Clique sur l'icône **⚙️ (engrenage)** en haut à gauche → **"Paramètres du projet"**
- Descends jusqu'à **"Vos applications"** → Clique **"</>"** (Web)
- Nom : `aguia-jjb-web` → Enregistrer
- Tu verras un bloc avec `firebaseConfig` — **copie ces valeurs** :
  ```
  apiKey: "AIza..."
  authDomain: "aguia-jjb.firebaseapp.com"
  projectId: "aguia-jjb"
  storageBucket: "aguia-jjb.firebasestorage.app"
  messagingSenderId: "123..."
  appId: "1:123...:web:abc..."
  ```

---

## 📁 Étape 2 : Préparer le projet (2 min)

1. **Dézippe** le dossier `aguia-vercel`
2. Crée un fichier **`.env`** à la racine du projet (copie `.env.example`) :
   ```
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=aguia-jjb.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=aguia-jjb
   VITE_FIREBASE_STORAGE_BUCKET=aguia-jjb.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=123...
   VITE_FIREBASE_APP_ID=1:123...:web:abc...
   ```
3. Remplace les valeurs par celles de ton projet Firebase

---

## 🚀 Étape 3 : Déployer sur Vercel (3 min)

### Via GitHub (recommandé)

1. **Crée un repo GitHub** sur [github.com/new](https://github.com/new)
2. **Upload** tous les fichiers du dossier (SAUF `.env`)
3. Va sur **[vercel.com](https://vercel.com)** → connecte-toi avec GitHub
4. Clique **"Add New Project"** → sélectionne ton repo
5. **IMPORTANT** — Avant de déployer, ajoute les variables d'environnement :
   - Clique **"Environment Variables"**
   - Ajoute chaque variable de ton `.env` :
     | Name | Value |
     |------|-------|
     | `VITE_FIREBASE_API_KEY` | `AIza...` |
     | `VITE_FIREBASE_AUTH_DOMAIN` | `aguia-jjb.firebaseapp.com` |
     | `VITE_FIREBASE_PROJECT_ID` | `aguia-jjb` |
     | `VITE_FIREBASE_STORAGE_BUCKET` | `aguia-jjb.firebasestorage.app` |
     | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123...` |
     | `VITE_FIREBASE_APP_ID` | `1:123...:web:abc...` |
6. Clique **"Deploy"** → Ton site est en ligne !

---

## 🔐 Étape 4 : Sécuriser Firebase (important !)

Après avoir vérifié que tout fonctionne, sécurise ta base de données :

### Firestore Rules
Dans Firebase Console → Firestore → **Règles**, remplace par :
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /site/{document} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

### Storage Rules
Dans Firebase Console → Storage → **Règles**, remplace par :
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{allPaths=**} {
      allow read: if true;
      allow write: if request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

---

## 🔑 Accès Admin

- URL : `tonsite.vercel.app/#admin`
- Code : `aguia83000toulonjjb`

---

## 📂 Structure

```
aguia-vercel/
├── public/
│   ├── logo.png
│   └── banner.jpg
├── src/
│   ├── main.jsx
│   ├── firebase.js      ← Configuration Firebase
│   └── App.jsx           ← Application complète
├── .env.example           ← Template des variables
├── index.html
├── package.json
└── vite.config.js
```

---

## ✅ Ce qui est sauvegardé dans Firebase

- Tous les textes de toutes les pages
- Lieux et horaires d'entraînement
- Articles de blog (avec images)
- Palmarès
- Configuration (bannière, lien HelloAsso, réseaux sociaux)

Les modifications admin sont **visibles par tous les visiteurs** instantanément.
