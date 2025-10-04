"use client";

import { useRef, useEffect, useState } from 'react';
import { ChatMessage } from '../page';

// Declare the SpeechRecognition interface for browser compatibility
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface AssistantTabProps {
  chatMessages: ChatMessage[];
  currentMessage: string;
  setCurrentMessage: (value: string) => void;
  handleSendMessage: () => void;
  isChatLoading: boolean;
  currentText: { [key: string]: string };
}

export default function AssistantTab({
  chatMessages,
  currentMessage,
  setCurrentMessage,
  handleSendMessage,
  isChatLoading,
  currentText
}: AssistantTabProps) {
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    chatBodyRef.current?.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages]);

  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser does not support voice recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');
      setCurrentMessage(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="mt-8 w-full bg-white rounded-lg shadow-xl border flex flex-col h-[70vh]">
      <header className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h3 className="font-bold text-lg text-center">{currentText.chatHeader}</h3>
      </header>
      <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {chatMessages.map((msg, index) => (
          <div key={index} className={`flex my-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-2xl p-3 max-w-xs lg:max-w-md ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
            </div>
          </div>
        ))}
        {isChatLoading && <div className="flex justify-start"><div className="rounded-2xl p-3 bg-gray-200 text-gray-500 animate-pulse">Typing...</div></div>}
      </div>
      <footer className="p-4 border-t bg-white">
        <div className="flex items-center">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={currentText.chatPlaceholder}
            className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button onClick={handleToggleListening} className={`p-3 border-y ${isListening ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </button>
          <button onClick={handleSendMessage} disabled={isChatLoading} className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:bg-blue-300">
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}