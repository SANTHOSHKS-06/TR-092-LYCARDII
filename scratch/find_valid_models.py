import os
from google import genai
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

try:
    models = list(client.models.list())
    for m in models:
        # Check if it supports generateContent
        if 'generateContent' in m.supported_generation_methods:
             print(f"VALID: {m.name}")
except Exception as e:
    print(f"Error: {e}")
