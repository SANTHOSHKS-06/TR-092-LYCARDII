import os
from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from dotenv import load_dotenv

# Load environment variables from the project root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

app = FastAPI(title="Usage Pattern Classifier API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API using the new google-genai SDK
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    client = genai.Client(api_key=GOOGLE_API_KEY)
else:
    client = None

# Load models using absolute path for Vercel compatibility
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

with open(os.path.join(BASE_DIR, 'model', 'classifier.pkl'), 'rb') as f:
    clf = pickle.load(f)
with open(os.path.join(BASE_DIR, 'model', 'scaler.pkl'), 'rb') as f:
    scaler = pickle.load(f)

class UserActivity(BaseModel):
    login_frequency: float
    avg_session_duration: float
    actions_per_session: float
    days_since_last_login: float
    total_sessions: float

from fastapi.staticfiles import StaticFiles

# Add the static mount at the bottom of the file (or after route definitions)
# to avoid it catching /predict and other routes. We will put it at the very bottom later.
# For now, let's just make sure we export what we need.

@app.post("/predict")
def predict(user: UserActivity):
    features = np.array([[
        user.login_frequency,
        user.avg_session_duration,
        user.actions_per_session,
        user.days_since_last_login,
        user.total_sessions
    ]])
    
    scaled = scaler.transform(features)
    prediction = clf.predict(scaled)[0]
    probabilities = clf.predict_proba(scaled)[0]
    confidence = round(float(max(probabilities)) * 100, 2)
    
    emoji_map = {
        'high_activity': '🟢',
        'low_activity': '🟡',
        'irregular_usage': '🔴'
    }
    
    return {
        "prediction": prediction,
        "emoji": emoji_map.get(prediction, '⚪'),
        "confidence": f"{confidence}%",
        "all_classes": dict(zip(clf.classes_, [round(p*100, 2) for p in probabilities]))
    }

import pandas as pd
import io

class BatchRequest(BaseModel):
    csv_text: str

@app.post("/predict_batch")
def predict_batch(req: BatchRequest):
    df = pd.read_csv(io.StringIO(req.csv_text))
    
    features = ['login_frequency', 'avg_session_duration', 'actions_per_session', 'days_since_last_login', 'total_sessions']
    
    # Check if necessary columns are present
    missing_cols = [c for c in features if c not in df.columns]
    if missing_cols:
        return {"error": f"Missing columns in CSV: {', '.join(missing_cols)}"}
        
    X = df[features]
    scaled = scaler.transform(X)
    predictions = clf.predict(scaled)
    
    unique, counts = np.unique(predictions, return_counts=True)
    distribution = {str(k): int(v) for k, v in zip(unique, counts)}
    
    return {
        "total": len(predictions),
        "distribution": distribution,
        "predictions": predictions.tolist()
    }

import urllib.request
import json



@app.get("/health")
def health():
    return {"status": "ok"}

class ChatRequest(BaseModel):
    message: str
    context: dict = None

@app.post("/chat")
def chat(req: ChatRequest):
    if not client:
        return {"response": "System Error: GOOGLE_API_KEY is not configured in the environment. Please set it to enable the Gemini AI assistant."}
        
    msg = req.message
    ctx = req.context
    
    if not ctx or not ctx.get('result'):
        return {"response": "I'm the Gemini-powered AI Assistant. Please analyze some traffic data first so I can interpret your specific user patterns!"}
    
    dist = ctx['result']['distribution']
    total = ctx['result']['total']
    topic = ctx.get('topic', 'the active dataset')
    
    # Construct professional prompt for Gemini
    prompt = f"""
    You are the "Usage Pattern Intelligence Assistant", a high-level data analyst expert.
    
    ENVIRONMENT CONTEXT:
    - Target Source: {topic}
    - Analysis Sample Size: {total}
    - Distribution Metrics: {json.dumps(dist)}
    
    USER QUERY:
    "{msg}"
    
    INSTRUCTIONS:
    1. If the user is just greeting you (e.g., "hi", "hello", "good morning"), respond warmly and professionally, offering to help with their data analysis.
    2. For technical queries, base your answer strictly on the provided distribution metrics and source context.
    3. Be concise, expert, yet approachable.
    4. If the user asks for suggestions, use the distribution data to suggest specific engagement, scaling, or audit strategies.
    5. Maintain a sophisticated data analyst persona that is helpful and easy to talk to.
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt
        )
        return {"response": response.text}
    except Exception as e:
        return {"response": f"Gemini API Communication Error: {str(e)}"}

# Mount static files at root to serve index.html, style.css, script.js locally without messing up Vercel
app.mount("/", StaticFiles(directory=BASE_DIR, html=True), name="static")