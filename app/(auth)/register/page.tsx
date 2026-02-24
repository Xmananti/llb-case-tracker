"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { FaGavel } from "react-icons/fa";
import { getAuthErrorMessage } from "../../../lib/utils/auth-errors";

const schema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
});

type FormData = z.infer<typeof schema>;

const RegisterPage: React.FC = () => {
    const { register: registerUser, loginWithGoogle } = useAuth();
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
            await registerUser(data.email, data.password);
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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-4 sm:p-6 lg:p-8 shadow-xl border-t-4 border-amber-500">
                <div className="text-center mb-4 sm:mb-6">
                    <FaGavel className="text-3xl sm:text-4xl text-amber-600 mx-auto mb-2" />
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Create Account</h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2">Create your account to get started</p>
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
                            autoComplete="new-password"
                            required
                        />
                        {errors.password && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password.message}</p>}
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            className="mt-1 w-full rounded border border-slate-300 px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                            {...register("confirmPassword")}
                            autoComplete="new-password"
                            required
                        />
                        {errors.confirmPassword && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.confirmPassword.message}</p>}
                    </div>
                    {serverError && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs sm:text-sm text-red-700">{serverError}</div>}
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-slate-900 py-2.5 sm:py-3 font-semibold text-white hover:bg-slate-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                    <div className="relative my-4">
                        <span className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-300" />
                        </span>
                        <span className="relative flex justify-center text-xs font-medium text-slate-500 bg-white px-2">or</span>
                    </div>
                    <button
                        type="button"
                        onClick={onGoogleSignIn}
                        disabled={googleLoading || loading}
                        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 sm:py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {googleLoading ? "Signing up..." : "Continue with Google"}
                    </button>
                </form>
                <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-slate-600">
                    Already have an account? <a href="/login" className="text-amber-600 hover:text-amber-700 font-semibold hover:underline">Sign in</a>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;