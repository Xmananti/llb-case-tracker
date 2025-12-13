# How to Get Your Firebase API Key

## ⚠️ Important: firebase.json vs Web App Config

**firebase.json** contains **service account credentials** (for server-side Admin SDK)
**You need** **Web App Config** (for client-side Firebase SDK)

These are **different** and serve different purposes!

## 🔑 Step-by-Step: Get Web App API Key

### Step 1: Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **llb-case-tracker**

### Step 2: Get Web App Configuration

1. Click **⚙️ Settings** (gear icon) in the left sidebar
2. Click **Project settings**
3. Scroll down to **"Your apps"** section
4. Look for a **Web app** (</> icon)

### Step 3: If No Web App Exists

1. Click **"Add app"** button
2. Select **Web** (</> icon)
3. Register app:
   - **App nickname**: "LLB Case Tracker Web" (or any name)
   - **Firebase Hosting**: (optional, can skip)
4. Click **"Register app"**

### Step 4: Copy Configuration Values

You'll see a config like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz123456", // ← COPY THIS
  authDomain: "llb-case-tracker.firebaseapp.com",
  projectId: "llb-case-tracker",
  storageBucket: "llb-case-tracker.appspot.com",
  messagingSenderId: "123456789012", // ← COPY THIS
  appId: "1:123456789012:web:abcdef1234567890", // ← COPY THIS
};
```

### Step 5: Update .env.local

Open `llb-case-tracker/.env.local` and replace:

```env
# Replace these placeholder values:
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz123456
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# These are already set (from firebase.json):
NEXT_PUBLIC_FIREBASE_PROJECT_ID=llb-case-tracker
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=llb-case-tracker.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=llb-case-tracker.appspot.com
```

### Step 6: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## 🔍 Verify Your API Key

After updating, test registration:

- Go to `/register`
- Try to create an account
- If it works, API key is correct!

## ❌ Common Issues

### "API key not valid"

- ✅ Make sure you copied the **Web app** API key (not service account)
- ✅ Check for extra spaces in `.env.local`
- ✅ Restart dev server after updating `.env.local`
- ✅ Verify API key starts with "AIza"

### "Cannot find web app"

- Create a new web app in Firebase Console
- Make sure you're in the correct project

### Still getting errors?

1. Double-check all values in `.env.local`
2. Make sure no quotes around values
3. Restart dev server
4. Clear browser cache

## 📝 Quick Checklist

- [ ] Opened Firebase Console
- [ ] Selected project: llb-case-tracker
- [ ] Went to Settings > Project settings
- [ ] Found/Created Web app
- [ ] Copied apiKey, messagingSenderId, appId
- [ ] Updated .env.local
- [ ] Restarted dev server
- [ ] Tested registration

## 🎯 What You Need

From Firebase Console Web App Config:

1. **apiKey** → `NEXT_PUBLIC_FIREBASE_API_KEY`
2. **messagingSenderId** → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
3. **appId** → `NEXT_PUBLIC_FIREBASE_APP_ID`

These are **different** from firebase.json (service account)!
