// frontend/app/components/HomeTab.tsx

"use client";

import { useEffect } from 'react';

// Define the props this component will receive
interface HomeTabProps {
    handleSubmit: (e: React.FormEvent) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isLoading: boolean;
    file: File | null;
    error: string | null;
    currentText: { [key: string]: string };
    analysisResult: any; // The analysis result of the currently active prescription
    editedPrescriptionText: string;
    setEditedPrescriptionText: (text: string) => void;
    handleUpdateAnalysis: () => void;
    prescriptions: any[]; // The list of all prescriptions
    activePrescriptionId: string | null;
    setActivePrescriptionId: (id: string) => void;
    handleDeletePrescription: (id: string) => void; // New prop for deleting
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
    handleUpdateAnalysis,
    prescriptions,
    activePrescriptionId,
    setActivePrescriptionId,
    handleDeletePrescription, // New prop
}: HomeTabProps) {

    // When the active prescription changes, update the text in the edit box
    useEffect(() => {
        if (analysisResult) {
            const generatedText = analysisResult.medications
                .map((med: any) => `${med.name} ${med.dosage} ${med.instruction}`)
                .join('\n');
            setEditedPrescriptionText(generatedText);
        } else {
            setEditedPrescriptionText('');
        }
    }, [analysisResult, setEditedPrescriptionText]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            {/* --- Prescription Switcher --- */}
            {prescriptions.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Prescriptions</h3>
                    <div className="flex flex-wrap gap-2">
                        {prescriptions.map((p, index) => (
                            <div key={p.id} className="flex items-center gap-1 bg-gray-200 rounded-md">
                                <button
                                    onClick={() => setActivePrescriptionId(p.id)}
                                    className={`pl-4 pr-3 py-2 text-sm font-medium rounded-l-md transition-colors ${p.id === activePrescriptionId
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    {`P${index + 1}: ${p.fileName}`}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent the setActiveId from firing
                                        handleDeletePrescription(p.id);
                                    }}
                                    className="px-2 py-2 text-red-500 hover:bg-red-200 rounded-r-md"
                                    title="Delete prescription"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- File Upload Form --- */}
            <form onSubmit={handleSubmit} className="mb-6">
                <label htmlFor="file-upload" className="block text-lg font-semibold text-gray-700 mb-2">
                    {prescriptions.length > 0 ? 'Upload Another Prescription' : currentText.uploadLabel}
                </label>
                <div className="flex items-center space-x-4">
                    <input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        accept="image/*"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !file}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? currentText.analyzingButton : currentText.analyzeButton}
                    </button>
                </div>
                {file && <p className="text-sm text-gray-500 mt-2">Selected: {file.name}</p>}
            </form>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {/* --- Edit Prescription Text Area --- */}
            {analysisResult && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Edit Extracted Text</h3>
                    <p className="text-sm text-gray-500 mb-2">
                        Correct any errors from the OCR scan below and click "Re-Analyze" to update the results.
                    </p>
                    <textarea
                        value={editedPrescriptionText}
                        onChange={(e) => setEditedPrescriptionText(e.target.value)}
                        className="w-full h-40 p-2 border border-gray-300 rounded-md text-black"
                    />
                    <button
                        onClick={handleUpdateAnalysis}
                        disabled={isLoading}
                        className="mt-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? currentText.analyzingButton : "Re-Analyze"}
                    </button>
                </div>
            )}
        </div>
    );
}