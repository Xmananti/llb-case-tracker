import React from "react";

interface LoaderProps {
    size?: "sm" | "md" | "lg";
    fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ size = "md", fullScreen = false }) => {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
    };

    const loader = (
        <div className="flex items-center justify-center">
            <div
                className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
            />
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
                {loader}
            </div>
        );
    }

    return loader;
};

export default Loader;
