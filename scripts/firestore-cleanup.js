/**
 * Firestore cleanup script
 * Removes Firestore documents (documents, hearings, tasks, conversations)
 * whose caseId no longer exists in the Realtime Database cases.
 *
 * Run: node scripts/firestore-cleanup.js
 * Requires: .env.local with FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL
 *           (or use a service account key file - set GOOGLE_APPLICATION_CREDENTIALS)
 */

const path = require("path");
const fs = require("fs");

// Load .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  });
}

const admin = require("firebase-admin");

function getApp() {
  if (admin.apps.length > 0) return admin.app();
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) {
    const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (keyPath && fs.existsSync(keyPath)) {
      const key = JSON.parse(fs.readFileSync(keyPath, "utf8"));
      return admin.initializeApp({
        credential: admin.credential.cert(key),
        databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${key.project_id}-default-rtdb.firebaseio.com`,
      });
    }
    throw new Error("Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env.local or GOOGLE_APPLICATION_CREDENTIALS");
  }
  privateKey = privateKey.replace(/\\n/g, "\n");
  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.firebaseio.com`,
  });
}

async function main() {
  console.log("Firestore cleanup – removing orphaned documents\n");

  const app = getApp();
  const rtdb = app.database();
  const firestore = app.firestore();

  // 1. Get all valid case IDs from Realtime Database
  const casesSnap = await rtdb.ref("cases").once("value");
  const casesVal = casesSnap.val() || {};
  const validCaseIds = new Set(Object.keys(casesVal));
  console.log(`Valid case IDs (from RTDB): ${validCaseIds.size}`);

  const collections = ["documents", "hearings", "tasks", "conversations"];
  let totalDeleted = 0;

  for (const collName of collections) {
    const coll = firestore.collection(collName);
    const snapshot = await coll.get();
    const toDelete = [];
    snapshot.docs.forEach((doc) => {
      const caseId = doc.data().caseId;
      if (caseId && !validCaseIds.has(caseId)) {
        toDelete.push(doc.ref);
      }
    });
    if (toDelete.length === 0) {
      console.log(`  ${collName}: 0 orphaned docs`);
      continue;
    }
    // Batch delete (Firestore limit 500 per batch)
    const batchSize = 500;
    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batch = firestore.batch();
      toDelete.slice(i, i + batchSize).forEach((ref) => batch.delete(ref));
      await batch.commit();
    }
    console.log(`  ${collName}: deleted ${toDelete.length} orphaned doc(s)`);
    totalDeleted += toDelete.length;
  }

  console.log(`\nDone. Total deleted: ${totalDeleted}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Cleanup failed:", err.message);
  process.exit(1);
});
