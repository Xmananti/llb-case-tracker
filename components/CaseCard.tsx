
import React from "react";
import Link from "next/link";
import { 
    FaHashtag, 
    FaBuilding, 
    FaUser, 
    FaCalendarAlt, 
    FaFileAlt, 
    FaTasks, 
    FaComments, 
    FaGavel, 
    FaTrash,
    FaCheckCircle,
    FaTimes,
    FaClock,
    FaPauseCircle
} from "react-icons/fa";

export interface Case {
    id: string;
    title: string;
    description: string;
    plaintiffCase?: string;
    defendantCase?: string;
    workToBeDone?: string;
    caseNumber?: string;
    caseCategory?: string;
    court?: string;
    plaintiff?: string;
    defendant?: string;
    petitioner?: string;
    respondent?: string;
    complainant?: string;
    accused?: string;
    advocateForPetitioner?: string;
    advocateForRespondent?: string;
    publicProsecutor?: string;
    currentStage?: string;
    lastHearingDate?: string;
    nextHearingDate?: string;
    hearingPurpose?: string;
    purposeOfHearingStage?: string;
    notes?: string;
    caseType?: string;
    status?: "pending" | "admitted" | "dismissed" | "allowed" | "disposed" | "withdrawn" | "compromised" | "stayed" | "appeal_filed";
    filingDate?: string;
}

interface CaseStats {
    documents: number;
    hearings: number;
    tasks: number;
    conversations: number;
}

interface CaseCardProps {
    caseData: Case;
    stats?: CaseStats;
    onEdit: (c: Case) => void;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

const CaseCard: React.FC<CaseCardProps> = ({ 
    caseData: c, 
    stats, 
    onEdit, 
    onDelete, 
    isDeleting 
}) => {
    const getStatusIcon = () => {
        switch (c.status) {
            case "admitted":
            case "allowed": return <FaCheckCircle className="text-green-600" />;
            case "dismissed": return <FaTimes className="text-red-600" />;
            case "disposed": return <FaCheckCircle className="text-gray-600" />;
            case "withdrawn": return <FaClock className="text-orange-600" />;
            case "compromised": return <FaCheckCircle className="text-blue-600" />;
            case "stayed": return <FaPauseCircle className="text-yellow-600" />;
            case "appeal_filed": return <FaFileAlt className="text-purple-600" />;
            case "pending": return <FaClock className="text-yellow-600" />;
            default: return <FaClock className="text-slate-600" />;
        }
    };

    const getStatusColor = () => {
        switch (c.status) {
            case "admitted":
            case "allowed": return "bg-green-100 text-green-800";
            case "dismissed": return "bg-red-100 text-red-800";
            case "disposed": return "bg-gray-100 text-gray-800";
            case "withdrawn": return "bg-orange-100 text-orange-800";
            case "compromised": return "bg-blue-100 text-blue-800";
            case "stayed": return "bg-yellow-100 text-yellow-800";
            case "appeal_filed": return "bg-purple-100 text-purple-800";
            case "pending": return "bg-yellow-100 text-yellow-800";
            default: return "bg-slate-100 text-slate-800";
        }
    };

    return (
        <Link
            href={`/cases/${c.id}`}
            className={`legal-card p-4 rounded-lg hover:shadow-lg transition-all group border border-slate-200 block cursor-pointer ${isDeleting ? 'opacity-0 scale-95 -translate-y-2 transition-all duration-300 pointer-events-none' : ''}`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-700 mb-1 line-clamp-1">{c.title}</h3>
                    {c.caseNumber && (
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                            <FaHashtag className="text-xs" /> {c.caseNumber}
                        </div>
                    )}
                </div>
                <div className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ml-2 flex-shrink-0 ${getStatusColor()}`}>
                    {getStatusIcon()}
                    <span className="capitalize hidden sm:inline">{c.status || "pending"}</span>
                </div>
            </div>
            <p className="text-slate-600 text-xs mb-3 line-clamp-2">{c.description}</p>

            <div className="space-y-1 mb-3 text-xs text-slate-600">
                {c.court && (
                    <div className="flex items-center gap-1.5 truncate">
                        <FaBuilding className="text-amber-600 flex-shrink-0" /> <span className="truncate">{c.court}</span>
                    </div>
                )}
                {(c.plaintiff || c.petitioner || c.complainant) && (
                    <div className="flex items-center gap-1.5 truncate">
                        <FaUser className="text-amber-600 flex-shrink-0" />
                        <span className="truncate">
                            {c.plaintiff || c.petitioner || c.complainant}
                            {(c.defendant || c.respondent || c.accused) && ` vs ${c.defendant || c.respondent || c.accused}`}
                        </span>
                    </div>
                )}
                {c.purposeOfHearingStage && (
                    <div className="flex items-center gap-1.5">
                        <FaCalendarAlt className="text-amber-600 flex-shrink-0" /> <span>Purpose: {c.purposeOfHearingStage}</span>
                    </div>
                )}
            </div>

            {/* Case Statistics */}
            {stats && (
                <div className="flex items-center gap-3 mb-3 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1 text-slate-600" title="Documents">
                        <FaFileAlt className="text-blue-600" />
                        <span className="font-semibold">{stats.documents}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600" title="Hearings">
                        <FaCalendarAlt className="text-green-600" />
                        <span className="font-semibold">{stats.hearings}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600" title="Tasks">
                        <FaTasks className="text-purple-600" />
                        <span className="font-semibold">{stats.tasks}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600" title="Conversations">
                        <FaComments className="text-amber-600" />
                        <span className="font-semibold">{stats.conversations}</span>
                    </div>
                </div>
            )}

            <div className="flex gap-1 sm:gap-1.5 pt-3 border-t border-slate-200" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/cases/${c.id}`;
                    }}
                    className="flex-1 bg-slate-900 text-white rounded px-2 py-1.5 hover:bg-slate-800 transition font-medium text-xs text-center flex items-center justify-center gap-1 select-none"
                >
                    <FaGavel className="text-xs" /> <span className="hidden sm:inline">View</span>
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEdit(c);
                    }}
                    disabled={isDeleting}
                    className="flex-1 bg-amber-600 text-white rounded px-2 py-1.5 hover:bg-amber-700 transition font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed select-none"
                    onMouseDown={(e) => e.preventDefault()}
                >
                    Edit
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(c.id);
                    }}
                    disabled={isDeleting}
                    className="flex-1 bg-red-600 text-white rounded px-2 py-1.5 hover:bg-red-700 transition font-medium text-xs flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed select-none"
                    onMouseDown={(e) => e.preventDefault()}
                >
                    {isDeleting ? (
                        <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            <span className="hidden sm:inline">Deleting...</span>
                        </>
                    ) : (
                        <>
                            <FaTrash className="text-xs" />
                            <span className="hidden sm:inline">Del</span>
                        </>
                    )}
                </button>
            </div>
        </Link>
    );
};

export default CaseCard;
