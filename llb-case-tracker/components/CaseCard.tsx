import React from "react";
import Link from "next/link";

interface CaseCardProps {
    id: string;
    title: string;
    description: string;
    onClick?: () => void;
}

const CaseCard: React.FC<CaseCardProps> = ({ id, title, description, onClick }) => {
    return (
        <Link href={`/cases/${id}`} onClick={onClick}>
            <div className="legal-card p-6 rounded-lg hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                <h3 className="text-xl font-bold mb-2 text-slate-900">{title}</h3>
                <p className="text-slate-600 text-sm grow line-clamp-3">{description}</p>
                <span className="text-amber-600 text-sm font-semibold mt-4 inline-block hover:text-amber-700">View Details →</span>
            </div>
        </Link>
    );
};

export default CaseCard;
