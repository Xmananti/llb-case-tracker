import { useState } from "react";
import { uploadCaseDocument } from "../lib/firebase/storage";
import type { UploadProgress } from "../lib/storage/blob";

export const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (caseId: string, file: File) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      const result = await uploadCaseDocument(
        caseId,
        file,
        (progress: UploadProgress) => {
          const percent = (progress.loaded / progress.total) * 100;
          setProgress(percent);
        }
      );
      setProgress(100);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFile,
    uploading,
    progress,
    error,
  };
};
