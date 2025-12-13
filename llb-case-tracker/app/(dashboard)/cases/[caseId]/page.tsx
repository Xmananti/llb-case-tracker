"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { getCase } from "../../../../lib/api-client";
import { app, storage } from "../../../../lib/firebase/config";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirestore, collection, query, where, addDoc, getDocs, deleteDoc, doc as fsDoc, Timestamp, updateDoc, orderBy, onSnapshot } from "firebase/firestore";
import type { Timestamp as TTimestamp } from "firebase/firestore";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaFileAlt, FaCalendarAlt, FaUser, FaBuilding, FaHashtag, FaTag, FaCheckCircle, FaClock, FaPauseCircle, FaUpload, FaTrash, FaDownload, FaEdit, FaFilePdf, FaComments, FaPaperPlane, FaEye } from "react-icons/fa";

interface DocumentResource {
    id: string;
    caseId: string;
    name: string;
    url: string;
    uploadedBy: string;
    uploadedAt: TTimestamp;
    path: string;
    type?: string;
    size?: number;
}

interface CaseDoc {
    id: string;
    title: string;
    description: string;
    userId: string;
    caseNumber?: string;
    court?: string;
    oppositeParty?: string;
    caseType?: string;
    status?: "active" | "closed" | "pending" | "on_hold";
    filingDate?: string;
    nextHearingDate?: string;
}

interface Hearing {
    id: string;
    caseId: string;
    title: string;
    date: string;
    notes?: string;
}

interface Task {
    id: string;
    caseId: string;
    text: string;
    completed: boolean;
    notes?: string;
}

const hearingSchema = z.object({
    title: z.string().min(2, "Title required"),
    date: z.string().min(1, "Date required"), // For simplicity, use string, can be Date
    notes: z.string().optional(),
});
type HearingForm = z.infer<typeof hearingSchema>;

const taskSchema = z.object({
    text: z.string().min(2, "Task required"),
    completed: z.boolean().optional(),
    notes: z.string().optional(),
});
type TaskForm = z.infer<typeof taskSchema>;

const tabs = ["Documents", "Hearings", "Tasks", "Conversations"];

const CaseDetailsPage: React.FC = () => {
    const { caseId } = useParams<{ caseId: string }>();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [caseData, setCaseData] = useState<CaseDoc | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (!user || !caseId) {
            setLoading(false);
            return;
        }
        const fetchCase = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getCase(caseId as string, user.uid);
                setCaseData({
                    id: data.id,
                    title: data.title,
                    description: data.description,
                    userId: data.userId,
                    caseNumber: data.caseNumber || "",
                    court: data.court || "",
                    oppositeParty: data.oppositeParty || "",
                    caseType: data.caseType || "",
                    status: data.status || "active",
                    filingDate: data.filingDate || "",
                    nextHearingDate: data.nextHearingDate || "",
                });
            } catch (err) {
                console.error("Error fetching case:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch case");
                setCaseData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchCase();
    }, [caseId, user]);

    return (
        <div className="max-w-6xl mx-auto p-2 sm:p-4">
            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
                    <p className="mt-2 text-slate-600 text-sm">Loading case details...</p>
                </div>
            ) : error || !caseData ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {error || "Case not found."}
                </div>
            ) : (
                <>
                    <div className="mb-4 bg-white rounded-lg shadow-md p-4 border-l-4 border-amber-500">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1.5 break-words">{caseData.title}</h1>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                    {caseData.caseNumber && (
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <FaHashtag className="text-amber-600" /> {caseData.caseNumber}
                                        </div>
                                    )}
                                    {caseData.status && (
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${caseData.status === "active" ? "bg-green-100 text-green-800" :
                                            caseData.status === "closed" ? "bg-gray-100 text-gray-800" :
                                                caseData.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                                    "bg-orange-100 text-orange-800"
                                            }`}>
                                            {caseData.status === "active" ? <FaCheckCircle /> :
                                                caseData.status === "closed" ? <FaCheckCircle /> :
                                                    caseData.status === "pending" ? <FaClock /> :
                                                        <FaPauseCircle />}
                                            <span className="capitalize">{caseData.status}</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-slate-600 text-sm mb-3">{caseData.description}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-3 border-t border-slate-200 text-sm">
                                    {caseData.court && (
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <FaBuilding className="text-amber-600" />
                                            <span className="font-semibold">Court:</span> {caseData.court}
                                        </div>
                                    )}
                                    {caseData.oppositeParty && (
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <FaUser className="text-amber-600" />
                                            <span className="font-semibold">Opposite Party:</span> {caseData.oppositeParty}
                                        </div>
                                    )}
                                    {caseData.caseType && (
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <FaTag className="text-amber-600" />
                                            <span className="font-semibold">Type:</span> {caseData.caseType}
                                        </div>
                                    )}
                                    {caseData.filingDate && (
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <FaCalendarAlt className="text-amber-600" />
                                            <span className="font-semibold">Filing Date:</span> {new Date(caseData.filingDate).toLocaleDateString()}
                                        </div>
                                    )}
                                    {caseData.nextHearingDate && (
                                        <div className="flex items-center gap-2 text-amber-700 font-semibold">
                                            <FaCalendarAlt />
                                            <span>Next Hearing:</span> {new Date(caseData.nextHearingDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-4 bg-white rounded-lg shadow-sm border-b border-slate-200 overflow-x-auto">
                        <nav className="flex space-x-2 sm:space-x-4 px-2 sm:px-4 min-w-max" aria-label="Tabs">
                            {tabs.map((tab, idx) => (
                                <button
                                    key={tab}
                                    className={`py-2 sm:py-2.5 font-semibold border-b-2 transition-colors duration-150 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-0 ${activeTab === idx
                                        ? "border-amber-500 text-slate-900"
                                        : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                                        }`}
                                    onClick={() => setActiveTab(idx)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div>
                        {activeTab === 0 && <CaseDocumentsTab caseId={caseId as string} />}
                        {activeTab === 1 && <CaseHearingsTab caseId={caseId as string} />}
                        {activeTab === 2 && <CaseTasksTab caseId={caseId as string} />}
                        {activeTab === 3 && <CaseConversationsTab caseId={caseId as string} />}
                    </div>
                </>
            )}
        </div>
    );
};

const CaseDocumentsTab: React.FC<{ caseId: string }> = ({ caseId }) => {
    const { user } = useAuth();
    const db = getFirestore(app);
    const [docs, setDocs] = useState<(DocumentResource & { isImage?: boolean; isPDF?: boolean })[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string; type: string } | null>(null);

    // Load documents
    useEffect(() => {
        if (!user || !caseId) return;
        const fetchDocs = async () => {
            setLoading(true);
            const q = query(collection(db, "documents"), where("caseId", "==", caseId));
            try {
                const snap = await getDocs(q);
                setDocs(
                    snap.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            caseId: data.caseId,
                            name: data.name,
                            url: data.url,
                            uploadedBy: data.uploadedBy,
                            uploadedAt: data.uploadedAt,
                            path: data.path,
                            type: data.type,
                            size: data.size,
                            isImage: data.isImage,
                            isPDF: data.isPDF,
                        } as DocumentResource & { isImage?: boolean; isPDF?: boolean };
                    })
                );
                setError("");
            } catch (err: unknown) {
                console.error("Error loading documents:", err);
                let message = "Could not load documents";
                if (err instanceof Error) {
                    if (err.message.includes("permission") || err.message.includes("Missing") || err.message.includes("insufficient")) {
                        message = "Permission denied. Please configure Firebase security rules. See FIREBASE_SECURITY_RULES.md";
                    } else {
                        message = err.message;
                    }
                    console.error("Error details:", err.stack);
                }
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, [user, caseId, db]);

    // Handle upload
    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("docfile") as HTMLInputElement;
        if (!input?.files?.[0]) return;
        const file = input.files[0];
        setUploading(true);
        setError("");
        try {
            // Fix linter - only call Date.now inside handler
            const timestamp = new Date().getTime();
            const storageRef = ref(storage, `cases/${caseId}/documents/${timestamp}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            // Wait for upload to complete
            await new Promise((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    null,
                    (error) => reject(error),
                    () => resolve(undefined)
                );
            });

            const url = await getDownloadURL(storageRef);
            const fileType = file.type || "";
            const isImage = fileType.startsWith("image/");
            const isPDF = fileType === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

            await addDoc(collection(db, "documents"), {
                caseId,
                name: file.name,
                url,
                uploadedBy: user?.uid,
                uploadedAt: Timestamp.now(),
                path: storageRef.fullPath,
                type: fileType || "unknown",
                size: file.size,
                isImage,
                isPDF,
            });
            const snap = await getDocs(query(collection(db, "documents"), where("caseId", "==", caseId)));
            setDocs(snap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    caseId: data.caseId,
                    name: data.name,
                    url: data.url,
                    uploadedBy: data.uploadedBy,
                    uploadedAt: data.uploadedAt,
                    path: data.path
                } as DocumentResource;
            }));
        } catch (err: unknown) {
            let message = "Upload failed";
            if (err instanceof Error) message = err.message;
            setError(message);
        }
        setUploading(false);
        if (input) input.value = "";
    };

    // Handle delete
    const handleDelete = async (docId: string, filePath: string) => {
        try {
            await deleteObject(ref(storage, filePath));
            await deleteDoc(fsDoc(db, "documents", docId));
            setDocs(prev => prev.filter(d => d.id !== docId));
        } catch (err: unknown) {
            let message = "Delete failed";
            if (err instanceof Error) message = err.message;
            setError(message);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
            <form onSubmit={handleUpload} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-slate-200">
                <input
                    type="file"
                    name="docfile"
                    accept="image/*,.pdf,.doc,.docx"
                    className="flex-1 rounded border border-slate-300 px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                />
                <button
                    type="submit"
                    disabled={uploading}
                    className="bg-slate-900 text-white rounded px-3 sm:px-4 py-2 hover:bg-slate-800 transition font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                    <FaUpload /> {uploading ? "Uploading..." : "Upload"}
                </button>
            </form>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">{error}</div>}
            {loading ? (
                <div className="text-center py-6">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                    <p className="mt-2 text-slate-600 text-sm">Loading documents...</p>
                </div>
            ) : docs.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">No documents found. Upload your first document!</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                        {docs.map((d) => {
                            const isImage = d.isImage || d.type?.startsWith("image/");
                            const isPDF = d.isPDF || d.name.toLowerCase().endsWith(".pdf");
                            return (
                                <div key={d.id} className="bg-slate-50 rounded border border-slate-200 hover:shadow-md transition overflow-hidden">
                                    {isImage ? (
                                        <div className="aspect-video bg-slate-200 relative group cursor-pointer" onClick={() => setPreviewDoc({ url: d.url, name: d.name, type: "image" })}>
                                            <img src={d.url} alt={d.name} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                                                <FaEye className="text-white opacity-0 group-hover:opacity-100 transition" />
                                            </div>
                                        </div>
                                    ) : isPDF ? (
                                        <div className="aspect-video bg-red-50 flex items-center justify-center cursor-pointer" onClick={() => setPreviewDoc({ url: d.url, name: d.name, type: "pdf" })}>
                                            <div className="text-center">
                                                <FaFilePdf className="text-red-600 text-3xl mx-auto mb-1" />
                                                <p className="text-xs text-slate-600">Click to preview</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="aspect-video bg-slate-200 flex items-center justify-center">
                                            <FaFileAlt className="text-slate-400 text-3xl" />
                                        </div>
                                    )}
                                    <div className="p-3">
                                        <p className="font-medium text-slate-900 text-xs mb-1.5 truncate" title={d.name}>{d.name}</p>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                                            {d.size && <span>{(d.size / 1024).toFixed(1)} KB</span>}
                                            {d.uploadedAt && (
                                                <span>• {new Date(d.uploadedAt.toMillis()).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => setPreviewDoc({ url: d.url, name: d.name, type: isImage ? "image" : isPDF ? "pdf" : "file" })}
                                                className="flex-1 bg-slate-900 text-white rounded px-2 py-1.5 hover:bg-slate-800 transition font-medium text-xs flex items-center justify-center gap-1"
                                            >
                                                <FaEye className="text-xs" /> View
                                            </button>
                                            <a
                                                href={d.url}
                                                download
                                                className="bg-blue-600 text-white rounded px-2 py-1.5 hover:bg-blue-700 transition font-medium text-xs flex items-center justify-center"
                                                title="Download"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <FaDownload className="text-xs" />
                                            </a>
                                            <button
                                                className="bg-red-600 text-white rounded px-2 py-1.5 hover:bg-red-700 transition font-medium text-xs flex items-center justify-center"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(d.id, d.path);
                                                }}
                                                title="Delete"
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Preview Modal */}
                    {previewDoc && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-2 sm:p-4" onClick={() => setPreviewDoc(null)}>
                            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                                <div className="sticky top-0 bg-white border-b border-slate-200 px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                                    <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate flex-1 mr-2">{previewDoc.name}</h3>
                                    <button
                                        onClick={() => setPreviewDoc(null)}
                                        className="text-slate-600 hover:text-slate-900 text-xl sm:text-2xl shrink-0"
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="p-3 sm:p-6">
                                    {previewDoc.type === "image" ? (
                                        <img src={previewDoc.url} alt={previewDoc.name} className="max-w-full h-auto mx-auto" />
                                    ) : previewDoc.type === "pdf" ? (
                                        <iframe src={previewDoc.url} className="w-full h-[400px] sm:h-[500px] lg:h-[600px] border-0" title={previewDoc.name} />
                                    ) : (
                                        <div className="text-center py-12">
                                            <FaFileAlt className="text-6xl text-slate-400 mx-auto mb-4" />
                                            <p className="text-slate-600 mb-4">Preview not available for this file type</p>
                                            <a
                                                href={previewDoc.url}
                                                download
                                                className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition font-semibold"
                                            >
                                                <FaDownload className="inline mr-2" /> Download File
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const CaseHearingsTab: React.FC<{ caseId: string }> = ({ caseId }) => {
    const { user } = useAuth();
    const db = getFirestore(app);
    const [hearings, setHearings] = useState<Hearing[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editHearing, setEditHearing] = useState<Hearing | null>(null);
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<HearingForm>({ resolver: zodResolver(hearingSchema) });

    useEffect(() => {
        if (!user || !caseId) return;
        const fetchHearings = async () => {
            setLoading(true);
            const q = query(collection(db, "hearings"), where("caseId", "==", caseId));
            try {
                const snap = await getDocs(q);
                setHearings(
                    snap.docs.map(doc => {
                        const d = doc.data();
                        return {
                            id: doc.id,
                            caseId: d.caseId,
                            title: d.title,
                            date: d.date,
                            notes: d.notes,
                        };
                    })
                );
                setError("");
            } catch (err) {
                console.error("Error loading hearings:", err);
                const errorMessage = err instanceof Error ? err.message : "Could not load hearings";
                setError(errorMessage);
            }
            setLoading(false);
        };
        fetchHearings();
    }, [user, caseId, db]);

    const openModal = (hearing?: Hearing) => {
        if (hearing) {
            setEditHearing(hearing);
            setValue("title", hearing.title);
            setValue("date", hearing.date);
            setValue("notes", hearing.notes || "");
        } else {
            setEditHearing(null);
            reset();
        }
        setShowModal(true);
    };

    const handleSave = async (data: HearingForm) => {
        try {
            setError("");
            if (editHearing) {
                // Update
                await updateDoc(fsDoc(db, "hearings", editHearing.id), {
                    ...data,
                    updatedAt: Timestamp.now(),
                });
            } else {
                await addDoc(collection(db, "hearings"), {
                    ...data,
                    caseId,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                });
            }
            setShowModal(false);
            setEditHearing(null);
            reset();
            // Refresh
            const snap = await getDocs(query(collection(db, "hearings"), where("caseId", "==", caseId)));
            setHearings(
                snap.docs.map(doc => {
                    const d = doc.data();
                    return {
                        id: doc.id,
                        caseId: d.caseId,
                        title: d.title,
                        date: d.date,
                        notes: d.notes,
                    };
                })
            );
        } catch (err) {
            console.error("Error saving hearing:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to save hearing";
            setError(errorMessage);
        }
    };
    const handleDelete = async (id: string) => {
        try {
            setError("");
            await deleteDoc(fsDoc(db, "hearings", id));
            setHearings(prev => prev.filter(h => h.id !== id));
        } catch (err) {
            console.error("Error deleting hearing:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to delete hearing";
            setError(errorMessage);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3 pb-2 border-b border-slate-200">
                <h2 className="font-bold text-base sm:text-lg text-slate-900">Hearings</h2>
                <button
                    className="bg-slate-900 text-white rounded px-3 py-1.5 hover:bg-slate-800 transition font-semibold shadow-md flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto justify-center"
                    onClick={() => openModal()}
                >
                    <FaCalendarAlt /> Add Hearing
                </button>
            </div>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}
            {loading ? (
                <div className="text-center py-6">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                    <p className="mt-2 text-slate-600 text-sm">Loading hearings...</p>
                </div>
            ) : hearings.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">No hearings for this case. Add your first hearing!</div>
            ) : (
                <ul className="space-y-2">
                    {hearings.map(h => (
                        <li key={h.id} className="py-2.5 px-3 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
                            <div className="flex-1 min-w-0 w-full sm:w-auto">
                                <div className="font-semibold text-slate-900 text-sm mb-0.5 break-words">{h.title}</div>
                                <div className="text-xs text-slate-600 flex items-center gap-1.5 flex-wrap">
                                    <FaCalendarAlt className="text-amber-600 shrink-0" /> <span>{h.date}</span> {h.notes && <> - <span className="italic break-words">{h.notes}</span></>}
                                </div>
                            </div>
                            <div className="flex gap-1.5 shrink-0 w-full sm:w-auto">
                                <button onClick={() => openModal(h)} className="flex-1 sm:flex-none px-2.5 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 transition font-medium text-xs flex items-center justify-center gap-1">
                                    <FaEdit /> Edit
                                </button>
                                <button onClick={() => handleDelete(h.id)} className="flex-1 sm:flex-none px-2.5 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition font-medium text-xs flex items-center justify-center gap-1">
                                    <FaTrash /> Del
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 sm:p-4 overflow-y-auto">
                    <form
                        onSubmit={handleSubmit(handleSave)}
                        className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 shadow-2xl space-y-3 sm:space-y-4 w-full max-w-md border-t-4 border-amber-500 my-2 sm:my-4 max-h-[95vh] overflow-y-auto"
                    >
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">{editHearing ? "Edit Hearing" : "Add Hearing"}</h2>
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Title</label>
                            <input
                                {...register("title")}
                                className="mt-1 w-full rounded border border-slate-300 px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                required
                            />
                            {errors.title && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.title.message}</p>}
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Date</label>
                            <input
                                type="date"
                                {...register("date")}
                                className="mt-1 w-full rounded border border-slate-300 px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                required
                            />
                            {errors.date && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.date.message}</p>}
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Notes (optional)</label>
                            <textarea
                                {...register("notes")}
                                className="mt-1 w-full rounded border border-slate-300 px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                rows={3}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4">
                            <button type="submit" className="flex-1 bg-slate-900 text-white rounded px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-slate-800 transition font-semibold text-sm">{editHearing ? "Update" : "Add Hearing"}</button>
                            <button type="button" className="flex-1 bg-slate-200 text-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded hover:bg-slate-300 transition font-semibold text-sm" onClick={() => { setShowModal(false); setEditHearing(null); }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const CaseTasksTab: React.FC<{ caseId: string }> = ({ caseId }) => {
    const { user } = useAuth();
    const db = getFirestore(app);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<TaskForm>({ resolver: zodResolver(taskSchema) });

    useEffect(() => {
        if (!user || !caseId) return;
        const fetchTasks = async () => {
            setLoading(true);
            const q = query(collection(db, "tasks"), where("caseId", "==", caseId));
            try {
                const snap = await getDocs(q);
                setTasks(
                    snap.docs.map(doc => {
                        const d = doc.data();
                        return {
                            id: doc.id,
                            caseId: d.caseId,
                            text: d.text,
                            completed: d.completed,
                            notes: d.notes,
                        };
                    })
                );
                setError("");
            } catch (err) {
                console.error("Error loading tasks:", err);
                const errorMessage = err instanceof Error ? err.message : "Could not load tasks";
                setError(errorMessage);
            }
            setLoading(false);
        };
        fetchTasks();
    }, [user, caseId, db]);

    const openModal = (task?: Task) => {
        if (task) {
            setEditTask(task);
            setValue("text", task.text);
            setValue("notes", task.notes || "");
            setValue("completed", !!task.completed);
        } else {
            setEditTask(null);
            reset();
        }
        setShowModal(true);
    };

    const handleSave = async (data: TaskForm) => {
        try {
            setError("");
            const payload = {
                ...data,
                completed: !!data.completed,
            };
            if (editTask) {
                // Update
                await updateDoc(fsDoc(db, "tasks", editTask.id), {
                    ...payload,
                    updatedAt: Timestamp.now(),
                });
            } else {
                await addDoc(collection(db, "tasks"), {
                    ...payload,
                    caseId,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                });
            }
            setShowModal(false);
            setEditTask(null);
            reset();
            // Refresh
            const snap = await getDocs(query(collection(db, "tasks"), where("caseId", "==", caseId)));
            setTasks(
                snap.docs.map(doc => {
                    const d = doc.data();
                    return {
                        id: doc.id,
                        caseId: d.caseId,
                        text: d.text,
                        completed: d.completed,
                        notes: d.notes,
                    };
                })
            );
        } catch (err) {
            console.error("Error saving task:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to save task";
            setError(errorMessage);
        }
    };
    const handleDelete = async (id: string) => {
        try {
            setError("");
            await deleteDoc(fsDoc(db, "tasks", id));
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error("Error deleting task:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to delete task";
            setError(errorMessage);
        }
    };
    const toggleCompleted = async (task: Task) => {
        try {
            setError("");
            await updateDoc(fsDoc(db, "tasks", task.id), {
                completed: !task.completed,
                updatedAt: Timestamp.now(),
            });
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
        } catch (err) {
            console.error("Error toggling task:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to update task";
            setError(errorMessage);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3 pb-2 border-b border-slate-200">
                <h2 className="font-bold text-base sm:text-lg text-slate-900">Tasks</h2>
                <button
                    className="bg-slate-900 text-white rounded px-3 py-1.5 hover:bg-slate-800 transition font-semibold shadow-md flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto justify-center"
                    onClick={() => openModal()}
                >
                    <FaCheckCircle /> Add Task
                </button>
            </div>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}
            {loading ? (
                <div className="text-center py-6">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                    <p className="mt-2 text-slate-600 text-sm">Loading tasks...</p>
                </div>
            ) : tasks.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">No tasks for this case. Add your first task!</div>
            ) : (
                <ul className="space-y-2">
                    {tasks.map(t => (
                        <li key={t.id} className="py-2.5 px-3 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
                            <div className="flex-1 min-w-0 w-full sm:w-auto">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!!t.completed}
                                        onChange={() => toggleCompleted(t)}
                                        className="w-4 h-4 text-amber-600 rounded focus:ring-2 focus:ring-amber-500 shrink-0"
                                    />
                                    <span className={`text-sm break-words ${t.completed ? "line-through text-slate-400" : "text-slate-900"}`}>{t.text}</span>
                                </label>
                                {t.notes && <div className="text-xs text-slate-500 mt-1 ml-6 break-words">{t.notes}</div>}
                            </div>
                            <div className="flex gap-1.5 shrink-0 w-full sm:w-auto">
                                <button onClick={() => openModal(t)} className="flex-1 sm:flex-none px-2.5 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 transition font-medium text-xs flex items-center justify-center gap-1">
                                    <FaEdit /> Edit
                                </button>
                                <button onClick={() => handleDelete(t.id)} className="flex-1 sm:flex-none px-2.5 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition font-medium text-xs flex items-center justify-center gap-1">
                                    <FaTrash /> Del
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 sm:p-4 overflow-y-auto">
                    <form
                        onSubmit={handleSubmit(handleSave)}
                        className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 shadow-2xl space-y-3 sm:space-y-4 w-full max-w-md border-t-4 border-amber-500 my-2 sm:my-4 max-h-[95vh] overflow-y-auto"
                    >
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">{editTask ? "Edit Task" : "Add Task"}</h2>
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Task</label>
                            <input
                                {...register("text")}
                                className="mt-1 w-full rounded border border-slate-300 px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                required
                            />
                            {errors.text && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.text.message}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" {...register("completed")} id="completed" className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500" />
                            <label htmlFor="completed" className="text-xs sm:text-sm font-semibold text-slate-700">Completed?</label>
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Notes (optional)</label>
                            <textarea
                                {...register("notes")}
                                className="mt-1 w-full rounded border border-slate-300 px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                rows={3}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4">
                            <button type="submit" className="flex-1 bg-slate-900 text-white rounded px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-slate-800 transition font-semibold text-sm">{editTask ? "Update" : "Add Task"}</button>
                            <button type="button" className="flex-1 bg-slate-200 text-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded hover:bg-slate-300 transition font-semibold text-sm" onClick={() => { setShowModal(false); setEditTask(null); }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

interface Message {
    id: string;
    caseId: string;
    senderId: string;
    senderName?: string;
    senderEmail?: string;
    message: string;
    timestamp: TTimestamp;
    attachments?: Array<{ url: string; name: string }>;
}

const CaseConversationsTab: React.FC<{ caseId: string }> = ({ caseId }) => {
    const { user } = useAuth();
    const db = getFirestore(app);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user || !caseId) return;
        const fetchMessages = async () => {
            setLoading(true);
            const q = query(collection(db, "conversations"), where("caseId", "==", caseId), orderBy("timestamp", "asc"));
            try {
                const snap = await getDocs(q);
                setMessages(
                    snap.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            caseId: data.caseId,
                            senderId: data.senderId,
                            senderName: data.senderName,
                            senderEmail: data.senderEmail,
                            message: data.message,
                            timestamp: data.timestamp,
                            attachments: data.attachments || [],
                        } as Message;
                    })
                );
                setError("");
            } catch (err) {
                console.error("Error loading messages:", err);
                const errorMessage = err instanceof Error ? err.message : "Could not load messages";
                setError(errorMessage);
            }
            setLoading(false);
        };
        fetchMessages();

        // Real-time listener
        const q = query(collection(db, "conversations"), where("caseId", "==", caseId), orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (snap) => {
            setMessages(
                snap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        caseId: data.caseId,
                        senderId: data.senderId,
                        senderName: data.senderName,
                        senderEmail: data.senderEmail,
                        message: data.message,
                        timestamp: data.timestamp,
                        attachments: data.attachments || [],
                    } as Message;
                })
            );
        });

        return () => unsubscribe();
    }, [user, caseId, db]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        setSending(true);
        setError("");
        try {
            await addDoc(collection(db, "conversations"), {
                caseId,
                senderId: user.uid,
                senderName: user.displayName || user.email?.split("@")[0] || "User",
                senderEmail: user.email || "",
                message: newMessage.trim(),
                timestamp: Timestamp.now(),
                attachments: [],
                createdAt: Timestamp.now(),
            });
            setNewMessage("");
        } catch (err: unknown) {
            console.error("Error sending message:", err);
            let message = "Failed to send message";
            if (err instanceof Error) {
                message = err.message;
                console.error("Error details:", err.stack);
            }
            setError(message);
        }
        setSending(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 flex flex-col h-[400px] sm:h-[500px]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                <h2 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                    <FaComments className="text-amber-600" /> <span className="text-sm sm:text-base">Conversations</span>
                </h2>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                        <p className="mt-2 text-slate-600 text-sm">Loading messages...</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto mb-3 space-y-2 pr-2">
                        {messages.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                <FaComments className="text-3xl text-slate-300 mx-auto mb-2" />
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isOwnMessage = msg.senderId === user?.uid;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[85%] sm:max-w-[75%] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 ${isOwnMessage
                                                ? "bg-slate-900 text-white"
                                                : "bg-slate-100 text-slate-900"
                                                }`}
                                        >
                                            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 flex-wrap">
                                                <span className={`text-xs font-semibold ${isOwnMessage ? "text-slate-300" : "text-slate-600"}`}>
                                                    {msg.senderName || msg.senderEmail || "Unknown"}
                                                </span>
                                                <span className={`text-xs ${isOwnMessage ? "text-slate-400" : "text-slate-500"}`}>
                                                    {msg.timestamp ? new Date(msg.timestamp.toMillis()).toLocaleTimeString() : ""}
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    {msg.attachments.map((att, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={att.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs underline flex items-center gap-1"
                                                        >
                                                            <FaFileAlt /> {att.name}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="border-t border-slate-200 pt-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className="bg-slate-900 text-white rounded-lg px-6 py-2.5 hover:bg-slate-800 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <FaPaperPlane /> {sending ? "Sending..." : "Send"}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default CaseDetailsPage;