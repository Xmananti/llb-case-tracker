# ✅ Environment Variables Checklist

## Required for Google Cloud Storage (GCS)

Make sure you have these in your `.env.local` file:

```env
GCS_BUCKET=your-bucket-name
GCS_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...",...}
```

**Alternative:** If running on GCE/Cloud Run or with a key file, you can use:

```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
GCS_BUCKET=your-bucket-name
```

## Quick Verification

1. **Check your `.env.local` file:**
   - `GCS_BUCKET`: Your GCS bucket name
   - `GCS_SERVICE_ACCOUNT_KEY`: Full JSON key (single line) **or** set `GOOGLE_APPLICATION_CREDENTIALS` to key file path

2. **Restart your dev server:**
   ```bash
   npm run dev
   ```

3. **Test file upload:**
   - Try uploading a document in the cases page
   - Check browser console and server logs for errors

## Common Issues

### Bucket not set
- Ensure `GCS_BUCKET` is set and the bucket exists in Google Cloud.

### Authentication
- For serverless (Vercel etc.), use `GCS_SERVICE_ACCOUNT_KEY` with the full JSON key as a single-line string.
- For local or GCE, `GOOGLE_APPLICATION_CREDENTIALS` pointing to a key file works.

### Public read for uploaded files
- To use public URLs (`https://storage.googleapis.com/...`), configure the bucket for public read (e.g. add a bucket policy or set object ACL). Alternatively, use signed URLs (see `lib/gcs.ts`).

### Still getting errors
1. Verify the service account has **Storage Object Admin** (or **Storage Admin**) on the bucket.
2. Ensure the key JSON is valid and has no extra newlines when pasted (use a single line).
