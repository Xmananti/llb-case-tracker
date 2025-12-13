import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
} from "firebase/storage";
import { app } from "./config";

const storage = getStorage(app);

export const uploadFile = async (
  path: string,
  file: File
): Promise<UploadTask> => {
  const storageRef = ref(storage, path);
  return uploadBytesResumable(storageRef, file);
};

export const getFileUrl = async (path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
};

export const deleteFile = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

export const uploadCaseDocument = async (
  caseId: string,
  file: File
): Promise<{ url: string; path: string }> => {
  const timestamp = Date.now();
  const path = `cases/${caseId}/documents/${timestamp}_${file.name}`;
  const uploadTask = await uploadFile(path, file);
  await uploadTask;
  const url = await getFileUrl(path);
  return { url, path };
};
