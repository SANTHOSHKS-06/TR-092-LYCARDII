# 🧠 Usage Pattern AI — The Behavioral Intelligence Command Center

**Usage Pattern AI** is a state-of-the-art, real-time analytics ecosystem designed to transform raw web telemetry into predictive behavioral intelligence. Developed for the **TENSOR '26** hackathon, this platform moves beyond traditional descriptive analytics, offering a cohesive suite of Machine Learning diagnostics and Generative AI conversational support.

---

## 💎 The Vision: From Data to Intelligence
In modern high-traffic environments like Wikipedia, understanding "what" happened is no longer sufficient. Developers need to know "why" behavior shifts occur and "how" to intervene. **Usage Pattern AI** bridges this gap by mapping real-time traffic to specific behavioral cohorts, providing a 360-degree view of platform health.

---

## 🧠 The Intelligent Core: Machine Learning
At the heart of the system is a high-performance **Random Forest Classifier** designed for multi-class behavioral mapping.

### 📊 Behavioral Feature Set
The model analyzes five critical vectors to categorize users:
- **Login Frequency**: Measure of baseline stability.
- **Session Duration**: Engagement depth per visit.
- **Actions per Session**: Real-time interactivity density.
- **Recency (Days Since Last Login)**: Predictive churn signal.
- **Total Historical Sessions**: Long-term retention benchmarking.

### 🛠️ Classification Pipeline
Using a **StandardScaler** preprocessing layer, the system normalizes live data streams before inference, allowing the ensemble model to deliver high-confidence predictions across **High Activity**, **Low Activity**, and **Irregular Usage** profiles.

---

## 🤖 GenAI Bridge: Google Gemini Integration
The system features a seamless integration with **Google Gemini (1.5 / 2.0 / 3.1)** via the latest **`google-genai` SDK**, creating a "Developer-Aware" Intelligence Assistant.

- **Conversational Telemetry**: The AI Assistant directly "reads" the live dashboard state. When you ask a question, the backend bundles your current traffic distributions, risk scores, and article context into the query.
- **Strategic Roadmapping**: Instead of generic advice, the AI provides prioritized intervention strategies based strictly on *your* currently analyzed dataset.
- **Sophisticated Analyst Persona**: The bot acts as an approachable but expert Data Analyst, balancing technical precision with natural conversational flow.

---

## 📊 The Diagnostic Suite
The dashboard is engineered to provide executive-level insights at a glance through its "Intelligence Terminal":

### ⚠️ Churn Risk Meter
A predictive probability index (0-100) that calculates the immediate risk of user dropout. This heuristic is dynamically weighted based on the density of detected "Irregular Usage" profiles in a given stream.

### 🎯 Session Quality Index (SQI)
A multi-factor health score that benchmarks platform performance across four key dimensions:
- **Stability Score**: Consistency of usage patterns.
- **Engagement Rate**: Interactivity vs. idle sessions.
- **Retention Index**: Longitudinal user stickiness.
- **Overall System Health**: Aggregated population viability.

### 💡 AI Recommendations
The system automatically generates prioritized "Strategic Intervention Cards." Based on volatility, it may suggest anything from a "Forensic Audit of Irregular Streams" to "Accelerated Reward Programs for High-Activity Cohorts."

---

## 🌐 Wikipedia Live Intelligence Hub
Direct integration with the **Wikimedia REST API (v1)** allows developers to stress-test their models against live encyclopedic traffic.
- **Topic-Aware Diagnostics**: Compare user behavior across wildly different article categories (e.g., *NASA* vs. *The Beatles*).
- **Longitudinal Mapping**: Integrated with **ApexCharts.js** to visualize the daily distribution of cohorts over a 7-day rolling window.

---

## 🛠️ Technical Stack
- **AI/ML**: Google Gemini Pro (v1.0+ SDK), Scikit-Learn (Random Forest Engine)
- **Backend**: Python 3.13, FastAPI (Asynchronous Routing), Pandas, NumPy, Python-Dotenv
- **Frontend**: HTML5 Semantic Foundation, CSS3 (Premium Glassmorphism Design System), Vanilla JS (Telemetry Controller), ApexCharts.js
- **Cloud/Infra**: Vercel Serverless Edge Functions, unified static/API mounting.

---

## 🚀 Setup & AI Activation

### 1. Environment Configuration
To activate the Generative AI engine, create a `.env` file in the root directory:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 2. Local Installation
```bash
# Clone the repository
git clone https://github.com/SANTHOSHKS-06/TR-092-LYCARDII.git
cd TR-092-LYCARDII

# Install high-performance dependencies
pip install -r requirements.txt

# Launch the Intelligence Command Center
uvicorn api.main:app --port 8000 --reload
```
Open [http://localhost:8000](http://localhost:8000) to begin the analysis.

---
**Developed by Team LYCARDII for TENSOR '26**
