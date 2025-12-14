"use client";
import React from "react";
import { useUI } from "../context/UIContext";

const Notification: React.FC = () => {
    const { notifications, removeNotification } = useUI();

    const getBgColor = (type: string) => {
        switch (type) {
            case "success":
                return "bg-green-500";
            case "error":
                return "bg-red-500";
            case "warning":
                return "bg-yellow-500";
            default:
                return "bg-blue-500";
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`${getBgColor(notification.type)} text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-between min-w-[300px] max-w-md transition-all duration-300 ease-in-out`}
                >
                    <p className="flex-1">{notification.message}</p>
                    <button
                        onClick={() => removeNotification(notification.id)}
                        className="ml-4 text-white hover:text-gray-200 font-bold"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Notification;

