# Firebase Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following Firebase configuration:

```env
# Firebase Configuration
# Get these values from your Firebase Console: https://console.firebase.google.com/
# Project Settings > General > Your apps > Web app config

# Firebase API Key
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here

# Firebase Auth Domain (usually: your-project-id.firebaseapp.com)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com

# Firebase Project ID
NEXT_PUBLIC_FIREBASE_PROJECT_ID=llb-case-tracker

# Firebase Storage Bucket (usually: your-project-id.appspot.com)
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Firebase Messaging Sender ID
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id

# Firebase App ID
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id-here
```

## How to Get Your Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click on the **Settings (gear icon)** > **Project settings**
4. Scroll down to **Your apps** section
5. If you don't have a web app, click **Add app** > **Web** (</> icon)
6. Copy the configuration values from the Firebase SDK setup

## Example Values Format

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=llb-case-tracker.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=llb-case-tracker
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=llb-case-tracker.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

## Important Notes

- The `.env.local` file is already in `.gitignore` and will not be committed to version control
- All variables must start with `NEXT_PUBLIC_` to be accessible in the browser
- Restart your Next.js development server after creating/updating `.env.local`
- Never commit your actual Firebase credentials to version control

## Firebase Services Setup

Make sure you have enabled the following Firebase services:

1. **Authentication** - Enable Email/Password provider
2. **Firestore Database** - Create database in production mode
3. **Storage** - Enable Firebase Storage

## Security Rules

Update your Firestore and Storage security rules in Firebase Console:

### Firestore Rules (firestore.rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cases/{caseId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /documents/{docId} {
      allow read, write: if request.auth != null;
    }
    match /hearings/{hearingId} {
      allow read, write: if request.auth != null;
    }
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
    match /conversations/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Rules (storage.rules)

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
