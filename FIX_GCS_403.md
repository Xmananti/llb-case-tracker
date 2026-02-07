# Fix 403 – Storage permission denied

Your service account **must** have access to the bucket in the **same Google Cloud project where the bucket lives**. Follow these steps exactly.

---

## Step 1: Find which project has the bucket

1. Open **[Cloud Console → Storage → Buckets](https://console.cloud.google.com/storage/browser)**.
2. At the **top of the page**, check the **project selector** (dropdown next to “Google Cloud”).
3. Switch projects if needed until you see the bucket **`case-tracker`** in the list.
4. Note that project name (e.g. `case-tracker-storage` or `my-project`). **All steps below must be done in this same project.**

---

## Step 2: Grant the service account access on the bucket

1. Still in that project, click the bucket name **`case-tracker`** (not the checkbox).
2. Open the **Permissions** tab.
3. Click **Grant access** (or **Add principal**).
4. **New principals:** paste exactly:
   ```text
   case-tracker-p@case-tracker-storage.iam.gserviceaccount.com
   ```
5. **Role:** choose **Storage Object Admin** (type “Storage Object Admin” in the role dropdown).
6. Click **Save**.

---

## Step 3: If the bucket is in a different project

If the bucket `case-tracker` is in project **A** and your service account is in project **B** (`case-tracker-storage`):

- You **must** add the principal in the project that **owns the bucket** (project A).
- Go to **project A** → **Storage** → **Buckets** → **case-tracker** → **Permissions** → **Grant access**.
- Use the same principal and role as in Step 2.

---

## Step 4: Wait and test

- Wait **1–2 minutes** for IAM to update.
- Restart your dev server (`npm run dev`) and try the upload again.

---

## Checklist

- [ ] I opened the project that **contains** the bucket `case-tracker`.
- [ ] I went to **Storage → Buckets → case-tracker → Permissions**.
- [ ] I added principal: `case-tracker-p@case-tracker-storage.iam.gserviceaccount.com`
- [ ] I set role: **Storage Object Admin**
- [ ] I saved and waited 1–2 minutes, then retried the upload.
