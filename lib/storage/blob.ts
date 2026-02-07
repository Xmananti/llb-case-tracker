/**
 * File storage client: upload/delete go through API routes backed by Google Cloud Storage (GCS).
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
 * Upload a file via the server API (GCS-backed).
 * All uploads go through the server route; the API uses Node.js runtime for larger files.
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
    // API doesn't stream progress; simulate based on file size
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
        // Don't set Content-Type header - browser will set it with boundary for FormData
      });

      clearInterval(interval);
      onProgress({ loaded: file.size, total: file.size });

      if (!response.ok) {
        let errorMessage = "Upload failed";
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch {
          // If response is not JSON, check status
          if (response.status === 413) {
            errorMessage =
              "File is too large or request was truncated. Try a smaller file (e.g. under 10MB) and restart the dev server.";
          } else if (response.status === 0 || response.type === "opaque") {
            errorMessage =
              "CORS error: Upload failed due to network restrictions. Please check your connection and try again.";
          } else {
            errorMessage = `Upload failed with status ${response.status}`;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      clearInterval(interval);
      // Better error detection for CORS/network issues
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Network error: Failed to upload file. This may be due to CORS restrictions or network issues. Please check your connection and try again."
        );
      }
      throw error;
    }
  } else {
    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Upload failed";
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch {
          if (response.status === 413) {
            errorMessage =
              "File is too large. Maximum file size is 100MB. For files over 4MB, please contact support.";
          } else if (response.status === 0 || response.type === "opaque") {
            errorMessage =
              "CORS error: Upload failed due to network restrictions. Please check your connection and try again.";
          } else {
            errorMessage = `Upload failed with status ${response.status}`;
          }
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      // Better error detection for CORS/network issues
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Network error: Failed to upload file. This may be due to CORS restrictions or network issues. Please check your connection and try again."
        );
      }
      throw error;
    }
  }
}

/**
 * Delete a file via the server API (GCS-backed).
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
 * Get file URL (GCS public URLs are used as-is).
 */
export async function getFileUrl(url: string): Promise<string> {
  return url;
}
