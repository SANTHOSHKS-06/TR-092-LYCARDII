import os
from google import genai
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

# Specific aliases from ListModels
model_names = [
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-1.5-flash-001",
    "gemini-1.5-pro-001"
]

for name in model_names:
    try:
        print(f"Testing model: {name}...")
        response = client.models.generate_content(model=name, contents="hi")
        print(f"SUCCESS with {name}!")
        # Print actual model name used
        print(f"Full model path: {response.model_version}")
        break
    except Exception as e:
        print(f"FAILED with {name}: {e}")
