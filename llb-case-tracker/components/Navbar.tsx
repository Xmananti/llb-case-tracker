"use client";
import React from "react";
import { useAuth } from "../hooks/useAuth";
import Link from "next/link";
import { FaGavel, FaSignOutAlt } from "react-icons/fa";

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-slate-900 text-white px-6 py-4 shadow-lg border-b-2 border-amber-500">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/dashboard" className="text-xl font-bold flex items-center gap-2">
                    <FaGavel className="text-amber-400" />
                    <span>LLB Case Tracker</span>
                </Link>
                <div className="flex items-center gap-4">
                    {user && (
                        <>
                            <span className="text-sm text-slate-300">{user.email}</span>
                            <button
                                onClick={() => logout()}
                                className="bg-amber-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-amber-700 transition-colors shadow-md flex items-center gap-2"
                            >
                                <FaSignOutAlt /> Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
