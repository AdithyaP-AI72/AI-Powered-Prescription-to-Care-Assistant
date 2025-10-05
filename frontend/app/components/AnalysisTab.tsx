// frontend/app/components/AnalysisTab.tsx

"use client";

import { Medication } from '../page'; // Import the interface from page.tsx

// Define the props this component will receive
interface AnalysisTabProps {
    displayAnalysis: any | null;
    displaySummary: any | null;
    isSummaryLoading: boolean;
    summaryError: string | null;
    handleGetSummary: () => void;
    openReminderModal: (med: Medication) => void;
    currentText: { [key: string]: string };
    prescriptions: any[]; // The list of all prescriptions
    activePrescriptionId: string | null;
    setActivePrescriptionId: (id: string) => void;
    handleDeletePrescription: (id: string) => void; // New prop for deleting
}

export default function AnalysisTab({
    displayAnalysis,
    displaySummary,
    isSummaryLoading,
    summaryError,
    handleGetSummary,
    openReminderModal,
    currentText,
    prescriptions,
    activePrescriptionId,
    setActivePrescriptionId,
    handleDeletePrescription,
}: AnalysisTabProps) {

    return (
        <div className="space-y-6">
            {/* --- Prescription Switcher --- */}
            {prescriptions.length > 1 && (
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">View Analysis For</h3>
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
                                        e.stopPropagation();
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

            {!displayAnalysis && (
                <div className="text-center py-10 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500">No prescription analyzed yet. Please upload one on the Home tab.</p>
                </div>
            )}

            {/* Analysis Results Table */}
            {displayAnalysis && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{currentText.analysisResults}</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{currentText.medicine}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{currentText.dosage}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{currentText.instruction}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{currentText.duration}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{currentText.reminders}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {displayAnalysis.medications.map((med: Medication) => (
                                    <tr key={med.name}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.dosage}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">{med.instruction}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.duration_days} days</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button onClick={() => openReminderModal(med)} className="text-indigo-600 hover:text-indigo-900 font-medium">
                                                {currentText.setReminderButton}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                        <h3 className="font-semibold text-gray-700">{currentText.doctorsAdvice}:</h3>
                        <p className="text-gray-600">{displayAnalysis.advice}</p>
                    </div>
                    <div className="text-center mt-6">
                        <button
                            onClick={handleGetSummary}
                            disabled={isSummaryLoading}
                            className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
                        >
                            {isSummaryLoading ? currentText.generatingSummary : currentText.getSummaryButton}
                        </button>
                    </div>
                </div>
            )}

            {/* AI Summary Section */}
            {summaryError && <p className="text-red-500 text-center">{summaryError}</p>}
            {displaySummary && (
                <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{currentText.aiSummary}</h3>
                        <p className="text-gray-600 mt-2">{displaySummary.summary}</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{currentText.healthTips}</h3>
                        <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                            {displaySummary.health_tips.map((tip: string, i: number) => <li key={i}>{tip}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{currentText.foodInteractions}</h3>
                        <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                            {displaySummary.food_interactions.map((food: string, i: number) => <li key={i}>{food}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}