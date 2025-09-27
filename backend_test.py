# main.py
import pytesseract
from PIL import Image
from dotenv import load_dotenv
import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI

# --- Setup ---
# Point to Tesseract executable if it's not in your system's PATH
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Load environment variables from a .env file
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

# Initialize the Gemini model via LangChain
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", # Using a powerful model for better JSON adherence
    temperature=0,
    google_api_key=api_key
)

# --- OCR Processing ---
# Make sure to place the prescription image in the same directory or provide the full path
try:
    image_path = "C:/Users/Adithya Parameswaran/OneDrive/Desktop/Langchain_1/images/p1.jpg"
    image = Image.open(image_path)
    extracted_text = pytesseract.image_to_string(image)
    print("✅ OCR Extraction Successful.\n")
    # print("--- OCR Result ---\n", extracted_text)
except FileNotFoundError:
    print(f"❌ Error: The file '{image_path}' was not found. Please check the path.")
    exit()

# --- LLM Prompting and Data Extraction ---
# This detailed prompt asks the LLM to return a structured JSON response.
prompt_template = f"""
You are an expert medical prescription analysis AI.
Based on the following OCR text, extract the prescribed medicines, their dosages, instructions, and the doctor's final 'Advice'.

**CRITICAL RULES:**
1.  **For Missing Information:** If a specific detail (like an 'instruction') is clearly not present for a medicine, you MUST use the string "N/A".
2.  **For Unreadable Text:** If a piece of information is present but garbled or cannot be read, you MUST use the string "Illegible". Do not invent information.

Format your response as a single JSON object with two keys: "medications" and "advice".
- The "medications" key should hold a list of JSON objects, each with three keys: "name", "dosage", and "instruction".
- The "advice" key should hold a single string of the doctor's advice.

Here is the OCR text:
---
{extracted_text}
---
"""

print("🧠 Sending data to Gemini for analysis...")
response = llm.invoke(prompt_template)
print("✅ Gemini analysis complete.\n")

# --- Parsing the Response ---
try:
    # Clean the response to ensure it's a valid JSON string
    # LLMs sometimes wrap JSON in markdown backticks
    cleaned_response = response.content.strip().replace("```json", "").replace("```", "")
    
    data = json.loads(cleaned_response)

    # Populate the lists from the parsed JSON data
    medicines = [med['name'] for med in data['medications']]
    dosages = [med['dosage'] for med in data['medications']]
    instructions = [med['instruction'] for med in data['medications']]
    advice = data['advice']

    # --- Final Output ---
    print("--- Extracted Information ---")
    print(f"\n💊 Medicines: {medicines}")
    print(f"\n📋 Dosages: {dosages}")
    print(f"\n📝 Instructions: {instructions}")
    print(f"\n🧑‍⚕️ Doctor's Advice: '{advice}'")

except (json.JSONDecodeError, KeyError) as e:
    print(f"❌ Error parsing the LLM response: {e}")
    print("--- Raw Gemini Response --- \n", response.content)