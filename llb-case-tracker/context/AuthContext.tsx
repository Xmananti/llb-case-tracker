"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase/config';

interface UserData {
    uid: string;
    email: string | null;
    name?: string;
    organizationId?: string;
    role?: "owner" | "admin" | "lawyer" | "assistant" | "viewer";
    organization?: any;
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: (onSuccess?: () => void) => Promise<void>;
    register: (email: string, password: string, organizationId?: string, role?: string) => Promise<void>;
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async (uid: string) => {
        try {
            const res = await fetch(`/api/users/${uid}`);
            if (res.ok) {
                const data = await res.json();
                setUserData(data);
            } else {
                // If API fails, use basic user data from Firebase Auth
                console.warn("API returned non-OK status, using basic user data");
                setUserData({
                    uid,
                    email: null,
                    name: undefined,
                    organizationId: undefined,
                    role: "lawyer",
                });
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            // Fallback to basic user data to prevent app crash
            setUserData({
                uid,
                email: null,
                name: undefined,
                organizationId: undefined,
                role: "lawyer",
            });
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                await fetchUserData(user.uid);
            } else {
                setUserData(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const refreshUserData = async () => {
        if (user) {
            await fetchUserData(user.uid);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            // Provide helpful error messages for network issues
            if (error?.code === "auth/network-request-failed") {
                throw new Error(
                    "Network error: Unable to connect to Firebase. Please check:\n" +
                    "1. Your internet connection\n" +
                    "2. Firebase API key restrictions in Firebase Console\n" +
                    "3. Browser console for CORS errors"
                );
            }
            throw error;
        }
    };
    const logout = async (onSuccess?: () => void) => {
        try {
            await signOut(auth);
            if (onSuccess) onSuccess();
        } catch (err) {
            // Could show error toast if needed in future
            console.error("Logout failed", err);
        }
    };
    const register = async (email: string, password: string, organizationId?: string, role?: string) => {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);

        // Register with organization if provided
        if (organizationId) {
            await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    organizationId,
                    role: role || "lawyer",
                }),
            });
        }

        // Refresh user data after registration
        if (userCred.user) {
            await fetchUserData(userCred.user.uid);
        }
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, login, logout, register, refreshUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
