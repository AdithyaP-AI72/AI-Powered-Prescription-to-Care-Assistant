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
  id: string;
  medicineName: string;
  time: string; // Stored in "HH:MM" format
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

  // --- New State for Reminders ---
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [reminderTime, setReminderTime] = useState("09:00");


  // --- Effects for Persistence and Notifications ---

  // Load reminders from localStorage on initial render
  useEffect(() => {
    try {
      const storedReminders = localStorage.getItem('medicationReminders');
      if (storedReminders) {
        setReminders(JSON.parse(storedReminders));
      }
    } catch (e) {
      console.error("Failed to parse reminders from localStorage", e);
    }
  }, []);

  // Save reminders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('medicationReminders', JSON.stringify(reminders));
  }, [reminders]);

  // Effect to check for and trigger notifications
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      reminders.forEach(reminder => {
        if (reminder.time === currentTime) {
          // Check if notification for this reminder has already been shown this minute
          const lastShownKey = `notif_last_shown_${reminder.id}`;
          const lastShownTime = sessionStorage.getItem(lastShownKey);
          if (lastShownTime !== currentTime) {
            new Notification('Medication Reminder', {
              body: `It's time to take your ${reminder.medicineName}.`,
              icon: '/favicon.ico'
            });
            sessionStorage.setItem(lastShownKey, currentTime);
          }
        }
      });
    };

    const intervalId = setInterval(checkReminders, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [reminders]);

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

  // --- Reminder-Specific Handlers ---

  const openReminderModal = (medication: Medication) => {
    setSelectedMedication(medication);
    setIsModalOpen(true);
  };

  const handleSetReminder = async () => {
    if (!selectedMedication || !reminderTime) return;

    if (Notification.permission === 'denied') {
      alert('You have blocked notifications. Please enable them in your browser settings to receive reminders.');
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('You need to allow notifications to set reminders.');
        return;
      }
    }

    const newReminder: Reminder = {
      id: `${selectedMedication.name}-${reminderTime}-${Date.now()}`,
      medicineName: selectedMedication.name,
      time: reminderTime,
    };

    setReminders(prev => [...prev, newReminder]);
    setIsModalOpen(false);
    setSelectedMedication(null);
  };

  const handleDeleteReminder = (reminderId: string) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId));
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

        {reminders.length > 0 && (
          <div className="mt-8 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Active Reminders</h2>
            <ul className="space-y-3">
              {reminders.map(reminder => (
                <li key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-gray-800">
                      Take <strong>{reminder.medicineName}</strong> at <strong>{reminder.time}</strong>
                    </p>
                  </div>
                  <button onClick={() => handleDeleteReminder(reminder.id)} className="text-red-500 hover:text-red-700 font-semibold">Delete</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isLoading && (
          <div className="mt-8 text-center">
            {/* Loading spinner */}
          </div>
        )}

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
                          Set
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
              {/* Summary Loading/Error/Result display */}
            </div>
          </div>
        )}
      </div>

      {/* Reminder Modal */}
      {isModalOpen && selectedMedication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">Set Reminder for {selectedMedication.name}</h3>
            <p className="text-gray-600 mb-4">Select the time you want to be reminded daily.</p>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-6"
            />
            <div className="flex justify-end space-x-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
              <button onClick={handleSetReminder} className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save Reminder</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

