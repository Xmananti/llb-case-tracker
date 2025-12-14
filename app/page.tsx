"use client";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const HomeRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [user, loading, router]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="animate-spin h-10 w-10 border-4 border-blue-400 border-t-transparent rounded-full"></span>
    </div>
  );
};
export default HomeRedirect;
