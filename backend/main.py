import pytesseract
from PIL import Image
from dotenv import load_dotenv
import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import io
from pydantic import BaseModel
from typing import List

# --- Setup ---
load_dotenv()
# Make sure to update this path if your Tesseract installation is different
# For Windows:
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
# For Linux/macOS, you might not need this line if tesseract is in your PATH
api_key = os.getenv("GOOGLE_API_KEY")

# --- LangChain Model Initialization ---
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
    google_api_key=api_key
)

# --- FastAPI App Initialization ---
app = FastAPI()

# --- CORS Middleware ---
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for Request Bodies ---
class MedicationList(BaseModel):
    medications: List[str]


# --- Core Analysis Logic ---
def analyze_prescription_image(image_bytes: bytes):
    """
    This function takes the image bytes, performs OCR, and gets the analysis from the LLM.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        extracted_text = pytesseract.image_to_string(image)

        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="OCR failed: No text could be extracted from the image.")

        prompt_template = f"""
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

        Format your final response as a single JSON object with two keys: "medications" and "advice".
        - The "medications" key should hold a list of JSON objects, each with three keys: "name", "dosage", and "instruction".
        - The "advice" key should hold a single string of the doctor's advice.

        Here is the OCR text:
        ---
        {extracted_text}
        ---
        """

        response = llm.invoke(prompt_template)
        
        cleaned_response = response.content.strip().replace("```json", "").replace("```", "")
        
        return json.loads(cleaned_response)

    except (json.JSONDecodeError, KeyError) as e:
        print(f"Error parsing LLM response: {e}")
        raise HTTPException(status_code=500, detail="Could not parse the analysis from the AI model.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")

# --- API Endpoints ---
@app.post("/analyze")
async def analyze_endpoint(file: UploadFile = File(...)):
    """
    The endpoint that receives the uploaded prescription image,
    processes it, and returns the analysis.
    """
    contents = await file.read()
    analysis_result = analyze_prescription_image(contents)
    return analysis_result

@app.post("/summarize")
async def summarize_endpoint(medication_list: MedicationList):
    """
    The new endpoint that receives a list of medicine names and returns
    a summary, health tips, and food interactions.
    """
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

    Example Response Structure:
    {{
        "summary": "This combination of medications is prescribed to treat...",
        "health_tips": ["Stay well-hydrated by drinking plenty of water throughout the day.", "Take the medication with food to reduce potential stomach upset."],
        "food_interactions": ["Avoid consuming grapefruit or grapefruit juice as it can interfere with the absorption of some of these medications.", "Limit high-fat meals around the time of your dose."]
    }}
    """
    try:
        response = llm.invoke(prompt_template)
        cleaned_response = response.content.strip().replace("```json", "").replace("```", "")
        return json.loads(cleaned_response)
    except (json.JSONDecodeError, KeyError) as e:
        print(f"Error parsing LLM summary response: {e}")
        raise HTTPException(status_code=500, detail="Could not parse the summary from the AI model.")
    except Exception as e:
        print(f"An unexpected error occurred during summarization: {e}")
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")
