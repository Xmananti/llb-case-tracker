"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getCases } from "../../../lib/api-client";
import { FaGavel, FaPlus, FaSearch, FaFileAlt, FaClock, FaFolder, FaChartBar, FaCalendarAlt } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CaseDoc {
    id: string;
    title: string;
    description: string;
    updatedAt?: string;
    createdAt?: string;
    caseNumber?: string;
    status?: string;
    nextHearingDate?: string;
}

type TimeRange = "all" | "last7" | "last30" | "last90";

const DashboardHome: React.FC = () => {
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [cases, setCases] = useState<CaseDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [recentCases, setRecentCases] = useState<CaseDoc[]>([]);
    const [timeRange, setTimeRange] = useState<TimeRange>("all");
    const searchInputRef = useRef<HTMLInputElement>(null);

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
                }));

                setCases(casesData);

                // Sort by updatedAt (most recent first) and take top 4
                const sorted = [...casesData].sort((a, b) => {
                    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
                    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
                    return bTime - aTime;
                });
                setRecentCases(sorted.slice(0, 4));
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/cases?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const isInRange = (dateStr: string | undefined, range: TimeRange) => {
        if (range === "all") return true;
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

        if (range === "last7") return diffDays <= 7;
        if (range === "last30") return diffDays <= 30;
        if (range === "last90") return diffDays <= 90;
        return true;
    };

    const filteredCasesByRange = useMemo(() => {
        if (timeRange === "all") return cases;
        return cases.filter(c => isInRange(c.updatedAt || c.createdAt, timeRange));
    }, [cases, timeRange]);

    const filteredRecentCases = recentCases
        .filter(c =>
            searchQuery.trim() === "" ||
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter(c => isInRange(c.updatedAt || c.createdAt, timeRange));

    // Prepare chart data
    const statusColors: { [key: string]: string } = {
        active: "#10b981", // green
        pending: "#f59e0b", // yellow/amber
        on_hold: "#f97316", // orange
        closed: "#6b7280", // gray
    };

    // Status distribution data
    const statusData = useMemo(() => {
        const statusCounts: { [key: string]: number } = {};
        filteredCasesByRange.forEach(c => {
            const status = c.status || "unknown";
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        return Object.entries(statusCounts).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1).replace("_", " "),
            value,
            color: statusColors[name] || "#94a3b8",
        }));
    }, [filteredCasesByRange]);

    // Upcoming hearings data (next 7 days)
    const upcomingHearings = useMemo(() => {
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        return filteredCasesByRange
            .filter(c => {
                if (!c.nextHearingDate) return false;
                const hearingDate = new Date(c.nextHearingDate);
                return hearingDate >= now && hearingDate <= nextWeek;
            })
            .map(c => ({
                name: c.title.length > 20 ? c.title.substring(0, 20) + "..." : c.title,
                date: c.nextHearingDate ? new Date(c.nextHearingDate).toLocaleDateString() : "",
                fullDate: c.nextHearingDate,
                caseNumber: c.caseNumber || "",
                status: c.status || "active",
            }))
            .sort((a, b) => {
                const dateA = a.fullDate ? new Date(a.fullDate).getTime() : 0;
                const dateB = b.fullDate ? new Date(b.fullDate).getTime() : 0;
                return dateA - dateB;
            })
            .slice(0, 5); // Top 5 upcoming
    }, [filteredCasesByRange]);

    return (
        <div className="min-h-screen flex flex-col">
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

            {/* Main Content Area - Google Style */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
                <div className="w-full max-w-2xl mx-auto">
                    {/* Logo/Brand */}
                    <div className="text-center mb-8 sm:mb-12">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <FaGavel className="text-amber-600 text-4xl sm:text-5xl lg:text-6xl" />
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">Case Search</h2>
                        </div>
                        <p className="text-slate-600 text-sm sm:text-base">Search your legal cases quickly</p>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mb-8 sm:mb-12">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                <FaSearch className="text-slate-400 text-lg sm:text-xl" />
                            </div>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search cases by title, description, or case number..."
                                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-lg hover:shadow-xl transition-shadow"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        searchInputRef.current?.focus();
                                    }}
                                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-slate-400 hover:text-slate-600"
                                >
                                    <span className="text-xl">×</span>
                                </button>
                            )}
                        </div>
                        <div className="flex justify-center gap-2 sm:gap-4 mt-4">
                            <button
                                type="submit"
                                className="bg-slate-100 text-slate-700 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-slate-200 transition font-medium text-xs sm:text-sm shadow-sm"
                            >
                                Case Search
                            </button>
                            <Link
                                href="/cases"
                                className="bg-slate-100 text-slate-700 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-slate-200 transition font-medium text-xs sm:text-sm shadow-sm"
                            >
                                View All Cases
                            </Link>
                        </div>
                    </form>

                    {/* Recently Edited Cases */}
                    {!loading && recentCases.length > 0 && (
                        <div className="mt-8 sm:mt-12 w-full">
                            {/* Time range filters */}
                            <div className="flex justify-end mb-3 gap-2 text-xs sm:text-sm">
                                {[
                                    { id: "all", label: "All" },
                                    { id: "last7", label: "Last 7 days" },
                                    { id: "last30", label: "Last 30 days" },
                                    { id: "last90", label: "Last 90 days" },
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setTimeRange(opt.id as TimeRange)}
                                        className={`px-2 py-1 rounded-full border transition-colors ${timeRange === opt.id
                                            ? "bg-amber-600 text-white border-amber-600"
                                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 flex items-center gap-2">
                                    <FaClock className="text-amber-600" />
                                    Recently Edited Cases
                                </h3>
                                <Link
                                    href="/cases"
                                    className="text-xs sm:text-sm text-amber-600 hover:text-amber-700 font-medium"
                                >
                                    View all →
                                </Link>
                            </div>

                            {filteredRecentCases.length === 0 && searchQuery.trim() ? (
                                <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
                                    <FaFileAlt className="text-3xl text-slate-400 mx-auto mb-2" />
                                    <p className="text-slate-600 text-sm">No cases found matching "{searchQuery}"</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                    {filteredRecentCases.map(c => (
                                        <Link
                                            key={c.id}
                                            href={`/cases/${c.id}`}
                                            className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 hover:shadow-lg hover:border-amber-500 transition-all group"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-amber-600 transition line-clamp-2 flex-1">
                                                    {c.title}
                                                </h4>
                                                {c.status && (
                                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${c.status === "active" ? "bg-green-100 text-green-800" :
                                                        c.status === "closed" ? "bg-gray-100 text-gray-800" :
                                                            c.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                                                "bg-orange-100 text-orange-800"
                                                        }`}>
                                                        {c.status}
                                                    </span>
                                                )}
                                            </div>
                                            {c.caseNumber && (
                                                <p className="text-xs text-slate-500 mb-1.5">#{c.caseNumber}</p>
                                            )}
                                            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-2">
                                                {c.description}
                                            </p>
                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                                <span className="text-xs text-slate-400">
                                                    {c.updatedAt
                                                        ? `Updated ${new Date(c.updatedAt).toLocaleDateString()}`
                                                        : c.createdAt
                                                            ? `Created ${new Date(c.createdAt).toLocaleDateString()}`
                                                            : "No date"
                                                    }
                                                </span>
                                                <span className="text-xs text-amber-600 font-medium group-hover:translate-x-1 transition-transform">
                                                    View →
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Charts Section */}
                    {!loading && cases.length > 0 && (
                        <div className="mt-8 sm:mt-12 w-full space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                {/* Case Status Distribution */}
                                <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FaChartBar className="text-amber-600 text-lg sm:text-xl" />
                                        <h3 className="text-base sm:text-lg font-semibold text-slate-900">Case Status Distribution</h3>
                                    </div>
                                    {statusData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    data={statusData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {statusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-center py-8 text-slate-500 text-sm">No status data available</div>
                                    )}
                                </div>

                                {/* Upcoming Hearings */}
                                <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FaCalendarAlt className="text-amber-600 text-lg sm:text-xl" />
                                        <h3 className="text-base sm:text-lg font-semibold text-slate-900">Upcoming Hearings (Next 7 Days)</h3>
                                    </div>
                                    {upcomingHearings.length > 0 ? (
                                        <div className="space-y-3">
                                            {upcomingHearings.map((hearing, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-amber-500 transition bg-slate-50"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-slate-900 truncate">{hearing.name}</p>
                                                        {hearing.caseNumber && (
                                                            <p className="text-xs text-slate-500">#{hearing.caseNumber}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1 ml-3">
                                                        <span className="text-xs sm:text-sm font-medium text-amber-700">{hearing.date}</span>
                                                        <span
                                                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${hearing.status === "active"
                                                                ? "bg-green-100 text-green-800"
                                                                : hearing.status === "pending"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : hearing.status === "on_hold"
                                                                        ? "bg-orange-100 text-orange-800"
                                                                        : "bg-gray-100 text-gray-800"
                                                                }`}
                                                        >
                                                            {hearing.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-500 text-sm">
                                            <FaCalendarAlt className="text-3xl text-slate-400 mx-auto mb-2" />
                                            <p>No upcoming hearings in the next 7 days</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status Bar Chart */}
                            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <FaChartBar className="text-amber-600 text-lg sm:text-xl" />
                                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">Cases by Status</h3>
                                </div>
                                {statusData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={statusData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center py-8 text-slate-500 text-sm">No status data available</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && recentCases.length === 0 && !error && (
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
    );
};

export default DashboardHome;
