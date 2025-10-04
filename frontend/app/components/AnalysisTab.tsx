"use client";

import { AnalysisResult, SummaryResult, Medication } from '../page';

interface AnalysisTabProps {
    displayAnalysis: AnalysisResult | null;
    displaySummary: SummaryResult | null;
    isSummaryLoading: boolean;
    summaryError: string | null;
    handleGetSummary: () => void;
    openReminderModal: (med: Medication) => void;
    currentText: { [key: string]: string };
}

export default function AnalysisTab({
    displayAnalysis,
    displaySummary,
    isSummaryLoading,
    summaryError,
    handleGetSummary,
    openReminderModal,
    currentText,
}: AnalysisTabProps) {
    if (!displayAnalysis) {
        return (
            <div className="text-center py-10 text-gray-500">
                <p>Please upload and analyze a prescription on the Home tab to see the results here.</p>
            </div>
        );
    }

    return (
        <div className="mt-8 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 animate-fade-in">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{currentText.analysisResults}</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{currentText.medicine}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{currentText.dosage}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{currentText.instruction}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{currentText.reminders}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {displayAnalysis.medications.map((med, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{med.dosage}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{med.instruction}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <button onClick={() => openReminderModal(med)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                        {currentText.setReminderButton}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700">{currentText.doctorsAdvice}</h3>
                <p className="mt-2 p-4 bg-blue-50 border-l-4 border-blue-500 text-gray-700 rounded-r-lg">
                    {displayAnalysis.advice}
                </p>
            </div>

            <div className="mt-8 border-t pt-6">
                {!displaySummary && !isSummaryLoading && (
                    <button
                        onClick={handleGetSummary}
                        disabled={isSummaryLoading}
                        className="w-full sm:w-auto px-6 py-3 text-base font-medium text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700"
                    >
                        {currentText.getSummaryButton}
                    </button>
                )}
                {isSummaryLoading && (
                    <div className="text-center">
                        <div className="flex justify-center items-center space-x-2">
                            <svg className="animate-spin h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span className="text-md font-medium text-gray-700">{currentText.generatingSummary}</span>
                        </div>
                    </div>
                )}

                {summaryError && (
                    <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                        <strong>{currentText.summaryErrorTitle}:</strong> {summaryError}
                    </div>
                )}

                {displaySummary && (
                    <div className="animate-fade-in space-y-6">
                        <div><h3 className="text-xl font-semibold text-gray-800">{currentText.aiSummary}</h3><p className="mt-2 p-4 bg-green-50 border-l-4 border-green-500 text-gray-700 rounded-r-lg">{displaySummary.summary}</p></div>
                        <div><h3 className="text-xl font-semibold text-gray-800">{currentText.healthTips}</h3><ul className="mt-2 list-disc list-inside space-y-1 text-gray-700">{displaySummary.health_tips.map((tip, index) => (<li key={index}>{tip}</li>))}</ul></div>
                        <div><h3 className="text-xl font-semibold text-gray-800">{currentText.foodInteractions}</h3><ul className="mt-2 list-disc list-inside space-y-1 text-gray-700">{displaySummary.food_interactions.map((interaction, index) => (<li key={index}>{interaction}</li>))}</ul></div>
                    </div>
                )}
            </div>
        </div>
    );
}