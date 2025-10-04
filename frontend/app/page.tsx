"use client";

import { useState, useEffect } from 'react';
import HomeTab from './components/HomeTab';
import AnalysisTab from './components/AnalysisTab';
import RemindersTab from './components/RemindersTab';
import AssistantTab from './components/AssistantTab';
import PharmaciesTab from './components/PharmaciesTab';

// --- TypeScript Interfaces ---
export interface Medication { name: string; dosage: string; instruction: string; }
export interface AnalysisResult { medications: Medication[]; advice: string; }
export interface SummaryResult { summary: string; health_tips: string[]; food_interactions: string[]; }
export interface Reminder { id: string; medicineName: string; time: string; calendarLink: string; }
export interface ChatMessage { sender: 'user' | 'ai'; text: string; }
export interface Pharmacy { name: string; address: string; phone: string; geometry?: { location: { lat: number; lng: number; } } }
export interface Location { lat: number; lng: number; } // For user location

// --- UI Text Translations ---
const uiText: { [key: string]: { [key: string]: string } } = {
  en: {
    title: "Prescription to Personal Care Assistant",
    subtitle: "Upload a prescription to extract details, get AI insights, and set medication reminders.",
    uploadLabel: "Upload Prescription",
    analyzeButton: "Analyze Now",
    analyzingButton: "Analyzing...",
    activeReminders: "Active Google Calendar Reminders",
    viewInCalendar: "(View in Calendar)",
    removeLocally: "Remove Locally",
    removeNote: 'Note: Clicking "Remove Locally" only removes the reminder from this list; you must delete the recurring event from your Google Calendar manually.',
    loadingAnalysis: "Extracting details from the prescription...",
    analysisResults: "Analysis Results",
    medicine: "Medicine",
    dosage: "Dosage",
    instruction: "Instruction",
    reminders: "Reminders",
    setReminderButton: "Set Google Reminder",
    doctorsAdvice: "Doctor's Advice",
    getSummaryButton: "Get AI Summary & Tips",
    generatingSummary: "Generating summary and tips...",
    summaryErrorTitle: "Summary Error",
    aiSummary: "AI-Powered Summary",
    healthTips: "Health Tips",
    foodInteractions: "Food Interactions",
    languageSelector: "Language:",
    translating: "Translating content...",
    chatPlaceholder: "Ask about your medication...",
    chatHeader: "Healthcare Agent",
    initialChatMessage: "Hello! I am your AI Healthcare Agent. Once you have analyzed a prescription, you can ask me questions about it.",
  },
  hi: {
    title: "पर्सनल केयर असिस्टेंट के लिए प्रिस्क्रिप्शन",
    subtitle: "विवरण निकालने, AI से जानकारी पाने और दवा के रिमाइंडर सेट करने के लिए प्रिस्क्रिप्शन अपलोड करें।",
    uploadLabel: "प्रिस्क्रिप्शन अपलोड करें",
    analyzeButton: "अभी विश्लेषण करें",
    analyzingButton: "विश्लेषण हो रहा है...",
    activeReminders: "सक्रिय गूगल कैलेंडर अनुस्मारक",
    viewInCalendar: "(कैलेंडर में देखें)",
    removeLocally: "स्थानीय रूप से हटाएं",
    removeNote: "नोट: 'स्थानीय रूप से हटाएं' पर क्लिक करने से यह रिमाइंडर केवल इस सूची से हटता है; आपको अपने गूगल कैलेंडर से आवर्ती ईवेंट को मैन्युअल रूप से हटाना होगा।",
    loadingAnalysis: "प्रिस्क्रिप्शन से विवरण निकाले जा रहे हैं...",
    analysisResults: "विश्लेषण के परिणाम",
    medicine: "दवा",
    dosage: "खुराक",
    instruction: "निर्देश",
    reminders: "अनुस्मारक",
    setReminderButton: "गूगल रिमाइंडर सेट करें",
    doctorsAdvice: "डॉक्टर की सलाह",
    getSummaryButton: "AI सारांश और सुझाव प्राप्त करें",
    generatingSummary: "सारांश और सुझाव तैयार हो रहे हैं...",
    summaryErrorTitle: "सारांश में त्रुटि",
    aiSummary: "AI-संचालित सारांश",
    healthTips: "स्वास्थ्य सुझाव",
    foodInteractions: "भोजन के साथ प्रतिक्रियाएं",
    languageSelector: "भाषा:",
    translating: "सामग्री का अनुवाद हो रहा है...",
    chatPlaceholder: "अपनी दवा के बारे में पूछें...",
    chatHeader: "हेल्थकेयर एजेंट",
    initialChatMessage: "नमस्ते! मैं आपका AI हेल्थकेयर एजेंट हूँ। एक बार जब आप प्रिस्क्रिप्शन का विश्लेषण कर लेते हैं, तो आप मुझसे इसके बारे में प्रश्न पूछ सकते हैं।",
  },
  kn: {
    title: "ವೈಯಕ್ತಿಕ ಆರೈಕೆ ಸಹಾಯಕರಿಗೆ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್",
    subtitle: "ವಿವರಗಳನ್ನು ಹೊರತೆಗೆಯಲು, AI ಒಳನೋಟಗಳನ್ನು ಪಡೆಯಲು ಮತ್ತು ಔಷಧಿ ಜ್ಞಾಪನೆಗಳನ್ನು ಹೊಂದಿಸಲು ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    uploadLabel: "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    analyzeButton: "ಈಗ ವಿಶ್ಲೇಷಿಸಿ",
    analyzingButton: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    activeReminders: "ಸಕ್ರಿಯ ಗೂಗಲ್ ಕ್ಯಾಲೆಂಡರ್ ಜ್ಞಾಪನೆಗಳು",
    viewInCalendar: "(ಕ್ಯಾಲೆಂಡರ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ)",
    removeLocally: "ಸ್ಥಳೀಯವಾಗಿ ತೆಗೆದುಹಾಕಿ",
    removeNote: "ಗಮನಿಸಿ: 'ಸ್ಥಳೀಯವಾಗಿ ತೆಗೆದುಹಾಕಿ' ಕ್ಲಿಕ್ ಮಾಡುವುದರಿಂದ ಈ ಜ್ಞಾಪನೆಯನ್ನು ಈ ಪಟ್ಟಿಯಿಂದ ಮಾತ್ರ ತೆಗೆದುಹಾಕಲಾಗುತ್ತದೆ; ನಿಮ್ಮ ಗೂಗಲ್ ಕ್ಯಾಲೆಂಡರ್‌ನಿಂದ ಮರುಕಳಿಸುವ ಈವೆಂಟ್ ಅನ್ನು ನೀವು ಹಸ್ತಚಾಲಿತವಾಗಿ ಅಳಿಸಬೇಕು.",
    loadingAnalysis: "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ನಿಂದ ವಿವರಗಳನ್ನು ಹೊರತೆಗೆಯಲಾಗುತ್ತಿದೆ...",
    analysisResults: "ವಿಶ್ಲೇಷಣೆ ಫಲಿತಾಂಶಗಳು",
    medicine: "ಔಷಧಿ",
    dosage: "ಡೋಸೇಜ್",
    instruction: "ಸೂಚನೆ",
    reminders: "ಜ್ಞಾಪನೆಗಳು",
    setReminderButton: "ಗೂಗಲ್ ಜ್ಞಾಪನೆ ಹೊಂದಿಸಿ",
    doctorsAdvice: "ವೈದ್ಯರ ಸಲಹೆ",
    getSummaryButton: "AI ಸಾರಾಂಶ ಮತ್ತು ಸಲಹೆಗಳನ್ನು ಪಡೆಯಿರಿ",
    generatingSummary: "ಸಾರಾಂಶ ಮತ್ತು ಸಲಹೆಗಳನ್ನು ರಚಿಸಲಾಗುತ್ತಿದೆ...",
    summaryErrorTitle: "ಸಾರಾಂಶ ದೋಷ",
    aiSummary: "AI-ಚಾಲಿತ ಸಾರಾಂಶ",
    healthTips: "ಆರೋಗ್ಯ ಸಲಹೆಗಳು",
    foodInteractions: "ಆಹಾರದ ಪರಸ್ಪರ ಕ್ರಿಯೆಗಳು",
    languageSelector: "ಭಾಷೆ:",
    translating: "ವಿಷಯವನ್ನು ಅನುವಾದಿಸಲಾಗುತ್ತಿದೆ...",
    chatPlaceholder: "ನಿಮ್ಮ ಔಷಧಿ ಬಗ್ಗೆ ಕೇಳಿ...",
    chatHeader: "ಆರೋಗ್ಯ ಏಜೆಂಟ್",
    initialChatMessage: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಆರೋಗ್ಯ ಏಜೆಂಟ್. ನೀವು ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅನ್ನು ವಿಶ್ಲೇಷಿಸಿದ ನಂತರ, ನೀವು ಅದರ ಬಗ್ಗೆ ನನಗೆ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು.",
  },
  ta: {
    title: "தனிப்பட்ட பராமரிப்பு உதவியாளருக்கான மருந்துச்சீட்டு",
    subtitle: "விவரங்களைப் பிரித்தெடுக்க, AI நுண்ணறிவுகளைப் பெற மற்றும் மருந்து நினைவூட்டல்களை அமைக்க ஒரு மருந்துச்சீட்டைப் பதிவேற்றவும்.",
    uploadLabel: "மருந்துச்சீட்டைப் பதிவேற்றவும்",
    analyzeButton: "இப்போது பகுப்பாய்வு செய்",
    analyzingButton: "பகுப்பாய்வு செய்யப்படுகிறது...",
    activeReminders: "செயலில் உள்ள கூகிள் கேலெண்டர் நினைவூட்டல்கள்",
    viewInCalendar: "(கேலெண்டரில் காண்க)",
    removeLocally: "உள்நாட்டில் அகற்று",
    removeNote: "குறிப்பு: 'உள்நாட்டில் அகற்று' என்பதைக் கிளிக் செய்வதன் மூலம் இந்த நினைவூட்டல் இந்தப் பட்டியலிலிருந்து மட்டுமே அகற்றப்படும்; உங்கள் கூகிள் கேலெண்டரிலிருந்து மீண்டும் மீண்டும் வரும் நிகழ்வை நீங்கள் கைமுறையாக நீக்க வேண்டும்.",
    loadingAnalysis: "மருந்துச்சீட்டிலிருந்து விவரங்கள் பிரித்தெடுக்கப்படுகின்றன...",
    analysisResults: "பகுப்பாய்வு முடிவுகள்",
    medicine: "மருந்து",
    dosage: "மருந்தளவு",
    instruction: "வழிமுறை",
    reminders: "நினைவூட்டல்கள்",
    setReminderButton: "கூகிள் நினைவூட்டலை அமைக்கவும்",
    doctorsAdvice: "மருத்துவரின் ஆலோசனை",
    getSummaryButton: "AI சுருக்கம் மற்றும் குறிப்புகளைப் பெறுங்கள்",
    generatingSummary: "சுருக்கம் மற்றும் குறிப்புகள் உருவாக்கப்படுகின்றன...",
    summaryErrorTitle: "சுருக்கப் பிழை",
    aiSummary: "AI-இயங்கும் சுருக்கம்",
    healthTips: "சுகாதார குறிப்புகள்",
    foodInteractions: "உணவு இடைவினைகள்",
    languageSelector: "மொழி:",
    translating: "உள்ளடக்கம் மொழிபெயர்க்கப்படுகிறது...",
    chatPlaceholder: "உங்கள் மருந்து பற்றி கேளுங்கள்...",
    chatHeader: "சுகாதார முகவர்",
    initialChatMessage: "வணக்கம்! நான் உங்கள் AI சுகாதார முகவர். நீங்கள் ஒரு மருந்துச்சீட்டை பகுப்பாய்வு செய்தவுடன், அதைப் பற்றி என்னிடம் கேள்விகளைக் கேட்கலாம்.",
  },
};

export default function Home() {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState('home');
  const [file, setFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [language, setLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedAnalysis, setTranslatedAnalysis] = useState<AnalysisResult | null>(null);
  const [translatedSummary, setTranslatedSummary] = useState<SummaryResult | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isFindingPharmacies, setIsFindingPharmacies] = useState(false);
  const [pharmacyError, setPharmacyError] = useState<string | null>(null);
  const [editedPrescriptionText, setEditedPrescriptionText] = useState('');
  const [currentUserLocation, setCurrentUserLocation] = useState<Location | null>(null);

  // --- Effects ---
  useEffect(() => {
    setChatMessages([{ sender: 'ai', text: uiText[language].initialChatMessage }]);
  }, [language]);

  useEffect(() => {
    const translateContent = async () => {
      if (language === 'en') {
        setTranslatedAnalysis(null);
        setTranslatedSummary(null);
        return;
      }
      if (!analysisResult) return;
      setIsTranslating(true);
      setError(null);
      try {
        const contentToTranslate = { analysis: analysisResult, summary: summaryResult };
        const response = await fetch("http://localhost:8000/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: contentToTranslate,
            target_language: language === 'hi' ? 'Hindi' : language === 'kn' ? 'Kannada' : 'Tamil'
          }),
        });
        if (!response.ok) throw new Error((await response.json()).detail || "Translation failed.");
        const translatedData = await response.json();
        setTranslatedAnalysis(translatedData.analysis);
        setTranslatedSummary(translatedData.summary);
      } catch (err: any) {
        setError(`Translation error: ${err.message}`);
      } finally {
        setIsTranslating(false);
      }
    };
    translateContent();
  }, [language, analysisResult, summaryResult]);

  useEffect(() => {
    if (analysisResult) {
      const generatedText = analysisResult.medications
        .map(med => `${med.name} ${med.dosage} ${med.instruction}`)
        .join('\n');
      setEditedPrescriptionText(generatedText);
    }
  }, [analysisResult]);

  // --- Event Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setAnalysisResult(null);
      setSummaryResult(null);
      setTranslatedAnalysis(null);
      setTranslatedSummary(null);
      setError(null);
      setSummaryError(null);
      setEditedPrescriptionText('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Please select a prescription image first."); return; }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setSummaryResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("http://localhost:8000/analyze", { method: "POST", body: formData });
      if (!response.ok) throw new Error((await response.json()).detail || "Analysis failed.");
      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);
      setActiveTab('analysis');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAnalysis = async () => {
    if (!editedPrescriptionText.trim()) {
      setError("The prescription text cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setSummaryResult(null);
    try {
      const response = await fetch("http://localhost:8000/re-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edited_text: editedPrescriptionText }),
      });
      if (!response.ok) throw new Error((await response.json()).detail || "Re-analysis failed.");
      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);
      setActiveTab('analysis');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetSummary = async () => {
    if (!analysisResult) return;
    setIsSummaryLoading(true);
    setSummaryError(null);
    setSummaryResult(null);
    setTranslatedSummary(null);
    const medicationNames = analysisResult.medications.map(med => med.name).filter(name => !['illegible', 'n/a'].includes(name.toLowerCase()));
    if (medicationNames.length === 0) {
      setSummaryError("No valid medication names to summarize.");
      setIsSummaryLoading(false);
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/summarize", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medications: medicationNames }),
      });
      if (!response.ok) throw new Error((await response.json()).detail || "Failed to get summary.");
      setSummaryResult(await response.json());
    } catch (err: any) {
      setSummaryError(err.message);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const openReminderModal = (medication: Medication) => {
    setSelectedMedication(medication);
    setIsModalOpen(true);
  };

  const handleSetReminder = async () => {
    if (!selectedMedication) return;
    try {
      const response = await fetch("http://localhost:8000/set-reminder", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedMedication.name, instruction: selectedMedication.instruction, time: reminderTime }),
      });
      if (!response.ok) throw new Error((await response.json()).detail || "Failed to set reminder.");
      const result = await response.json();
      setReminders(prev => [...prev, { id: result.event_id, medicineName: selectedMedication.name, time: reminderTime, calendarLink: result.calendar_link }]);
      alert(`Reminder set!`);
      setIsModalOpen(false);
      setActiveTab('reminders');
    } catch (err: any) {
      alert(`Error setting reminder: ${err.message}`);
    }
  };

  const handleDeleteReminder = (reminderId: string) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId));
    alert("Reminder removed from local list. You must manually delete the recurring event from Google Calendar.");
  };

  const handleSendMessage = async () => {
    const userMessage = currentMessage.trim();
    if (!userMessage) return;
    const newMessages: ChatMessage[] = [...chatMessages, { sender: 'user', text: userMessage }];
    setChatMessages(newMessages);
    setCurrentMessage('');
    setIsChatLoading(true);
    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.sender, text: m.text })),
          analysis_data: analysisResult
        }),
      });
      if (!response.ok) throw new Error((await response.json()).detail || "Failed to get response.");
      const result = await response.json();
      setChatMessages(prev => [...prev, { sender: 'ai', text: result.response }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: `Sorry, I encountered an error: ${err.message}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleFindPharmacies = () => {
    setIsFindingPharmacies(true);
    setPharmacyError(null);
    setPharmacies([]);
    setCurrentUserLocation(null);

    if (!navigator.geolocation) {
      setPharmacyError("Geolocation is not supported by your browser.");
      setIsFindingPharmacies(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentUserLocation({ lat: latitude, lng: longitude });
        try {
          const response = await fetch("http://localhost:8000/find-pharmacies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude }),
          });
          if (!response.ok) {
            throw new Error((await response.json()).detail || "Failed to fetch pharmacies.");
          }
          const data: Pharmacy[] = await response.json();
          setPharmacies(data);
        } catch (err: any) {
          setPharmacyError(err.message);
        } finally {
          setIsFindingPharmacies(false);
        }
      },
      () => {
        setPharmacyError("Unable to retrieve your location. Please enable location services when prompted by your browser.");
        setIsFindingPharmacies(false);
      }
    );
  };

  const displayAnalysis = translatedAnalysis || analysisResult;
  const displaySummary = translatedSummary || summaryResult;
  const currentText = uiText[language] || uiText['en'];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analysis':
        return <AnalysisTab displayAnalysis={displayAnalysis} displaySummary={displaySummary} isSummaryLoading={isSummaryLoading} summaryError={summaryError} handleGetSummary={handleGetSummary} openReminderModal={openReminderModal} currentText={currentText} />;
      case 'reminders':
        return <RemindersTab reminders={reminders} handleDeleteReminder={handleDeleteReminder} currentText={currentText} />;
      case 'pharmacies':
        return <PharmaciesTab handleFindPharmacies={handleFindPharmacies} isFindingPharmacies={isFindingPharmacies} pharmacies={pharmacies} pharmacyError={pharmacyError} currentText={currentText} currentUserLocation={currentUserLocation} />;
      case 'assistant':
        return <AssistantTab chatMessages={chatMessages} currentMessage={currentMessage} setCurrentMessage={setCurrentMessage} handleSendMessage={handleSendMessage} isChatLoading={isChatLoading} currentText={currentText} />;
      case 'home':
      default:
        return <HomeTab handleSubmit={handleSubmit} handleFileChange={handleFileChange} isLoading={isLoading} file={file} error={error} currentText={currentText} analysisResult={analysisResult} editedPrescriptionText={editedPrescriptionText} setEditedPrescriptionText={setEditedPrescriptionText} handleUpdateAnalysis={handleUpdateAnalysis} />;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 bg-gray-50 font-sans">
      {isTranslating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="text-white text-lg flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {currentText.translating}...
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">{currentText.title}</h1>
          <p className="text-lg text-gray-600 mt-2">{currentText.subtitle}</p>
        </div>

        <div className="flex justify-end items-center mb-4">
          <label htmlFor="language-select" className="mr-2 font-medium text-gray-700">{currentText.languageSelector}</label>
          <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)} className="p-2 border border-gray-300 rounded-md shadow-sm text-black">
            <option value="en">English</option><option value="hi">हिंदी (Hindi)</option><option value="kn">ಕನ್ನಡ (Kannada)</option><option value="ta">தமிழ் (Tamil)</option>
          </select>
        </div>

        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button onClick={() => setActiveTab('home')} className={`${activeTab === 'home' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Home</button>
            <button onClick={() => setActiveTab('analysis')} className={`${activeTab === 'analysis' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Analysis</button>
            <button onClick={() => setActiveTab('reminders')} className={`${activeTab === 'reminders' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Reminders</button>
            <button onClick={() => setActiveTab('pharmacies')} className={`${activeTab === 'pharmacies' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Pharmacies</button>
            <button onClick={() => setActiveTab('assistant')} className={`${activeTab === 'assistant' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>AI Assistant</button>
          </nav>
        </div>

        <div>
          {renderTabContent()}
        </div>

      </div>

      {isModalOpen && selectedMedication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">Set Reminder for {selectedMedication.name}</h3>
            <p className="text-gray-600 mb-4">A **DAILY** recurring event will be created in your Google Calendar at the selected time.</p>
            <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mb-6" />
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