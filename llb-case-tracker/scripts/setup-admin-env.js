/**
 * Extract Firebase Admin SDK credentials from firebase.json
 * and add them to .env.local as environment variables
 */

const fs = require("fs");
const path = require("path");

console.log("🔧 Setting up Firebase Admin SDK environment variables\n");

// Paths
const firebaseJsonPath = path.join(process.cwd(), "firebase.json");
const envLocalPath = path.join(process.cwd(), ".env.local");

// Read firebase.json
let firebaseJson;
try {
  if (!fs.existsSync(firebaseJsonPath)) {
    console.error("❌ firebase.json not found!");
    console.error("   Please download your service account key from Firebase Console:");
    console.error("   https://console.firebase.google.com/project/llb-case-tracker/settings/serviceaccounts/adminsdk");
    process.exit(1);
  }
  
  firebaseJson = JSON.parse(fs.readFileSync(firebaseJsonPath, "utf8"));
  console.log("✅ Found firebase.json");
} catch (error) {
  console.error("❌ Error reading firebase.json:", error.message);
  process.exit(1);
}

// Extract values
const projectId = firebaseJson.project_id;
const clientEmail = firebaseJson.client_email;
const privateKey = firebaseJson.private_key;
const databaseURL = `https://${projectId}-default-rtdb.firebaseio.com`;

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ firebase.json is missing required fields!");
  console.error("   Required: project_id, client_email, private_key");
  process.exit(1);
}

console.log("✅ Extracted credentials from firebase.json");
console.log(`   Project ID: ${projectId}`);
console.log(`   Client Email: ${clientEmail}`);
console.log(`   Private Key: ${privateKey.substring(0, 30)}...`);

// Read existing .env.local
let envContent = "";
if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, "utf8");
  console.log("✅ Found existing .env.local");
} else {
  console.log("📝 Creating new .env.local");
}

// Environment variables to add/update
const envVars = {
  FIREBASE_PROJECT_ID: projectId,
  FIREBASE_CLIENT_EMAIL: clientEmail,
  FIREBASE_PRIVATE_KEY: privateKey.replace(/\n/g, "\\n"), // Escape newlines for .env
  FIREBASE_DATABASE_URL: databaseURL,
};

// Update or add environment variables
let updated = false;
for (const [key, value] of Object.entries(envVars)) {
  const regex = new RegExp(`^${key}=.*$`, "m");
  if (regex.test(envContent)) {
    // Update existing
    envContent = envContent.replace(regex, `${key}=${value}`);
    console.log(`   Updated: ${key}`);
    updated = true;
  } else {
    // Add new
    if (envContent && !envContent.endsWith("\n")) {
      envContent += "\n";
    }
    envContent += `# Firebase Admin SDK (Server-side)\n${key}=${value}\n`;
    console.log(`   Added: ${key}`);
    updated = true;
  }
}

// Write .env.local
try {
  fs.writeFileSync(envLocalPath, envContent, "utf8");
  console.log("\n✅ Successfully updated .env.local");
  console.log("\n📋 Next steps:");
  console.log("   1. Restart your dev server (npm run dev)");
  console.log("   2. The Admin SDK will now use environment variables");
  console.log("   3. You can safely delete firebase.json (it's already in .gitignore)");
  console.log("\n⚠️  Important: Never commit .env.local to Git!");
} catch (error) {
  console.error("❌ Error writing .env.local:", error.message);
  process.exit(1);
}

