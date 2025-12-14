"use client";
import React, { useState, useRef } from "react";

interface FileUploaderProps {
    onUpload: (file: File) => Promise<void>;
    accept?: string;
    maxSize?: number; // in MB
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, accept = "*", maxSize = 10 }) => {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            await handleFile(file);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await handleFile(file);
        }
    };

    const handleFile = async (file: File) => {
        if (file.size > maxSize * 1024 * 1024) {
            alert(`File size must be less than ${maxSize}MB`);
            return;
        }
        setUploading(true);
        try {
            await onUpload(file);
        } catch {
            alert("Upload failed");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
            />
            <p className="text-gray-600 mb-2">
                {dragging ? "Drop file here" : "Drag & drop file here or"}
            </p>
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {uploading ? "Uploading..." : "Browse Files"}
            </button>
            <p className="text-xs text-gray-500 mt-2">Max size: {maxSize}MB</p>
        </div>
    );
};

export default FileUploader;
