"use client";
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

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <ProtectedRoute>
            <Navbar />
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 px-4 py-8 md:px-12">{children}</main>
            </div>
        </ProtectedRoute>
    );
}

