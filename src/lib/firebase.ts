// Firebase initialization (client-side only)
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZrgrH46VBv56E9i8MUzwtxyoQf8t7He0",
  authDomain: "iesvdv-96a18.firebaseapp.com",
  projectId: "iesvdv-96a18",
  storageBucket: "iesvdv-96a18.firebasestorage.app",
  messagingSenderId: "526669274609",
  appId: "1:526669274609:web:4c5d370e2f7d27cb467850",
  measurementId: "G-SV1CTE3TB4",
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== "undefined") {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // SSR fallback (never used in this app, but keeps imports safe)
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };
