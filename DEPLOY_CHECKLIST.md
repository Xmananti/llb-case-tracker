# ✅ Production Deployment Checklist

## Pre-Deployment

- [ ] Code is committed and pushed to Git repository
- [ ] All tests pass locally
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in development

## Environment Variables to Set in Vercel

### Firebase Client SDK (Public)

- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Firebase Admin SDK (Private - Server-side)

Choose ONE option:

**Option 1: Individual Variables**

- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `FIREBASE_PRIVATE_KEY` (with `\n` for newlines)
- [ ] `FIREBASE_DATABASE_URL`

**Option 2: Base64 Encoded**

- [ ] `FIREBASE_CONFIG_BASE64`

### Google Cloud Storage (file uploads)

- [ ] `GCS_BUCKET`
- [ ] `GCS_SERVICE_ACCOUNT_KEY` (JSON string) or `GOOGLE_APPLICATION_CREDENTIALS`

## Deployment Steps

1. [ ] Create Vercel account or login
2. [ ] Import Git repository to Vercel
3. [ ] Configure environment variables in Vercel Dashboard
4. [ ] Deploy project
5. [ ] Verify deployment URL works
6. [ ] Test all features

## Post-Deployment

- [ ] Deploy Firestore indexes: `firebase deploy --only firestore:indexes`
- [ ] Verify Firebase security rules are published
- [ ] Test user registration
- [ ] Test case creation
- [ ] Test file uploads
- [ ] Test client management
- [ ] Test payment tracking

## Quick Deploy Commands

```powershell
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
cd llb-case-tracker
vercel --prod
```
