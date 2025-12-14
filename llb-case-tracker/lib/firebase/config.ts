// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFirestore, Firestore } from "firebase/firestore";
import { getDatabase, Database } from "firebase/database";

// Your web app's Firebase configuration
// Uses environment variables with fallback to hardcoded values for development
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAX17XUOiLQSCszTg6DnHpnWSnelYYkQes",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "llb-case-tracker.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://llb-case-tracker-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "llb-case-tracker",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "llb-case-tracker.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "539879699050",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:539879699050:web:c5dbc51ec4841fe77c9013",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-NX3EN6M8EL",
};

// Validate required configuration
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("your-") || firebaseConfig.apiKey.includes("REPLACE")) {
  console.error("❌ Firebase API key is missing or invalid. Please set NEXT_PUBLIC_FIREBASE_API_KEY in .env.local");
}

// Initialize Firebase App
export const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
export const analytics: Analytics | null =
  typeof window !== "undefined" ? getAnalytics(app) : null;

// Initialize and export Firebase services
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);
export const db: Firestore = getFirestore(app);
export const database: Database = getDatabase(app);
