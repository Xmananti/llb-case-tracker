# 📦 Google Cloud Storage (GCS) Setup

## Overview

This project uses **Google Cloud Storage (GCS)** for file uploads (case documents, user logos). Upload and delete go through API routes that use the `@google-cloud/storage` client.

- Upload: `POST /api/files/upload` (FormData: `file`, `path`)
- Delete: `DELETE /api/files/delete?url=...`
- File URLs: `https://storage.googleapis.com/{bucket}/{path}` (when bucket is public)

## Setup Instructions

### 1. Create a GCS bucket

1. Open [Google Cloud Console](https://console.cloud.google.com/storage)
2. Create a bucket (e.g. `your-app-uploads`)
3. Choose region and storage class as needed

### 2. Create a service account and download the key

1. **Open Service Accounts**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project (the one that has the `case-tracker` bucket).
   - In the left menu: **IAM & Admin** → **Service Accounts**.

2. **Create the service account**
   - Click **+ Create Service Account**.
   - **Service account name:** e.g. `case-tracker-p` (or `app-storage`).
   - **Service account ID:** will be filled automatically (e.g. `case-tracker-p`).
   - (Optional) Add a description, e.g. “Access to case-tracker bucket for app uploads”.
   - Click **Create and Continue**.

3. **Grant access to the bucket**
   - Under **Grant this service account access to project**, click **Add another role**.
   - Add **Storage Object Admin** (or **Storage Admin** if you prefer).
   - Click **Continue** → **Done**.

4. **Create and download the private key (JSON)**
   - In the **Service Accounts** list, click the service account you just created (e.g. `case-tracker-p`).
   - Open the **Keys** tab.
   - Click **Add key** → **Create new key**.
   - Choose **JSON** → **Create**.
   - A JSON file will download (e.g. `your-project-xxxxx.json`).  
     **Store this file securely; the private key cannot be recovered if lost.**

5. **Use the key in your app**
   - **Option A (recommended for Vercel / serverless):** Open the downloaded JSON file, copy its **entire** contents, and put it in one line (remove line breaks) as the value of `GCS_SERVICE_ACCOUNT_KEY` in `.env.local` (see step 3 below).
   - **Option B (local dev):** Set `GOOGLE_APPLICATION_CREDENTIALS` in `.env.local` to the full path of the JSON file, e.g. `C:\Users\YourName\Downloads\your-project-xxxxx.json`.

### 3. Environment variables

**Option A – JSON key in env (recommended for Vercel/serverless)**

In `.env.local` (and in Vercel → Project → Settings → Environment Variables):

```env
GCS_BUCKET=your-bucket-name
GCS_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...",...}
```

Paste the **entire** contents of the JSON key file as a single line (no newlines inside the value).

**Option B – Key file path (local / GCE / Cloud Run)**

```env
GCS_BUCKET=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### 4. Public read (optional)

To use direct public URLs (`https://storage.googleapis.com/...`):

- Either set the bucket to **public** (bucket policy: allUsers `objectViewer`), or
- Keep the bucket private and switch the app to use **signed URLs** in `lib/gcs.ts` (see [Signed URLs](https://cloud.google.com/storage/docs/access-control/signed-urls)).

## Code references

- **Server (GCS client):** `lib/gcs.ts` – `uploadToGcs`, `deleteFromGcsByUrl`, `parseGcsUrl`
- **API routes:** `app/api/files/upload/route.ts`, `app/api/files/delete/route.ts`
- **Client:** `lib/storage/blob.ts` (calls the API; no GCS dependency in the browser)

## Troubleshooting

- **403 – "does not have storage.objects.create access"**  
  The service account has no permission on the bucket. **See [FIX_GCS_403.md](./FIX_GCS_403.md)** for step-by-step fix. Important: the bucket might be in a **different project** than your service account—grant access in the project that **owns** the bucket `case-tracker`.

- **"GCS_BUCKET is not set"**  
  Add `GCS_BUCKET` and either `GCS_SERVICE_ACCOUNT_KEY` or `GOOGLE_APPLICATION_CREDENTIALS`.

- **403 / Permission denied**  
  Ensure the service account has **Storage Object Admin** (or **Storage Admin**) on the bucket.

- **Invalid GCS URL on delete**  
  Delete only supports GCS URLs (`https://storage.googleapis.com/...`). Old Vercel Blob URLs cannot be deleted by this app.

- **Large uploads**  
  Upload goes through the Next.js API (max body size applies). The upload route uses `maxDuration = 60` and Node runtime.

## Links

- [Google Cloud Storage Node.js client](https://github.com/googleapis/nodejs-storage)
- [GCS authentication](https://cloud.google.com/docs/authentication)
