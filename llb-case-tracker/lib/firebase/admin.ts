import * as admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";

// Get the service account from environment variables or firebase.json
let serviceAccount: admin.ServiceAccount;

// Priority: Environment variables > Base64 config > firebase.json
if (
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_CLIENT_EMAIL
) {
  // Use environment variables (production)
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };
} else if (process.env.FIREBASE_CONFIG_BASE64) {
  // Use base64 encoded config
  try {
    const firebaseConfig = JSON.parse(
      Buffer.from(process.env.FIREBASE_CONFIG_BASE64, "base64").toString()
    );
    serviceAccount = {
      projectId: firebaseConfig.project_id,
      privateKey: firebaseConfig.private_key?.replace(/\\n/g, "\n"),
      clientEmail: firebaseConfig.client_email,
    };
  } catch (error) {
    console.error("❌ Error parsing FIREBASE_CONFIG_BASE64:", error);
    throw new Error(
      "Failed to parse Firebase config from environment variable"
    );
  }
} else {
  // Fallback to firebase.json (local development)
  try {
    const firebaseJsonPath = path.join(process.cwd(), "firebase.json");
    const firebaseJson = JSON.parse(fs.readFileSync(firebaseJsonPath, "utf8"));
    serviceAccount = {
      projectId: firebaseJson.project_id,
      privateKey: firebaseJson.private_key?.replace(/\\n/g, "\n"),
      clientEmail: firebaseJson.client_email,
    };
  } catch (error) {
    console.error("❌ Error reading firebase.json:", error);
    throw new Error(
      "Failed to load Firebase service account. Please set environment variables or provide firebase.json"
    );
  }
}

// Initialize Firebase Admin SDK (Global Singleton)
// This ensures Firebase Admin is only initialized once across all API routes
let adminApp: admin.app.App;

try {
  if (admin.apps.length === 0) {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL:
        process.env.FIREBASE_DATABASE_URL ||
        "https://llb-case-tracker-default-rtdb.firebaseio.com",
    });
    console.log("✅ Firebase Admin SDK initialized successfully (Global)");
  } else {
    adminApp = admin.app();
  }
} catch (error) {
  console.error("❌ Firebase Admin initialization error:", error);
  throw error;
}

// Export Firebase Admin services
export const adminAuth = admin.auth(adminApp);
export const adminDb = admin.database(adminApp);
export const adminFirestore = admin.firestore(adminApp);
export const adminStorage = admin.storage(adminApp);

// Export the admin app instance
export default adminApp;
