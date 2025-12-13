"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { FaGavel } from "react-icons/fa";

const schema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormData = z.infer<typeof schema>;

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const router = useRouter();
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
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
            const error = err as Error;
            setServerError(error.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-4 sm:p-6 lg:p-8 shadow-xl border-t-4 border-amber-500">
                <div className="text-center mb-4 sm:mb-6">
                    <FaGavel className="text-3xl sm:text-4xl text-amber-600 mx-auto mb-2" />
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Sign in to LLB Case Tracker</h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2">Legal Case Management System</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="mt-1 w-full rounded border border-slate-300 px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                            {...register("email")}
                            autoComplete="email"
                            required
                        />
                        {errors.email && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            className="mt-1 w-full rounded border border-slate-300 px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                            {...register("password")}
                            autoComplete="current-password"
                            required
                        />
                        {errors.password && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password.message}</p>}
                    </div>
                    {serverError && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs sm:text-sm text-red-700">{serverError}</div>}
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-slate-900 py-2.5 sm:py-3 font-semibold text-white hover:bg-slate-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
                <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-slate-600">
                    Don&apos;t have an account? <a href="/register" className="text-amber-600 hover:text-amber-700 font-semibold hover:underline">Register</a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;