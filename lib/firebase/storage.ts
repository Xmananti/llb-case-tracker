/**
 * Storage module - Uses Google Cloud Storage (GCS) via API routes
 */

import {
  uploadFile as blobUploadFile,
  deleteFile as blobDeleteFile,
  getFileUrl as blobGetFileUrl,
  uploadCaseDocument as blobUploadCaseDocument,
  uploadUserLogo as blobUploadUserLogo,
  UploadProgress,
} from "../storage/blob";

// Re-export for backward compatibility
export const uploadFile = async (
  path: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
) => {
  return blobUploadFile(path, file, onProgress);
};

export const getFileUrl = async (url: string): Promise<string> => {
  return blobGetFileUrl(url);
};

export const deleteFile = async (url: string): Promise<void> => {
  return blobDeleteFile(url);
};

export const uploadCaseDocument = async (
  caseId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ url: string; path: string }> => {
  return blobUploadCaseDocument(caseId, file, onProgress);
};

export const uploadUserLogo = async (
  userId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ url: string; path: string }> => {
  return blobUploadUserLogo(userId, file, onProgress);
};
