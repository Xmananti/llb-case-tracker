/**
 * Diagnostic script to verify Firebase Admin SDK credentials
 * Run with: node scripts/verify-admin-credentials.js
 */

const fs = require("fs");
const path = require("path");

// Load .env.local manually
const envPath = path.join(process.cwd(), ".env.local");
const envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        envVars[key] = value;
      }
    }
  });
} else {
  console.log("⚠️  .env.local file not found!\n");
}

// Set environment variables
Object.keys(envVars).forEach((key) => {
  process.env[key] = envVars[key];
});

console.log("🔍 Verifying Firebase Admin SDK Configuration...\n");

// Check environment variables
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const configBase64 = process.env.FIREBASE_CONFIG_BASE64;

let hasErrors = false;

console.log("📋 Environment Variables Check:");
console.log("─".repeat(50));

if (!projectId) {
  console.log("❌ FIREBASE_PROJECT_ID: Missing");
  hasErrors = true;
} else {
  console.log(`✅ FIREBASE_PROJECT_ID: ${projectId}`);
}

if (!clientEmail) {
  console.log("❌ FIREBASE_CLIENT_EMAIL: Missing");
  hasErrors = true;
} else {
  console.log(`✅ FIREBASE_CLIENT_EMAIL: ${clientEmail}`);
}

if (!privateKey && !configBase64) {
  console.log("❌ FIREBASE_PRIVATE_KEY: Missing");
  console.log("❌ FIREBASE_CONFIG_BASE64: Missing");
  hasErrors = true;
} else if (privateKey) {
  // Validate private key format
  const normalizedKey = privateKey.replace(/\\n/g, "\n");
  const hasBegin = normalizedKey.includes("-----BEGIN PRIVATE KEY-----");
  const hasEnd = normalizedKey.includes("-----END PRIVATE KEY-----");

  if (hasBegin && hasEnd) {
    console.log("✅ FIREBASE_PRIVATE_KEY: Present and formatted correctly");
  } else {
    console.log("❌ FIREBASE_PRIVATE_KEY: Present but incorrectly formatted");
    console.log("   Missing BEGIN marker:", !hasBegin);
    console.log("   Missing END marker:", !hasEnd);
    hasErrors = true;
  }
} else if (configBase64) {
  console.log("✅ FIREBASE_CONFIG_BASE64: Present");
  try {
    const config = JSON.parse(Buffer.from(configBase64, "base64").toString());
    if (config.private_key && config.client_email && config.project_id) {
      console.log("✅ Base64 config contains required fields");
    } else {
      console.log("❌ Base64 config missing required fields");
      hasErrors = true;
    }
  } catch (error) {
    console.log("❌ FIREBASE_CONFIG_BASE64: Invalid base64 or JSON");
    hasErrors = true;
  }
}

console.log("\n" + "─".repeat(50));

if (hasErrors) {
  console.log("\n❌ Configuration errors found!");
  console.log("\n📖 Next steps:");
  console.log("   1. Review ADMIN_SDK_ENV_SETUP.md for setup instructions");
  console.log(
    "   2. Ensure all required environment variables are set in .env.local"
  );
  console.log(
    "   3. Verify private key format (must include BEGIN/END markers)"
  );
  console.log(
    "   4. If key was revoked, generate a new one from Firebase Console"
  );
  process.exit(1);
} else {
  console.log(
    "\n✅ All environment variables are present and correctly formatted!"
  );
  console.log('\n💡 If you still get "Invalid JWT Signature" errors:');
  console.log("   1. The service account key may have been revoked");
  console.log("   2. Generate a NEW key from Firebase Console");
  console.log("   3. Update .env.local with the new credentials");
  console.log("   4. Restart your development server");
  process.exit(0);
}
