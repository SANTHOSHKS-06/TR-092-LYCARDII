<<<<<<< HEAD
# 🧠 Usage Pattern AI — Intelligent User Classifier

Usage Pattern AI is a robust, end-to-end machine learning system designed to analyze user activity data and group users into actionable categories: **High Activity**, **Low Activity**, and **Irregular Usage**. 

Built with a high-performance **FastAPI** backend and a stunning **Glassmorphism** frontend, this project provides both real-time individual classification and large-scale batch analysis via CSV uploads.

## 🚀 Key Features

- **Machine Learning Core**: Uses a pre-trained **Random Forest Classifier** to achieve high accuracy in behavior prediction.
- **Dynamic Analysis**: Interactive UI with real-time sliders to simulate user behavior and get instant AI feedback.
- **Batch Processing**: Drag-and-drop CSV upload zone to analyze engagement patterns across hundreds of users simultaneously.
- **Premium UI/UX**: Modern glassmorphism design with smooth animations, animated background orbs, and color-coded confidence meters.
- **Vercel Optimized**: Fully configured for serverless deployment with a unified API and static file architecture.

## 🛠️ Tech Stack

- **Backend**: Python, FastAPI, Scikit-Learn, Pandas, NumPy
- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism), JavaScript (ES6+)
- **Deployment**: Vercel (Serverless Functions)
- **Data**: Synthetic activity datasets for proof-of-concept modeling

## 📂 Project Structure

```text
usage-pattern-ai/
├── api/
│   └── main.py             # FastAPI Backend + Static Mounting
├── data/
│   ├── generate_data.py     # Dataset Generator
│   └── user_activity.csv    # Sample Activity Data
├── model/
│   ├── classifier.pkl       # Random Forest Model Artifact
│   └── scaler.pkl           # Feature Scaler Artifact
├── index.html               # Main UI Dashboard
├── style.css                # Premium Glassmorphism Styles
├── script.js                # Frontend Application Logic
├── vercel.json              # Vercel Deployment Configuration
└── requirements.txt         # Python Dependencies
```

## 💻 Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/usage-pattern-ai.git
   cd usage-pattern-ai
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server**:
   ```bash
   uvicorn api.main:app --port 8000 --reload
   ```

4. **Access the App**:
   Open [http://localhost:8000](http://localhost:8000) in your browser.

## 🌐 Deployment to Vercel

1. **Connect your GitHub** Repo to your Vercel Account.
2. Vercel will automatically detect the `vercel.json` and `api/` directory.
3. Deploy! The frontend and backend will be served from a single deployment URL.

---
Developed by **Team LYCARDII** for **Tensor '26**
=======
# pattern-usage-ai
An AI-powered classification system that analyzes user activity patterns (logins, session duration, actions) to predict engagement and churn risk using a Random Forest Classifier and a premium Glassmorphism UI.
>>>>>>> 85d33edb33721fb77aafb64021359c9e033d2451
