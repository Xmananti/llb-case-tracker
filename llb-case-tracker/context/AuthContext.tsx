"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase/config';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: (onSuccess?: () => void) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
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
    const register = async (email: string, password: string) => {
        await createUserWithEmailAndPassword(auth, email, password);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
