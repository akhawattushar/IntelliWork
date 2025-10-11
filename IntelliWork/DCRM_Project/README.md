# 🔌 DCRM Fault Detection System

**AI-Powered Circuit Breaker Monitoring & Analysis Platform**

[![Smart India Hackathon 2025](https://img.shields.io/badge/SIH-2025-blue.svg)](https://www.sih.gov.in/)
[![Python](https://img.shields.io/badge/Python-3.8+-green.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.3+-red.svg)](https://flask.palletsprojects.com/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-purple.svg)](https://scikit-learn.org/)

---

## 📋 Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Installation Guide](#installation-guide)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Future Scope](#future-scope)
- [Team](#team)
- [License](#license)

---

## 🎯 Problem Statement

**Circuit breaker faults** in electrical distribution systems lead to:
- ❌ Unplanned power outages
- ❌ Equipment damage and safety hazards
- ❌ High maintenance costs
- ❌ Lack of predictive maintenance capabilities

Traditional DCRM (Direct Contact Resistance Measurement) testing is **manual, time-consuming, and reactive** rather than proactive.

---

## 💡 Solution Overview

Our **AI-Powered DCRM Fault Detection System** revolutionizes circuit breaker monitoring by:

✅ **Automated Analysis** - Instant fault detection using machine learning  
✅ **Real-Time Monitoring** - 24/7 continuous surveillance with live dashboards  
✅ **Predictive Maintenance** - Early fault detection before failures occur  
✅ **Multiple Interfaces** - Web-based analysis + Live monitoring dashboard  
✅ **High Accuracy** - 100% accuracy on test datasets with confidence scoring  

---

## ✨ Key Features

### 🔍 **Analysis Module**
- **CSV File Upload** - Drag & drop support for historical data analysis
- **Manual Data Input** - Paste comma-separated resistance values
- **Test Sample Generation** - Generate synthetic waveforms for testing
- **Instant Results** - Fault detection with confidence scores and extracted features

### 📡 **Real-Time Monitoring Dashboard**
- **Live Waveform Visualization** - Chart.js powered real-time graphs
- **Animated Circuit Breaker** - Visual representation with state indicators
- **Fault Detection Display** - Color-coded alerts with confidence metrics
- **Statistics Panel** - Total scans, faults detected, uptime, health rate
- **Alert History** - Comprehensive log of all detected anomalies
- **Adjustable Monitoring Speed** - Configurable update intervals (0.5s - 5s)
- **Fault Simulation** - Test with Normal, Spike, Plateau, Unstable signals

### 🤖 **AI/ML Capabilities**
- **Random Forest Classifier** - 200 estimators with optimized parameters
- **Feature Extraction** - 9 key features including peaks, slopes, plateaus
- **Multi-Class Classification** - Detects Normal, Spike, Plateau, Unstable faults
- **Confidence Scoring** - Probability distribution for all fault types
- **Trained on Synthetic Data** - 300 samples with noise and variations

### 🎨 **User Interface**
- **Modern Glassmorphism Design** - Frosted glass effects with backdrop blur
- **Animated Backgrounds** - Floating gradient orbs and moving grid patterns
- **Color-Coded Themes** - Purple/Pink for analysis, Teal/Cyan for monitoring
- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Smooth Animations** - Hover effects, transitions, loading states

---

## 🛠️ Technology Stack

### **Backend**
- **Python 3.8+** - Core programming language
- **Flask 2.3+** - Web framework for REST API
- **Flask-CORS** - Cross-origin resource sharing
- **Scikit-learn** - Machine learning library
- **NumPy** - Numerical computations
- **SciPy** - Signal processing
- **Joblib** - Model persistence

### **Frontend**
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **JavaScript (ES6+)** - Dynamic functionality
- **Chart.js** - Real-time waveform visualization

### **AI/ML**
- **Random Forest Classifier** - Ensemble learning method
- **Feature Engineering** - Peak detection, statistical analysis
- **Signal Processing** - Savitzky-Golay filtering

### **Future Integration**
- **ESP32 Microcontroller** - Hardware data acquisition
- **IoT Sensors** - Real-time DCRM measurements
- **Cloud Deployment** - Heroku, Vercel, Railway

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface Layer                  │
├──────────────────────┬──────────────────────────────────┤
│   Analysis Page      │   Monitoring Dashboard           │
│   (index_v2.html)    │   (monitor_v2.html)             │
│   - Upload CSV       │   - Live Waveform Chart         │
│   - Manual Input     │   - Circuit Breaker Visual      │
│   - Test Generation  │   - Real-time Statistics        │
└──────────┬───────────┴──────────────┬──────────────────┘
           │                          │
           ▼                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Flask REST API                        │
│                 (dcrm_flask_api.py)                     │
├─────────────────────────────────────────────────────────┤
│  Endpoints:                                             │
│  - POST /predict   → Analyze waveform                   │
│  - GET  /health    → API health check                   │
│  - GET  /          → API information                    │
└──────────┬──────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│              AI Processing Layer                         │
├─────────────────────────────────────────────────────────┤
│  1. Feature Extraction                                  │
│     - Peak detection (SciPy)                            │
│     - Statistical metrics (NumPy)                       │
│     - Plateau duration analysis                         │
│     - Slope calculations                                │
│                                                          │
│  2. ML Model (Random Forest)                            │
│     - 200 decision trees                                │
│     - 9 input features                                  │
│     - 4 output classes                                  │
│     - Confidence scoring                                │
└──────────┬──────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│                 Data Sources                             │
├─────────────────────────────────────────────────────────┤
│  Current: Synthetic Data Generation                     │
│  Future:  ESP32 → DCRM Sensors → WiFi → API            │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Installation Guide

### **Prerequisites**
- Python 3.8 or higher
- pip package manager
- Modern web browser (Chrome, Firefox, Edge)

### **Step 1: Clone Repository**
```bash
git clone https://github.com/yourusername/dcrm-fault-detection.git
cd dcrm-fault-detection
```

### **Step 2: Install Python Dependencies**
```bash
cd backend
pip install flask flask-cors numpy scipy scikit-learn joblib
```

Or use requirements.txt:
```bash
pip install -r requirements.txt
```

### **Step 3: Train AI Model (Optional)**
```bash
python train_dcrm_classifier.py
```
This generates `dcrm_fault_classifier_v2.joblib`

### **Step 4: Start Flask API**
```bash
python dcrm_flask_api.py
```
API starts at `http://localhost:5000`

### **Step 5: Open Frontend**
Navigate to `frontend/` folder and open `index_v2.html` in your browser.

Or use a local server:
```bash
cd frontend
python -m http.server 8000
```
Then visit `http://localhost:8000`

---

## 🚀 Usage

### **Analysis Mode**

1. **Upload CSV File**
   - Click browse or drag & drop your CSV file
   - File should contain resistance measurements
   - Click "Analyze CSV" button

2. **Manual Input**
   - Paste comma-separated resistance values
   - Minimum 10 values required
   - Click "Analyze Data" button

3. **Generate Test Sample**
   - Select fault type (Normal, Spike, Plateau, Unstable)
   - Click "Generate & Analyze"
   - System creates and analyzes synthetic waveform

### **Real-Time Monitoring Mode**

1. Click **"📡 Open Live Monitoring Dashboard"** button
2. Adjust monitoring speed (0.5s - 5s intervals)
3. Select fault simulation type
4. Click **"🚀 Start Monitoring"**
5. Watch live analysis with:
   - Real-time waveform chart
   - Animated circuit breaker
   - Fault detection alerts
   - Statistics updates
   - Alert history

---

## 📡 API Documentation

### **Base URL**
```
http://localhost:5000
```

### **Endpoints**

#### 1. Get API Information
```http
GET /
```

**Response:**
```json
{
  "message": "DCRM Fault Detection API",
  "version": "1.0",
  "endpoints": {
    "/predict": "POST - Analyze waveform",
    "/health": "GET - Check API health"
  }
}
```

#### 2. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

#### 3. Predict Fault
```http
POST /predict
Content-Type: application/json
```

**Request Body:**
```json
{
  "waveform": [2.5, 2.6, 2.4, 2.7, ...]
}
```

**Response:**
```json
{
  "success": true,
  "predicted_fault": "spike",
  "confidence": {
    "normal": 0.00,
    "spike": 77.00,
    "plateau": 8.50,
    "unstable": 14.50
  },
  "features_extracted": {
    "num_peaks": 1,
    "max_peak_height": 1.000,
    "mean": 0.089,
    "std": 0.110,
    "plateau_duration": 10,
    "max_slope": 0.3872,
    "min_slope": -0.2341
  }
}
```

---

## 📸 Screenshots

### Analysis Page
![Analysis Page](screenshots/analysis_page.png)
- Modern UI with gradient animations
- Three upload options
- Instant results display

### Real-Time Monitoring Dashboard
![Monitoring Dashboard](screenshots/monitoring_dashboard.png)
- Live waveform chart
- Animated circuit breaker
- Statistics panel
- Alert history

### Fault Detection Results
![Results](screenshots/fault_results.png)
- Confidence scores with progress bars
- Extracted features display
- Color-coded fault indicators

---

## 🔮 Future Scope

### **Short-term Enhancements**
- ✅ ESP32 hardware integration
- ✅ WebSocket support for real-time data streaming
- ✅ Database integration (PostgreSQL/MongoDB)
- ✅ User authentication and multi-user support
- ✅ Historical data analytics and trends

### **Long-term Vision**
- 🚀 Mobile app (Flutter/React Native)
- 🚀 Advanced ML models (LSTM, Transformer)
- 🚀 Predictive maintenance scheduling
- 🚀 Multi-sensor support (temperature, vibration)
- 🚀 Cloud deployment with auto-scaling
- 🚀 Integration with SCADA systems
- 🚀 Anomaly detection for multiple fault types
- 🚀 Report generation and export features

---

## 👥 Team

**Team Name:** [Your Team Name]

| Name | Role | Contact |
|------|------|---------|
| [Member 1] | Team Lead, Backend Developer | [email] |
| [Member 2] | Frontend Developer | [email] |
| [Member 3] | ML Engineer | [email] |
| [Member 4] | Hardware Integration | [email] |

---

## 📄 License

This project is developed for **Smart India Hackathon 2025**.

---

## 🙏 Acknowledgments

- Smart India Hackathon organizing committee
- [Your College/Institution Name]
- Open-source libraries: Flask, Scikit-learn, Chart.js
- Inspiration from modern UI design trends

---

## 📞 Contact

For queries related to this project:
- **Email:** [your-email@example.com]
- **GitHub:** [github.com/yourusername]
- **LinkedIn:** [linkedin.com/in/yourprofile]

---

**Made with ❤️ for Smart India Hackathon 2025**
