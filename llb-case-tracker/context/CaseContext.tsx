"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth as useAuthContext } from "./AuthContext";
import { getCasesByUser } from "../lib/firebase/firestore";

interface Case {
    id: string;
    title: string;
    description: string;
    userId: string;
}

interface CaseContextType {
    cases: Case[];
    loading: boolean;
    refreshCases: () => Promise<void>;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export const CaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuthContext();
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshCases = useCallback(async () => {
        if (!user) {
            setCases([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await getCasesByUser(user.uid);
            setCases(data as Case[]);
        } catch {
            setCases([]);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        let cancelled = false;
        const loadCases = async () => {
            if (!user) {
                if (!cancelled) {
                    setCases([]);
                    setLoading(false);
                }
                return;
            }
            if (!cancelled) {
                setLoading(true);
            }
            try {
                const data = await getCasesByUser(user.uid);
                if (!cancelled) {
                    setCases(data as Case[]);
                    setLoading(false);
                }
            } catch {
                if (!cancelled) {
                    setCases([]);
                    setLoading(false);
                }
            }
        };
        loadCases();
        return () => {
            cancelled = true;
        };
    }, [user]);

    return (
        <CaseContext.Provider value={{ cases, loading, refreshCases }}>
            {children}
        </CaseContext.Provider>
    );
};

export const useCaseContext = () => {
    const context = useContext(CaseContext);
    if (!context) throw new Error("useCaseContext must be used within CaseProvider");
    return context;
};

