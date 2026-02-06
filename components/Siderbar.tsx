"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChartBar, FaFolder, FaUser, FaTimes, FaBuilding, FaUsers } from "react-icons/fa";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
    const pathname = usePathname();

    const links = [
        { href: "/dashboard", label: "Dashboard", icon: FaChartBar },
        { href: "/cases", label: "Cases", icon: FaFolder },
        { href: "/clients", label: "Clients", icon: FaUsers },
        // { href: "/admin", label: "Admin", icon: FaBuilding }, // Hidden for now
        { href: "/profile", label: "Profile", icon: FaUser },
    ];

    return (
        <>
            <aside className={`bg-white w-64 shrink-0 border-r border-slate-200 shadow-sm fixed md:static z-50 transform transition-transform duration-300 ease-in-out flex flex-col top-0 bottom-0 md:h-full ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                }`}>
                <div className="flex items-center justify-between p-4 border-b border-slate-200 md:hidden shrink-0">
                    <span className="font-bold text-slate-900">Menu</span>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition"
                        aria-label="Close menu"
                    >
                        <FaTimes />
                    </button>
                </div>
                <nav className="flex flex-col p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto flex-1">
                    {links.map((link) => {
                        const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={onClose}
                                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base shrink-0 ${isActive
                                    ? "bg-slate-900 text-white shadow-md border-l-4 border-amber-500"
                                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                    }`}
                            >
                                <link.icon className="text-base sm:text-lg" />
                                <span className="font-medium">{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
