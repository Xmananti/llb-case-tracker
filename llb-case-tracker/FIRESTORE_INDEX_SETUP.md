# 🔍 Firestore Index Setup

## Issue

When querying the `conversations` collection with both a `where` clause and an `orderBy` clause, Firestore requires a composite index.

**Error Message:**

```
Error: The query requires an index. You can create it here: [link]
```

## Solution

A `firestore.indexes.json` file has been created with the required index configuration.

### Option 1: Deploy via Firebase CLI (Recommended)

If you have Firebase CLI installed:

```bash
cd llb-case-tracker
firebase deploy --only firestore:indexes
```

### Option 2: Use the Error Link (Quick Fix)

1. When you see the error, click the link provided in the error message
2. This will open Firebase Console with the index creation page
3. Click "Create Index" button
4. Wait for the index to build (usually takes a few minutes)

### Option 3: Manual Creation in Firebase Console

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
