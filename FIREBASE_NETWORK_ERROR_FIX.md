# 🔧 Fix Firebase Network Request Failed Error

## ⚠️ Error: `auth/network-request-failed`

This error occurs when Firebase cannot make network requests. Common causes:

## ✅ Solutions

### 1. Check API Key Restrictions in Firebase Console

The most common cause is **API key restrictions** in Firebase Console.

**Steps to fix:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **llb-case-tracker**
3. Navigate to **APIs & Services** > **Credentials**
4. Find your API key: `AIzaSyAX17XUOiLQSCszTg6DnHpnWSnelYYkQes`
5. Click on the API key to edit it
6. Under **Application restrictions**:
   - If set to **HTTP referrers**, make sure your domains are added:
     - `localhost:3000/*`
     - `127.0.0.1:3000/*`
     - Your production domain (e.g., `your-app.vercel.app/*`)
   - Or temporarily set to **None** for testing (not recommended for production)
7. Under **API restrictions**:
   - Make sure **Identity Toolkit API** is enabled
   - Or set to **Don't restrict key** for testing
8. Click **Save**

### 2. Enable Required APIs

Make sure these APIs are enabled in Google Cloud Console:

1. Go to **APIs & Services** > **Library**
2. Enable these APIs:
   - ✅ **Identity Toolkit API** (required for Authentication)
   - ✅ **Cloud Firestore API** (required for Firestore)
   - ✅ **Cloud Storage API** (required for Storage)

### 3. Check Firebase Console Settings

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **llb-case-tracker**
3. Go to **Project Settings** > **General**
4. Under **Your apps**, verify your web app configuration
5. Make sure **Authentication** is enabled:
   - Go to **Authentication** > **Get started**
   - Enable **Email/Password** sign-in method

### 4. Check Browser Console

Open browser DevTools (F12) and check:

1. **Console tab**: Look for CORS errors or network errors
2. **Network tab**: Check if requests to Firebase are being blocked
3. **Application tab**: Check if cookies/localStorage are being blocked

### 5. Verify Environment Variables

Make sure your `.env.local` has all required variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAX17XUOiLQSCszTg6DnHpnWSnelYYkQes
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=llb-case-tracker.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=llb-case-tracker
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=llb-case-tracker.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=539879699050
NEXT_PUBLIC_FIREBASE_APP_ID=1:539879699050:web:c5dbc51ec4841fe77c9013
```

**Important:** Restart your dev server after updating `.env.local`:
```bash
# Stop server (Ctrl+C)
npm run dev
```

### 6. Check Firewall/Network

- Disable VPN if active
- Check if corporate firewall is blocking Firebase domains
- Try a different network (mobile hotspot)

### 7. Test Firebase Connection

Run this in browser console on your login page:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const config = {
  apiKey: "AIzaSyAX17XUOiLQSCszTg6DnHpnWSnelYYkQes",
  authDomain: "llb-case-tracker.firebaseapp.com",
  projectId: "llb-case-tracker"
};

const app = initializeApp(config);
const auth = getAuth(app);
console.log("Firebase initialized:", auth);
```

## 🎯 Quick Fix Checklist

- [ ] API key has no HTTP referrer restrictions (or includes localhost)
- [ ] Identity Toolkit API is enabled
- [ ] Authentication is enabled in Firebase Console
- [ ] Email/Password sign-in method is enabled
- [ ] `.env.local` has all required variables
- [ ] Dev server restarted after `.env.local` changes
- [ ] No CORS errors in browser console
- [ ] No firewall/VPN blocking Firebase

## 📝 Most Common Fix

**90% of the time**, the issue is **API key restrictions**. 

1. Go to Google Cloud Console > Credentials
2. Edit your API key
3. Set **Application restrictions** to **None** (temporarily)
4. Set **API restrictions** to **Don't restrict key** (temporarily)
5. Test your login
6. Once working, add proper restrictions back

## ✅ After Fixing

Once the network error is resolved, you should be able to:
- ✅ Login successfully
- ✅ Register new users
- ✅ Access Firebase services

If you still get errors, check the browser console for specific error messages.

