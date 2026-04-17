import os
from google import genai
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

# Standard stable models
model_names = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    "gemini-1.0-pro"
]

for name in model_names:
    try:
        print(f"Testing model: {name}...")
        response = client.models.generate_content(model=name, contents="hi")
        print(f"SUCCESS with {name}!")
        break
    except Exception as e:
        print(f"FAILED with {name}: {e}")
