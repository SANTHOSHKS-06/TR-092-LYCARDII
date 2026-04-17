# 🧠 Wikipedia Intelligence — AI-Powered Behavioral Command Center

Wikipedia Intelligence is a sophisticated, real-time analytics ecosystem designed to map user behavior patterns using high-fidelity Machine Learning and Generative AI. Beyond simple classification, the system acts as a **Behavioral Command Center**, providing predictive diagnostics and conversational intelligence for developers.

Built for **TENSOR '26**, this project leverages a high-performance **FastAPI** backend and a premium **Glassmorphism** terminal interface.

---

## 🚀 Key Features

### 1. 🤖 AI Intelligence Assistant
Integrated with **Google Gemini (1.5/2.0/3.1)**, the dashboard features a context-aware chatbot.
- **Contextual Reasoning**: The AI "reads" your live dashboard telemetry (distributions, risk scores, article context) to answer specific developer queries.
- **Strategic Advice**: Provides natural language suggestions for system optimizations and user engagement strategies.

### 2. 🌐 Global Live Stream Integration
Connects directly to the **Wikimedia REST API** to map real-time behavioral heartbeats across the encyclopedia.
- **Topic-Aware Diagnostics**: Analyze traffic for specific entities (e.g., NASA, Python, History) to see localized usage anomalies.
- **Last Updated Heartbeat**: Synchronized system timestamps for real-time telemetry verification.

### 3. 📊 Advanced Predictive Diagnostics
- **Churn Risk Meter**: A real-time probability index (0-100) detecting the likelihood of user dropout and irregular usage volatility.
- **Session Quality Index (SQI)**: A high-fidelity health score based on **Stability, Engagement Rate, Retention Index, and System Health**.
- **AI Recommendation Engine**: Generates prioritized intervention cards (High/Medium/Low) based on traffic volatility.

### 4. 📈 Longitudinal Traffic Mapping
Integrated with **ApexCharts.js**, the system provides a 7-day longitudinal view of traffic distribution, allowing for the detection of peak vs. off-peak behavioral anomalies.

---

## 🛠️ Tech Stack

- **Intelligence**: Google Gemini AI (SDK v1.0+), Scikit-Learn (Random Forest)
- **Backend**: Python 3.13, FastAPI, Pandas, NumPy, Python-Dotenv
- **Frontend**: HTML5, Vanilla CSS3 (Premium Glassmorphism), Javascript (ES6), ApexCharts.js
- **Deployment**: Vercel (Serverless Edge Functions)

---

## 💻 Local Setup & AI Activation

### 1. Clone & Install
```bash
git clone https://github.com/SANTHOSHKS-06/TR-092-LYCARDII.git
cd TR-092-LYCARDII
pip install -r requirements.txt
```

### 2. Activate Gemini AI
Create a `.env` file in the root directory and add your key:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 3. Launch the Terminal
```bash
uvicorn api.main:app --port 8000 --reload
```
Open [http://localhost:8000](http://localhost:8000) to enter the Intelligence Command Center.

---

## 📂 Project Architecture

```text
usage-pattern-ai/
├── api/
│   └── main.py             # Gemini Assistant Hub + ML Routing
├── model/
│   ├── classifier.pkl       # Random Forest Intelligence
│   └── scaler.pkl           # Feature Normalization
├── index.html               # Prediction Dashboard
├── wikipedia.html           # Live Intelligence Hub
├── style.css                # Glassmorphism Design System
├── script.js                # Real-time Telemetry Control
├── .env                     # AI Credentials (Local)
└── vercel.json              # Cloud Edge Deployment logic
```

---
**Developed by Team LYCARDII for Tensor '26**
