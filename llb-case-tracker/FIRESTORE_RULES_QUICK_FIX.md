# 🔧 Quick Fix: Firestore Security Rules

## ⚠️ Immediate Action Required

Your Firestore security rules need to be updated in Firebase Console to allow document operations.

## Step-by-Step Fix

### 1. Go to Firebase Console

- Visit: https://console.firebase.google.com/
- Select project: **llb-case-tracker**

### 2. Navigate to Firestore Rules

- Click **Firestore Database** in left sidebar
- Click **Rules** tab at the top

### 3. Copy and Paste These Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check ownership
    function isOwner(resource) {
      return request.auth != null &&
             (resource.data.uploadedBy == request.auth.uid ||
              resource.data.userId == request.auth.uid ||
              resource.data.senderId == request.auth.uid);
    }

    // Documents collection
    match /documents/{docId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && isOwner(resource);
    }

    // Hearings collection
    match /hearings/{hearingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && isOwner(resource);
    }

    // Tasks collection
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && isOwner(resource);
    }

    // Conversations collection
    match /conversations/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && isOwner(resource);
    }

    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Click "Publish"

- After pasting, click the **"Publish"** button
- Rules take effect immediately

### 5. Test

- Refresh your application
- Try viewing documents
- Try deleting a document
- Should work without permission errors

## Alternative: Test Mode (Development Only)

If you need to test quickly, use these permissive rules (⚠️ **NOT for production**):

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

**Remember to replace with proper rules before production!**

## What These Rules Do

- **Read**: Any authenticated user can read documents
- **Create**: Any authenticated user can create documents
- **Update/Delete**: Only the owner (uploadedBy/userId/senderId) can update/delete

This ensures:

- ✅ Users can view all documents in their organization
- ✅ Users can create new documents
- ✅ Only owners can delete their own documents
- ✅ Security is maintained

## Verification

After updating rules:

1. Refresh your browser
2. Check browser console - no more permission errors
3. Try deleting a document - should work
4. Try viewing documents - should work
