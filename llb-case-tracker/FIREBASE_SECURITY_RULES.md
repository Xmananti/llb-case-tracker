# Firebase Security Rules Configuration

## 🔒 Fix "Missing or insufficient permissions" Error

This error occurs when Firebase security rules block access. Follow these steps to fix it:

## Step 1: Configure Firestore Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **llb-case-tracker**
3. Navigate to **Firestore Database** > **Rules**
4. Replace the rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Documents collection - allow authenticated users to read/write
    match /documents/{docId} {
      allow read, write: if request.auth != null;
    }

    // Hearings collection - allow authenticated users to read/write
    match /hearings/{hearingId} {
      allow read, write: if request.auth != null;
    }

    // Tasks collection - allow authenticated users to read/write
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }

    // Conversations collection - allow authenticated users to read/write
    match /conversations/{messageId} {
      allow read, write: if request.auth != null;
    }

    // Users collection (if you have one)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. Click **"Publish"**

## Step 2: Configure Realtime Database Rules

1. Go to **Realtime Database** in Firebase Console
2. Click on the **Rules** tab
3. Replace the rules with:

```json
{
  "rules": {
    "cases": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$caseId": {
        ".validate": "newData.hasChildren(['title', 'description', 'userId']) && newData.child('userId').val() == auth.uid"
      }
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

4. Click **"Publish"**

## Step 3: Configure Storage Rules

1. Go to **Storage** > **Rules** in Firebase Console
2. Replace with:

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

3. Click **"Publish"**

## Step 4: Verify Authentication

Make sure users are authenticated before accessing Firestore. The app should:

1. Check if user is logged in before making Firestore queries
2. Wait for authentication to complete before fetching data

## Step 5: Test Mode (Development Only)

⚠️ **WARNING: Only use for development/testing!**

If you need to test quickly, you can temporarily use these permissive rules:

### Firestore (Test Mode)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Realtime Database (Test Mode)

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

**Remember to replace with proper rules before production!**

## Common Issues

### Issue 1: User not authenticated

- **Solution**: Make sure the user is logged in before accessing Firestore
- Check `useAuth()` hook returns a valid user

### Issue 2: Rules not published

- **Solution**: After updating rules, always click **"Publish"**
- Rules take effect immediately after publishing

### Issue 3: Wrong collection path

- **Solution**: Verify collection names match exactly:
  - `documents` (not `document`)
  - `hearings` (not `hearing`)
  - `tasks` (not `task`)
  - `conversations` (not `conversation`)

### Issue 4: Realtime Database not enabled

- **Solution**:
  1. Go to Firebase Console
  2. Navigate to **Realtime Database**
  3. Click **"Create Database"**
  4. Choose location
  5. Select **"Start in test mode"** (then update rules)
  6. Click **"Enable"**

## Verification Steps

1. **Check Authentication**:

   ```javascript
   // In browser console
   firebase.auth().currentUser;
   // Should return user object if logged in
   ```

2. **Check Rules**:

   - Go to Firebase Console
   - Check Rules tab shows your updated rules
   - Verify "Published" status

3. **Test Access**:
   - Try creating a case
   - Try uploading a document
   - Check browser console for errors

## Need Help?

If errors persist:

1. Check browser console for detailed error messages
2. Verify user is authenticated: `firebase.auth().currentUser !== null`
3. Check Firebase Console > Firestore > Rules are published
4. Verify Realtime Database is enabled and rules are set
