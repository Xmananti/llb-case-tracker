import React from "react";
import { formatDate } from "../lib/utils/formatDate";

interface HearingCardProps {
    id: string;
    title: string;
    date: string;
    notes?: string;
    onEdit?: () => void;
    onDelete?: () => void;
}

const HearingCard: React.FC<HearingCardProps> = ({ title, date, notes, onEdit, onDelete }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-amber-500 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-lg text-slate-900">{title}</h4>
                <div className="flex gap-2">
                    {onEdit && (
                        <button onClick={onEdit} className="text-amber-600 hover:text-amber-700 text-sm font-semibold">Edit</button>
                    )}
                    {onDelete && (
                        <button onClick={onDelete} className="text-red-600 hover:text-red-700 text-sm font-semibold">Delete</button>
                    )}
                </div>
            </div>
            <p className="text-slate-600 text-sm mb-1">
                <span className="font-semibold">Date:</span> {formatDate(date)}
            </p>
            {notes && (
                <p className="text-slate-500 text-sm mt-2 italic">{notes}</p>
            )}
        </div>
    );
};

export default HearingCard;
