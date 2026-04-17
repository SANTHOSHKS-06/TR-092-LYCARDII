import os
from google import genai
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

try:
    print("Listing available models...")
    for model in client.models.list():
        print(f"- {model.name}")
except Exception as e:
    print(f"Error: {e}")
