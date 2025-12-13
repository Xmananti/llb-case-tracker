"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getCases } from "../../../lib/api-client";
import { FaFileAlt, FaPlus } from "react-icons/fa";
import Link from "next/link";

interface CaseDoc {
    id: string;
    title: string;
    description: string;
}

const DashboardHome: React.FC = () => {
    const { user } = useAuth();
    const [cases, setCases] = useState<CaseDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (!user) {
            setLoading(false);
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
                    [key: string]: unknown;
                }>;
                setCases(
                    data.map((c) => ({
                        id: c.id,
                        title: c.title,
                        description: c.description,
                    }))
                );
            } catch (err) {
                console.error("Error fetching cases:", err);
                setError("Failed to fetch cases");
            } finally {
                setLoading(false);
            }
        };
        fetchCases();
    }, [user]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-1">Welcome to Your Dashboard</h1>
                <p className="text-slate-600 text-sm">Manage your legal cases, documents, and hearings</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-amber-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{cases.length}</h2>
                        <p className="text-slate-600 text-sm">Active Case{cases.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Link
                        className="bg-slate-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
                        href="/cases"
                    >
                        <FaPlus /> Add New Case
                    </Link>
                </div>
            </div>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
                    <p className="mt-2 text-slate-600 text-sm">Loading cases...</p>
                </div>
            ) : cases.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-slate-300">
                    <FaFileAlt className="text-4xl text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 mb-3">No cases to show. Create your first case!</p>
                    <Link href="/cases" className="inline-block bg-slate-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition text-sm">Create Case</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cases.map(c => (
                        <div key={c.id} className="legal-card p-4 rounded-lg hover:shadow-lg transition-all cursor-pointer group">
                            <Link href={`/cases/${c.id}`} className="block">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-700 flex-1 line-clamp-2">{c.title}</h3>
                                    <span className="text-amber-600 text-xs font-semibold ml-2">View →</span>
                                </div>
                                <p className="text-slate-600 text-xs mb-3 line-clamp-2">{c.description}</p>
                                <div className="pt-2 border-t border-slate-200">
                                    <span className="text-slate-500 text-xs">Click to view details</span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default DashboardHome;