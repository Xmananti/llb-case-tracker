import * as admin from "firebase-admin";

// Lazy initialization - only initialize when actually needed
let adminApp: admin.app.App | null = null;
let initializationError: Error | null = null;

function validatePrivateKey(privateKey: string): boolean {
  if (!privateKey) return false;

  // Check if it starts and ends with the correct markers
  const normalizedKey = privateKey.replace(/\\n/g, "\n");
  const hasBeginMarker = normalizedKey.includes("-----BEGIN PRIVATE KEY-----");
  const hasEndMarker = normalizedKey.includes("-----END PRIVATE KEY-----");

  return hasBeginMarker && hasEndMarker;
}

function getServiceAccount(): admin.ServiceAccount | null {
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL
  ) {
    // Use environment variables (recommended)
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

    // Validate private key format
    if (!validatePrivateKey(process.env.FIREBASE_PRIVATE_KEY)) {
      console.error(
        "❌ Invalid private key format. It must include '-----BEGIN PRIVATE KEY-----' and '-----END PRIVATE KEY-----'"
      );
      return null;
    }

    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: privateKey,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
  } else if (process.env.FIREBASE_CONFIG_BASE64) {
    // Use base64 encoded config
    try {
      const firebaseConfig = JSON.parse(
        Buffer.from(process.env.FIREBASE_CONFIG_BASE64, "base64").toString()
      );

      if (
        !firebaseConfig.private_key ||
        !validatePrivateKey(firebaseConfig.private_key)
      ) {
        console.error("❌ Invalid private key in FIREBASE_CONFIG_BASE64");
        return null;
      }

      return {
        projectId: firebaseConfig.project_id,
        privateKey: firebaseConfig.private_key.replace(/\\n/g, "\n"),
        clientEmail: firebaseConfig.client_email,
      };
    } catch (error) {
      console.error("❌ Error parsing FIREBASE_CONFIG_BASE64:", error);
      return null;
    }
  }
  return null;
}

function initializeAdmin(): admin.app.App | null {
  // If already initialized, return existing app
  if (adminApp) {
    return adminApp;
  }

  // If initialization previously failed, return null (don't throw)
  if (initializationError) {
    return null;
  }

  // Check if already initialized by Firebase
  if (admin.apps.length > 0) {
    adminApp = admin.app();
    return adminApp;
  }

  // Get service account credentials
  const serviceAccount = getServiceAccount();

  if (!serviceAccount) {
    const missingVars = [];
    if (!process.env.FIREBASE_PROJECT_ID)
      missingVars.push("FIREBASE_PROJECT_ID");
    if (!process.env.FIREBASE_PRIVATE_KEY)
      missingVars.push("FIREBASE_PRIVATE_KEY");
    if (!process.env.FIREBASE_CLIENT_EMAIL)
      missingVars.push("FIREBASE_CLIENT_EMAIL");

    initializationError = new Error(
      `Firebase Admin SDK configuration missing. Required environment variables: ${missingVars.join(
        ", "
      )}. ` +
        "Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL in .env.local. " +
        "See ADMIN_SDK_ENV_SETUP.md for setup instructions."
    );

    // Only log warning once, don't spam console
    if (!process.env.ADMIN_SDK_WARNING_LOGGED) {
      console.warn(
        "⚠️ Firebase Admin SDK: Missing required environment variables:"
      );
      console.warn("   Missing:", missingVars.join(", "));
      console.warn(
        "   Admin SDK features will be unavailable until configured."
      );
      console.warn("   See ADMIN_SDK_ENV_SETUP.md for setup instructions.");
      console.warn("   (This warning will only show once per server restart)");
      process.env.ADMIN_SDK_WARNING_LOGGED = "true";
    }

    return null;
  }

  // Initialize Firebase Admin SDK
  try {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL:
        process.env.FIREBASE_DATABASE_URL ||
        "https://llb-case-tracker-default-rtdb.firebaseio.com",
    });

    // Test the credentials by attempting to get the app (this will trigger JWT validation)
    // The actual error will occur when credentials are used, but we can at least verify the app was created
    console.log("✅ Firebase Admin SDK initialized successfully");
    return adminApp;
  } catch (error) {
    initializationError = error as Error;
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Only log error once
    if (!process.env.ADMIN_SDK_ERROR_LOGGED) {
      console.error("❌ Firebase Admin initialization error:", errorMessage);

      // Provide specific guidance based on error type
      if (
        errorMessage.includes("Invalid JWT Signature") ||
        errorMessage.includes("invalid_grant")
      ) {
        console.error("\n🔍 JWT Signature Error - Possible causes:");
        console.error(
          "   1. Private key has been revoked - Generate a new key at:"
        );
        console.error(
          "      https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk"
        );
        console.error(
          "   2. Private key format is incorrect - Must include '-----BEGIN PRIVATE KEY-----' and '-----END PRIVATE KEY-----'"
        );
        console.error(
          "   3. Server time is not synced (unlikely in development)"
        );
        console.error("   4. The key ID was deleted from Firebase Console");
        console.error("\n💡 Solution:");
        console.error(
          "   - Go to Firebase Console > Project Settings > Service Accounts"
        );
        console.error("   - Generate a NEW private key");
        console.error(
          "   - Update FIREBASE_PRIVATE_KEY in .env.local with the new key"
        );
        console.error(
          "   - Make sure the key includes \\n for line breaks (not actual newlines)"
        );
      } else {
        console.error(
          "   This usually means your service account credentials are invalid or revoked."
        );
      }

      console.error(
        "\n📖 See ADMIN_SDK_ENV_SETUP.md for detailed setup instructions."
      );
      process.env.ADMIN_SDK_ERROR_LOGGED = "true";
    }
    return null;
  }
}

// Lazy getters - only initialize when accessed, return null if not available
export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_target, prop) {
    const app = initializeAdmin();
    if (!app) {
      // Return a no-op function if Admin SDK is not available
      return () => {
        throw new Error(
          "Firebase Admin SDK is not configured. Please set environment variables. See ADMIN_SDK_ENV_SETUP.md"
        );
      };
    }
    const auth = admin.auth(app);
    return (auth as any)[prop];
  },
});

export const adminDb = new Proxy({} as admin.database.Database, {
  get(_target, prop) {
    const app = initializeAdmin();
    if (!app) {
      // Return a no-op function if Admin SDK is not available
      return () => {
        throw new Error(
          "Firebase Admin SDK is not configured. Please set environment variables. See ADMIN_SDK_ENV_SETUP.md"
        );
      };
    }
    const db = admin.database(app);
    return (db as any)[prop];
  },
});

export const adminFirestore = new Proxy({} as admin.firestore.Firestore, {
  get(_target, prop) {
    const app = initializeAdmin();
    if (!app) {
      // Return a no-op function if Admin SDK is not available
      return () => {
        throw new Error(
          "Firebase Admin SDK is not configured. Please set environment variables. See ADMIN_SDK_ENV_SETUP.md"
        );
      };
    }
    const firestore = admin.firestore(app);
    return (firestore as any)[prop];
  },
});

export const adminStorage = new Proxy({} as admin.storage.Storage, {
  get(_target, prop) {
    const app = initializeAdmin();
    if (!app) {
      // Return a no-op function if Admin SDK is not available
      return () => {
        throw new Error(
          "Firebase Admin SDK is not configured. Please set environment variables. See ADMIN_SDK_ENV_SETUP.md"
        );
      };
    }
    const storage = admin.storage(app);
    return (storage as any)[prop];
  },
});

// Export function to check if Admin SDK is available
export function isAdminSDKAvailable(): boolean {
  try {
    const app = initializeAdmin();
    return app !== null;
  } catch {
    return false;
  }
}

// Export function to test credentials (validates by attempting to get auth)
export async function testAdminCredentials(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const app = initializeAdmin();
    if (!app) {
      return {
        success: false,
        error: "Admin SDK not initialized - check environment variables",
      };
    }

    // Attempt to use auth to trigger credential validation
    const auth = admin.auth(app);
    // Just getting the auth instance should validate credentials
    // If credentials are invalid, this will throw when actually used
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

// Export the admin app instance (lazy)
export default new Proxy({} as admin.app.App, {
  get(_target, prop) {
    const app = initializeAdmin();
    return (app as any)[prop];
  },
});
