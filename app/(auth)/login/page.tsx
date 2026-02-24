"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaGavel } from "react-icons/fa";
import { getAuthErrorMessage } from "../../../lib/utils/auth-errors";

const schema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormData = z.infer<typeof schema>;

const LoginPage: React.FC = () => {
    const { login, loginWithGoogle } = useAuth();
    const router = useRouter();
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setServerError("");
        try {
            await login(data.email, data.password);
            router.push("/dashboard");
        } catch (err: unknown) {
            setServerError(getAuthErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const onGoogleSignIn = async () => {
        setGoogleLoading(true);
        setServerError("");
        try {
            await loginWithGoogle();
            router.push("/dashboard");
        } catch (err: unknown) {
            setServerError(getAuthErrorMessage(err));
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Gradient background – lawyer palette (slate + amber) */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/95 via-white to-amber-50/90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/30 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-slate-100/40 via-transparent to-transparent" />
            {/* Soft noise / texture overlay for depth */}
            <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />

            {/* Glass card */}
            <div className="relative w-full max-w-md rounded-[22px] p-6 sm:p-8 lg:p-10 bg-white/70 dark:bg-white/60 backdrop-blur-xl shadow-2xl shadow-black/5 border border-white/60 dark:border-white/20">
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/80 shadow-lg shadow-black/5 border border-white/60 mb-4">
                        <FaGavel className="text-xl sm:text-2xl text-amber-600" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">Welcome back</h1>
                    <p className="text-sm text-slate-500 mt-1.5">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <input
                            type="email"
                            className="w-full rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition shadow-sm"
                            {...register("email")}
                            autoComplete="email"
                            placeholder="you@example.com"
                            required
                        />
                        {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                        <input
                            type="password"
                            className="w-full rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition shadow-sm"
                            {...register("password")}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            required
                        />
                        {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
                    </div>
                    {serverError && (
                        <div className="rounded-xl bg-red-50/90 border border-red-200/80 px-4 py-3 text-sm text-red-700">
                            {serverError}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-3.5 font-medium text-sm shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                    <div className="relative py-2">
                        <span className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200/80" />
                        </span>
                        <span className="relative flex justify-center text-xs font-medium text-slate-400 bg-transparent px-3">or continue with</span>
                    </div>

                    <button
                        type="button"
                        onClick={onGoogleSignIn}
                        disabled={googleLoading || loading}
                        className="w-full rounded-xl border border-slate-200 bg-white/80 hover:bg-slate-50/90 py-3 font-medium text-slate-700 text-sm flex items-center justify-center gap-3 transition shadow-sm hover:shadow-md hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {googleLoading ? "Signing in..." : "Google"}
                    </button>

                    <p className="text-center pt-1">
                        <Link href="/forgot-password" className="text-sm font-medium text-slate-600 hover:text-amber-600 transition">
                            Forgot password?
                        </Link>
                    </p>
                </form>

                <p className="mt-6 pt-6 border-t border-slate-200/80 text-center text-sm text-slate-500">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-semibold text-slate-700 hover:text-amber-600 transition">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;