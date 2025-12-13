/**
 * Firebase Integration Verification Script
 * Run: node scripts/verify-firebase.js
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Firebase Integration Verification\n");

// Check .env.local
const envPath = path.join(process.cwd(), ".env.local");
const envExists = fs.existsSync(envPath);

console.log("1. Environment Variables:");
if (envExists) {
  console.log("   ✅ .env.local file exists");
  const envContent = fs.readFileSync(envPath, "utf8");
  const requiredVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ];

  let allPresent = true;
  requiredVars.forEach((varName) => {
    if (envContent.includes(varName)) {
      const value = envContent.split(`${varName}=`)[1]?.split("\n")[0]?.trim();
      if (value && !value.includes("your-") && !value.includes("REPLACE")) {
        console.log(`   ✅ ${varName}: Set`);
      } else {
        console.log(`   ⚠️  ${varName}: Not configured (placeholder value)`);
        allPresent = false;
      }
    } else {
      console.log(`   ❌ ${varName}: Missing`);
      allPresent = false;
    }
  });

  if (allPresent) {
    console.log("\n   ✅ All environment variables are configured!");
  } else {
    console.log("\n   ⚠️  Some environment variables need configuration.");
    console.log("   📝 See .env.local.example for template");
  }
} else {
  console.log("   ❌ .env.local file not found");
  console.log("   📝 Create .env.local from .env.local.example");
}

// Check firebase.json
console.log("\n2. Firebase Configuration:");
const firebaseJsonPath = path.join(process.cwd(), "firebase.json");
if (fs.existsSync(firebaseJsonPath)) {
  console.log("   ✅ firebase.json exists");
  try {
    const firebaseJson = JSON.parse(fs.readFileSync(firebaseJsonPath, "utf8"));
    if (firebaseJson.project_id) {
      console.log(`   ✅ Project ID: ${firebaseJson.project_id}`);
    }
  } catch (e) {
    console.log("   ⚠️  firebase.json exists but may be invalid");
  }
} else {
  console.log("   ⚠️  firebase.json not found");
}

// Check Firebase config file
console.log("\n3. Firebase Integration Files:");
const configPath = path.join(process.cwd(), "lib", "firebase", "config.ts");
if (fs.existsSync(configPath)) {
  console.log("   ✅ lib/firebase/config.ts exists");
  const configContent = fs.readFileSync(configPath, "utf8");
  if (configContent.includes("getAuth")) console.log("   ✅ Auth initialized");
  if (configContent.includes("getFirestore"))
    console.log("   ✅ Firestore initialized");
  if (configContent.includes("getStorage"))
    console.log("   ✅ Storage initialized");
} else {
  console.log("   ❌ lib/firebase/config.ts not found");
}

// Check API routes
console.log("\n4. API Routes:");
const apiRoutes = [
  "app/api/cases/create/route.ts",
  "app/api/cases/list/route.ts",
  "app/api/cases/update/route.ts",
  "app/api/cases/delete/route.ts",
  "app/api/auth/login/route.ts",
  "app/api/auth/register/route.ts",
];
apiRoutes.forEach((route) => {
  const routePath = path.join(process.cwd(), route);
  if (fs.existsSync(routePath)) {
    console.log(`   ✅ ${route}`);
  } else {
    console.log(`   ❌ ${route} missing`);
  }
});

console.log("\n✅ Verification complete!");
console.log("\n📚 Next steps:");
console.log(
  "   1. Ensure .env.local has all required values from Firebase Console"
);
console.log("   2. Enable Authentication (Email/Password) in Firebase Console");
console.log("   3. Create Firestore Database in Firebase Console");
console.log("   4. Enable Storage in Firebase Console");
console.log(
  "   5. Configure Security Rules (see FIREBASE_INTEGRATION_CHECK.md)"
);
