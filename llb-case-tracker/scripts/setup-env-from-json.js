/**
 * Extract values from firebase.json and create/update .env.local
 * Run: node scripts/setup-env-from-json.js
 */

const fs = require("fs");
const path = require("path");

console.log("🔧 Setting up .env.local from firebase.json\n");

// Read firebase.json
const firebaseJsonPath = path.join(process.cwd(), "firebase.json");
const envPath = path.join(process.cwd(), ".env.local");

if (!fs.existsSync(firebaseJsonPath)) {
  console.error("❌ firebase.json not found!");
  process.exit(1);
}

try {
  const firebaseJson = JSON.parse(fs.readFileSync(firebaseJsonPath, "utf8"));
  const projectId = firebaseJson.project_id || "llb-case-tracker";

  console.log(`✅ Found project_id: ${projectId}\n`);

  // Read existing .env.local if it exists
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
    console.log("✅ Found existing .env.local, updating...\n");
  } else {
    console.log("📝 Creating new .env.local...\n");
  }

  // Update or add values
  const updates = {
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: projectId,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: `${projectId}.firebaseapp.com`,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: `${projectId}.appspot.com`,
  };

  // Update each value
  Object.entries(updates).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
      console.log(`   ✅ Updated ${key}`);
    } else {
      envContent += `${key}=${value}\n`;
      console.log(`   ✅ Added ${key}`);
    }
  });

  // Ensure required variables exist (even if placeholder)
  const requiredVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ];

  requiredVars.forEach((varName) => {
    if (!envContent.includes(`${varName}=`)) {
      envContent += `${varName}=your-${varName
        .toLowerCase()
        .replace("next_public_firebase_", "")
        .replace(/_/g, "-")}-here\n`;
      console.log(`   ⚠️  Added placeholder for ${varName}`);
    }
  });

  // Write updated .env.local
  fs.writeFileSync(envPath, envContent, "utf8");

  console.log("\n✅ .env.local updated successfully!");
  console.log("\n📝 Next steps:");
  console.log(
    "   1. Get API_KEY, MESSAGING_SENDER_ID, and APP_ID from Firebase Console"
  );
  console.log("   2. Update .env.local with these values");
  console.log("   3. Restart your dev server");
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
