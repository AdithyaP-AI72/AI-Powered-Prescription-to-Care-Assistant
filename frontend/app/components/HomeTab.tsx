"use client";

import { AnalysisResult } from '../page';

interface HomeTabProps {
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isLoading: boolean;
    file: File | null;
    error: string | null;
    currentText: { [key: string]: string };
    // New props for editable prescription
    analysisResult: AnalysisResult | null;
    editedPrescriptionText: string;
    setEditedPrescriptionText: (text: string) => void;
    handleUpdateAnalysis: () => void;
}

export default function HomeTab({
    handleSubmit,
    handleFileChange,
    isLoading,
    file,
    error,
    currentText,
    analysisResult,
    editedPrescriptionText,
    setEditedPrescriptionText,
    handleUpdateAnalysis
}: HomeTabProps) {
    return (
        <>
            <div className="bg-white mt-8 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
                <form onSubmit={handleSubmit}>
                    <label htmlFor="file-upload" className="block text-lg font-medium text-gray-700 mb-2">{currentText.uploadLabel}</label>
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" suppressHydrationWarning={true} />
                        <button type="submit" disabled={isLoading || !file} className="w-full sm:w-auto px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400">{isLoading ? currentText.analyzingButton : currentText.analyzeButton}</button>
                    </div>
                    {file && <p className="text-sm text-gray-500 mt-3">Selected file: {file.name}</p>}
                </form>
            </div>

            {error && <div className="mt-6 p-4 bg-red-100 border text-red-700 rounded-lg text-center"><strong>Error:</strong> {error}</div>}
            {isLoading && <div className="mt-8 text-center"><div className="flex justify-center items-center space-x-2"><svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span className="text-lg font-medium text-gray-700">{currentText.loadingAnalysis}</span></div></div>}

            {/* New Editable Prescription Section */}
            {analysisResult && (
                <div className="bg-white mt-8 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Edit Prescription for Accuracy</h2>
                    <p className="text-gray-600 mb-4">The text below was extracted from your prescription. You can correct any errors and re-run the analysis.</p>
                    <textarea
                        value={editedPrescriptionText}
                        onChange={(e) => setEditedPrescriptionText(e.target.value)}
                        rows={8}
                        className="w-full p-2 border border-gray-300 rounded-md mb-4 text-black bg-gray-50 focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleUpdateAnalysis} disabled={isLoading} className="w-full sm:w-auto px-6 py-3 text-base font-medium text-white bg-purple-600 rounded-lg shadow-md hover:bg-purple-700 disabled:bg-gray-400">
                        {isLoading ? "Updating..." : "Update Analysis"}
                    </button>
                </div>
            )}
        </>
    );
}