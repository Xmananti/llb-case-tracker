/**
 * Vercel Blob Storage implementation
 * Replaces Firebase Storage for free file storage
 */

export interface UploadProgress {
  loaded: number;
  total: number;
}

export interface UploadResult {
  url: string;
  path: string;
  size: number;
}

/**
 * Upload a file to Vercel Blob Storage
 */
export async function uploadFile(
  path: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("path", path);

  // Simulate progress for better UX
  if (onProgress) {
    // Since Vercel Blob doesn't support progress callbacks in the API,
    // we simulate progress based on file size
    const simulateProgress = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress < 90) {
          onProgress({
            loaded: (file.size * progress) / 100,
            total: file.size,
          });
        } else {
          clearInterval(interval);
        }
      }, 100);
      return interval;
    };

    const interval = simulateProgress();

    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      onProgress({ loaded: file.size, total: file.size });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      clearInterval(interval);
      throw error;
    }
  } else {
    const response = await fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    return await response.json();
  }
}

/**
 * Delete a file from Vercel Blob Storage
 */
export async function deleteFile(url: string): Promise<void> {
  const response = await fetch(
    `/api/files/delete?url=${encodeURIComponent(url)}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Delete failed");
  }
}

/**
 * Upload a case document
 */
export async function uploadCaseDocument(
  caseId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ url: string; path: string }> {
  const timestamp = Date.now();
  const path = `cases/${caseId}/documents/${timestamp}_${file.name}`;
  const result = await uploadFile(path, file, onProgress);
  return { url: result.url, path: result.path };
}

/**
 * Upload a user logo
 */
export async function uploadUserLogo(
  userId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ url: string; path: string }> {
  const timestamp = Date.now();
  const fileExtension = file.name.split(".").pop() || "png";
  const path = `users/${userId}/logo_${timestamp}.${fileExtension}`;
  const result = await uploadFile(path, file, onProgress);
  return { url: result.url, path: result.path };
}

/**
 * Get file URL (Vercel Blob URLs are already public, so just return the URL)
 */
export async function getFileUrl(url: string): Promise<string> {
  // Vercel Blob URLs are already public, so we just return the URL
  return url;
}
