# 🚀 Vercel Deployment Fix

## ⚠️ Issue

Vercel cannot find Next.js because the project is in a subdirectory (`llb-case-tracker/`), but Vercel is building from the repository root.

## ✅ Solution Options

### Option 1: Configure Root Directory in Vercel Dashboard (Recommended)

1. Go to your Vercel project settings: https://vercel.com/[your-username]/llb-case-tracker/settings
2. Navigate to **General** > **Root Directory**
3. Set Root Directory to: `llb-case-tracker`
4. Click **Save**
5. Redeploy your project

### Option 2: Use vercel.json (Alternative)

I've created a `vercel.json` file in the repository root. However, Vercel's recommended approach is to set the Root Directory in the dashboard.

If you want to use `vercel.json`, you can also create it in the `llb-case-tracker` directory instead.

### Option 3: Move Project to Root (If you want to simplify)

If you prefer, you can move all files from `llb-case-tracker/` to the repository root:

```bash
# Backup first!
# Then move files
cd llb-case-tracker
mv * ..
mv .* .. 2>/dev/null || true
cd ..
rmdir llb-case-tracker
```

## 📋 Current Project Structure

```
llb-case-tracker/          (Git repository root)
└── llb-case-tracker/      (Next.js project root)
    ├── package.json        (Has Next.js dependency)
    ├── app/
    ├── components/
    └── ...
```

## ✅ Verification

After setting the Root Directory in Vercel:

1. The build should find `package.json` with Next.js
2. The build should complete successfully
3. Your app should deploy

## 🔧 Additional Configuration

Make sure your Vercel project has these environment variables set:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Go to: **Settings** > **Environment Variables** in Vercel dashboard.

## 🎯 Quick Fix Steps

1. **Set Root Directory in Vercel:**

   - Dashboard → Settings → General → Root Directory
   - Set to: `llb-case-tracker`
   - Save

2. **Add Environment Variables:**

   - Dashboard → Settings → Environment Variables
   - Add all Firebase config variables from your `.env.local`

3. **Redeploy:**
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment

That's it! Your deployment should work now. ✅
