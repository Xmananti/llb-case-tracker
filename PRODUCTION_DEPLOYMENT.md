# 🚀 Production Deployment Guide - AdvocatePro

This guide will help you deploy AdvocatePro to production on Vercel.

## Prerequisites Checklist

- [ ] Firebase project configured and active
- [ ] Firebase security rules deployed
- [ ] Vercel account created (sign up at https://vercel.com)
- [ ] Vercel Blob Storage token obtained
- [ ] All environment variables ready

## Step 1: Test Build Locally

Before deploying, test the build:

```powershell
cd llb-case-tracker
npm run build
```

If build succeeds, proceed to deployment.

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**

   ```powershell
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Import Project in Vercel**

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **"Add New"** → **"Project"**
   - Import your Git repository
   - Vercel will auto-detect Next.js settings

3. **Configure Build Settings**
   - Framework Preset: **Next.js**
   - Root Directory: `llb-case-tracker` (if your repo root is parent)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**

   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel**

   ```powershell
   vercel login
   ```

3. **Deploy**

   ```powershell
   cd llb-case-tracker
   vercel
   ```

   Follow prompts:

   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No** (first time)
   - Project name? **advocatepro** (or your choice)
   - Directory? **.** (current directory)

4. **Deploy to Production**
   ```powershell
   vercel --prod
   ```

## Step 3: Configure Environment Variables

**CRITICAL:** Add all environment variables in Vercel Dashboard before first deployment.

### Go to Vercel Dashboard → Your Project → Settings → Environment Variables

### Required Environment Variables:

#### 1. Firebase Client SDK (Public - for browser)

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=llb-case-tracker.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=llb-case-tracker
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://llb-case-tracker-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=llb-case-tracker.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=539879699050
NEXT_PUBLIC_FIREBASE_APP_ID=1:539879699050:web:c5dbc51ec4841fe77c9013
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-NX3EN6M8EL
```

#### 2. Firebase Admin SDK (Server-side - Private)

**Option 1: Individual Variables (Recommended)**

```
FIREBASE_PROJECT_ID=llb-case-tracker
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@llb-case-tracker.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://llb-case-tracker-default-rtdb.firebaseio.com
```

**Option 2: Base64 Encoded Config**

```
FIREBASE_CONFIG_BASE64=<base64_encoded_service_account_json>
```

#### 3. Vercel Blob Storage (Required for file uploads)

```
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
```

**How to get Vercel Blob Token:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** → **Blob**
3. Create a new Blob store (if needed)
4. Copy the **BLOB_READ_WRITE_TOKEN**

### Environment Variable Settings:

- **Environment:** Select **Production**, **Preview**, and **Development**
- **Apply to:** All environments (or specific as needed)

## Step 4: Deploy Firestore Indexes

Deploy Firestore indexes to avoid query errors:

```powershell
cd llb-case-tracker
firebase deploy --only firestore:indexes
```

If Firebase CLI is not installed:

```powershell
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:indexes
```

## Step 5: Verify Deployment

1. **Visit your deployment URL** (provided by Vercel)
2. **Test the following:**
   - [ ] User registration
   - [ ] User login
   - [ ] Create a case
   - [ ] Upload documents
   - [ ] Add clients
   - [ ] Add payments
   - [ ] View case details

## Step 6: Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

## Troubleshooting

### Build Fails

- Check Vercel build logs for specific errors
- Verify all environment variables are set
- Ensure `package.json` has correct dependencies
- Check for TypeScript errors: `npm run build` locally

### Firebase Errors

- Verify Firebase Admin SDK credentials are correct
- Check Firebase security rules are published
- Ensure environment variables are set for Production environment
- Check Firebase Console for API restrictions

### File Upload Not Working

- Verify `BLOB_READ_WRITE_TOKEN` is set in Vercel
- Check token has read/write permissions
- Verify Vercel Blob store is created

### API Routes Not Working

- Check server logs in Vercel Dashboard
- Verify Firebase Admin SDK environment variables
- Ensure API routes are in `app/api/` directory

## Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Firebase security rules deployed
- [ ] Firestore indexes deployed
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Test all major features
- [ ] Monitor error logs in Vercel Dashboard

## Quick Commands Reference

```powershell
# Test build locally
cd llb-case-tracker
npm run build

# Deploy to Vercel (preview)
vercel

# Deploy to Vercel (production)
vercel --prod

# View deployment logs
vercel logs

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

## Support

- Vercel Documentation: https://vercel.com/docs
- Firebase Console: https://console.firebase.google.com/
- Check deployment logs in Vercel Dashboard for specific errors
