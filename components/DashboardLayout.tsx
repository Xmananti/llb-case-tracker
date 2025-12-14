"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Sidebar from "./Siderbar";
import ProtectedRoute from "./ProtectedRoute";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <ProtectedRoute>
            <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <div className="flex min-h-screen relative">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
                <main className="flex-1 px-2 py-4 sm:px-4 sm:py-6 md:px-8 lg:px-12 w-full min-w-0">{children}</main>
            </div>
        </ProtectedRoute>
    );
}

