"use client";

import { useState } from 'react';

// Define the structure of the analysis result for TypeScript
interface Medication {
  name: string;
  dosage: string;
  instruction: string;
}

interface AnalysisResult {
  medications: Medication[];
  advice: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      // Reset previous results when a new file is chosen
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a prescription image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "An error occurred during analysis.");
      }

      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);

    } catch (err: any) {
      setError(err.message || "Failed to connect to the backend.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-gray-50 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
            Prescription to Personal Care Assistant
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Upload a prescription to instantly extract details, set reminders, and more.
          </p>
        </div>

        {/* File Upload Form */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
          <form onSubmit={handleSubmit}>
            <label htmlFor="file-upload" className="block text-lg font-medium text-gray-700 mb-2">
              Upload Prescription
            </label>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                type="submit"
                disabled={isLoading || !file}
                className="w-full sm:w-auto px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
              >
                {isLoading ? "Analyzing..." : "Analyze Now"}
              </button>
            </div>
            {file && <p className="text-sm text-gray-500 mt-3">Selected file: {file.name}</p>}
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mt-8 text-center">
            <div className="flex justify-center items-center space-x-2">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg font-medium text-gray-700">Extracting details from the prescription...</span>
            </div>
          </div>
        )}

        {/* Results Display */}
        {analysisResult && (
          <div className="mt-8 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 animate-fade-in">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Analysis Results</h2>

            {/* Medications Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instruction</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analysisResult.medications.map((med, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{med.dosage}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{med.instruction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Doctor's Advice Section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700">Doctor's Advice</h3>
              <p className="mt-2 p-4 bg-blue-50 border-l-4 border-blue-500 text-gray-700 rounded-r-lg">
                {analysisResult.advice}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
