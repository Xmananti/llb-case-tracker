import * as admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";

// Get the service account from firebase.json
const firebaseJsonPath = path.join(process.cwd(), "firebase.json");
let serviceAccount: admin.ServiceAccount;

try {
  const firebaseJson = JSON.parse(fs.readFileSync(firebaseJsonPath, "utf8"));

  // Extract service account credentials from firebase.json
  serviceAccount = {
    projectId: firebaseJson.project_id,
    privateKey: firebaseJson.private_key?.replace(/\\n/g, "\n"),
    clientEmail: firebaseJson.client_email,
  };
} catch (error) {
  console.error("❌ Error reading firebase.json:", error);
  throw new Error("Failed to load Firebase service account from firebase.json");
}

// Initialize Firebase Admin SDK (Global Singleton)
// This ensures Firebase Admin is only initialized once across all API routes
let adminApp: admin.app.App;

try {
  if (admin.apps.length === 0) {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://llb-case-tracker-default-rtdb.firebaseio.com",
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
