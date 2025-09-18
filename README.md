🩺 AI Prescription-to-Care Assistant

AI-powered healthcare companion that turns a doctor’s prescription into a personalized care plan.

Patients can simply upload their prescription (photo or PDF), and our system automatically:

📄 Extracts text with OCR → medicines, dosage, doctor notes.

⏰ Schedules medicine reminders → recurring events synced to Google Calendar.

📅 Adds doctor appointments → directly into Google Calendar.

💊 Analyzes dosage & interactions → frequency, duration, and safety tips.

🛒 Finds cheapest medicine prices online → with alternatives & purchase links.

🔔 Sends notifications → via email/WhatsApp/SMS for timely reminders.

📊 Generates health summaries → weekly adherence + useful suggestions.

🚀 Why This Project?

Managing prescriptions is confusing and often leads to missed doses, expensive purchases, or forgotten appointments.
This project makes healthcare accessible, organized, and affordable by acting as your AI-powered prescription manager.

🔹 Workflow (User Journey)

Upload Prescription (Image/PDF)

User uploads prescription (mobile scan / photo).

OCR (Tesseract, Google Vision API, or AWS Textract) extracts:

Patient details

Medicines + dosage + frequency + duration

Doctor notes (if readable)

Medicine & Dosage Analysis (AI Agent 1)

Parse extracted text → detect:

Medicine names

Dosage frequency (e.g., 1–0–1 means morning & night)

Duration (e.g., 5 days / 2 weeks)

Standardize into a structured JSON.

Calendar Integration (AI Agent 2)

Automatically add doctor appointment dates (if mentioned) to Google Calendar.

Set medicine reminders as recurring calendar events (with notifications).

Medicine Price Comparison (AI Agent 3)

Query online pharmacy APIs/web scraping (e.g., PharmEasy, 1mg, NetMeds).

Find cheapest available options (generic alternatives if possible).

Display side-by-side price comparison → link to purchase.

Reminders & Notifications (AI Agent 4)

Push daily notifications (via email, SMS, or WhatsApp API).

“Take Paracetamol 500mg at 9 AM.”

Mark as “taken / skipped” to update adherence.

Health Insights & Suggestions (AI Agent 5)

Summarize:

Total daily dosage count (e.g., 6 tablets/day).

Food interactions (“Don’t take this antibiotic with milk”).

Generic health tips (hydration, sleep).

Provide a simple weekly summary report.

🛠️ Tech Stack

Frontend: React / Next.js + TailwindCSS

Backend: FastAPI / Flask (Python)

OCR: Tesseract / Google Vision API

AI Agents: LangChain + OpenAI

Calendar Integration: Google Calendar API

Reminders/Notifications: Twilio / WhatsApp API

Database: Firebase / SQLite
