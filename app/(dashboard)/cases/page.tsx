"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getCases, createCase, updateCase, deleteCase } from "../../../lib/api-client";
import { createClient, getClients } from "../../../lib/api-client";
import { uploadCaseDocument } from "../../../lib/firebase/storage";
import { FaFileAlt, FaCheckCircle, FaTimes, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import CaseModal, { CaseFormData } from "../../../components/CaseModal";
import { useSearchParams } from "next/navigation";

interface Case {
    id: string;
    title: string;
    description: string;
    plaintiffCase?: string;
    defendantCase?: string;
    workToBeDone?: string;
    caseNumber?: string;
    caseCategory?: string;
    court?: string;
    fileNumber?: string;
    year?: string;
    plaintiff?: string;
    defendant?: string;
    petitioner?: string;
    respondent?: string;
    complainant?: string;
    accused?: string;
    advocateForPetitioner?: string;
    advocateForRespondent?: string;
    publicProsecutor?: string;
    currentStage?: string;
    mobileNumber?: string;
    lastHearingDate?: string;
    nextHearingDate?: string;
    hearingPurpose?: string;
    purposeOfHearingStage?: string;
    notes?: string;
    caseType?: string;
    status?: "pending" | "admitted" | "dismissed" | "allowed" | "disposed" | "withdrawn" | "compromised" | "stayed" | "appeal_filed";
    filingDate?: string;
    updatedAt?: string;
    createdAt?: string;
}

const CasesPage: React.FC = () => {
    const { user, userData, refreshUserData } = useAuth();
    const searchParams = useSearchParams();
    const searchQuery = searchParams?.get("search") || "";
    const [cases, setCases] = useState<Case[]>([]);
    const [filteredCases, setFilteredCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
    const [form, setForm] = useState<CaseFormData>({
        title: "",
        description: "",
        plaintiffCase: "",
        defendantCase: "",
        workToBeDone: "",
        caseNumber: "",
        caseCategory: "",
        court: "",
        fileNumber: "",
        year: "",
        plaintiff: "",
        defendant: "",
        petitioner: "",
        respondent: "",
        complainant: "",
        accused: "",
        advocateForPetitioner: "",
        advocateForRespondent: "",
        publicProsecutor: "",
        mobileNumber: "",
        currentStage: "",
        lastHearingDate: "",
        nextHearingDate: "",
        hearingPurpose: "",
        purposeOfHearingStage: "",
        notes: "",
        caseType: "",
        status: "pending",
        filingDate: "",
    });
    const [editId, setEditId] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedPlaintiffFiles, setSelectedPlaintiffFiles] = useState<File[]>([]);
    const [selectedCitationFiles, setSelectedCitationFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [caseStats, setCaseStats] = useState<{ [caseId: string]: { documents: number; hearings: number; tasks: number; conversations: number } }>({});
    const [deletingCaseId, setDeletingCaseId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>("");

    // Fetch cases for current user
    useEffect(() => {
        if (!user) return;
        const fetchCases = async () => {
            setLoading(true);
            try {
                const res = await getCases(user.uid);
                setCases(res);
                setError("");

                // Apply search filter if query exists
                if (searchQuery.trim()) {
                    const filtered = res.filter((c: Case) =>
                        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.court?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.plaintiff?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.defendant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.petitioner?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.respondent?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.complainant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.accused?.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    setFilteredCases(filtered);
                } else {
                    setFilteredCases(res);
                }

                // Fetch statistics for each case (only if user is authenticated)
                if (!user) {
                    setLoading(false);
                    return;
                }

                const { getFirestore, collection, query, where, getDocs } = await import("firebase/firestore");
                const { app } = await import("../../../lib/firebase/config");
                const db = getFirestore(app);

                const statsPromises = res.map(async (c: Case) => {
                    try {
                        const [docsSnap, hearingsSnap, tasksSnap, conversationsSnap] = await Promise.all([
                            getDocs(query(collection(db, "documents"), where("caseId", "==", c.id))),
                            getDocs(query(collection(db, "hearings"), where("caseId", "==", c.id))),
                            getDocs(query(collection(db, "tasks"), where("caseId", "==", c.id))),
                            getDocs(query(collection(db, "conversations"), where("caseId", "==", c.id))),
                        ]);

                        return {
                            caseId: c.id,
                            documents: docsSnap.size,
                            hearings: hearingsSnap.size,
                            tasks: tasksSnap.size,
                            conversations: conversationsSnap.size,
                        };
                    } catch (err) {
                        // Silently fail for permissions errors - stats will show 0
                        console.warn(`Could not fetch stats for case ${c.id}:`, err);
                        return {
                            caseId: c.id,
                            documents: 0,
                            hearings: 0,
                            tasks: 0,
                            conversations: 0,
                        };
                    }
                });

                const statsResults = await Promise.all(statsPromises);
                const statsMap: { [key: string]: { documents: number; hearings: number; tasks: number; conversations: number } } = {};
                statsResults.forEach(stat => {
                    statsMap[stat.caseId] = {
                        documents: stat.documents,
                        hearings: stat.hearings,
                        tasks: stat.tasks,
                        conversations: stat.conversations,
                    };
                });
                setCaseStats(statsMap);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Failed to fetch cases";
                setError(errorMessage);
            }
            setLoading(false);
        };
        fetchCases();
    }, [user, searchQuery]);

    // Update local search when URL param changes
    useEffect(() => {
        if (searchParams?.get("search")) {
            setLocalSearchQuery(searchParams.get("search") || "");
        } else {
            setLocalSearchQuery("");
        }
    }, [searchParams]);

    // Check if "new" query parameter is present to open the modal
    useEffect(() => {
        if (searchParams?.get("new") === "true" && user) {
            // Reset form and open modal
            setEditId(null);
            setForm({
                title: "",
                description: "",
                plaintiffCase: "",
                defendantCase: "",
                workToBeDone: "",
                caseNumber: "",
                caseCategory: "",
                court: "",
                fileNumber: "",
                year: "",
                plaintiff: "",
                defendant: "",
                petitioner: "",
                respondent: "",
                complainant: "",
                accused: "",
                advocateForPetitioner: "",
                advocateForRespondent: "",
                publicProsecutor: "",
                mobileNumber: "",
                currentStage: "",
                lastHearingDate: "",
                nextHearingDate: "",
                hearingPurpose: "",
                purposeOfHearingStage: "",
                notes: "",
                caseType: "",
                status: "pending",
                filingDate: "",
            });
            setSelectedFiles([]);
            setSelectedPlaintiffFiles([]);
            setShowModal(true);
            // Remove the query parameter from URL without reload
            const url = new URL(window.location.href);
            url.searchParams.delete("new");
            window.history.replaceState({}, "", url.pathname + url.search);
        }
    }, [searchParams, user]);

    // Check if "edit" query parameter is present to open the modal in edit mode
    useEffect(() => {
        const editParam = searchParams?.get("edit");
        if (editParam && user && cases.length > 0) {
            const existing = cases.find(c => c.id === editParam);
            if (existing) {
                handleEdit(existing);
                // Remove the query parameter from URL without reload
                const url = new URL(window.location.href);
                url.searchParams.delete("edit");
                window.history.replaceState({}, "", url.pathname + url.search);
            }
        }
    }, [searchParams, user, cases]);

    // Filter cases based on search query from URL (only when URL param changes)
    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = cases.filter((c: Case) =>
                c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.court?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.plaintiff?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.defendant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.petitioner?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.respondent?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.complainant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.accused?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredCases(filtered);
        } else {
            setFilteredCases(cases);
        }
    }, [searchQuery, cases]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (localSearchQuery.trim()) {
            params.set("search", localSearchQuery.trim());
            window.history.pushState({}, "", `/cases?${params.toString()}`);
            // Trigger search by updating the searchQuery from URL
            // This will trigger the useEffect that filters cases
        } else {
            window.history.pushState({}, "", "/cases");
            // Clear filtered cases to show all
            setFilteredCases(cases);
        }
    };

    const handleAddOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError("You must be logged in to create cases.");
            return;
        }
        // If no organization, try to get one (will be auto-assigned by API)
        // Don't block case creation - let the API handle organization assignment
        setUploading(true);
        setError("");
        try {
            let newCaseId: string | undefined;
            // Prepare form data, ensuring status is valid
            const validStatuses = ["pending", "admitted", "dismissed", "allowed", "disposed", "withdrawn", "compromised", "stayed", "appeal_filed"];

            // Build a backend-friendly description from the split fields
            const generatedDescription =
                form.description ||
                [
                    form.plaintiffCase && `Plaintiff Case: ${form.plaintiffCase}`,
                    form.defendantCase && `Defendant Case: ${form.defendantCase}`,
                    form.workToBeDone && `Work to be Done: ${form.workToBeDone}`,
                ]
                    .filter(Boolean)
                    .join("\n\n");

            // Frontend validation to match backend .min(2) rule
            if (!generatedDescription || generatedDescription.trim().length < 2) {
                setUploading(false);
                setError("Please enter at least some description in Plaintiff Case, Defendant Case, or Work to be Done.");
                return;
            }

            const caseData = {
                ...form,
                description: generatedDescription,
                userId: user.uid,
                // Ensure status is valid or undefined
                status: form.status && validStatuses.includes(form.status) ? form.status : "pending"
            };

            let caseIdForUpload: string | undefined;
            if (editId) {
                await updateCase({ id: editId, ...caseData });
                caseIdForUpload = editId;
            } else {
                const result = await createCase(caseData);
                newCaseId = result.id;
                caseIdForUpload = newCaseId;
            }

            let uploadFailed = false;
            // Upload plaintiff/petitioner documents if any were selected (one file per request)
            if (selectedPlaintiffFiles.length > 0 && caseIdForUpload) {
                const { getFirestore, collection, addDoc, Timestamp } = await import("firebase/firestore");
                const { app } = await import("../../../lib/firebase/config");
                const db = getFirestore(app);

                for (let i = 0; i < selectedPlaintiffFiles.length; i++) {
                    const file = selectedPlaintiffFiles[i];
                    const fileKey = editId ? `plaintiff_edit_${i}` : `plaintiff_new_${i}`;
                    try {
                        const { url, path } = await uploadCaseDocument(caseIdForUpload, file, (progress) => {
                            const percent = (progress.loaded / progress.total) * 100;
                            setUploadProgress(prev => ({ ...prev, [fileKey]: percent }));
                        });

                        const fileType = file.type || "";
                        const isImage = fileType.startsWith("image/");
                        const isPDF = fileType === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

                        await addDoc(collection(db, "documents"), {
                            caseId: caseIdForUpload,
                            name: file.name,
                            url: url,
                            uploadedBy: user.uid,
                            uploadedAt: Timestamp.now(),
                            path: path,
                            type: fileType || "unknown",
                            size: file.size,
                            isImage,
                            isPDF,
                            category: "plaintiff",
                        });

                        setUploadProgress(prev => {
                            const newProgress = { ...prev };
                            delete newProgress[fileKey];
                            return newProgress;
                        });
                    } catch (uploadError) {
                        console.error("Error uploading plaintiff file:", uploadError);
                        const msg = uploadError instanceof Error ? uploadError.message : "";
                        setError(msg.includes("permission denied") || msg.includes("GCS_SETUP") || msg.includes("FIX_GCS_403") ? msg : `Failed to upload ${file.name}. You can add it later in case Documents.`);
                        setUploadProgress(prev => {
                            const newProgress = { ...prev };
                            delete newProgress[fileKey];
                            return newProgress;
                        });
                        uploadFailed = true;
                    }
                }
            }

            // Upload defendant/opposite party documents (one file per request)
            if (selectedFiles.length > 0 && caseIdForUpload) {
                const { getFirestore, collection, addDoc, Timestamp } = await import("firebase/firestore");
                const { app } = await import("../../../lib/firebase/config");
                const db = getFirestore(app);

                for (let i = 0; i < selectedFiles.length; i++) {
                    const file = selectedFiles[i];
                    const fileKey = editId ? `edit_${i}` : `new_${i}`;
                    try {
                        // Upload to GCS via API with progress tracking
                        const { url, path } = await uploadCaseDocument(caseIdForUpload, file, (progress) => {
                            const percent = (progress.loaded / progress.total) * 100;
                            setUploadProgress(prev => ({ ...prev, [fileKey]: percent }));
                        });

                        const fileType = file.type || "";
                        const isImage = fileType.startsWith("image/");
                        const isPDF = fileType === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

                        // Save document metadata to Firestore (Defendant / Opposite Party)
                        await addDoc(collection(db, "documents"), {
                            caseId: caseIdForUpload,
                            name: file.name,
                            url: url,
                            uploadedBy: user.uid,
                            uploadedAt: Timestamp.now(),
                            path: path,
                            type: fileType || "unknown",
                            size: file.size,
                            isImage,
                            isPDF,
                            category: "defendant",
                        });

                        // Clear progress after successful upload
                        setUploadProgress(prev => {
                            const newProgress = { ...prev };
                            delete newProgress[fileKey];
                            return newProgress;
                        });
                    } catch (uploadError) {
                        console.error("Error uploading file:", uploadError);
                        const msg = uploadError instanceof Error ? uploadError.message : "";
                        setError(msg.includes("permission denied") || msg.includes("GCS_SETUP") || msg.includes("FIX_GCS_403") ? msg : `Failed to upload ${file.name}. You can add it later in case Documents.`);
                        setUploadProgress(prev => {
                            const newProgress = { ...prev };
                            delete newProgress[fileKey];
                            return newProgress;
                        });
                        uploadFailed = true;
                    }
                }
            }

            // Upload citations (one file per request) (store as documents with category=citation)
            if (selectedCitationFiles.length > 0 && caseIdForUpload) {
                const { getFirestore, collection, addDoc, Timestamp } = await import("firebase/firestore");
                const { app } = await import("../../../lib/firebase/config");
                const db = getFirestore(app);

                for (let i = 0; i < selectedCitationFiles.length; i++) {
                    const file = selectedCitationFiles[i];
                    try {
                        const { url, path } = await uploadCaseDocument(caseIdForUpload, file);
                        const fileType = file.type || "";
                        const isImage = fileType.startsWith("image/");
                        const isPDF = fileType === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

                        await addDoc(collection(db, "documents"), {
                            caseId: caseIdForUpload,
                            name: file.name,
                            url: url,
                            uploadedBy: user.uid,
                            uploadedAt: Timestamp.now(),
                            path: path,
                            type: fileType || "unknown",
                            size: file.size,
                            isImage,
                            isPDF,
                            category: "citation",
                        });
                    } catch (uploadError) {
                        console.error("Error uploading citation file:", uploadError);
                        const msg = uploadError instanceof Error ? uploadError.message : "";
                        setError(msg.includes("permission denied") || msg.includes("GCS_SETUP") || msg.includes("FIX_GCS_403") ? msg : `Failed to upload citation ${file.name}. Add it later in Citations tab.`);
                        uploadFailed = true;
                    }
                }
            }

            if (uploadFailed) {
                setUploading(false);
                return;
            }

            setShowModal(false);
            setForm({
                title: "",
                description: "",
                plaintiffCase: "",
                defendantCase: "",
                workToBeDone: "",
                caseNumber: "",
                caseCategory: "",
                court: "",
                fileNumber: "",
                year: "",
                plaintiff: "",
                defendant: "",
                petitioner: "",
                respondent: "",
                complainant: "",
                accused: "",
                advocateForPetitioner: "",
                advocateForRespondent: "",
                publicProsecutor: "",
                mobileNumber: "",
                currentStage: "",
                lastHearingDate: "",
                nextHearingDate: "",
                hearingPurpose: "",
                purposeOfHearingStage: "",
                notes: "",
                caseType: "",
                status: "pending",
                filingDate: "",
            });
            setSelectedFiles([]);
            setSelectedPlaintiffFiles([]);
            setSelectedCitationFiles([]);
            setUploadProgress({});
            setEditId(null);

            // Remove focus from any active element to prevent text selection
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }

            // Refresh
            const res = await getCases(user.uid);
            setCases(res);

            // Refresh statistics
            const { getFirestore, collection, query, where, getDocs } = await import("firebase/firestore");
            const { app } = await import("../../../lib/firebase/config");
            const db = getFirestore(app);

            if (newCaseId) {
                try {
                    const [docsSnap, hearingsSnap, tasksSnap, conversationsSnap] = await Promise.all([
                        getDocs(query(collection(db, "documents"), where("caseId", "==", newCaseId))),
                        getDocs(query(collection(db, "hearings"), where("caseId", "==", newCaseId))),
                        getDocs(query(collection(db, "tasks"), where("caseId", "==", newCaseId))),
                        getDocs(query(collection(db, "conversations"), where("caseId", "==", newCaseId))),
                    ]);

                    setCaseStats((prev) => {
                        const updated = { ...prev };
                        if (newCaseId) {
                            updated[newCaseId] = {
                                documents: docsSnap.size,
                                hearings: hearingsSnap.size,
                                tasks: tasksSnap.size,
                                conversations: conversationsSnap.size,
                            };
                        }
                        return updated;
                    });
                } catch (err) {
                    console.error("Error fetching stats:", err);
                }
            }
        } catch (err) {
            let errorMessage = "Could not save case";
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === "string") {
                errorMessage = err;
            }
            setError(errorMessage);
            console.error("Error saving case:", err);
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (c: Case) => {
        setEditId(c.id);
        setForm({
            title: c.title,
            description: c.description || "",
            plaintiffCase: (c as any).plaintiffCase || "",
            defendantCase: (c as any).defendantCase || "",
            workToBeDone: (c as any).workToBeDone || "",
            caseNumber: c.caseNumber || "",
            caseCategory: c.caseCategory || "",
            court: c.court || "",
            fileNumber: (c as any).fileNumber || "",
            year: (c as any).year || "",
            plaintiff: c.plaintiff || "",
            defendant: c.defendant || "",
            petitioner: c.petitioner || "",
            respondent: c.respondent || "",
            complainant: c.complainant || "",
            accused: c.accused || "",
            advocateForPetitioner: c.advocateForPetitioner || "",
            advocateForRespondent: c.advocateForRespondent || "",
            publicProsecutor: c.publicProsecutor || "",
            mobileNumber: (c as any).mobileNumber || "",
            currentStage: c.currentStage || "",
            lastHearingDate: c.lastHearingDate || "",
            nextHearingDate: c.nextHearingDate || "",
            hearingPurpose: c.hearingPurpose || "",
            purposeOfHearingStage: (c as any).purposeOfHearingStage || "",
            notes: c.notes || "",
            caseType: c.caseType || "",
            status: c.status || "pending",
            filingDate: c.filingDate || "",
        });
        setShowModal(true);
    };
    const handleDelete = async (id: string) => {
        if (!user) {
            setError("You must be logged in to delete cases.");
            return;
        }

        // Confirmation dialog
        if (!confirm("Are you sure you want to delete this case? This action cannot be undone.")) {
            return;
        }

        // Set deleting state for animation
        setDeletingCaseId(id);
        setError("");
        setSuccessMessage("");

        try {
            await deleteCase({
                id,
                userId: user.uid,
            });

            // Show success message
            const deletedCase = cases.find(c => c.id === id);
            setSuccessMessage(`Case "${deletedCase?.title || 'Case'}" deleted successfully`);

            // Wait a bit for fade-out animation, then remove from state
            setTimeout(() => {
                // Update both cases and filteredCases
                setCases(prev => prev.filter(c => c.id !== id));
                setFilteredCases(prev => prev.filter(c => c.id !== id));
                // Also remove from stats
                setCaseStats(prev => {
                    const updated = { ...prev };
                    delete updated[id];
                    return updated;
                });
                setDeletingCaseId(null);
            }, 300); // Match animation duration

            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (err) {
            console.error("Error deleting case:", err);
            setDeletingCaseId(null);
            let errorMessage = "Could not delete case";
            if (err instanceof Error) {
                if (err.message.includes("Unauthorized") || err.message.includes("403")) {
                    errorMessage = "You don't have permission to delete this case.";
                } else if (err.message.includes("not found") || err.message.includes("404")) {
                    errorMessage = "Case not found. It may have already been deleted.";
                } else {
                    errorMessage = err.message || errorMessage;
                }
            }
            setError(errorMessage);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Search Bar - Always Visible */}
            <div className="mb-6">
                <form onSubmit={handleSearch} className="w-full">
                    <div className="relative max-w-2xl">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaSearch className="text-slate-400 text-lg" />
                                    </div>
                                    <input
                                        type="text"
                                        value={localSearchQuery}
                                        onChange={(e) => setLocalSearchQuery(e.target.value)}
                            placeholder="Search cases by title, case number, court, parties..."
                            className="w-full pl-12 pr-24 py-3 text-base border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm hover:border-slate-400 transition-colors"
                                    />
                        <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2">
                                    {localSearchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLocalSearchQuery("");
                                                window.history.pushState({}, "", "/cases");
                                        setFilteredCases(cases);
                                            }}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition"
                                    title="Clear search"
                                        >
                                    <FaTimes className="text-sm" />
                                        </button>
                                    )}
                                <button
                                type="submit"
                                className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-all shadow-sm hover:shadow-md"
                            >
                                Search
                                </button>
                        </div>
                    </div>
                            </form>
                    </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Cases</h1>
                    <p className="text-slate-600 text-xs sm:text-sm mt-0.5 hidden sm:block">Manage your legal cases and documents</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                        className="bg-slate-900 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2 text-xs sm:text-sm"
                        onClick={() => {
                            setEditId(null);
                            setForm({
                                title: "",
                                description: "",
                                plaintiffCase: "",
                                defendantCase: "",
                                workToBeDone: "",
                                caseNumber: "",
                                caseCategory: "",
                                court: "",
                                fileNumber: "",
                                year: "",
                                plaintiff: "",
                                defendant: "",
                                petitioner: "",
                                respondent: "",
                                complainant: "",
                                accused: "",
                                advocateForPetitioner: "",
                                advocateForRespondent: "",
                                publicProsecutor: "",
                                mobileNumber: "",
                                currentStage: "",
                                lastHearingDate: "",
                                nextHearingDate: "",
                                hearingPurpose: "",
                                purposeOfHearingStage: "",
                                notes: "",
                                caseType: "",
                                status: "pending",
                                filingDate: "",
                            });
                            setSelectedFiles([]);
                            setSelectedPlaintiffFiles([]);
                            setSelectedCitationFiles([]);
                            setShowModal(true);
                        }}
                    >
                        <FaFileAlt /> Add New Case
                    </button>
                </div>
            </div>
            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
                    <p className="mt-2 text-slate-600 text-sm">Loading cases...</p>
                </div>
            ) : (
                <>
                    {/* Success Toast Notification */}
                    {successMessage && (
                        <div className="fixed top-4 right-4 z-50 animate-slide-in-right bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-sm">
                            <FaCheckCircle className="text-green-600 flex-shrink-0" />
                            <span className="text-sm font-medium">{successMessage}</span>
                            <button
                                onClick={() => setSuccessMessage("")}
                                className="ml-auto text-green-600 hover:text-green-800"
                            >
                                <FaTimes className="text-xs" />
                            </button>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">{error}</div>
                    )}

                    {filteredCases.length === 0 && searchQuery ? (
                        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-slate-300">
                            <FaSearch className="text-4xl text-slate-400 mx-auto mb-3" />
                            <p className="text-slate-600 mb-2">No cases found matching "{searchQuery}"</p>
                            <button
                                onClick={() => {
                                    setLocalSearchQuery("");
                                    window.history.pushState({}, "", "/cases");
                                    setFilteredCases(cases);
                                }}
                                className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                            >
                                Clear search
                            </button>
                        </div>
                    ) : cases.length === 0 ? (
                        <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-slate-300">
                            <FaFileAlt className="text-4xl text-slate-400 mx-auto mb-3" />
                            <p className="text-slate-600">No cases found. Create your first case!</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Case Number</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Court</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Work to be Done</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Updated</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {filteredCases.map((c) => (
                                            <tr 
                                    key={c.id}
                                                className={`hover:bg-slate-50 transition-colors ${deletingCaseId === c.id ? "opacity-50" : ""}`}
                                            >
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={`/cases/${c.id}`}
                                                        className="text-sm font-semibold text-slate-900 hover:text-amber-600 transition"
                                                    >
                                                        {c.caseNumber || "—"}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {c.status && (
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                c.status === "pending"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : c.status === "admitted" || c.status === "allowed"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : c.status === "dismissed" || c.status === "disposed" || c.status === "withdrawn"
                                                                    ? "bg-gray-100 text-gray-800"
                                                                    : "bg-orange-100 text-orange-800"
                                                            }`}
                                                        >
                                                            {c.status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-slate-600">
                                                        {c.court || "—"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm text-slate-600 line-clamp-2 max-w-xs">
                                                        {c.workToBeDone || "—"}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-slate-500">
                                                        {c.updatedAt
                                                            ? new Date(c.updatedAt).toLocaleDateString()
                                                            : c.createdAt
                                                            ? new Date(c.createdAt).toLocaleDateString()
                                                            : "—"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                                <button
                                                            onClick={() => handleEdit(c)}
                                                            className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded transition"
                                                            title="Edit case"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                                </button>
                                                            <button
                                                            onClick={() => handleDelete(c.id)}
                                                            disabled={deletingCaseId === c.id}
                                                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Delete case"
                                                        >
                                                            <FaTrash className="text-sm" />
                                                            </button>
                                                        <Link
                                                            href={`/cases/${c.id}`}
                                                            className="text-xs text-amber-600 hover:text-amber-700 font-medium ml-1"
                                                        >
                                                            View →
                                                        </Link>
                                                        </div>
                                                </td>
                                            </tr>
                                                    ))}
                                    </tbody>
                                </table>
                                    </div>
                                </div>
                            )}
                                    </>
                                )}

            {/* Modal */}
            {showModal && (
                <CaseModal
                    form={form}
                    setForm={setForm}
                    editId={editId}
                    uploading={uploading}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    selectedCitationFiles={selectedCitationFiles}
                    setSelectedCitationFiles={setSelectedCitationFiles}
                    uploadProgress={uploadProgress}
                    setUploadProgress={setUploadProgress}
                        onSubmit={handleAddOrUpdate}
                    selectedPlaintiffFiles={selectedPlaintiffFiles}
                    setSelectedPlaintiffFiles={setSelectedPlaintiffFiles}
                    onBack={() => {
                                    setShowModal(false);
                                    setSelectedFiles([]);
                                    setSelectedPlaintiffFiles([]);
                                    setEditId(null);
                                }}
                    onCancel={() => {
                                    setShowModal(false);
                                    setSelectedFiles([]);
                                    setSelectedPlaintiffFiles([]);
                                }}
                />
            )}
        </div>
    );
};

export default CasesPage;