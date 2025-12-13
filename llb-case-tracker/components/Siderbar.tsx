"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChartBar, FaFolder, FaUser } from "react-icons/fa";

const Sidebar: React.FC = () => {
    const pathname = usePathname();

    const links = [
        { href: "/dashboard", label: "Dashboard", icon: FaChartBar },
        { href: "/cases", label: "Cases", icon: FaFolder },
        { href: "/profile", label: "Profile", icon: FaUser },
    ];

    return (
        <aside className="bg-white h-screen w-64 shrink-0 border-r border-slate-200 shadow-sm">
            <nav className="flex flex-col p-4 space-y-2">
                {links.map((link) => {
                    const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                ? "bg-slate-900 text-white shadow-md border-l-4 border-amber-500"
                                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                        >
                            <link.icon className="text-lg" />
                            <span className="font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;
