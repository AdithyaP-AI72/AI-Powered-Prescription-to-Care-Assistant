import pytesseract
from PIL import Image
from dotenv import load_dotenv
import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import io
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# --- LangChain Message Imports ---
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

# --- Google Calendar & Maps API Imports ---
import os.path
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow 
from googleapiclient.discovery import build
from datetime import datetime, timedelta
import pytz
import googlemaps
# -----------------------------------
# --- Pathlib import for robust pathing ---
from pathlib import Path


# --- Setup ---
backend_dir = Path(__file__).resolve().parent
project_root = backend_dir.parent
dotenv_path = project_root / "frontend" / ".env.local"

if dotenv_path.exists():
    load_dotenv(dotenv_path=dotenv_path)
else:
    print(f"WARNING: Environment file not found at {dotenv_path}. Make sure it exists.")


pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
api_key = os.getenv("GOOGLE_API_KEY")
maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY")


if not api_key or not maps_api_key:
    raise ValueError("ERROR: GOOGLE_API_KEY or GOOGLE_MAPS_API_KEY is not set. Please check your .env.local file.")


# --- Google Calendar Configuration ---
TIMEZONE = "Asia/Kolkata"
CALENDAR_ID = 'primary'
SCOPES = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid",
]

# --- LangChain Model Initialization ---
llm = ChatGoogleGenerativeAI( model="gemini-2.5-flash", temperature=0, google_api_key=api_key )

# --- FastAPI App Initialization ---
app = FastAPI()
origins = [ "http://localhost:3000" ]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic Models ---
class MedicationList(BaseModel): medications: List[str]
class ReminderRequest(BaseModel): name: str; instruction: str; time: str; days_duration: int; access_token: str
class TranslationRequest(BaseModel): content: Dict[str, Any]; target_language: str
class ChatRequest(BaseModel): messages: List[Dict[str, str]]; analysis_data: Optional[Dict[str, Any]] = None
class LocationRequest(BaseModel): latitude: float; longitude: float
class ReanalysisRequest(BaseModel): edited_text: str
class RefreshTokenRequest(BaseModel): refresh_token: str

# --- Analysis Prompt ---
ANALYSIS_PROMPT_TEMPLATE = """
You are an expert medical data analysis AI. Your task is to analyze the following OCR text from a prescription and return clean, structured data.

**Primary Directive: Correct and Extract.**

**Phase 1: Correction**
- First, mentally review the entire text for common OCR errors (e.g., 'wen' should be 'when', 'tabIet' should be 'tablet').
- Use medical and general context to correct these typos to their most logical, real-world equivalent.

**Phase 2: Extraction**
- After correction, extract the information based on the following strict rules.

**CRITICAL EXTRACTION RULES:**
1.  **For Missing Information:** If a specific detail (like an 'instruction') is clearly not present for a medicine, you MUST use the string "N/A".
2.  **For Unreadable Text:** If a piece of text is so garbled that you cannot confidently correct it into a real-world medicine or a coherent instruction, you MUST use the string "Illegible".
3.  **DO NOT HALLUCINATE:** Never invent a medicine name or dosage. If the OCR text for a medicine is nonsensical (e.g., 'Vixbiet'), label its name as "Illegible" and do not attempt to create a dosage for it.
4.  **Duration (Days):** Find the total number of days the medication is prescribed for. Look for explicit terms like "for 7 days," "x 14 days," or "till 30 days" in the text associated with the medicine. If found, provide the number as an **INTEGER**. If not found or illegible, use the INTEGER **1** (assuming a minimum duration).
    
Format your final response as a single JSON object with two keys: "medications" and "advice".
- The "medications" key should hold a list of JSON objects, each with **FOUR** keys: "name", "dosage", "instruction", AND **"duration_days"** (as an integer).
- The "advice" key should hold a single string of the doctor's advice.

**Example of the required JSON format:**
{{
  "medications": [
    {{
      "name": "Augmentin 625 Duo Tablet",
      "dosage": "1 tablet",
      "instruction": "Take on empty stomach, twice daily for 5 days",
      "duration_days": 5
    }},
    {{
      "name": "Crocin Advance Tablet",
      "dosage": "1 tablet",
      "instruction": "Take when required",
      "duration_days": 1
    }}
  ],
  "advice": "Review with reports in 7 days"
}}

Your entire response MUST be only the JSON object. Do not include any other text or formatting like ```json.

Here is the text to analyze:
---
{text_to_analyze}
---
"""

# --- Core Logic ---
def get_analysis_from_text(text: str):
    prompt = ANALYSIS_PROMPT_TEMPLATE.format(text_to_analyze=text)
    cleaned_response = ""
    try:
        response = llm.invoke(prompt)
        cleaned_response = response.content.strip().replace("```json", "").replace("```", "")
        if not cleaned_response: raise ValueError("LLM returned empty analysis.")
        
        data = json.loads(cleaned_response)
        if not isinstance(data.get("medications"), list):
                raise KeyError("JSON missing 'medications' list.")
                
        for med in data["medications"]:
            if "duration_days" not in med:
                print("WARNING: Missing 'duration_days' key in a medication object.")
                
        return data

    except json.JSONDecodeError as e:
        print(f"--- JSON DECODE ERROR ---")
        print(f"Error: {e}")
        print(f"AI response that failed to parse:\n{cleaned_response}")
        print(f"-------------------------")
        raise HTTPException(status_code=500, detail="Could not get a valid analysis from the AI model (JSON format error).")
    except Exception as e:
        print(f"Error during AI analysis: {e}")
        raise HTTPException(status_code=500, detail="Could not get a valid analysis from the AI model.")


# --- OAUTH 2.0 AUTHENTICATION FLOW ---

@app.get("/auth/login")
def login_with_google():
    """Redirects the user to Google's login page using credentials.json."""
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
    
    try:
        flow = Flow.from_client_secrets_file(
            'credentials.json',
            scopes=SCOPES,
            redirect_uri="http://localhost:8000/auth/callback"
        )
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="credentials.json not found. Make sure it's in the backend directory.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create auth flow: {str(e)}")
        
    authorization_url, _ = flow.authorization_url(prompt="consent", access_type="offline")
    
    return RedirectResponse(authorization_url)


@app.get("/auth/callback")
def auth_callback(request: Request):
    """Handles the redirect from Google after user login."""
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
    
    try:
        flow = Flow.from_client_secrets_file(
            'credentials.json',
            scopes=SCOPES,
            redirect_uri="http://localhost:8000/auth/callback",
        )
        
        flow.fetch_token(authorization_response=str(request.url))
        credentials = flow.credentials
        access_token = credentials.token
        refresh_token = credentials.refresh_token

        user_info_service = build('oauth2', 'v2', credentials=credentials)
        user_info = user_info_service.userinfo().get().execute()
        email = user_info.get('email')
        
        redirect_url = f"http://localhost:3000/#access_token={access_token}&refresh_token={refresh_token}&email={email}"
        return RedirectResponse(redirect_url)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="credentials.json not found.")
    except Exception as e:
        print(f"Error in auth callback: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred during authentication callback: {str(e)}")

@app.post("/auth/refresh")
def refresh_token(request: RefreshTokenRequest):
    """Refreshes an expired access token using a refresh token."""
    try:
        with open('credentials.json', 'r') as f:
            client_secrets_config = json.load(f)["web"]

        creds = Credentials(
            None,
            refresh_token=request.refresh_token,
            token_uri=client_secrets_config["token_uri"],
            client_id=client_secrets_config["client_id"],
            client_secret=client_secrets_config["client_secret"],
            scopes=SCOPES,
        )
        creds.refresh(GoogleRequest())
        return {"access_token": creds.token}
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="credentials.json not found.")
    except Exception as e:
        print(f"Error refreshing token: {e}")
        raise HTTPException(status_code=401, detail="Could not refresh token. Please log in again.")

# --- API Endpoints ---
@app.post("/analyze")
async def analyze_endpoint(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents))
        extracted_text = pytesseract.image_to_string(image)
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="OCR failed: No text could be extracted.")
        return get_analysis_from_text(extracted_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")

@app.post("/re-analyze")
async def reanalyze_endpoint(request: ReanalysisRequest):
    return get_analysis_from_text(request.edited_text)

@app.post("/summarize")
async def summarize_endpoint(medication_list: MedicationList):
    medications = medication_list.medications
    if not medications:
        raise HTTPException(status_code=400, detail="No medication names provided.")

    prompt_template = f"""
    You are a helpful AI medical assistant. Your task is to provide clear, concise, and easy-to-understand information about the following medications for a patient.

    **Medication List:**
    {', '.join(medications)}

    **Instructions:**
    1.  **General Summary:** Write a brief, one-paragraph summary explaining the primary purpose of this combination of medications.
    2.  **Health Tips:** Provide a bulleted list of 3-5 general health tips that would be beneficial for someone taking these medications.
    3.  **Food Interactions:** Provide a bulleted list of potential food or drink interactions to be aware of. If there are no well-known major interactions for a drug, state that.

    **CRITICAL OUTPUT FORMAT:**
    - Your entire response MUST be a single, valid JSON object.
    - The JSON object must have three keys: "summary", "health_tips", and "food_interactions".
    - "summary" should contain the paragraph as a single string.
    - "health_tips" should be a list of strings.
    - "food_interactions" should be a list of strings.
    """
    try:
        response = llm.invoke(prompt_template)
        cleaned_response = response.content.strip().replace("```json", "").replace("```", "")
        return json.loads(cleaned_response)
    except (json.JSONDecodeError, KeyError) as e:
        raise HTTPException(status_code=500, detail="Could not parse the summary from the AI model.")


@app.post("/set-reminder")
async def set_reminder_endpoint(reminder_data: ReminderRequest):
    if not reminder_data.access_token:
        raise HTTPException(status_code=401, detail="Missing authentication token.")

    if reminder_data.days_duration <= 0:
       raise HTTPException(status_code=400, detail="Medication duration must be 1 day or more.")
        
    try:
        creds = Credentials(token=reminder_data.access_token)
        service = build('calendar', 'v3', credentials=creds)

        local_tz = pytz.timezone(TIMEZONE)
        today = datetime.now(local_tz).date()
        hour, minute = map(int, reminder_data.time.split(':'))
        start_datetime = local_tz.localize(datetime(today.year, today.month, today.day, hour, minute))
        end_datetime = start_datetime + timedelta(minutes=30) 
        
        last_dose_date = start_datetime.date() + timedelta(days=reminder_data.days_duration - 1)
        utc_end_of_day = local_tz.localize(datetime(last_dose_date.year, last_dose_date.month, last_dose_date.day, 23, 59, 59)).astimezone(pytz.utc)
        until_string = utc_end_of_day.strftime('%Y%m%dT%H%M%SZ')
        rrule = f'RRULE:FREQ=DAILY;INTERVAL=1;UNTIL={until_string}'
        
        event = { 
            'summary': f"Medication Reminder: Take {reminder_data.name}", 
            'description': f"Dosage/Instruction: {reminder_data.instruction} (Duration: {reminder_data.days_duration} days)", 
            'start': {'dateTime': start_datetime.isoformat(), 'timeZone': TIMEZONE}, 
            'end': {'dateTime': end_datetime.isoformat(), 'timeZone': TIMEZONE}, 
            'reminders': {'useDefault': False, 'overrides': [{'method': 'popup', 'minutes': 10}]}, 
            'recurrence': [rrule]
        }
        
        inserted_event = service.events().insert(calendarId='primary', body=event).execute()
        
        return { 
            "status": "success", 
            "message": "Reminder created successfully on Google Calendar.", 
            "event_id": inserted_event.get('id'), 
            "calendar_link": inserted_event.get('htmlLink')
        }
    except Exception as e:
        print(f"Google Calendar API Error: {e}")
        raise HTTPException(status_code=401, detail=f"Failed to create event. Your login may have expired. Please log in again.")


@app.post("/translate")
async def translate_endpoint(request: TranslationRequest):
    if not request.content:
        raise HTTPException(status_code=400, detail="No content provided for translation.")

    try:
        content_json_str = json.dumps(request.content, indent=2, ensure_ascii=False)
        prompt_template = f"""
        You are a highly skilled translation AI. Your task is to translate the user-provided JSON content into {request.target_language}.

        **CRITICAL INSTRUCTIONS:**
        1.  **Translate ONLY the string values.** Do not translate the JSON keys (e.g., "name", "dosage", "summary").
        2.  **Preserve the original JSON structure EXACTLY.** The output must be a valid JSON object with the same keys and nesting.
        3.  **Keep special medical terms as is:** Do not translate specific medical terms or strings like "N/A" or "Illegible".
        4.  **Handle numbers:** Numbers should not be translated or changed.
        5.  **Language Script:** Use the native script for the target language (e.g., Devanagari for Hindi).
        6.  **Your final output must ONLY be the translated JSON object, and nothing else.** Do not wrap it in ```json``` or add any conversational text.

        **TARGET LANGUAGE:** {request.target_language}

        **JSON TO TRANSLATE:**
        ---
        {content_json_str}
        ---
        """
        response = llm.invoke(prompt_template)
        cleaned_response = response.content.strip().replace("```json", "").replace("```", "")
        if not cleaned_response: raise ValueError("LLM returned an empty response for translation.")
        return json.loads(cleaned_response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal server error occurred during translation: {str(e)}")

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    context_str = "No prescription data available."
    if request.analysis_data:
        context_str = f"The user's current prescription analysis is:\n{json.dumps(request.analysis_data, indent=2)}"

    system_prompt = f"""
    You are an AI Healthcare Planning Agent. Your primary role is to assist users with questions about their medication schedule and general health inquiries based on their prescription.

    **Your Core Traits:**
    - **Proactive:** You anticipate user needs.
    - **Reasoning:** You understand interactions, risks, and schedules based on the provided context.
    - **Personalized:** Your advice is tailored to the user's specific prescription data.
    - **Autonomous:** You can provide clear next steps and suggestions without needing manual intervention for simple queries.
    - **Explainable:** You provide the reasoning for your advice.

    **IMPORTANT SAFETY RULE:** You are an AI assistant, NOT a doctor. You MUST ALWAYS include a disclaimer to consult a healthcare professional for any medical decisions. Never give definitive medical advice. You can provide information and suggestions based ONLY on the data provided.

    **User's Prescription Context:**
    {context_str}

    Now, please continue the conversation with the user.
    """
    langchain_messages = [SystemMessage(content=system_prompt)]
    for msg in request.messages[1:]:
        if msg["role"] == 'user': langchain_messages.append(HumanMessage(content=msg["text"]))
        elif msg["role"] == 'ai': langchain_messages.append(AIMessage(content=msg["text"]))
    try:
        response = llm.invoke(langchain_messages)
        return {"response": response.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred in the AI chat agent: {str(e)}")

@app.post("/find-pharmacies")
async def find_pharmacies_endpoint(location: LocationRequest):
    if not maps_api_key:
        raise HTTPException(status_code=503, detail="Google Maps API key is not configured on the server.")
    
    gmaps = googlemaps.Client(key=maps_api_key)
    
    try:
        places_result = gmaps.places_nearby(
            location=(location.latitude, location.longitude),
            keyword='pharmacy',
            rank_by='distance'
        )
        results = []
        for place in places_result.get('results', [])[:5]:
            place_id = place.get('place_id')
            place_geometry = place.get('geometry') 
            
            if not place_id or not place_geometry: 
                continue

            details = gmaps.place(place_id=place_id, fields=['formatted_phone_number'])
            place_details = details.get('result', {})
            
            results.append({
                'name': place.get('name'),
                'address': place.get('vicinity'),
                'phone': place_details.get('formatted_phone_number', 'N/A'),
                'geometry': place_geometry 
            })
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while searching for pharmacies: {str(e)}")