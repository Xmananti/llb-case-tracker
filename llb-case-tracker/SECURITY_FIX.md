# 🔒 Security Fix: Remove Firebase Credentials from Git

## ⚠️ CRITICAL: Your Firebase credentials were exposed in git history!

GitHub blocked your push because `firebase.json` contains Google Cloud Service Account credentials. These credentials must be removed from git history.

## Steps to Fix

### 1. Remove firebase.json from git tracking (but keep local file)

```powershell
# Remove from git but keep local file
git rm --cached firebase.json

# Commit the removal
git commit -m "Remove firebase.json from repository (contains secrets)"
```

### 2. Remove from git history (if already pushed)

If you've already pushed to a remote repository, you need to remove it from history:

```powershell
# Use git filter-branch or BFG Repo-Cleaner
# Option 1: Using git filter-branch
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch firebase.json" --prune-empty --tag-name-filter cat -- --all

# Option 2: Using BFG (recommended - faster)
# Download BFG from https://rtyley.github.io/bfg-repo-cleaner/
# Then run:
# bfg --delete-files firebase.json
```

### 3. Force push (⚠️ WARNING: Only if working alone or team is aware)

```powershell
# Force push to update remote
git push origin --force --all
git push origin --force --tags
```

### 4. Verify firebase.json is in .gitignore

The file `.gitignore` should now include:

```
firebase.json
```

### 5. Create firebase.json from template

Copy the example file:

```powershell
# Copy the example (already created)
# Then manually add your actual credentials to firebase.json (which is now gitignored)
```

## ✅ What's Fixed

- ✅ `firebase.json` added to `.gitignore`
- ✅ `firebase.json.example` created as template
- ✅ Credentials will no longer be committed

## 🔐 Best Practices Going Forward

1. **Never commit credentials** - Always use `.gitignore`
2. **Use environment variables** - Consider moving to `.env.local`
3. **Rotate credentials** - If exposed, regenerate them in Firebase Console
4. **Use secret management** - For production, use services like:
   - Firebase Functions environment config
   - AWS Secrets Manager
   - Google Secret Manager
   - Vercel Environment Variables

## 🔄 If Credentials Were Exposed

If your credentials were already pushed to a public repository:

1. **Immediately rotate credentials**:

   - Go to Firebase Console
   - IAM & Admin > Service Accounts
   - Delete the exposed service account
   - Create a new one
   - Update `firebase.json` with new credentials

2. **Review access logs** in Firebase Console

3. **Monitor for unauthorized access**

## 📝 Next Steps

After fixing the security issue, you can continue with the SaaS implementation. The credentials are now properly secured.
