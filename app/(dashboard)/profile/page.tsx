"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { updateProfile } from "firebase/auth";
import { uploadUserLogo, deleteFile } from "../../../lib/firebase/storage";

const ProfilePage: React.FC = () => {
    const { user, userData, logout, refreshUserData } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [firmEditMode, setFirmEditMode] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [firmName, setFirmName] = useState(userData?.firmName || "");
    const [message, setMessage] = useState("");
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (userData?.firmName) {
            setFirmName(userData.firmName);
        }
    }, [userData]);

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            await updateProfile(user, { displayName });
            setMessage("Display name updated.");
            setEditMode(false);
        } catch {
            setMessage("Failed to update profile.");
        }
    };

    const handleFirmNameUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            const response = await fetch(`/api/users/${user.uid}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firmName }),
            });
            if (response.ok) {
                setMessage("Legal Firm Name updated successfully.");
                setFirmEditMode(false);
                await refreshUserData();
            } else {
                setMessage("Failed to update Legal Firm Name.");
            }
        } catch {
            setMessage("Failed to update Legal Firm Name.");
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setMessage("Please upload an image file.");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMessage("Image size should be less than 5MB.");
            return;
        }

        setUploadingLogo(true);
        setMessage("");

        try {
            // Delete old logo if exists
            if (userData?.logoUrl) {
                try {
                    await deleteFile(userData.logoUrl);
                } catch (deleteError) {
                    console.warn("Could not delete old logo:", deleteError);
                }
            }

            // Upload new logo
            const { url } = await uploadUserLogo(user.uid, file);

            // Update user profile with new logo URL
            const response = await fetch(`/api/users/${user.uid}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ logoUrl: url }),
            });

            if (response.ok) {
                setMessage("Logo uploaded successfully.");
                await refreshUserData();
            } else {
                setMessage("Failed to update logo.");
            }
        } catch (error) {
            console.error("Logo upload error:", error);
            setMessage("Failed to upload logo. Please try again.");
        } finally {
            setUploadingLogo(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleLogoRemove = async () => {
        if (!user || !userData?.logoUrl) return;

        if (!confirm("Are you sure you want to remove your logo?")) return;

        try {
            // Delete logo from storage
            await deleteFile(userData.logoUrl);

            // Update user profile to remove logo URL
            const response = await fetch(`/api/users/${user.uid}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ logoUrl: "" }),
            });

            if (response.ok) {
                setMessage("Logo removed successfully.");
                await refreshUserData();
            } else {
                setMessage("Failed to remove logo.");
            }
        } catch (error) {
            console.error("Logo removal error:", error);
            setMessage("Failed to remove logo. Please try again.");
        }
    };
    return (
        <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-amber-500">
                <h1 className="text-3xl font-bold text-slate-900 mb-6">My Profile</h1>
                <div className="space-y-6">
                    <div className="pb-4 border-b border-slate-200">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                        <p className="text-slate-900 text-lg">{user?.email}</p>
                    </div>
                    <div className="pb-4 border-b border-slate-200">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Display Name</label>
                        {editMode ? (
                            <form className="flex items-center gap-2 mt-2" onSubmit={handleEdit}>
                                <input
                                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    required
                                />
                                <button type="submit" className="bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition font-semibold">Save</button>
                                <button type="button" className="bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-300 transition font-semibold" onClick={() => setEditMode(false)}>Cancel</button>
                            </form>
                        ) : (
                            <div className="flex items-center gap-2 mt-2">
                                <p className="text-slate-900 text-lg flex-1">{user?.displayName || <span className="italic text-slate-500">Not set</span>}</p>
                                <button className="text-amber-600 hover:text-amber-700 font-semibold underline" onClick={() => setEditMode(true)}>Edit</button>
                            </div>
                        )}
                    </div>
                    <div className="pb-4 border-b border-slate-200">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Legal Firm Name</label>
                        {firmEditMode ? (
                            <form className="flex items-center gap-2 mt-2" onSubmit={handleFirmNameUpdate}>
                                <input
                                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={firmName}
                                    onChange={e => setFirmName(e.target.value)}
                                    placeholder="Enter your legal firm name"
                                />
                                <button type="submit" className="bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition font-semibold">Save</button>
                                <button type="button" className="bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-300 transition font-semibold" onClick={() => {
                                    setFirmEditMode(false);
                                    setFirmName(userData?.firmName || "");
                                }}>Cancel</button>
                            </form>
                        ) : (
                            <div className="flex items-center gap-2 mt-2">
                                <p className="text-slate-900 text-lg flex-1">{userData?.firmName || <span className="italic text-slate-500">Not set</span>}</p>
                                <button className="text-amber-600 hover:text-amber-700 font-semibold underline" onClick={() => setFirmEditMode(true)}>Edit</button>
                            </div>
                        )}
                    </div>
                    <div className="pb-4 border-b border-slate-200">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Firm Logo</label>
                        <div className="mt-2 flex items-center gap-4">
                            {userData?.logoUrl ? (
                                <div className="flex items-center gap-4">
                                    <img
                                        src={userData.logoUrl}
                                        alt="Firm Logo"
                                        className="w-20 h-20 object-contain border border-slate-300 rounded-lg bg-white p-2"
                                    />
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingLogo}
                                            className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {uploadingLogo ? "Uploading..." : "Change Logo"}
                                        </button>
                                        <button
                                            onClick={handleLogoRemove}
                                            disabled={uploadingLogo}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Remove Logo
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50">
                                        <span className="text-slate-400 text-xs text-center px-2">No Logo</span>
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingLogo}
                                        className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploadingLogo ? "Uploading..." : "Upload Logo"}
                                    </button>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Recommended: Square image, max 5MB (PNG, JPG, or GIF)</p>
                    </div>
                    {message && <div className={`px-4 py-3 rounded-lg ${message.includes("successfully") || message.includes("updated") ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>{message}</div>}
                    <button onClick={() => logout()} className="w-full bg-red-600 text-white px-6 py-3 mt-6 rounded-lg hover:bg-red-700 transition font-semibold shadow-md">Logout</button>
                </div>
            </div>
        </div>
    );
};
export default ProfilePage; 