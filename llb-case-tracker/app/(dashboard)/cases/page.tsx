"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getCases, createCase, updateCase, deleteCase } from "../../../lib/api-client";
import { storage } from "../../../lib/firebase/config";
import { ref, uploadBytesResumable } from "firebase/storage";
import { FaGavel, FaFileAlt, FaCalendarAlt, FaUser, FaBuilding, FaHashtag, FaCheckCircle, FaClock, FaPauseCircle, FaUpload, FaTimes, FaComments, FaTasks, FaSearch } from "react-icons/fa";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Case {
    id: string;
    title: string;
    description: string;
    caseNumber?: string;
    court?: string;
    oppositeParty?: string;
    caseType?: string;
    status?: "active" | "closed" | "pending" | "on_hold";
    filingDate?: string;
    nextHearingDate?: string;
}

const CasesPage: React.FC = () => {
    const { user } = useAuth();
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
        caseNumber: string;
        court: string;
        oppositeParty: string;
        caseType: string;
        status: "active" | "closed" | "pending" | "on_hold";
        filingDate: string;
        nextHearingDate: string;
    }>({
        title: "",
        description: "",
        caseNumber: "",
        court: "",
        oppositeParty: "",
        caseType: "",
        status: "active",
        filingDate: "",
        nextHearingDate: "",
    });
    const [editId, setEditId] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [caseStats, setCaseStats] = useState<{ [caseId: string]: { documents: number; hearings: number; tasks: number; conversations: number } }>({});

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
                        c.oppositeParty?.toLowerCase().includes(searchQuery.toLowerCase())
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
            } catch {
                setError("Failed to fetch cases");
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

    // Filter cases based on local search query
    useEffect(() => {
        if (localSearchQuery.trim()) {
            const filtered = cases.filter((c: Case) =>
                c.title.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                c.description?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                c.caseNumber?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                c.court?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                c.oppositeParty?.toLowerCase().includes(localSearchQuery.toLowerCase())
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
        } else {
            window.history.pushState({}, "", "/cases");
        }
    };

    const handleAddOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setUploading(true);
        setError("");
        try {
            let newCaseId: string | undefined;
            if (editId) {
                await updateCase({ id: editId, ...form, userId: user.uid });
            } else {
                const result = await createCase({ ...form, userId: user.uid });
                newCaseId = result.id;
            }

            // Upload documents if any were selected
            if (selectedFiles.length > 0 && newCaseId) {
                const { getFirestore, collection, addDoc, Timestamp } = await import("firebase/firestore");
                const { app } = await import("../../../lib/firebase/config");
                const { getDownloadURL } = await import("firebase/storage");
                const db = getFirestore(app);

                for (let i = 0; i < selectedFiles.length; i++) {
                    const file = selectedFiles[i];
                    const fileKey = editId ? `edit_${i}` : `new_${i}`;
                    try {
                        const timestamp = Date.now();
                        const storageRef = ref(storage, `cases/${newCaseId}/documents/${timestamp}_${file.name}`);
                        const uploadTask = uploadBytesResumable(storageRef, file);

                        // Track upload progress
                        await new Promise((resolve, reject) => {
                            uploadTask.on(
                                "state_changed",
                                (snapshot) => {
                                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                    setUploadProgress(prev => ({ ...prev, [fileKey]: progress }));
                                },
                                (error) => reject(error),
                                () => {
                                    setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }));
                                    resolve(undefined);
                                }
                            );
                        });

                        const url = await getDownloadURL(storageRef);
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
                            path: storageRef.fullPath,
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

            setShowModal(false);
            setForm({
                title: "",
                description: "",
                caseNumber: "",
                court: "",
                oppositeParty: "",
                caseType: "",
                status: "active",
                filingDate: "",
                nextHearingDate: "",
            });
            setSelectedFiles([]);
            setUploadProgress({});
            setEditId(null);
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
            setError("Could not save case");
            console.error("Error saving case:", err);
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (c: Case) => {
        setEditId(c.id);
        setForm({
            title: c.title,
            description: c.description,
            caseNumber: c.caseNumber || "",
            court: c.court || "",
            oppositeParty: c.oppositeParty || "",
            caseType: c.caseType || "",
            status: c.status || "active",
            filingDate: c.filingDate || "",
            nextHearingDate: c.nextHearingDate || "",
        });
        setShowModal(true);
    };
    const handleDelete = async (id: string) => {
        if (!user) return;
        try {
            await deleteCase({ id, userId: user.uid });
            setCases(prev => prev.filter(c => c.id !== id));
        } catch {
            setError("Could not delete case");
        }
    };

    return (
        <div className="p-2 sm:p-4 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Cases</h1>
                    <p className="text-slate-600 text-xs sm:text-sm mt-0.5">Manage your legal cases and documents</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-1 sm:flex-initial sm:min-w-[250px]">
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
                                caseNumber: "",
                                court: "",
                                oppositeParty: "",
                                caseType: "",
                                status: "active",
                                filingDate: "",
                                nextHearingDate: "",
                            });
                            setSelectedFiles([]);
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
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>
            ) : filteredCases.length === 0 && localSearchQuery ? (
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
                                case "active": return <FaCheckCircle className="text-green-600" />;
                                case "closed": return <FaCheckCircle className="text-gray-600" />;
                                case "pending": return <FaClock className="text-yellow-600" />;
                                case "on_hold": return <FaPauseCircle className="text-orange-600" />;
                                default: return <FaClock className="text-slate-600" />;
                            }
                        };
                        const getStatusColor = () => {
                            switch (c.status) {
                                case "active": return "bg-green-100 text-green-800";
                                case "closed": return "bg-gray-100 text-gray-800";
                                case "pending": return "bg-yellow-100 text-yellow-800";
                                case "on_hold": return "bg-orange-100 text-orange-800";
                                default: return "bg-slate-100 text-slate-800";
                            }
                        };
                        return (
                            <div key={c.id} className="legal-card p-4 rounded-lg hover:shadow-lg transition-all group border border-slate-200">
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
                                        <span className="capitalize hidden sm:inline">{c.status || "active"}</span>
                                    </div>
                                </div>
                                <p className="text-slate-600 text-xs mb-3 line-clamp-2">{c.description}</p>

                                <div className="space-y-1 mb-3 text-xs text-slate-600">
                                    {c.court && (
                                        <div className="flex items-center gap-1.5 truncate">
                                            <FaBuilding className="text-amber-600 flex-shrink-0" /> <span className="truncate">{c.court}</span>
                                        </div>
                                    )}
                                    {c.oppositeParty && (
                                        <div className="flex items-center gap-1.5 truncate">
                                            <FaUser className="text-amber-600 flex-shrink-0" /> <span className="truncate">{c.oppositeParty}</span>
                                        </div>
                                    )}
                                    {c.nextHearingDate && (
                                        <div className="flex items-center gap-1.5">
                                            <FaCalendarAlt className="text-amber-600 flex-shrink-0" /> <span>Next: {new Date(c.nextHearingDate).toLocaleDateString()}</span>
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

                                <div className="flex gap-1 sm:gap-1.5 pt-3 border-t border-slate-200">
                                    <Link href={`/cases/${c.id}`} className="flex-1 bg-slate-900 text-white rounded px-2 py-1.5 hover:bg-slate-800 transition font-medium text-xs text-center flex items-center justify-center gap-1">
                                        <FaGavel className="text-xs" /> <span className="hidden sm:inline">View</span>
                                    </Link>
                                    <button onClick={() => handleEdit(c)} className="flex-1 bg-amber-600 text-white rounded px-2 py-1.5 hover:bg-amber-700 transition font-medium text-xs">Edit</button>
                                    <button onClick={() => handleDelete(c.id)} className="flex-1 bg-red-600 text-white rounded px-2 py-1.5 hover:bg-red-700 transition font-medium text-xs">Del</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 sm:p-4 overflow-y-auto">
                    <form
                        onSubmit={handleAddOrUpdate}
                        className="bg-white rounded-lg p-4 sm:p-6 shadow-2xl space-y-3 w-full max-w-2xl border-t-4 border-amber-500 my-2 sm:my-4 max-h-[95vh] overflow-y-auto"
                    >
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                            <FaFileAlt className="text-amber-600" /> <span className="text-sm sm:text-lg">{editId ? "Edit Case" : "Add New Case"}</span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Case Title *</label>
                                <input
                                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    required
                                    placeholder="e.g., Smith vs. Jones"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Case Number</label>
                                <input
                                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.caseNumber}
                                    onChange={e => setForm({ ...form, caseNumber: e.target.value })}
                                    placeholder="e.g., CV-2024-001"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Case Type</label>
                                <input
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.caseType}
                                    onChange={e => setForm({ ...form, caseType: e.target.value })}
                                    placeholder="e.g., Civil, Criminal, Family"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Court</label>
                                <input
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.court}
                                    onChange={e => setForm({ ...form, court: e.target.value })}
                                    placeholder="e.g., District Court, High Court"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Opposite Party</label>
                                <input
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.oppositeParty}
                                    onChange={e => setForm({ ...form, oppositeParty: e.target.value })}
                                    placeholder="Name of opposite party"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                                <select
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.status}
                                    onChange={e => setForm({ ...form, status: e.target.value as "active" | "closed" | "pending" | "on_hold" })}
                                >
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="on_hold">On Hold</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Filing Date</label>
                                <input
                                    type="date"
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.filingDate}
                                    onChange={e => setForm({ ...form, filingDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Next Hearing Date</label>
                                <input
                                    type="date"
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.nextHearingDate}
                                    onChange={e => setForm({ ...form, nextHearingDate: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                                <textarea
                                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    required
                                    rows={3}
                                    placeholder="Case details, summary, and important notes..."
                                />
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