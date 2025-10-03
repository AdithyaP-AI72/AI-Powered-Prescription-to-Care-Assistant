"use client";

import { useState, useEffect } from 'react';

// --- TypeScript Interfaces for Data Structures ---

interface Medication {
  name: string;
  dosage: string;
  instruction: string;
}

interface AnalysisResult {
  medications: Medication[];
  advice: string;
}

interface SummaryResult {
  summary: string;
  health_tips: string[];
  food_interactions: string[];
}

interface Reminder {
  id: string; // This will now store the Google Calendar Event ID
  medicineName: string;
  time: string; // Stored in "HH:MM" format
  calendarLink: string; // New: Link to the event in Google Calendar
}


export default function Home() {
  // --- State Management ---
  const [file, setFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // --- State for Reminders (Now tracks Google Calendar events) ---
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [reminderTime, setReminderTime] = useState("09:00");


  // --- Event Handlers ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setAnalysisResult(null);
      setSummaryResult(null);
      setError(null);
      setSummaryError(null);
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
    setSummaryResult(null);
    setSummaryError(null);


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

  const handleGetSummary = async () => {
    if (!analysisResult || analysisResult.medications.length === 0) {
      setSummaryError("No medications found to summarize.");
      return;
    }

    setIsSummaryLoading(true);
    setSummaryError(null);
    setSummaryResult(null);

    const medicationNames = analysisResult.medications
      .map(med => med.name)
      .filter(name => name.toLowerCase() !== 'illegible' && name.toLowerCase() !== 'n/a');

    if (medicationNames.length === 0) {
      setSummaryError("No valid medication names found to summarize.");
      setIsSummaryLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ medications: medicationNames }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get summary.");
      }

      const summaryData: SummaryResult = await response.json();
      setSummaryResult(summaryData);

    } catch (err: any) {
      setSummaryError(err.message || "Failed to connect for summary.");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // --- NEW: Sends data to FastAPI to create Google Calendar event ---

  const openReminderModal = (medication: Medication) => {
    setSelectedMedication(medication);
    setIsModalOpen(true);
  };

  const handleSetReminder = async () => {
    if (!selectedMedication || !reminderTime) return;

    // Data to send to FastAPI /set-reminder endpoint
    const reminderData = {
      name: selectedMedication.name,
      instruction: selectedMedication.instruction,
      time: reminderTime, // HH:MM string
    };
    
    // Clear local error before trying
    setSummaryError(null);

    try {
      const response = await fetch("http://localhost:8000/set-reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reminderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create Google Calendar reminder.");
      }

      const result = await response.json();
      
      // Update local state with the Google Calendar Event ID and Link
      const newReminder: Reminder = {
        id: result.event_id, 
        medicineName: selectedMedication.name,
        time: reminderTime,
        calendarLink: result.calendar_link,
      };

      setReminders(prev => [...prev, newReminder]);
      
      // Provide positive feedback
      alert(`Reminder set! Event ID: ${result.event_id}. You can view it in your Google Calendar.`);
      
      setIsModalOpen(false);
      setSelectedMedication(null);
      
    } catch (err: any) {
      setSummaryError(`Error setting Google Calendar reminder: ${err.message}`);
      alert(`Error setting Google Calendar reminder: ${err.message}`);
    }
  };

  // NOTE: A function to delete from Google Calendar is complex and not included here.
  // This local delete only removes it from the displayed list.
  const handleDeleteReminder = (reminderId: string) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId));
    alert("Reminder removed from local list. You must manually delete the recurring event from Google Calendar.");
  };


  // --- JSX Rendering ---

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 bg-gray-50 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
            Prescription to Personal Care Assistant
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Upload a prescription to extract details, get AI insights, and set medication reminders.
          </p>
        </div>

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
                suppressHydrationWarning={true}
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

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Active Reminders Display */}
        {reminders.length > 0 && (
          <div className="mt-8 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Active Google Calendar Reminders</h2>
            <ul className="space-y-3">
              {reminders.map(reminder => (
                <li key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-gray-800">
                      Take <strong>{reminder.medicineName}</strong> at <strong>{reminder.time}</strong>
                      <a href={reminder.calendarLink} target="_blank" rel="noopener noreferrer" className="ml-3 text-blue-500 hover:text-blue-700 text-sm font-medium">(View in Calendar)</a>
                    </p>
                  </div>
                  <button onClick={() => handleDeleteReminder(reminder.id)} className="text-red-500 hover:text-red-700 font-semibold">Remove Locally</button>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-600 border-t pt-2">
              Note: Clicking "Remove Locally" only removes the reminder from this list; you must delete the recurring event from your Google Calendar manually.
            </p>
          </div>
        )}

        {/* Analysis Loading State */}
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

        {/* Analysis Results Display */}
        {analysisResult && (
          <div className="mt-8 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 animate-fade-in">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Analysis Results</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instruction</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reminders</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analysisResult.medications.map((med, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{med.dosage}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{med.instruction}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <button onClick={() => openReminderModal(med)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                          Set Google Reminder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700">Doctor's Advice</h3>
              <p className="mt-2 p-4 bg-blue-50 border-l-4 border-blue-500 text-gray-700 rounded-r-lg">
                {analysisResult.advice}
              </p>
            </div>

            <div className="mt-8 border-t pt-6">
              {!summaryResult && !isSummaryLoading && (
                <button
                  onClick={handleGetSummary}
                  disabled={isSummaryLoading}
                  className="w-full sm:w-auto px-6 py-3 text-base font-medium text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700"
                >
                  Get AI Summary & Tips
                </button>
              )}
              {isSummaryLoading && (
                <div className="text-center">
                  <div className="flex justify-center items-center space-x-2">
                    <svg className="animate-spin h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-md font-medium text-gray-700">Generating summary and tips...</span>
                  </div>
                </div>
              )}

              {summaryError && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                  <strong>Summary Error:</strong> {summaryError}
                </div>
              )}

              {summaryResult && (
                <div className="animate-fade-in space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">AI-Powered Summary</h3>
                    <p className="mt-2 p-4 bg-green-50 border-l-4 border-green-500 text-gray-700 rounded-r-lg">
                      {summaryResult.summary}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Health Tips</h3>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-gray-700">
                      {summaryResult.health_tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Food Interactions</h3>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-gray-700">
                      {summaryResult.food_interactions.map((interaction, index) => (
                        <li key={index}>{interaction}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reminder Modal */}
      {isModalOpen && selectedMedication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">Set Reminder for {selectedMedication.name}</h3>
            <p className="text-gray-600 mb-4">
              A **DAILY** recurring event will be created in your Google Calendar at the selected time.
            </p>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-6"
            />
            <div className="flex justify-end space-x-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
              <button onClick={handleSetReminder} className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Create Google Calendar Event</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}