// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFirestore, Firestore } from "firebase/firestore";
import { getDatabase, Database } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAX17XUOiLQSCszTg6DnHpnWSnelYYkQes",
  authDomain: "llb-case-tracker.firebaseapp.com",
  databaseURL: "https://llb-case-tracker-default-rtdb.firebaseio.com",
  projectId: "llb-case-tracker",
  storageBucket: "llb-case-tracker.firebasestorage.app",
  messagingSenderId: "539879699050",
  appId: "1:539879699050:web:c5dbc51ec4841fe77c9013",
  measurementId: "G-NX3EN6M8EL",
};

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
