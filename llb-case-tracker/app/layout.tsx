import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { UIProvider } from "../context/UIContext";
import Notification from "../components/Notification";
import DashboardLayout from "../components/DashboardLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LLB Case Tracker - Legal Case Management System",
  description: "Professional legal case tracking and management system for law firms",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 min-h-screen`}
      >
        <AuthProvider>
          <UIProvider>
            <DashboardLayout>{children}</DashboardLayout>
            <Notification />
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
