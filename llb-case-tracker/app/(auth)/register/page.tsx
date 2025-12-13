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
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
});

type FormData = z.infer<typeof schema>;

const RegisterPage: React.FC = () => {
    const { register: registerUser } = useAuth();
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
            await registerUser(data.email, data.password);
            router.push("/dashboard");
        } catch (err: unknown) {
            let message = "Registration failed";
            if (err instanceof Error) message = err.message;
            setServerError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl border-t-4 border-amber-500">
                <div className="text-center mb-6">
                    <FaGavel className="text-4xl text-amber-600 mx-auto mb-2" />
                    <h2 className="text-2xl font-bold text-slate-900">Register for LLB Case Tracker</h2>
                    <p className="text-sm text-slate-600 mt-2">Create your account to get started</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                            {...register("email")}
                            autoComplete="email"
                            required
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                            {...register("password")}
                            autoComplete="new-password"
                            required
                        />
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                            {...register("confirmPassword")}
                            autoComplete="new-password"
                            required
                        />
                        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
                    </div>
                    {serverError && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{serverError}</div>}
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-slate-900 py-3 font-semibold text-white hover:bg-slate-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-600">
                    Already have an account? <a href="/login" className="text-amber-600 hover:text-amber-700 font-semibold hover:underline">Sign in</a>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;