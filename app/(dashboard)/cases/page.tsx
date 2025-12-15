"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getCases, createCase, updateCase, deleteCase } from "../../../lib/api-client";
import { createClient, getClients } from "../../../lib/api-client";
import { uploadCaseDocument } from "../../../lib/firebase/storage";
import { FaGavel, FaFileAlt, FaCalendarAlt, FaUser, FaBuilding, FaHashtag, FaCheckCircle, FaClock, FaPauseCircle, FaUpload, FaTimes, FaComments, FaTasks, FaSearch, FaTrash, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
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
    lastHearingDate?: string;
    nextHearingDate?: string;
    hearingPurpose?: string;
    purposeOfHearingStage?: string;
    notes?: string;
    caseType?: string;
    status?: "pending" | "admitted" | "dismissed" | "allowed" | "disposed" | "withdrawn" | "compromised" | "stayed" | "appeal_filed";
    filingDate?: string;
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
    const [form, setForm] = useState<{
        title: string;
        description: string;
        plaintiffCase: string;
        defendantCase: string;
        workToBeDone: string;
        caseNumber: string;
        caseCategory: string;
        court: string;
        plaintiff: string;
        defendant: string;
        petitioner: string;
        respondent: string;
        complainant: string;
        accused: string;
        advocateForPetitioner: string;
        advocateForRespondent: string;
        publicProsecutor: string;
        currentStage: string;
        lastHearingDate: string;
        nextHearingDate: string;
        hearingPurpose: string;
        purposeOfHearingStage: string;
        notes: string;
        caseType: string;
        status: "pending" | "admitted" | "dismissed" | "allowed" | "disposed" | "withdrawn" | "compromised" | "stayed" | "appeal_filed";
        filingDate: string;
    }>({
        title: "",
        description: "",
        plaintiffCase: "",
        defendantCase: "",
        workToBeDone: "",
        caseNumber: "",
        caseCategory: "",
        court: "",
        plaintiff: "",
        defendant: "",
        petitioner: "",
        respondent: "",
        complainant: "",
        accused: "",
        advocateForPetitioner: "",
        advocateForRespondent: "",
        publicProsecutor: "",
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
    const [selectedCitationFiles, setSelectedCitationFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [caseStats, setCaseStats] = useState<{ [caseId: string]: { documents: number; hearings: number; tasks: number; conversations: number } }>({});
    const [deletingCaseId, setDeletingCaseId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

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
            // Auto-expand search on desktop if there's a search query
            setIsSearchExpanded(true);
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
                plaintiff: "",
                defendant: "",
                petitioner: "",
                respondent: "",
                complainant: "",
                accused: "",
                advocateForPetitioner: "",
                advocateForRespondent: "",
                publicProsecutor: "",
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

    // Filter cases based on local search query
    useEffect(() => {
        if (localSearchQuery.trim()) {
            const filtered = cases.filter((c: Case) =>
                c.title.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                c.description?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                c.caseNumber?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                c.court?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                c.plaintiff?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                c.defendant?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                c.petitioner?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                c.respondent?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                c.complainant?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                c.accused?.toLowerCase().includes(localSearchQuery.toLowerCase())
            );
            setFilteredCases(filtered);
        } else {
            setFilteredCases(cases);
        }
    }, [localSearchQuery, cases]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (localSearchQuery.trim()) {
            params.set("search", localSearchQuery.trim());
            window.history.pushState({}, "", `/cases?${params.toString()}`);
            // Keep search expanded on desktop when there's a query
            setIsSearchExpanded(true);
        } else {
            window.history.pushState({}, "", "/cases");
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
            const caseData = {
                ...form,
                // keep backend-friendly description in sync
                description:
                    form.description ||
                    [
                        form.plaintiffCase && `Plaintiff Case: ${form.plaintiffCase}`,
                        form.defendantCase && `Defendant Case: ${form.defendantCase}`,
                        form.workToBeDone && `Work to be Done: ${form.workToBeDone}`,
                    ]
                        .filter(Boolean)
                        .join("\n\n"),
                userId: user.uid,
                // Ensure status is valid or undefined
                status: form.status && validStatuses.includes(form.status) ? form.status : "pending"
            };

            if (editId) {
                await updateCase({ id: editId, ...caseData });
            } else {
                const result = await createCase(caseData);
                newCaseId = result.id;
            }

            // Upload documents if any were selected
            if (selectedFiles.length > 0 && newCaseId) {
                const { getFirestore, collection, addDoc, Timestamp } = await import("firebase/firestore");
                const { app } = await import("../../../lib/firebase/config");
                const db = getFirestore(app);

                for (let i = 0; i < selectedFiles.length; i++) {
                    const file = selectedFiles[i];
                    const fileKey = editId ? `edit_${i}` : `new_${i}`;
                    try {
                        // Upload to Vercel Blob Storage with progress tracking
                        const { url, path } = await uploadCaseDocument(newCaseId, file, (progress) => {
                            const percent = (progress.loaded / progress.total) * 100;
                            setUploadProgress(prev => ({ ...prev, [fileKey]: percent }));
                        });

                        const fileType = file.type || "";
                        const isImage = fileType.startsWith("image/");
                        const isPDF = fileType === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

                        // Save document metadata to Firestore
                        await addDoc(collection(db, "documents"), {
                            caseId: newCaseId,
                            name: file.name,
                            url: url,
                            uploadedBy: user.uid,
                            uploadedAt: Timestamp.now(),
                            path: path,
                            type: fileType || "unknown",
                            size: file.size,
                            isImage,
                            isPDF,
                        });

                        // Clear progress after successful upload
                        setUploadProgress(prev => {
                            const newProgress = { ...prev };
                            delete newProgress[fileKey];
                            return newProgress;
                        });
                    } catch (uploadError) {
                        console.error("Error uploading file:", uploadError);
                        setError(`Failed to upload ${file.name}. Please try uploading it manually in the case details.`);
                        setUploadProgress(prev => {
                            const newProgress = { ...prev };
                            delete newProgress[fileKey];
                            return newProgress;
                        });
                        // Continue with other files even if one fails
                    }
                }
            }

            // Upload citations if any were selected (store as documents with category=citation)
            if (selectedCitationFiles.length > 0 && newCaseId) {
                const { getFirestore, collection, addDoc, Timestamp } = await import("firebase/firestore");
                const { app } = await import("../../../lib/firebase/config");
                const db = getFirestore(app);

                for (let i = 0; i < selectedCitationFiles.length; i++) {
                    const file = selectedCitationFiles[i];
                    try {
                        const { url, path } = await uploadCaseDocument(newCaseId, file);
                        const fileType = file.type || "";
                        const isImage = fileType.startsWith("image/");
                        const isPDF = fileType === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

                        await addDoc(collection(db, "documents"), {
                            caseId: newCaseId,
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
                        setError(`Failed to upload citation ${file.name}. You can try uploading it later from the case details page.`);
                    }
                }
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
                plaintiff: "",
                defendant: "",
                petitioner: "",
                respondent: "",
                complainant: "",
                accused: "",
                advocateForPetitioner: "",
                advocateForRespondent: "",
                publicProsecutor: "",
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
            plaintiff: c.plaintiff || "",
            defendant: c.defendant || "",
            petitioner: c.petitioner || "",
            respondent: c.respondent || "",
            complainant: c.complainant || "",
            accused: c.accused || "",
            advocateForPetitioner: c.advocateForPetitioner || "",
            advocateForRespondent: c.advocateForRespondent || "",
            publicProsecutor: c.publicProsecutor || "",
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Cases</h1>
                    {/* Desktop: Search Icon Button */}
                    <div className="hidden md:flex items-center gap-2">
                        {!isSearchExpanded ? (
                            <button
                                type="button"
                                onClick={() => setIsSearchExpanded(true)}
                                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                title="Search cases"
                            >
                                <FaSearch className="text-lg" />
                            </button>
                        ) : (
                            <form onSubmit={handleSearch} className="flex items-center gap-2">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="text-slate-400 text-sm" />
                                    </div>
                                    <input
                                        type="text"
                                        value={localSearchQuery}
                                        onChange={(e) => setLocalSearchQuery(e.target.value)}
                                        placeholder="Search cases..."
                                        autoFocus
                                        className="w-64 pl-9 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                    {localSearchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLocalSearchQuery("");
                                                window.history.pushState({}, "", "/cases");
                                            }}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                        >
                                            <span className="text-lg">×</span>
                                        </button>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSearchExpanded(false);
                                        if (!localSearchQuery) {
                                            setLocalSearchQuery("");
                                            window.history.pushState({}, "", "/cases");
                                        }
                                    }}
                                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                    title="Close search"
                                >
                                    <FaTimes className="text-sm" />
                                </button>
                            </form>
                        )}
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm mt-0.5 hidden sm:block">Manage your legal cases and documents</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {/* Mobile: Search Bar */}
                    <form onSubmit={handleSearch} className="flex-1 md:hidden">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-slate-400 text-sm" />
                            </div>
                            <input
                                type="text"
                                value={localSearchQuery}
                                onChange={(e) => setLocalSearchQuery(e.target.value)}
                                placeholder="Search cases..."
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                            {localSearchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLocalSearchQuery("");
                                        window.history.pushState({}, "", "/cases");
                                    }}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                >
                                    <span className="text-lg">×</span>
                                </button>
                            )}
                        </div>
                    </form>
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
                                plaintiff: "",
                                defendant: "",
                                petitioner: "",
                                respondent: "",
                                complainant: "",
                                accused: "",
                                advocateForPetitioner: "",
                                advocateForRespondent: "",
                                publicProsecutor: "",
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
                            setSelectedCitationFiles([]);
                            setShowModal(true);
                        }}
                    >
                        <FaFileAlt /> Add New Case
                    </button>
                    <button
                        className="bg-amber-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-amber-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2 text-xs sm:text-sm"
                        onClick={async () => {
                            if (!user) return;
                            try {
                                const res = await fetch("/api/cases/seed", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ userId: user.uid }),
                                });
                                if (res.ok) {
                                    await res.json();
                                    const res2 = await getCases(user.uid);
                                    setCases(res2);
                                    alert("Sample case created successfully!");
                                } else {
                                    setError("Failed to create sample case");
                                }
                            } catch {
                                setError("Failed to create sample case");
                            }
                        }}
                    >
                        <FaFileAlt /> Create Sample Case
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

                    {filteredCases.length === 0 && localSearchQuery ? (
                        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-slate-300">
                            <FaSearch className="text-4xl text-slate-400 mx-auto mb-3" />
                            <p className="text-slate-600 mb-2">No cases found matching "{localSearchQuery}"</p>
                            <button
                                onClick={() => {
                                    setLocalSearchQuery("");
                                    window.history.pushState({}, "", "/cases");
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                            {filteredCases.map(c => {
                                const getStatusIcon = () => {
                                    switch (c.status) {
                                        case "admitted":
                                        case "allowed": return <FaCheckCircle className="text-green-600" />;
                                        case "dismissed": return <FaTimes className="text-red-600" />;
                                        case "disposed": return <FaCheckCircle className="text-gray-600" />;
                                        case "withdrawn": return <FaClock className="text-orange-600" />;
                                        case "compromised": return <FaCheckCircle className="text-blue-600" />;
                                        case "stayed": return <FaPauseCircle className="text-yellow-600" />;
                                        case "appeal_filed": return <FaFileAlt className="text-purple-600" />;
                                        case "pending": return <FaClock className="text-yellow-600" />;
                                        default: return <FaClock className="text-slate-600" />;
                                    }
                                };
                                const getStatusColor = () => {
                                    switch (c.status) {
                                        case "admitted":
                                        case "allowed": return "bg-green-100 text-green-800";
                                        case "dismissed": return "bg-red-100 text-red-800";
                                        case "disposed": return "bg-gray-100 text-gray-800";
                                        case "withdrawn": return "bg-orange-100 text-orange-800";
                                        case "compromised": return "bg-blue-100 text-blue-800";
                                        case "stayed": return "bg-yellow-100 text-yellow-800";
                                        case "appeal_filed": return "bg-purple-100 text-purple-800";
                                        case "pending": return "bg-yellow-100 text-yellow-800";
                                        default: return "bg-slate-100 text-slate-800";
                                    }
                                };
                                const isDeleting = deletingCaseId === c.id;
                                return (
                                    <Link
                                        key={c.id}
                                        href={`/cases/${c.id}`}
                                        className={`legal-card p-4 rounded-lg hover:shadow-lg transition-all group border border-slate-200 block cursor-pointer ${isDeleting ? 'opacity-0 scale-95 -translate-y-2 transition-all duration-300 pointer-events-none' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-700 mb-1 line-clamp-1">{c.title}</h3>
                                                {c.caseNumber && (
                                                    <div className="flex items-center gap-1 text-xs text-slate-600">
                                                        <FaHashtag className="text-xs" /> {c.caseNumber}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ml-2 flex-shrink-0 ${getStatusColor()}`}>
                                                {getStatusIcon()}
                                                <span className="capitalize hidden sm:inline">{c.status || "pending"}</span>
                                            </div>
                                        </div>
                                        <p className="text-slate-600 text-xs mb-3 line-clamp-2">{c.description}</p>

                                        <div className="space-y-1 mb-3 text-xs text-slate-600">
                                            {c.court && (
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <FaBuilding className="text-amber-600 flex-shrink-0" /> <span className="truncate">{c.court}</span>
                                                </div>
                                            )}
                                            {(c.plaintiff || c.petitioner || c.complainant) && (
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <FaUser className="text-amber-600 flex-shrink-0" />
                                                    <span className="truncate">
                                                        {c.plaintiff || c.petitioner || c.complainant}
                                                        {(c.defendant || c.respondent || c.accused) && ` vs ${c.defendant || c.respondent || c.accused}`}
                                                    </span>
                                                </div>
                                            )}
                                            {c.purposeOfHearingStage && (
                                                <div className="flex items-center gap-1.5">
                                                    <FaCalendarAlt className="text-amber-600 flex-shrink-0" /> <span>Purpose: {c.purposeOfHearingStage}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Case Statistics */}
                                        {caseStats[c.id] && (
                                            <div className="flex items-center gap-3 mb-3 pt-2 border-t border-slate-100 text-xs">
                                                <div className="flex items-center gap-1 text-slate-600" title="Documents">
                                                    <FaFileAlt className="text-blue-600" />
                                                    <span className="font-semibold">{caseStats[c.id].documents}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-600" title="Hearings">
                                                    <FaCalendarAlt className="text-green-600" />
                                                    <span className="font-semibold">{caseStats[c.id].hearings}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-600" title="Tasks">
                                                    <FaTasks className="text-purple-600" />
                                                    <span className="font-semibold">{caseStats[c.id].tasks}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-600" title="Conversations">
                                                    <FaComments className="text-amber-600" />
                                                    <span className="font-semibold">{caseStats[c.id].conversations}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-1 sm:gap-1.5 pt-3 border-t border-slate-200" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    window.location.href = `/cases/${c.id}`;
                                                }}
                                                className="flex-1 bg-slate-900 text-white rounded px-2 py-1.5 hover:bg-slate-800 transition font-medium text-xs text-center flex items-center justify-center gap-1 select-none"
                                            >
                                                <FaGavel className="text-xs" /> <span className="hidden sm:inline">View</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleEdit(c);
                                                }}
                                                disabled={isDeleting}
                                                className="flex-1 bg-amber-600 text-white rounded px-2 py-1.5 hover:bg-amber-700 transition font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed select-none"
                                                onMouseDown={(e) => e.preventDefault()}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleDelete(c.id);
                                                }}
                                                disabled={isDeleting || deletingCaseId !== null}
                                                className="flex-1 bg-red-600 text-white rounded px-2 py-1.5 hover:bg-red-700 transition font-medium text-xs flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed select-none"
                                                onMouseDown={(e) => e.preventDefault()}
                                            >
                                                {isDeleting ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                        <span className="hidden sm:inline">Deleting...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaTrash className="text-xs" />
                                                        <span className="hidden sm:inline">Del</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 sm:p-4 overflow-y-auto">
                    <form
                        onSubmit={handleAddOrUpdate}
                        className="bg-white rounded-lg p-4 sm:p-6 shadow-2xl space-y-3 w-full max-w-2xl border-t-4 border-amber-500 my-2 sm:my-4 max-h-[95vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                                <FaFileAlt className="text-amber-600" /> <span className="text-sm sm:text-lg">{editId ? "Edit Case" : "Add New Case"}</span>
                            </h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedFiles([]);
                                    setEditId(null);
                                }}
                                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-2"
                                title="Go back"
                            >
                                <FaArrowLeft className="text-sm" />
                                <span className="text-sm font-medium hidden sm:inline">Back</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Case Title - Cause Title *</label>
                                <input
                                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    required
                                    placeholder="e.g., Smith vs. Jones"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Case Type <span className="text-slate-500 font-normal text-xs">(Optional)</span></label>
                                <select
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.caseType}
                                    onChange={e => setForm({ ...form, caseType: e.target.value })}
                                >
                                    <option value="">Select Case Type</option>
                                    <option value="Civil">Civil</option>
                                    <option value="Criminal">Criminal</option>
                                    <option value="Writ Petition">Writ Petition</option>
                                    <option value="Appeal">Appeal</option>
                                    <option value="Revision">Revision</option>
                                    <option value="Miscellaneous Case">Miscellaneous Case</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Case Number <span className="text-slate-500 font-normal">(Optional)</span></label>
                                <input
                                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.caseNumber}
                                    onChange={e => setForm({ ...form, caseNumber: e.target.value })}
                                    placeholder="e.g., CV-2024-001"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Case Category <span className="text-slate-500 font-normal text-xs">(Optional)</span></label>
                                <select
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.caseCategory}
                                    onChange={e => setForm({ ...form, caseCategory: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    <option value="O.S">O.S (Original Suit)</option>
                                    <option value="C.C">C.C (Calendar Case)</option>
                                    <option value="S.C">S.C (Sessions Case)</option>
                                    <option value="Crl.P">Crl.P (Criminal Petition)</option>
                                    <option value="Crl.A">Crl.A (Criminal Appeal)</option>
                                    <option value="W.P">W.P (Writ Petition)</option>
                                    <option value="W.A">W.A (Writ Appeal)</option>
                                    <option value="M.C">M.C (Miscellaneous Case)</option>
                                    <option value="I.A">I.A (Interim Application)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Court <span className="text-slate-500 font-normal text-xs">(Optional)</span></label>
                                <input
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.court}
                                    onChange={e => setForm({ ...form, court: e.target.value })}
                                    placeholder="e.g., District & Sessions Court, High Court of Telangana"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Parties <span className="text-slate-500 font-normal text-xs">(Optional)</span></label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1">Plaintiff <span className="text-slate-400">(Optional)</span></label>
                                        <input
                                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                            value={form.plaintiff}
                                            onChange={e => setForm({ ...form, plaintiff: e.target.value })}
                                            placeholder="Name of plaintiff"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1">Defendant <span className="text-slate-400">(Optional)</span></label>
                                        <input
                                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                            value={form.defendant}
                                            onChange={e => setForm({ ...form, defendant: e.target.value })}
                                            placeholder="Name of defendant"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Advocate Details <span className="text-slate-500 font-normal text-xs">(Optional)</span></label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1">Advocate of Plaintiff <span className="text-slate-400">(Optional)</span></label>
                                        <input
                                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                            value={form.advocateForPetitioner}
                                            onChange={e => setForm({ ...form, advocateForPetitioner: e.target.value })}
                                            placeholder="Advocate name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1">Advocate of Defendant <span className="text-slate-400">(Optional)</span></label>
                                        <input
                                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                            value={form.advocateForRespondent}
                                            onChange={e => setForm({ ...form, advocateForRespondent: e.target.value })}
                                            placeholder="Advocate name"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Current Stage <span className="text-slate-500 font-normal text-xs">(Optional)</span></label>
                                <select
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.currentStage}
                                    onChange={e => setForm({ ...form, currentStage: e.target.value })}
                                >
                                    <option value="">Select Stage</option>
                                    <option value="Filing / Registration">Filing / Registration</option>
                                    <option value="Notice Stage">Notice Stage</option>
                                    <option value="Counter Filed / Awaited">Counter Filed / Awaited</option>
                                    <option value="Evidence Stage">Evidence Stage</option>
                                    <option value="Cross-Examination">Cross-Examination</option>
                                    <option value="Arguments">Arguments</option>
                                    <option value="Judgment Reserved">Judgment Reserved</option>
                                    <option value="Judgment Pronounced">Judgment Pronounced</option>
                                    <option value="Execution Petition (EP)">Execution Petition (EP)</option>
                                    <option value="Appeal Stage">Appeal Stage</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Case Status <span className="text-slate-500 font-normal text-xs">(Optional)</span></label>
                                <select
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.status || "pending"}
                                    onChange={e => {
                                        const validStatuses = ["pending", "admitted", "dismissed", "allowed", "disposed", "withdrawn", "compromised", "stayed", "appeal_filed"];
                                        const newStatus = validStatuses.includes(e.target.value) ? e.target.value : "pending";
                                        setForm({ ...form, status: newStatus as typeof form.status });
                                    }}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="admitted">Admitted</option>
                                    <option value="dismissed">Dismissed</option>
                                    <option value="allowed">Allowed</option>
                                    <option value="disposed">Disposed</option>
                                    <option value="withdrawn">Withdrawn</option>
                                    <option value="compromised">Compromised / Settled</option>
                                    <option value="stayed">Stayed</option>
                                    <option value="appeal_filed">Appeal Filed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Filing Date <span className="text-slate-500 font-normal text-xs">(Optional)</span></label>
                                <input
                                    type="date"
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.filingDate}
                                    onChange={e => setForm({ ...form, filingDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Purpose of Hearing - Stage (Date) <span className="text-slate-500 font-normal text-xs">(Optional)</span></label>
                                <input
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.purposeOfHearingStage}
                                    onChange={e => setForm({ ...form, purposeOfHearingStage: e.target.value })}
                                    placeholder="e.g., Arguments - 15/02/2025"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1">Plaintiff Case</label>
                                        <textarea
                                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                            value={form.plaintiffCase}
                                            onChange={e => setForm({ ...form, plaintiffCase: e.target.value })}
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1">Defendant/Opponent Case</label>
                                        <textarea
                                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                            value={form.defendantCase}
                                            onChange={e => setForm({ ...form, defendantCase: e.target.value })}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <label className="block text-xs text-slate-600 mb-1">Work to be Done</label>
                                    <textarea
                                        className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                        value={form.workToBeDone}
                                        onChange={e => setForm({ ...form, workToBeDone: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                            </div>
                            {!editId && (
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Documents (Optional)</label>
                                    <div className="mt-1 border-2 border-dashed border-slate-300 rounded p-3">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,.pdf,.doc,.docx"
                                            className="hidden"
                                            id="case-documents"
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files || []);
                                                setSelectedFiles(prev => [...prev, ...files]);
                                            }}
                                        />
                                        <label
                                            htmlFor="case-documents"
                                            className="cursor-pointer flex flex-col items-center justify-center py-2"
                                        >
                                            <FaUpload className="text-xl text-slate-400 mb-1" />
                                            <span className="text-xs text-slate-600">Click to upload documents</span>
                                            <span className="text-xs text-slate-500 mt-0.5">PDF, Images, Word, etc.</span>
                                        </label>
                                        {selectedFiles.length > 0 && (
                                            <div className="mt-2 space-y-1.5">
                                                {selectedFiles.map((file, idx) => {
                                                    const fileKey = editId ? `edit_${idx}` : `new_${idx}`;
                                                    const progress = uploadProgress[fileKey] || 0;
                                                    const isUploading = uploading && progress > 0 && progress < 100;
                                                    return (
                                                        <div key={idx} className="bg-slate-50 p-2 rounded text-xs">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-slate-700 truncate flex-1">{file.name}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
                                                                        setUploadProgress(prev => {
                                                                            const newProgress = { ...prev };
                                                                            delete newProgress[fileKey];
                                                                            return newProgress;
                                                                        });
                                                                    }}
                                                                    disabled={isUploading}
                                                                    className="ml-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                                                                >
                                                                    <FaTimes className="text-xs" />
                                                                </button>
                                                            </div>
                                                            {isUploading && (
                                                                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                                                                    <div
                                                                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                                                        style={{ width: `${progress}%` }}
                                                                    ></div>
                                                                </div>
                                                            )}
                                                            {isUploading && (
                                                                <span className="text-xs text-blue-600 mt-0.5 block">{Math.round(progress)}%</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {!editId && (
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Citations (Optional)</label>
                                    <div className="mt-1 border-2 border-dashed border-slate-300 rounded p-3">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,.pdf,.doc,.docx"
                                            className="hidden"
                                            id="case-citations"
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files || []);
                                                setSelectedCitationFiles(prev => [...prev, ...files]);
                                            }}
                                        />
                                        <label
                                            htmlFor="case-citations"
                                            className="cursor-pointer flex flex-col items-center justify-center py-2"
                                        >
                                            <FaUpload className="text-xl text-slate-400 mb-1" />
                                            <span className="text-xs text-slate-600">Click to upload citation files</span>
                                            <span className="text-xs text-slate-500 mt-0.5">PDF, Images, Word, etc.</span>
                                        </label>
                                        {selectedCitationFiles.length > 0 && (
                                            <details className="mt-2">
                                                <summary className="text-xs text-slate-600 cursor-pointer select-none">
                                                    View selected citations ({selectedCitationFiles.length})
                                                </summary>
                                                <div className="mt-2 space-y-1.5">
                                                    {selectedCitationFiles.map((file, idx) => (
                                                        <div key={idx} className="bg-slate-50 p-2 rounded text-xs flex items-center justify-between">
                                                            <span className="text-slate-700 truncate flex-1">{file.name}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedCitationFiles(prev => prev.filter((_, i) => i !== idx));
                                                                }}
                                                                className="ml-2 text-red-600 hover:text-red-800"
                                                            >
                                                                <FaTimes className="text-xs" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 pt-3">
                            <button
                                type="submit"
                                disabled={uploading}
                                className="flex-1 bg-slate-900 text-white rounded px-3 py-2 hover:bg-slate-800 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {uploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                        {editId ? "Updating..." : "Creating..."}
                                    </>
                                ) : (
                                    <>
                                        <FaCheckCircle /> {editId ? "Update Case" : "Create Case"}
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                disabled={uploading}
                                className="flex-1 bg-slate-200 text-slate-700 px-3 py-2 rounded hover:bg-slate-300 transition font-semibold disabled:opacity-50 text-sm"
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedFiles([]);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CasesPage;