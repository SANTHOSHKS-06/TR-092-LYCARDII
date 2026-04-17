import os
from google import genai
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

try:
    for m in client.models.list():
        if 'gemini' in m.name and 'generateContent' in m.supported_actions:
             print(f"VALID GEMINI: {m.name}")
except Exception as e:
    print(f"Error: {e}")
