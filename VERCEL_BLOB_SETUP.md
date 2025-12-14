# 📦 Vercel Blob Storage Setup

## Overview

This project now uses **Vercel Blob Storage** instead of Firebase Cloud Storage for free file storage. Vercel Blob provides:

- ✅ **Free tier**: 1 GB storage, 100 GB bandwidth per month
- ✅ **No Firebase Storage costs**
- ✅ **Simple API**
- ✅ **Fast CDN delivery**

## Setup Instructions

### Step 1: Install Dependencies

```bash
npm install @vercel/blob
```

### Step 2: Get Vercel Blob Token

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project settings
3. Go to **Storage** > **Blob**
4. Create a new Blob store (if you don't have one)
5. Copy the **BLOB_READ_WRITE_TOKEN**

### Step 3: Add Environment Variable

Add to your `.env.local` file:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
```

**For Vercel Deployment:**

Add the environment variable in Vercel Dashboard:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add `BLOB_READ_WRITE_TOKEN` with your token value

## Migration from Firebase Storage

### What Changed

1. **Storage Backend**: Firebase Storage → Vercel Blob
2. **API Routes**: New routes at `/api/files/upload` and `/api/files/delete`
3. **Storage Module**: `lib/firebase/storage.ts` now uses Vercel Blob
4. **File URLs**: Now use Vercel Blob URLs instead of Firebase Storage URLs

### File Structure

```
lib/
  storage/
    blob.ts          # Vercel Blob implementation
  firebase/
    storage.ts       # Wrapper (backward compatible)

app/
  api/
    files/
      upload/route.ts    # Upload endpoint
      delete/route.ts    # Delete endpoint
```

### API Usage

**Upload File:**

```typescript
import { uploadCaseDocument } from "@/lib/firebase/storage";

const { url, path } = await uploadCaseDocument(caseId, file, (progress) => {
  console.log(`Upload: ${(progress.loaded / progress.total) * 100}%`);
});
```

**Delete File:**

```typescript
import { deleteFile } from "@/lib/firebase/storage";

await deleteFile(fileUrl);
```

## Benefits

1. **Cost Savings**: No Firebase Storage charges
2. **Free Tier**: 1 GB storage + 100 GB bandwidth/month
3. **Simple**: Fewer dependencies and simpler API
4. **Fast**: CDN-backed delivery
5. **Integrated**: Works seamlessly with Vercel deployments

## Limitations

- Requires Vercel account (free tier available)
- 1 GB storage limit on free tier
- Files are stored in Vercel's infrastructure

## Troubleshooting

### Error: "BLOB_READ_WRITE_TOKEN is not set"

Make sure you've added the token to your `.env.local` file and restarted your dev server.

### Error: "Failed to upload file"

1. Check your Vercel Blob token is valid
2. Verify you have storage quota available
3. Check file size limits (Vercel Blob supports files up to 4.5 GB)

### Files Not Uploading

1. Check browser console for errors
2. Verify API routes are accessible
3. Check Vercel Blob dashboard for storage usage

## Next Steps

1. Install `@vercel/blob` package
2. Add `BLOB_READ_WRITE_TOKEN` to environment variables
3. Test file uploads in your application
4. Monitor storage usage in Vercel Dashboard

## Support

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Vercel Blob Pricing](https://vercel.com/pricing)
