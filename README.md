# **🩺 AI Prescription-to-Care Assistant** 

AI-powered healthcare companion that turns a doctor’s prescription into a personalized care plan.
AI-Agent Powered Prescription-to-Care Assistant
This project is a full-stack web application designed to help users digitize and understand their medical prescriptions. It uses Optical Character Recognition (OCR) to read an uploaded prescription image and a powerful Large Language Model (LLM) to extract, correct, and structure the information.

Project Architecture
The application is built with a modern decoupled architecture:

Frontend: A user-friendly interface built with Next.js and React, allowing users to upload a prescription image and view the results.

Backend: A powerful API server built with FastAPI (Python) that handles the core logic, including OCR processing and AI analysis.

Prerequisites
Before you begin, ensure you have the following installed on your system:

Tesseract-OCR Engine: This is required for the OCR functionality.

Download and install it from the official Tesseract documentation.

Important: During installation on Windows, make sure to note the installation path. The default is typically C:\Program Files\Tesseract-OCR. You may need to update this path in backend/main.py if yours is different.

Python: (Version 3.8 or higher recommended).

Download from python.org.

Node.js: (LTS version recommended).

Download from nodejs.org. This includes npm, the Node package manager.

Setup Instructions
Follow these steps to get the application running locally.

1. Backend Setup (FastAPI Server)
The backend is responsible for all the heavy lifting.

Navigate to the Backend Directory:

cd backend

Create and Activate a Python Virtual Environment:

This isolates the project's Python dependencies.

# Create the virtual environment
python -m venv .venv

# Activate it (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Or for Windows Command Prompt
# .\.venv\Scripts\activate

Your terminal prompt should now be prefixed with (.venv).

Install Python Dependencies:

All required packages are listed in requirements.txt.

pip install -r requirements.txt

Configure Environment Variables:

The backend needs your Google API key to work.

In the backend folder, create a file named .env.

Add your API key to this file like so:

GOOGLE_API_KEY="YOUR_SECRET_API_KEY_HERE"

2. Frontend Setup (Next.js App)
The frontend is what you see and interact with in the browser.

Navigate to the Frontend Directory:

From the project's root folder, run:

cd frontend

Install Node.js Dependencies:

This will download all the necessary packages for the React app, like Tailwind CSS.

npm install

Running the Application
To run the full-stack application, you must have two separate terminals open and running simultaneously.

Terminal 1: Start the Backend Server
Make sure you are in the backend directory.

Make sure your Python virtual environment is activated ((.venv) is visible).

Run the Uvicorn server:

uvicorn main:app --reload

The server will start and be available at http://localhost:8000. Leave this terminal running.

Terminal 2: Start the Frontend App
Make sure you are in the frontend directory.

Run the Next.js development server:

npm run dev

The frontend application will start and be available at http://localhost:3000.

You can now open your web browser and navigate to http://localhost:3000 to use the Prescription-to-Care Assistant!


Patients can simply upload their prescription (photo or PDF), and our system automatically:

📄 Extracts text with OCR → medicines, dosage, doctor notes.

⏰ Schedules medicine reminders → recurring events synced to Google Calendar.

📅 Adds doctor appointments → directly into Google Calendar.

💊 Analyzes dosage & interactions → frequency, duration, and safety tips.

🛒 Finds cheapest medicine prices online → with alternatives & purchase links.

🔔 Sends notifications → via email/WhatsApp/SMS for timely reminders.

📊 Generates health summaries → weekly adherence + useful suggestions.



🛠️ Tech Stack

Frontend: React / Next.js + TailwindCSS

Backend: FastAPI / Flask (Python)

OCR: Tesseract / Google Vision API

AI Agents: LangChain + OpenAI

Calendar Integration: Google Calendar API

Reminders/Notifications: Twilio / WhatsApp API

Database: Firebase / SQLite
