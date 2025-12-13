"use client";
import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { updateProfile } from "firebase/auth";

const ProfilePage: React.FC = () => {
    const { user, logout } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [message, setMessage] = useState("");
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
                    {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{message}</div>}
                    <button onClick={() => logout()} className="w-full bg-red-600 text-white px-6 py-3 mt-6 rounded-lg hover:bg-red-700 transition font-semibold shadow-md">Logout</button>
                </div>
            </div>
        </div>
    );
};
export default ProfilePage; 