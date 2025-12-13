import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { app } from "./config";

const db = getFirestore(app);

// Cases
export const createCase = async (data: {
  title: string;
  description: string;
  userId: string;
}) => {
  return await addDoc(collection(db, "cases"), {
    ...data,
    createdAt: Timestamp.now(),
  });
};

export const getCase = async (caseId: string) => {
  const docRef = doc(db, "cases", caseId);
  const snap = await getDoc(docRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getCasesByUser = async (userId: string) => {
  const q = query(collection(db, "cases"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateCaseById = async (
  caseId: string,
  data: Partial<{ title: string; description: string }>
) => {
  await updateDoc(doc(db, "cases", caseId), data);
};

export const deleteCaseById = async (caseId: string) => {
  await deleteDoc(doc(db, "cases", caseId));
};

// Documents
export const createDocument = async (data: {
  caseId: string;
  name: string;
  url: string;
  uploadedBy: string;
  path: string;
}) => {
  return await addDoc(collection(db, "documents"), {
    ...data,
    uploadedAt: Timestamp.now(),
  });
};

export const getDocumentsByCase = async (caseId: string) => {
  const q = query(collection(db, "documents"), where("caseId", "==", caseId));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const deleteDocumentById = async (docId: string) => {
  await deleteDoc(doc(db, "documents", docId));
};

// Hearings
export const createHearing = async (data: {
  caseId: string;
  title: string;
  date: string;
  notes?: string;
}) => {
  return await addDoc(collection(db, "hearings"), data);
};

export const getHearingsByCase = async (caseId: string) => {
  const q = query(collection(db, "hearings"), where("caseId", "==", caseId));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateHearingById = async (
  hearingId: string,
  data: Partial<{ title: string; date: string; notes?: string }>
) => {
  await updateDoc(doc(db, "hearings", hearingId), data);
};

export const deleteHearingById = async (hearingId: string) => {
  await deleteDoc(doc(db, "hearings", hearingId));
};

// Tasks
export const createTask = async (data: {
  caseId: string;
  text: string;
  completed: boolean;
  notes?: string;
}) => {
  return await addDoc(collection(db, "tasks"), data);
};

export const getTasksByCase = async (caseId: string) => {
  const q = query(collection(db, "tasks"), where("caseId", "==", caseId));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateTaskById = async (
  taskId: string,
  data: Partial<{ text: string; completed: boolean; notes?: string }>
) => {
  await updateDoc(doc(db, "tasks", taskId), data);
};

export const deleteTaskById = async (taskId: string) => {
  await deleteDoc(doc(db, "tasks", taskId));
};
