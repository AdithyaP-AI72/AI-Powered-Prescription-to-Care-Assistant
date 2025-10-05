##Prescription to Personal Care Assistant
This is an AI-powered web application that analyzes medical prescriptions, provides health insights, sets medication reminders, finds nearby pharmacies, and offers a conversational AI assistant for health-related questions.

Features
Prescription Analysis: Upload an image of a prescription to extract medication details using OCR and a Gemini-powered language model.

AI Summaries: Get easy-to-understand summaries, health tips, and food interaction warnings for your medications.

Google Calendar Integration: Set daily medication reminders directly in your Google Calendar.

Nearby Pharmacies: Find the top 5 closest pharmacies using your current location, displayed on an interactive map.

AI Assistant: A conversational agent to answer questions about your prescription (e.g., "What should I do if I miss a dose?").

Multi-Language Support: The interface and analysis results can be translated into Hindi, Kannada, and Tamil.

Secure Login: Enables safe sign-in with local storage to protect data and ensure seamless access.

Voice Input: Use your voice to interact with the AI Assistant.

Tech Stack
Frontend
Framework: Next.js / React

Language: TypeScript

Styling: Tailwind CSS

Maps: Google Maps JavaScript API via @react-google-maps/api

Voice Input: Web Speech API (Browser native)

Backend
Framework: FastAPI

Language: Python

AI Integration: LangChain with langchain-google-genai

OCR: Tesseract-OCR via pytesseract

Data Validation: Pydantic

External Services & APIs
AI Model: Google Gemini

Calendar: Google Calendar API

Maps & Geolocation: Google Maps API, Google Places API

System Prerequisites
Before you begin, you need to have the following installed on your system. These are dependencies that exist outside the Python virtual environment.

Python (3.9+): Download Python

Node.js (18.x or newer): Download Node.js

Tesseract-OCR: This is required for the Optical Character Recognition (OCR) to work.

Windows: Download and run the installer from Tesseract at UB Mannheim. Important: During installation, make sure to check the box to add Tesseract to your system's PATH.

macOS (using Homebrew): brew install tesseract

Linux (Debian/Ubuntu): sudo apt-get install tesseract-ocr

🚨 Ensure that in main.py the line -- pytesseract.pytesseract.tesseract_cmd = r" The path where tesseract is downloaded ".

🚀 Setup Instructions
1. API Keys & Security Notice
⚠️ IMPORTANT: For the purpose of this hackathon, the necessary API keys have been pre-configured in the .env (backend) and .env.local (frontend) files.

2. Backend Setup
Navigate to your backend directory from the terminal.

cd path/to/your/backend

a. Create a Virtual Environment:

python -m venv venv

b. Activate the Virtual Environment:

Windows: venv\Scripts\activate

macOS/Linux: source venv/bin/activate

c. Install Python Dependencies:

pip install -r requirements.txt

d. Google Calendar Authentication:

Run the calendar_auth.py script once to authorize access to your Google Calendar. This will create a token.json file.

python calendar_auth.py

e. Run the Backend Server:

uvicorn main:app --reload

The backend will now be running at http://localhost:8000.

3. Frontend Setup
Open a new terminal and navigate to your frontend directory.

cd path/to/your/frontend

a. Install Node.js Dependencies:

npm install

b. Run the Frontend Development Server:

npm run dev

The frontend will now be running at http://localhost:3000. The API keys are already configured in the .env.local file and should work out of the box.
