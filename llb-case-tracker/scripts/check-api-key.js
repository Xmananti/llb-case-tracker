/**
 * Check if API key is configured correctly
 * Run: node scripts/check-api-key.js
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Checking Firebase API Key Configuration\n");

const envPath = path.join(process.cwd(), ".env.local");

if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local file not found!");
  console.log("📝 Run: node scripts/setup-env-from-json.js");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");

// Check API key
const apiKeyMatch = envContent.match(/NEXT_PUBLIC_FIREBASE_API_KEY=(.+)/);
if (!apiKeyMatch) {
  console.error("❌ NEXT_PUBLIC_FIREBASE_API_KEY not found in .env.local");
} else {
  const apiKey = apiKeyMatch[1].trim();
  if (!apiKey || apiKey.includes("your-") || apiKey.includes("REPLACE")) {
    console.error("❌ NEXT_PUBLIC_FIREBASE_API_KEY is a placeholder!");
    console.log("   Current value:", apiKey);
    console.log("\n📝 To fix:");
    console.log(
      "   1. Go to Firebase Console > Project Settings > Your apps > Web app"
    );
    console.log("   2. Copy the 'apiKey' value");
    console.log(
      "   3. Update .env.local with: NEXT_PUBLIC_FIREBASE_API_KEY=<your-actual-key>"
    );
    console.log("   4. See GET_API_KEY.md for detailed instructions");
  } else if (apiKey.startsWith("AIza")) {
    console.log(
      "✅ NEXT_PUBLIC_FIREBASE_API_KEY looks valid (starts with AIza)"
    );
    console.log("   Value:", apiKey.substring(0, 10) + "...");
  } else {
    console.warn(
      "⚠️  NEXT_PUBLIC_FIREBASE_API_KEY doesn't look like a Firebase API key"
    );
    console.log("   Firebase API keys usually start with 'AIza'");
    console.log("   Current value:", apiKey.substring(0, 20) + "...");
  }
}

// Check other required values
console.log("\n📋 Other Required Values:");
const required = [
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

required.forEach((varName) => {
  const match = envContent.match(new RegExp(`${varName}=(.+)`));
  if (!match) {
    console.error(`❌ ${varName} not found`);
  } else {
    const value = match[1].trim();
    if (!value || value.includes("your-") || value.includes("REPLACE")) {
      console.error(`❌ ${varName} is a placeholder`);
    } else {
      console.log(`✅ ${varName} is set`);
    }
  }
});

console.log("\n📚 Next Steps:");
console.log("   1. Get Web App Config from Firebase Console");
console.log("   2. Update .env.local with actual values");
console.log("   3. Restart dev server: npm run dev");
console.log("   4. See GET_API_KEY.md for detailed instructions");
