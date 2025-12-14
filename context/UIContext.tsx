"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

interface Notification {
    id: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
    duration?: number;
}

interface UIContextType {
    notifications: Notification[];
    addNotification: (message: string, type?: Notification["type"], duration?: number) => void;
    removeNotification: (id: string) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const addNotification = useCallback((message: string, type: Notification["type"] = "info", duration = 3000) => {
        const id = Date.now().toString();
        const notification: Notification = { id, message, type, duration };
        setNotifications(prev => [...prev, notification]);
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    }, [removeNotification]);

    return (
        <UIContext.Provider value={{ notifications, addNotification, removeNotification, sidebarOpen, setSidebarOpen }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error("useUI must be used within UIProvider");
    return context;
};

