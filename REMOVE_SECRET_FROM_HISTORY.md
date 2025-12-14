# 🔒 Remove firebase.json from Git History

## ⚠️ Important
This will rewrite Git history. If others are working on this repo, coordinate with them first.

## Steps to Remove Secret from History

### Option 1: Using git filter-branch (Recommended)

```bash
# Navigate to the repository
cd llb-case-tracker

# Remove firebase.json from entire Git history
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch firebase.json" --prune-empty --tag-name-filter cat -- --all

# Force push to update remote (WARNING: This rewrites history)
git push origin --force --all
```

### Option 2: Using BFG Repo-Cleaner (Faster, if installed)

```bash
# Install BFG (one-time)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove firebase.json
bfg --delete-files firebase.json

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
```

### Option 3: Create a New Repository (Safest if history doesn't matter)

If you don't need the Git history:

```bash
# Remove .git folder
rm -rf .git

# Initialize new repo
git init
git add .
git commit -m "Initial commit (secrets removed)"
git remote add origin <your-repo-url>
git push -u origin main --force
```

## ⚠️ After Removing from History

1. **Rotate your Firebase credentials immediately:**
   - Go to Firebase Console > Project Settings > Service Accounts
   - Delete the exposed service account
   - Create a new service account
   - Download new `firebase.json`

2. **Verify the file is gone:**
   ```bash
   git log --all -- "firebase.json"
   # Should return nothing
   ```

3. **Update all team members:**
   - They need to re-clone or reset their local repos
   - Warn them about the history rewrite

## ✅ Current Status

The file is in commit `8c4aa29` (first commit). You need to remove it from history before pushing.

