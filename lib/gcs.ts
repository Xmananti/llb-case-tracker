/**
 * Google Cloud Storage (GCS) client for file upload and delete.
 * Replaces Vercel Blob for file storage.
 */

import { Storage } from "@google-cloud/storage";

function getStorage(): Storage {
  const bucketName = process.env.GCS_BUCKET;
  if (!bucketName) {
    throw new Error(
      "GCS_BUCKET is not set. Please configure Google Cloud Storage."
    );
  }

  const keyJson = process.env.GCS_SERVICE_ACCOUNT_KEY;
  if (keyJson) {
    const credentials = JSON.parse(keyJson) as Record<string, unknown>;
    return new Storage({ credentials });
  }

  // Use GOOGLE_APPLICATION_CREDENTIALS path if set (e.g. local or GCE)
  return new Storage();
}

/** Default expiry for signed read URLs (1 hour). */
const DEFAULT_SIGNED_URL_EXPIRY_SECONDS = 3600;

/**
 * Get a signed URL for reading an object. Use for private buckets.
 * @param gcsStoredUrl - Stored URL like https://storage.googleapis.com/bucket/path
 * @param expiresInSeconds - How long the link is valid (default 1 hour)
 */
export async function getSignedReadUrl(
  gcsStoredUrl: string,
  expiresInSeconds: number = DEFAULT_SIGNED_URL_EXPIRY_SECONDS
): Promise<string> {
  const parsed = parseGcsUrl(gcsStoredUrl);
  if (!parsed) {
    throw new Error(`Invalid GCS URL: ${gcsStoredUrl}`);
  }
  const storage = getStorage();
  const bucket = storage.bucket(parsed.bucket);
  const file = bucket.file(parsed.path);
  const [signedUrl] = await file.getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + expiresInSeconds * 1000,
  });
  return signedUrl;
}

/**
 * Upload a file buffer to GCS and return the canonical URL (use signed URLs for private buckets).
 */
export async function uploadToGcs(
  path: string,
  buffer: Buffer,
  contentType?: string
): Promise<{ url: string; path: string }> {
  const bucketName = process.env.GCS_BUCKET;
  if (!bucketName) {
    throw new Error("GCS_BUCKET is not set.");
  }

  const storage = getStorage();
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(path);

  await file.save(buffer, {
    contentType: contentType || "application/octet-stream",
    metadata: {
      cacheControl: "public, max-age=31536000",
    },
  });

  const url = `https://storage.googleapis.com/${bucketName}/${path}`;
  return { url, path };
}

/**
 * Delete a file from GCS by its public URL.
 * URL format: https://storage.googleapis.com/{bucket}/{path}
 */
export async function deleteFromGcsByUrl(url: string): Promise<void> {
  const parsed = parseGcsUrl(url);
  if (!parsed) {
    throw new Error(`Invalid GCS URL: ${url}`);
  }

  const storage = getStorage();
  const bucket = storage.bucket(parsed.bucket);
  const file = bucket.file(parsed.path);
  await file.delete();
}

/**
 * Parse GCS public URL into bucket and path.
 * Supports: https://storage.googleapis.com/bucket/path/to/object
 * Decodes the path so that %20 (or double-encoded %2520) matches the object key used at upload (e.g. spaces in filename).
 */
export function parseGcsUrl(
  url: string
): { bucket: string; path: string } | null {
  try {
    const u = new URL(url);
    if (
      u.origin !== "https://storage.googleapis.com" &&
      !u.hostname.endsWith(".storage.googleapis.com")
    ) {
      return null;
    }
    // pathname is /bucket/path/to/object (may contain %20 etc.)
    const segments = u.pathname.replace(/^\/+/, "").split("/");
    if (segments.length < 2) {
      return null;
    }
    const [bucket, ...pathParts] = segments;
    let path = pathParts.join("/");
    try {
      path = decodeURIComponent(path);
    } catch {
      // leave path as-is if decoding fails
    }
    return { bucket, path };
  } catch {
    return null;
  }
}
