"use client";
import React from "react";
import { useAuth } from "../hooks/useAuth";
import Link from "next/link";
import { FaGavel, FaSignOutAlt, FaBars } from "react-icons/fa";

interface NavbarProps {
    onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-slate-900 text-white px-3 sm:px-6 py-3 sm:py-4 shadow-lg border-b-2 border-amber-500 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={onMenuClick}
                        className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition"
                        aria-label="Toggle menu"
                    >
                        <FaBars className="text-xl" />
                    </button>
                    <Link href="/dashboard" className="text-lg sm:text-xl font-bold flex items-center gap-2">
                        <FaGavel className="text-amber-400" />
                        <span className="hidden sm:inline">LLB Case Tracker</span>
                        <span className="sm:hidden">LLB</span>
                    </Link>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    {user && (
                        <>
                            <span className="text-xs sm:text-sm text-slate-300 hidden sm:inline truncate max-w-[150px] lg:max-w-none">
                                {user.email}
                            </span>
                            <button
                                onClick={() => logout()}
                                className="bg-amber-600 text-white font-semibold rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 hover:bg-amber-700 transition-colors shadow-md flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                            >
                                <FaSignOutAlt /> <span className="hidden sm:inline">Logout</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
