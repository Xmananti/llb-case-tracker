# ⚡ Quick Fix: Admin SDK "Invalid JWT Signature" Error

## 🚨 Current Error

```
Invalid JWT Signature
Failed to fetch (in AuthContext)
```

## ✅ Quick Fix (2 minutes)

### Step 1: Run the setup script

If you have `firebase.json` in your project:

```bash
cd llb-case-tracker
node scripts/setup-admin-env.js
```

This will automatically extract credentials and add them to `.env.local`.

### Step 2: Or manually add to `.env.local`

If you don't have `firebase.json`, get your service account key:

1. Go to: https://console.firebase.google.com/project/llb-case-tracker/settings/serviceaccounts/adminsdk
2. Click **"Generate new private key"**
3. Download the JSON file
4. Open it and copy these values to `llb-case-tracker/.env.local`:

```env
# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=llb-case-tracker
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@llb-case-tracker.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://llb-case-tracker-default-rtdb.firebaseio.com
```

**Important:** 
- Copy the entire private key (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
- Replace `\n` with `\\n` (escape the newlines)
- Keep quotes around the private key value

### Step 3: Restart dev server

```bash
# Stop server (Ctrl+C)
npm run dev
```

## ✅ What's Fixed

- ✅ API routes will now work even if Admin SDK isn't fully initialized
- ✅ App won't crash on "Failed to fetch" errors
- ✅ Basic user data will be used as fallback
- ✅ Once you add environment variables, full functionality will work

## 🎯 After Setup

Once environment variables are set:
- ✅ Admin SDK will initialize properly
- ✅ User data will be fetched from database
- ✅ All API routes will work correctly
- ✅ No more "Invalid JWT Signature" errors

## 📝 Note

The app is now more resilient - it will work with basic functionality even if Admin SDK isn't configured, but you should still set up the environment variables for full functionality.

