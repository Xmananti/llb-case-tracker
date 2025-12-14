# 🔧 Firebase Admin SDK - Environment Variables Setup

## ⚠️ Current Issue

The Firebase Admin SDK is trying to use `firebase.json` which may have invalid/revoked credentials, causing:

```
Invalid JWT Signature
```

## ✅ Solution: Use Environment Variables

The Admin SDK now prioritizes environment variables over `firebase.json`.

### Step 1: Get Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **llb-case-tracker**
3. Go to **Project Settings** (gear icon) > **Service Accounts**
4. Click **Generate new private key**
5. Download the JSON file (this is your service account credentials)

### Step 2: Extract Values from Service Account JSON

Open the downloaded JSON file. You'll see something like:

```json
{
  "type": "service_account",
  "project_id": "llb-case-tracker",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@llb-case-tracker.iam.gserviceaccount.com",
  "client_id": "...",
  ...
}
```

### Step 3: Add to `.env.local`

**Option A: Use the setup script (if you have firebase.json):**

```bash
cd llb-case-tracker
node scripts/setup-admin-env.js
```

This will automatically extract values from `firebase.json` and add them to `.env.local`.

**Option B: Manually add to `.env.local`:**

Add these environment variables to your `llb-case-tracker/.env.local`:

```env
# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=llb-case-tracker
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@llb-case-tracker.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://llb-case-tracker-default-rtdb.firebaseio.com
```

**Important Notes:**

- The `FIREBASE_PRIVATE_KEY` must include the full key with `\n` characters
- Keep the quotes around the private key value
- The private key should be on a single line with `\n` for newlines

### Step 4: Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

## 🔄 Alternative: Base64 Encoding

If you prefer, you can encode the entire service account JSON as base64:

```bash
# On Mac/Linux
base64 -i service-account.json

# On Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account.json"))
```

Then add to `.env.local`:

```env
FIREBASE_CONFIG_BASE64=<base64_encoded_string>
```

## ✅ Verification

After setting up environment variables, the Admin SDK will:

1. ✅ Use environment variables (priority)
2. ✅ Skip `firebase.json` fallback
3. ✅ Initialize without "Invalid JWT Signature" errors

## 🚨 If You Still Get Errors

### "Invalid JWT Signature" Error

If you see this error:

```
invalid_grant: Invalid JWT Signature
```

**This means your service account private key is invalid or revoked.** Here's how to fix it:

#### Step 1: Regenerate Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) > **Service Accounts** tab
4. Click **Generate new private key**
5. Download the new JSON file

#### Step 2: Update Environment Variables

**Option A: Use the setup script**

```bash
cd llb-case-tracker
node scripts/setup-admin-env.js
```

**Option B: Manually update `.env.local`**

Extract these values from the new JSON file:

- `project_id` → `FIREBASE_PROJECT_ID`
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `private_key` → `FIREBASE_PRIVATE_KEY` (keep as single line with `\n`)

**Important:** The private key must be formatted correctly:

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

#### Step 3: Verify Key Format

The private key in `.env.local` should:

- ✅ Be wrapped in quotes
- ✅ Include `-----BEGIN PRIVATE KEY-----` at the start
- ✅ Include `-----END PRIVATE KEY-----` at the end
- ✅ Use `\n` (backslash-n) for line breaks, not actual newlines
- ✅ Be on a single line

#### Step 4: Restart Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Other Common Issues

1. **Check environment variables are loaded:**

   ```bash
   # In your code, temporarily add:
   console.log("Project ID:", process.env.FIREBASE_PROJECT_ID);
   console.log("Client Email:", process.env.FIREBASE_CLIENT_EMAIL);
   console.log("Private Key exists:", !!process.env.FIREBASE_PRIVATE_KEY);
   ```

2. **Verify private key format:**

   - Must start with `-----BEGIN PRIVATE KEY-----`
   - Must end with `-----END PRIVATE KEY-----`
   - Must have `\n` for line breaks (not actual newlines)

3. **Check service account is active:**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **IAM & Admin** > **Service Accounts**
   - Verify your service account exists and is enabled

4. **Check if key was revoked:**

   - Go to [Firebase Console](https://console.firebase.google.com/) > Project Settings > Service Accounts
   - Check if the key ID still exists
   - If not, the key was deleted and you need to generate a new one

## 📝 Current Configuration Priority

1. **Environment Variables** (`FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`)
2. **Base64 Config** (`FIREBASE_CONFIG_BASE64`)
3. ~~`firebase.json` (fallback - will be removed)~~

The Admin SDK will now use environment variables by default! 🎉
