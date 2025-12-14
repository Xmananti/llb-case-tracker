# 🔍 Firestore Index Setup

## Issue

When querying the `conversations` collection with both a `where` clause and an `orderBy` clause, Firestore requires a composite index.

**Error Message:**

```
Error: The query requires an index. You can create it here: [link]
```

## Solution

A `firestore.indexes.json` file has been created with the required index configuration.

### Option 1: Use the Error Link (Quickest - No Installation Required) ⚡

**This is the fastest way to create the index:**

1. When you see the error, **click the link** provided in the error message
2. This will open Firebase Console with the index creation page pre-configured
3. Click **"Create Index"** button
4. Wait for the index to build (usually takes 1-5 minutes)

**That's it!** The index will be created automatically and the error will disappear once it's built.

### Option 2: Install and Use Firebase CLI

If you want to use Firebase CLI (useful for future deployments):

#### Install Firebase CLI on Windows (PowerShell)

```powershell
# Install via npm (if you have Node.js installed)
npm install -g firebase-tools

# Or install via standalone installer
# Download from: https://firebase.tools/bin/win/instant/latest
```

#### After Installation

```powershell
# Login to Firebase
firebase login

# Navigate to project directory
cd llb-case-tracker

# Deploy indexes
firebase deploy --only firestore:indexes
```

**Note:** If you don't have Node.js/npm installed, use Option 1 (the error link) instead.

1. When you see the error, click the link provided in the error message
2. This will open Firebase Console with the index creation page
3. Click "Create Index" button
4. Wait for the index to build (usually takes a few minutes)

### Option 3: Manual Creation in Firebase Console (If Link Doesn't Work)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **llb-case-tracker**
3. Navigate to **Firestore Database** > **Indexes** tab
4. Click **Create Index**
5. Configure:
   - **Collection ID**: `conversations`
   - **Fields to index**:
     - `caseId` (Ascending)
     - `timestamp` (Ascending)
6. Click **Create**

## Index Configuration

The index is defined in `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "conversations",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "caseId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "ASCENDING"
        }
      ]
    }
  ]
}
```

## What This Index Enables

This index allows queries like:

```typescript
query(
  collection(db, "conversations"),
  where("caseId", "==", caseId),
  orderBy("timestamp", "asc")
);
```

This is used in:

- `app/(dashboard)/cases/[caseId]/page.tsx` - CaseConversationsTab component
- Fetches and displays conversations for a specific case, ordered by timestamp

## Verification

After the index is created:

1. The error should disappear
2. Conversations should load properly in the case details page
3. Real-time updates should work correctly

## Note

- Index creation typically takes 1-5 minutes
- The index is automatically used once it's built
- No code changes are needed after the index is created
