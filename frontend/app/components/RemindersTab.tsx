"use client";

import { Reminder } from '../page';

interface RemindersTabProps {
    reminders: Reminder[];
    handleDeleteReminder: (id: string) => void;
    currentText: { [key: string]: string };
}

export default function RemindersTab({ reminders, handleDeleteReminder, currentText }: RemindersTabProps) {
    if (reminders.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                <p>You have no active reminders. Set a reminder from the Analysis tab.</p>
            </div>
        );
    }

    return (
        <div className="mt-8 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{currentText.activeReminders}</h2>
            <ul className="space-y-3">
                {reminders.map(reminder => (
                    <li key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <p className="text-gray-800">
                                Take <strong>{reminder.medicineName}</strong> at <strong>{reminder.time}</strong>
                                <a href={reminder.calendarLink} target="_blank" rel="noopener noreferrer" className="ml-3 text-blue-500 hover:text-blue-700 text-sm font-medium">{currentText.viewInCalendar}</a>
                            </p>
                        </div>
                        <button onClick={() => handleDeleteReminder(reminder.id)} className="text-red-500 hover:text-red-700 font-semibold">{currentText.removeLocally}</button>
                    </li>
                ))}
            </ul>
            <p className="mt-4 text-sm text-gray-600 border-t pt-2">{currentText.removeNote}</p>
        </div>
    );
}