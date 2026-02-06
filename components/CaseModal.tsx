import React, { Dispatch, SetStateAction } from "react";
import { FaFileAlt, FaArrowLeft, FaUpload, FaTimes, FaCheckCircle } from "react-icons/fa";

export interface CaseFormData {
    title: string;
    description: string;
    plaintiffCase: string;
    defendantCase: string;
    workToBeDone: string;
    caseNumber: string;
    caseCategory: string;
    court: string;
    plaintiff: string;
    defendant: string;
    petitioner: string;
    respondent: string;
    complainant: string;
    accused: string;
    advocateForPetitioner: string;
    advocateForRespondent: string;
    publicProsecutor: string;
    mobileNumber: string;
    currentStage: string;
    lastHearingDate: string;
    nextHearingDate: string;
    hearingPurpose: string;
    purposeOfHearingStage: string;
    notes: string;
    caseType: string;
    status: "pending" | "admitted" | "dismissed" | "allowed" | "disposed" | "withdrawn" | "compromised" | "stayed" | "appeal_filed";
    filingDate: string;
}

interface CaseModalProps {
    form: CaseFormData;
    setForm: Dispatch<SetStateAction<CaseFormData>>;
    editId: string | null;
    uploading: boolean;
    selectedFiles: File[];
    setSelectedFiles: Dispatch<SetStateAction<File[]>>;
    selectedCitationFiles: File[];
    setSelectedCitationFiles: Dispatch<SetStateAction<File[]>>;
    uploadProgress: { [key: string]: number };
    setUploadProgress: Dispatch<SetStateAction<{ [key: string]: number }>>;
    onSubmit: (e: React.FormEvent) => void;
    onBack: () => void;
    onCancel: () => void;
}

const CaseModal: React.FC<CaseModalProps> = ({
    form,
    setForm,
    editId,
    uploading,
    selectedFiles,
    setSelectedFiles,
    selectedCitationFiles,
    setSelectedCitationFiles,
    uploadProgress,
    setUploadProgress,
    onSubmit,
    onBack,
    onCancel,
}) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 sm:p-4 overflow-y-auto">
            <form
                onSubmit={onSubmit}
                className="bg-white rounded-lg p-4 sm:p-6 shadow-2xl space-y-3 w-full max-w-2xl border-t-4 border-amber-500 my-2 sm:my-4 max-h-[95vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                        <FaFileAlt className="text-amber-600" />{" "}
                        <span className="text-sm sm:text-lg">{editId ? "Edit Case" : "Add New Case"}</span>
                    </h2>
                    <button
                        type="button"
                        onClick={onBack}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-2"
                        title="Go back"
                    >
                        <FaArrowLeft className="text-sm" />
                        <span className="text-sm font-medium hidden sm:inline">Back</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Case Title - Cause Title *</label>
                        <input
                            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            value={form.title}
                            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                            required
                            placeholder="e.g., Smith vs. Jones"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Court *
                        </label>
                        <input
                            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            value={form.court}
                            onChange={e => setForm(prev => ({ ...prev, court: e.target.value }))}
                            placeholder="e.g., District & Sessions Court, High Court of Telangana"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Case Type <span className="text-slate-500 font-normal text-xs">(Optional)</span>
                        </label>
                        <select
                            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            value={form.caseType}
                            onChange={e => setForm(prev => ({ ...prev, caseType: e.target.value }))}
                        >
                            <option value="">Select Case Type</option>
                            <option value="Civil">Civil</option>
                            <option value="Criminal">Criminal</option>
                            <option value="Writ Petition">Writ Petition</option>
                            <option value="Appeal">Appeal</option>
                            <option value="Revision">Revision</option>
                            <option value="Miscellaneous Case">Miscellaneous Case</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Case Number <span className="text-slate-500 font-normal">(Optional)</span>
                        </label>
                        <input
                            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            value={form.caseNumber}
                            onChange={e => setForm(prev => ({ ...prev, caseNumber: e.target.value }))}
                            placeholder="e.g., CV-2024-001"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Case Category <span className="text-slate-500 font-normal text-xs">(Optional)</span>
                        </label>
                        <select
                            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            value={form.caseCategory}
                            onChange={e => setForm(prev => ({ ...prev, caseCategory: e.target.value }))}
                        >
                            <option value="">Select Category</option>
                            <option value="O.S">O.S (Original Suit)</option>
                            <option value="C.C">C.C (Calendar Case)</option>
                            <option value="S.C">S.C (Sessions Case)</option>
                            <option value="Crl.P">Crl.P (Criminal Petition)</option>
                            <option value="Crl.A">Crl.A (Criminal Appeal)</option>
                            <option value="W.P">W.P (Writ Petition)</option>
                            <option value="W.A">W.A (Writ Appeal)</option>
                            <option value="M.C">M.C (Miscellaneous Case)</option>
                            <option value="I.A">I.A (Interim Application)</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Parties <span className="text-slate-500 font-normal text-xs">(Optional)</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">
                                    Plaintiff <span className="text-slate-400">(Optional)</span>
                                </label>
                                <input
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.plaintiff}
                                    onChange={e => setForm(prev => ({ ...prev, plaintiff: e.target.value }))}
                                    placeholder="Name of plaintiff"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">
                                    Defendant <span className="text-slate-400">(Optional)</span>
                                </label>
                                <input
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.defendant}
                                    onChange={e => setForm(prev => ({ ...prev, defendant: e.target.value }))}
                                    placeholder="Name of defendant"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Advocate Details</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">
                                    Advocate for Petitioner / Plaintiff
                                </label>
                                <input
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.advocateForPetitioner}
                                    onChange={e => setForm(prev => ({ ...prev, advocateForPetitioner: e.target.value }))}
                                    placeholder="Name of advocate for petitioner / plaintiff"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">
                                    Advocate for Respondent / Defendant <span className="text-slate-400">(Optional)</span>
                                </label>
                                <input
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.advocateForRespondent}
                                    onChange={e => setForm(prev => ({ ...prev, advocateForRespondent: e.target.value }))}
                                    placeholder="Advocate name"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Current Stage <span className="text-slate-500 font-normal text-xs">(Optional)</span>
                        </label>
                        <select
                            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            value={form.currentStage}
                            onChange={e => setForm(prev => ({ ...prev, currentStage: e.target.value }))}
                        >
                            <option value="">Select Stage</option>
                            <option value="Filing / Registration">Filing / Registration</option>
                            <option value="Notice Stage">Notice Stage</option>
                            <option value="Counter Filed / Awaited">Counter Filed / Awaited</option>
                            <option value="Evidence Stage">Evidence Stage</option>
                            <option value="Cross-Examination">Cross-Examination</option>
                            <option value="Arguments">Arguments</option>
                            <option value="Judgment Reserved">Judgment Reserved</option>
                            <option value="Judgment Pronounced">Judgment Pronounced</option>
                            <option value="Execution Petition (EP)">Execution Petition (EP)</option>
                            <option value="Appeal Stage">Appeal Stage</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Mobile Number <span className="text-slate-500 font-normal text-xs">(Optional)</span>
                        </label>
                        <input
                            type="tel"
                            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            value={form.mobileNumber}
                            onChange={e => setForm(prev => ({ ...prev, mobileNumber: e.target.value }))}
                            placeholder="e.g., 9876543210"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">Plaintiff Case</label>
                                <textarea
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.plaintiffCase}
                                    onChange={e => setForm(prev => ({ ...prev, plaintiffCase: e.target.value }))}
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">Defendant/Opponent Case</label>
                                <textarea
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    value={form.defendantCase}
                                    onChange={e => setForm(prev => ({ ...prev, defendantCase: e.target.value }))}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="block text-xs text-slate-600 mb-1">Work to be Done</label>
                            <textarea
                                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                value={form.workToBeDone}
                                onChange={e => setForm(prev => ({ ...prev, workToBeDone: e.target.value }))}
                                rows={2}
                            />
                        </div>
                    </div>
                    {!editId && (
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Dependent Documents / Opposite Party Documents (Optional)
                            </label>
                            <div className="mt-1 border-2 border-dashed border-slate-300 rounded p-3">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf,.doc,.docx"
                                    className="hidden"
                                    id="case-documents"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        setSelectedFiles(prev => [...prev, ...files]);
                                    }}
                                />
                                <label
                                    htmlFor="case-documents"
                                    className="cursor-pointer flex flex-col items-center justify-center py-2"
                                >
                                    <FaUpload className="text-xl text-slate-400 mb-1" />
                                    <span className="text-xs text-slate-600">Click to upload documents</span>
                                    <span className="text-xs text-slate-500 mt-0.5">PDF, Images, Word, etc.</span>
                                </label>
                                {selectedFiles.length > 0 && (
                                    <div className="mt-2 space-y-1.5">
                                        {selectedFiles.map((file, idx) => {
                                            const fileKey = editId ? `edit_${idx}` : `new_${idx}`;
                                            const progress = uploadProgress[fileKey] || 0;
                                            const isUploading = uploading && progress > 0 && progress < 100;
                                            return (
                                                <div key={idx} className="bg-slate-50 p-2 rounded text-xs">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-slate-700 truncate flex-1">{file.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
                                                                setUploadProgress(prev => {
                                                                    const newProgress = { ...prev };
                                                                    delete newProgress[fileKey];
                                                                    return newProgress;
                                                                });
                                                            }}
                                                            disabled={isUploading}
                                                            className="ml-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                                                        >
                                                            <FaTimes className="text-xs" />
                                                        </button>
                                                    </div>
                                                    {isUploading && (
                                                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                                                            <div
                                                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                                                style={{ width: `${progress}%` }}
                                                            ></div>
                                                        </div>
                                                    )}
                                                    {isUploading && (
                                                        <span className="text-xs text-blue-600 mt-0.5 block">
                                                            {Math.round(progress)}%
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {!editId && (
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Citations (Optional)</label>
                            <div className="mt-1 border-2 border-dashed border-slate-300 rounded p-3">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf,.doc,.docx"
                                    className="hidden"
                                    id="case-citations"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        setSelectedCitationFiles(prev => [...prev, ...files]);
                                    }}
                                />
                                <label
                                    htmlFor="case-citations"
                                    className="cursor-pointer flex flex-col items-center justify-center py-2"
                                >
                                    <FaUpload className="text-xl text-slate-400 mb-1" />
                                    <span className="text-xs text-slate-600">Click to upload citation files</span>
                                    <span className="text-xs text-slate-500 mt-0.5">PDF, Images, Word, etc.</span>
                                </label>
                                {selectedCitationFiles.length > 0 && (
                                    <details className="mt-2">
                                        <summary className="text-xs text-slate-600 cursor-pointer select-none">
                                            View selected citations ({selectedCitationFiles.length})
                                        </summary>
                                        <div className="mt-2 space-y-1.5">
                                            {selectedCitationFiles.map((file, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-slate-50 p-2 rounded text-xs flex items-center justify-between"
                                                >
                                                    <span className="text-slate-700 truncate flex-1">{file.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedCitationFiles(prev => prev.filter((_, i) => i !== idx));
                                                        }}
                                                        className="ml-2 text-red-600 hover:text-red-800"
                                                    >
                                                        <FaTimes className="text-xs" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex gap-2 pt-3">
                    <button
                        type="submit"
                        disabled={uploading}
                        className="flex-1 bg-slate-900 text-white rounded px-3 py-2 hover:bg-slate-800 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {uploading ? (
                            <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                {editId ? "Updating..." : "Creating..."}
                            </>
                        ) : (
                            <>
                                <FaCheckCircle /> {editId ? "Update Case" : "Create Case"}
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        disabled={uploading}
                        className="flex-1 bg-slate-200 text-slate-700 px-3 py-2 rounded hover:bg-slate-300 transition font-semibold disabled:opacity-50 text-sm"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CaseModal;


