# 🚀 Production Deployment Guide

This guide will help you deploy the LLB Case Tracker application to production.

## Prerequisites

1. ✅ Firebase project configured
2. ✅ Firebase security rules set up
3. ✅ `firebase.json` file with credentials (not in git)
4. ✅ All dependencies installed

## Step 1: Test Build Locally

Before deploying, test the build locally:

```bash
cd llb-case-tracker
npm run build
```

If the build succeeds, you're ready to deploy!

## Step 2: Choose Deployment Platform

### Option A: Vercel (Recommended for Next.js)

Vercel is the easiest option for Next.js applications.

#### 2.1. Install Vercel CLI (if not installed)

```bash
npm i -g vercel
```

#### 2.2. Deploy to Vercel

```bash
cd llb-case-tracker
vercel
```

Follow the prompts:

- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No** (for first deployment)
- Project name? **llb-case-tracker** (or your preferred name)
- Directory? **./llb-case-tracker** (or just `.` if already in that directory)
- Override settings? **No**

#### 2.3. Configure Environment Variables

After deployment, you need to add Firebase credentials as environment variables:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

**For Firebase Admin SDK (Server-side):**

You have two options:

**Option 1: Use Firebase Service Account JSON (Recommended)**

Add these environment variables (extract from your `firebase.json`):

```
FIREBASE_PROJECT_ID=llb-case-tracker
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@llb-case-tracker.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://llb-case-tracker-default-rtdb.firebaseio.com
```

**Option 2: Use Base64 Encoded firebase.json**

```
FIREBASE_CONFIG_BASE64=<base64_encoded_firebase.json_content>
```

**For Firebase Client SDK (Client-side):**

These are already in your `lib/firebase/config.ts`, but you can also set them as environment variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAX17XUOiLQSCszTg6DnHpnWSnelYYkQes
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=llb-case-tracker.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://llb-case-tracker-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=llb-case-tracker
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=llb-case-tracker.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=539879699050
NEXT_PUBLIC_FIREBASE_APP_ID=1:539879699050:web:c5dbc51ec4841fe77c9013
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-NX3EN6M8EL
```

#### 2.4. Update Firebase Admin Code (if using environment variables)

If you want to use environment variables instead of `firebase.json`, update `lib/firebase/admin.ts`:

```typescript
// Option 1: Use individual environment variables
const adminConfig = {
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
};

// Option 2: Use base64 encoded config
const firebaseConfigBase64 = process.env.FIREBASE_CONFIG_BASE64;
if (firebaseConfigBase64) {
  const firebaseConfig = JSON.parse(
    Buffer.from(firebaseConfigBase64, "base64").toString()
  );
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: firebaseConfig.databaseURL,
  });
}
```

#### 2.5. Redeploy

After adding environment variables, redeploy:

```bash
vercel --prod
```

Or trigger a new deployment from the Vercel dashboard.

---

### Option B: Other Platforms

#### Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Build: `npm run build`
3. Deploy: `netlify deploy --prod`
4. Configure environment variables in Netlify dashboard

#### AWS Amplify / Railway / Render

Similar process:

1. Connect your Git repository
2. Configure build command: `npm run build`
3. Configure start command: `npm start`
4. Add environment variables
5. Deploy

---

## Step 3: Configure Firebase Security Rules

**IMPORTANT:** Make sure your Firebase security rules are configured for production!

### Firestore Rules

Go to [Firebase Console](https://console.firebase.google.com/) → Firestore Database → Rules

Use the rules from `FIREBASE_SECURITY_RULES.md` or `FIRESTORE_RULES_QUICK_FIX.md`

### Realtime Database Rules

Go to Realtime Database → Rules

```json
{
  "rules": {
    "cases": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "organizations": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### Storage Rules

Go to Storage → Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /cases/{caseId}/documents/{fileName} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Step 4: Update CORS Settings (if needed)

If you're using Firebase from a custom domain, update CORS settings in Firebase Console.

---

## Step 5: Test Production Deployment

1. Visit your deployed URL
2. Test user registration
3. Test case creation
4. Test document upload
5. Test all major features

---

## Step 6: Set Up Custom Domain (Optional)

### Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

## Troubleshooting

### Build Fails

- Check that all environment variables are set
- Verify Firebase credentials are correct
- Check build logs for specific errors

### Firebase Errors in Production

- Verify security rules are published
- Check that environment variables are correctly set
- Ensure Firebase Admin SDK credentials are valid

### API Routes Not Working

- Verify `firebase.json` or environment variables are accessible
- Check server logs in Vercel dashboard
- Ensure Firebase Admin SDK is initialized correctly

---

## Quick Deploy Commands

```bash
# Test build locally
npm run build

# Deploy to Vercel (preview)
vercel

# Deploy to Vercel (production)
vercel --prod

# View deployment logs
vercel logs
```

---

## Security Checklist

- ✅ `firebase.json` is in `.gitignore`
- ✅ Environment variables are set in deployment platform
- ✅ Firebase security rules are configured
- ✅ No sensitive data in client-side code
- ✅ API routes are protected
- ✅ CORS is configured correctly

---

## Need Help?

- Check deployment platform documentation
- Review Firebase Console for errors
- Check server logs in deployment dashboard
- Verify all environment variables are set correctly
