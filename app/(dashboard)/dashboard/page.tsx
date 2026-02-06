"use client";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getCases } from "../../../lib/api-client";
import { FaGavel, FaPlus, FaSearch, FaFileAlt, FaFolder, FaTable, FaTh } from "react-icons/fa";
import Link from "next/link";

interface CaseDoc {
    id: string;
    title: string;
    description: string;
    updatedAt?: string;
    createdAt?: string;
    caseNumber?: string;
    status?: string;
    nextHearingDate?: string;
    workToBeDone?: string;
    court?: string;
}

type ViewType = "table" | "grid";

const ITEMS_PER_PAGE = 20;

const DashboardHome: React.FC = () => {
    const { user, userData, loading: authLoading } = useAuth();
    const [cases, setCases] = useState<CaseDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [viewType, setViewType] = useState<ViewType>("table");
    const [searchQuery, setSearchQuery] = useState("");
    const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        // Wait for auth to finish loading
        if (authLoading) {
            return;
        }
        const fetchCases = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getCases(user.uid) as Array<{
                    id: string;
                    title: string;
                    description: string;
                    updatedAt?: string;
                    createdAt?: string;
                    caseNumber?: string;
                    status?: string;
                    nextHearingDate?: string;
                    workToBeDone?: string;
                    court?: string;
                    [key: string]: unknown;
                }>;

                const casesData = data.map((c) => ({
                    id: c.id,
                    title: c.title,
                    description: c.description,
                    updatedAt: c.updatedAt,
                    createdAt: c.createdAt,
                    caseNumber: c.caseNumber,
                    status: c.status,
                    nextHearingDate: c.nextHearingDate,
                    workToBeDone: c.workToBeDone,
                    court: c.court,
                }));

                // Sort by updatedAt (most recent first)
                const sorted = [...casesData].sort((a, b) => {
                    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
                    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
                    return bTime - aTime;
                });
                setCases(sorted);
            } catch (err) {
                console.error("Error fetching cases:", err);
                const errorMessage = err instanceof Error ? err.message : "Failed to fetch cases";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchCases();
    }, [user, userData]);

    const filteredCases = cases.filter(c =>
        searchQuery.trim() === "" ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.workToBeDone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.court?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayedCases = filteredCases.slice(0, displayedCount);
    const hasMore = displayedCount < filteredCases.length;

    // Reset displayed count when search query changes
    useEffect(() => {
        setDisplayedCount(ITEMS_PER_PAGE);
    }, [searchQuery, viewType]);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setDisplayedCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredCases.length));
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loading, filteredCases.length]);

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Top Action Bar */}
            <div className="bg-white border-b border-slate-200 px-2 sm:px-4 py-3 sm:py-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <FaGavel className="text-amber-600 text-xl sm:text-2xl" />
                            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Dashboard</h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                href="/cases"
                                className="bg-slate-100 text-slate-700 font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-slate-200 transition-all shadow-sm flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                            >
                                <FaFolder /> <span className="hidden sm:inline">All Cases</span>
                            </Link>
                            <Link
                                href="/cases?new=true"
                                className="bg-amber-600 text-white font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-amber-700 transition-all shadow-md flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                            >
                                <FaPlus /> <span className="hidden sm:inline">New Case</span>
                                <span className="sm:hidden">New</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:py-8">
                    <div className="max-w-7xl mx-auto">
                    {/* Header with View Toggle */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                                <FaGavel className="text-amber-600" />
                                All Cases
                            </h2>
                            <p className="text-slate-600 text-sm mt-1">
                                {filteredCases.length} {filteredCases.length === 1 ? "case" : "cases"}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* View Toggle */}
                            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={() => setViewType("table")}
                                    className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-2 text-sm font-medium ${
                                        viewType === "table"
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    <FaTable /> Table
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewType("grid")}
                                    className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-2 text-sm font-medium ${
                                        viewType === "grid"
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    <FaTh /> Grid
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar (only for table view) */}
                    {viewType === "table" && (
                        <div className="mb-6">
                            <div className="relative max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search cases by title, case number, work to be done, or court..."
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                    >
                                        <span className="text-xl">×</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Table View */}
                    {viewType === "table" && !loading && (
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            {filteredCases.length === 0 ? (
                                <div className="p-12 text-center">
                                    <FaFileAlt className="text-4xl text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-600 text-sm">
                                        {searchQuery.trim() ? `No cases found matching "${searchQuery}"` : "No cases yet"}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Title</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Case Number</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Court</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Work to be Done</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Updated</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {displayedCases.map((c) => (
                                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <Link
                                                                href={`/cases/${c.id}`}
                                                                className="text-sm font-semibold text-slate-900 hover:text-amber-600 transition"
                                                            >
                                                                {c.title}
                                                            </Link>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="text-sm text-slate-600">
                                                                {c.caseNumber || "—"}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {c.status && (
                                                                <span
                                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                        c.status === "active"
                                                                            ? "bg-green-100 text-green-800"
                                                                            : c.status === "closed"
                                                                            ? "bg-gray-100 text-gray-800"
                                                                            : c.status === "pending"
                                                                            ? "bg-yellow-100 text-yellow-800"
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
                                                            <Link
                                                                href={`/cases/${c.id}`}
                                                                className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                                                            >
                                                                View →
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {hasMore && (
                                        <div ref={observerTarget} className="py-4 text-center">
                                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Grid View */}
                    {viewType === "grid" && !loading && (
                        <>
                            {filteredCases.length === 0 ? (
                                <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                                    <FaFileAlt className="text-4xl text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-600 text-sm">
                                        {searchQuery.trim() ? `No cases found matching "${searchQuery}"` : "No cases yet"}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {displayedCases.map((c) => (
                                            <Link
                                                key={c.id}
                                                href={`/cases/${c.id}`}
                                                className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-lg hover:border-amber-500 transition-all group"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-amber-600 transition line-clamp-2 flex-1">
                                                        {c.title}
                                                    </h4>
                                                    {c.status && (
                                                        <span
                                                            className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                                                                c.status === "active"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : c.status === "closed"
                                                                    ? "bg-gray-100 text-gray-800"
                                                                    : c.status === "pending"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : "bg-orange-100 text-orange-800"
                                                            }`}
                                                        >
                                                            {c.status}
                                                        </span>
                                                    )}
                                                </div>
                                                {c.caseNumber && (
                                                    <p className="text-xs text-slate-500 mb-1.5">#{c.caseNumber}</p>
                                                )}
                                                <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                                                    {c.description}
                                                </p>
                                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                                    <span className="text-xs text-slate-400">
                                                        {c.updatedAt
                                                            ? `Updated ${new Date(c.updatedAt).toLocaleDateString()}`
                                                            : c.createdAt
                                                            ? `Created ${new Date(c.createdAt).toLocaleDateString()}`
                                                            : "No date"}
                                                    </span>
                                                    <span className="text-xs text-amber-600 font-medium group-hover:translate-x-1 transition-transform">
                                                        View →
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                    {hasMore && (
                                        <div ref={observerTarget} className="py-6 text-center">
                                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* Empty State */}
                    {!loading && cases.length === 0 && !error && (
                        <div className="mt-8 sm:mt-12 text-center">
                            <FaFileAlt className="text-4xl sm:text-5xl text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">No cases yet</h3>
                            <p className="text-slate-600 text-sm sm:text-base mb-4">Create your first case to get started</p>
                            <Link
                                href="/cases?new=true"
                                className="inline-flex items-center gap-2 bg-amber-600 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-amber-700 transition shadow-md"
                            >
                                <FaPlus /> Create Your First Case
                            </Link>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="mt-8 sm:mt-12 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="mt-8 sm:mt-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                            <p className="mt-2 text-slate-600 text-sm">Loading cases...</p>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
