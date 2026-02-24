"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";
import { FaGavel } from "react-icons/fa";
import { getAuthErrorMessage } from "../../../lib/utils/auth-errors";

const schema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
});

type FormData = z.infer<typeof schema>;

const ForgotPasswordPage: React.FC = () => {
    const { forgotPassword } = useAuth();
    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setServerError("");
        setSuccess(false);
        try {
            await forgotPassword(data.email);
            setSuccess(true);
        } catch (err: unknown) {
            const error = err as { code?: string };
            if (error.code === "auth/user-not-found") {
                setServerError("No account found with this email. Please register first.");
            } else if (error.code === "auth/invalid-email") {
                setServerError("Invalid email address.");
            } else {
                setServerError(getAuthErrorMessage(err));
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                <div className="w-full max-w-md rounded-lg bg-white p-4 sm:p-6 lg:p-8 shadow-xl border-t-4 border-amber-500">
                    <div className="text-center mb-4 sm:mb-6">
                        <FaGavel className="text-3xl sm:text-4xl text-amber-600 mx-auto mb-2" />
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Check your email</h2>
                        <p className="text-xs sm:text-sm text-slate-600 mt-2">
                            We&apos;ve sent a password reset link to your email. Click the link to set a new password.
                        </p>
                    </div>
                    <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs sm:text-sm text-green-700 mb-4">
                        If you don&apos;t see the email, check your spam folder.
                    </div>
                    <p className="text-center text-xs sm:text-sm text-slate-600">
                        <Link href="/login" className="text-amber-600 hover:text-amber-700 font-semibold hover:underline">
                            Back to Sign in
                        </Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-4 sm:p-6 lg:p-8 shadow-xl border-t-4 border-amber-500">
                <div className="text-center mb-4 sm:mb-6">
                    <FaGavel className="text-3xl sm:text-4xl text-amber-600 mx-auto mb-2" />
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Forgot password</h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2">
                        Enter your email and we&apos;ll send you a link to reset your password.
                    </p>
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
                    {serverError && (
                        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs sm:text-sm text-red-700">
                            {serverError}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-slate-900 py-2.5 sm:py-3 font-semibold text-white hover:bg-slate-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send reset link"}
                    </button>
                </form>
                <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-slate-600">
                    Remember your password?{" "}
                    <Link href="/login" className="text-amber-600 hover:text-amber-700 font-semibold hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
