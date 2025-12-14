# Testing with firebase.json

## ✅ Configuration Complete

Your Firebase configuration now automatically reads from `firebase.json` for testing purposes!

### What Was Done

1. **Updated `lib/firebase/config.ts`**

   - Now reads `project_id` from `firebase.json` automatically
   - Derives `authDomain` and `storageBucket` from project_id
   - Falls back to environment variables if firebase.json not found

2. **Created Setup Script**

   - `scripts/setup-env-from-json.js` - Extracts values from firebase.json
   - Automatically updates `.env.local` with derived values

3. **Auto-Configuration**
   - Project ID: `llb-case-tracker` (from firebase.json)
   - Auth Domain: `llb-case-tracker.firebaseapp.com` (derived)
   - Storage Bucket: `llb-case-tracker.appspot.com` (derived)

## 📋 Current Status

From `firebase.json`:

- ✅ Project ID: `llb-case-tracker`
- ✅ Auth Domain: `llb-case-tracker.firebaseapp.com`
- ✅ Storage Bucket: `llb-case-tracker.appspot.com`

Still needed from Firebase Console:

- ⚠️ `NEXT_PUBLIC_FIREBASE_API_KEY`
- ⚠️ `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- ⚠️ `NEXT_PUBLIC_FIREBASE_APP_ID`

## 🚀 Quick Start for Testing

### Option 1: Use Current Setup (Recommended)

The config now automatically uses values from `firebase.json`. Just add the 3 missing values:

```bash
# 1. Get API_KEY, MESSAGING_SENDER_ID, APP_ID from Firebase Console
# 2. Add them to .env.local
# 3. Restart dev server
npm run dev
```

### Option 2: Run Setup Script Again

If you update firebase.json, run:

```bash
node scripts/setup-env-from-json.js
```

This will update `.env.local` with latest values from `firebase.json`.

## 🔍 How It Works

1. **Server-side**: Config reads `firebase.json` to get `project_id`
2. **Auto-derives**: Creates `authDomain` and `storageBucket` from project_id
3. **Falls back**: Uses environment variables if firebase.json not found
4. **Client-side**: Uses environment variables (browser can't read files)

## 📝 Testing Checklist

- [ ] Run `node scripts/setup-env-from-json.js` to sync values
- [ ] Add missing API_KEY, MESSAGING_SENDER_ID, APP_ID to `.env.local`
- [ ] Restart dev server: `npm run dev`
- [ ] Test registration: `/register`
- [ ] Test login: `/login`
- [ ] Test case creation
- [ ] Test document upload
- [ ] Test conversations

## 🎯 Benefits

- ✅ No manual configuration needed for project_id, authDomain, storageBucket
- ✅ Automatically syncs with firebase.json
- ✅ Easy to test with different Firebase projects
- ✅ Still supports environment variables for production

## ⚠️ Important Notes

1. **firebase.json is for server-side only**

   - Contains service account credentials
   - Used for Admin SDK operations
   - Client-side still needs web app config

2. **Still need Web App Config**

   - API_KEY, MESSAGING_SENDER_ID, APP_ID must come from Firebase Console
   - These are different from service account credentials
   - Get them from: Firebase Console > Project Settings > Your apps > Web app

3. **Security**
   - firebase.json contains sensitive credentials
   - Should be in `.gitignore` (already is)
   - Never commit to version control

## 🔄 Update Process

If you change firebase.json:

```bash
# 1. Update firebase.json with new project_id
# 2. Run setup script
node scripts/setup-env-from-json.js

# 3. Restart dev server
npm run dev
```

Your configuration is now ready for testing! Just add the 3 missing values from Firebase Console.
