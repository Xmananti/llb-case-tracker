"use client";
import React from "react";
import { useAuth } from "../hooks/useAuth";
import Link from "next/link";
import { FaGavel, FaSignOutAlt, FaBars } from "react-icons/fa";

interface NavbarProps {
    onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
    const { user, userData, logout } = useAuth();
    const firmName = userData?.firmName || "AdvocatePro";
    const logoUrl = userData?.logoUrl;

    return (
        <nav className="bg-slate-900 text-white py-3 sm:py-4 shadow-lg border-b-2 border-amber-500 sticky top-0 z-50">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 md:pl-8 lg:pl-12">
                    <button
                        onClick={onMenuClick}
                        className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition flex-shrink-0"
                        aria-label="Toggle menu"
                    >
                        <FaBars className="text-xl" />
                    </button>
                    <Link href="/dashboard" className="text-lg sm:text-xl font-bold flex items-center gap-2">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={firmName}
                                className="h-8 w-8 sm:h-10 sm:w-10 object-contain flex-shrink-0 bg-white rounded p-1"
                            />
                        ) : (
                            <FaGavel className="text-amber-400 flex-shrink-0 text-xl sm:text-2xl" />
                        )}
                        <span className="hidden sm:inline truncate max-w-[200px] lg:max-w-none">{firmName}</span>
                        <span className="sm:hidden truncate max-w-[100px]">{firmName.length > 10 ? firmName.substring(0, 10) + "..." : firmName}</span>
                    </Link>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 pr-2 sm:pr-4 md:pr-8 lg:pr-12">
                    {user && (
                        <>
                            <span className="text-xs sm:text-sm text-slate-300 hidden sm:inline truncate max-w-[150px] lg:max-w-none">
                                {user.email}
                            </span>
                            <button
                                onClick={() => logout()}
                                className="bg-amber-600 text-white font-semibold rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 hover:bg-amber-700 transition-colors shadow-md flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap"
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
