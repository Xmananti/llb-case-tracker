# ✅ Environment Variables Checklist

## Required for Vercel Blob Storage

Make sure you have this in your `.env.local` file:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
```

**Important:** The variable name must be exactly `BLOB_READ_WRITE_TOKEN` (not `prod_READ_WRITE_TOKEN` or any other variation).

## Quick Verification

1. **Check your `.env.local` file:**

   - Variable name: `BLOB_READ_WRITE_TOKEN`
   - Value: Your Vercel Blob token (starts with `vercel_blob_`)

2. **Restart your dev server:**

   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

3. **Test file upload:**
   - Try uploading a document in the cases page
   - Check browser console for any errors
   - Check server logs for token-related errors

## Common Issues

### Wrong Variable Name

❌ `prod_READ_WRITE_TOKEN`  
❌ `BLOB_TOKEN`  
❌ `VERCEL_BLOB_TOKEN`

✅ `BLOB_READ_WRITE_TOKEN` (correct)

### Token Not Loading

- Make sure `.env.local` is in the project root (`llb-case-tracker/`)
- Restart the dev server after adding/changing environment variables
- Check that the token value doesn't have extra quotes or spaces

### Still Getting Errors

1. Verify token is valid in Vercel Dashboard
2. Check token has read/write permissions
3. Ensure you're using the correct token for your environment (dev vs production)
