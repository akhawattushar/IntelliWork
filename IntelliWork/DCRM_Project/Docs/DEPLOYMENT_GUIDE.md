# 🚀 Deployment Guide

**Deploy DCRM Fault Detection System to Production**

---

## 📋 Table of Contents

- [Deployment Options](#deployment-options)
- [Local Deployment](#local-deployment)
- [Cloud Deployment](#cloud-deployment)
  - [Heroku](#option-1-heroku)
  - [Railway](#option-2-railway)
  - [Vercel + Backend](#option-3-vercel--separate-backend)
- [Environment Configuration](#environment-configuration)
- [Production Checklist](#production-checklist)

---

## 🎯 Deployment Options

| Platform | Cost | Difficulty | Best For |
|----------|------|------------|----------|
| **Local** | Free | Easy | Development, Testing |
| **Heroku** | Free tier available | Medium | Full-stack apps |
| **Railway** | Free $5 credit/month | Easy | Quick deployment |
| **Vercel** | Free | Easy | Frontend only |
| **AWS/Azure** | Pay as you go | Hard | Enterprise scale |

---

## 💻 Local Deployment

### **For Hackathon Demo**

This is the simplest option for presenting at Smart India Hackathon.

#### **Step 1: Start Backend**
```bash
cd DCRM_Project/backend
python dcrm_flask_api.py
```

Backend runs at `http://localhost:5000`

#### **Step 2: Start Frontend**

**Option A: Direct File Access**
```bash
cd DCRM_Project/frontend
# Double-click index_v2.html
```

**Option B: Local Server (Recommended)**
```bash
cd DCRM_Project/frontend
python -m http.server 8000
```

Frontend runs at `http://localhost:8000`

#### **Step 3: Test**
- Open browser to `http://localhost:8000`
- Upload CSV or generate test sample
- Verify results appear correctly

---

## ☁️ Cloud Deployment

### **Option 1: Heroku**

Heroku is great for full-stack applications with free tier support.

#### **Prerequisites**
```bash
# Install Heroku CLI
# Windows: Download from heroku.com
# Mac: brew install heroku/brew/heroku
# Linux: snap install heroku --classic

# Login
heroku login
```

#### **Step 1: Prepare Backend for Heroku**

Create `runtime.txt` in backend folder:
```
python-3.10.12
```

Create `Procfile` in backend folder:
```
web: python dcrm_flask_api.py
```

Create `requirements.txt`:
```bash
cd DCRM_Project/backend
pip freeze > requirements.txt
```

Or manually create with:
```
Flask==2.3.3
Flask-CORS==4.0.0
numpy==1.24.3
scipy==1.11.1
scikit-learn==1.3.0
joblib==1.3.2
gunicorn==21.2.0
```

Update `dcrm_flask_api.py` to use PORT environment variable:
```python
import os

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
```

#### **Step 2: Deploy to Heroku**

```bash
cd DCRM_Project/backend

# Initialize git repository
git init
git add .
git commit -m "Initial commit"

# Create Heroku app
heroku create dcrm-fault-detection

# Deploy
git push heroku master

# Check logs
heroku logs --tail
```

Your API will be at: `https://dcrm-fault-detection.herokuapp.com`

#### **Step 3: Update Frontend**

In `app_v2.js` and `monitor_v2.js`, change:
```javascript
// Old
const API_URL = 'http://localhost:5000';

// New
const API_URL = 'https://dcrm-fault-detection.herokuapp.com';
```

#### **Step 4: Deploy Frontend**

**Option A: GitHub Pages**
```bash
cd DCRM_Project
git add frontend/
git commit -m "Add frontend"
git push origin main

# Enable GitHub Pages in repository settings
# Source: main branch, /frontend folder
```

**Option B: Netlify Drop**
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag & drop your `frontend` folder
3. Done! Get instant URL

---

### **Option 2: Railway**

Railway offers simple deployment with free credits.

#### **Step 1: Sign Up**
- Go to [railway.app](https://railway.app)
- Sign up with GitHub

#### **Step 2: Deploy Backend**

```bash
cd DCRM_Project/backend

# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

Railway automatically detects Python and installs dependencies!

#### **Step 3: Get Your URL**
```bash
railway domain
```

Your API: `https://dcrm-fault-detection.up.railway.app`

#### **Step 4: Update Frontend API URLs**
Change `API_URL` in JavaScript files as shown above.

---

### **Option 3: Vercel + Separate Backend**

Deploy frontend on Vercel (fastest), backend elsewhere.

#### **Step 1: Deploy Frontend to Vercel**

```bash
cd DCRM_Project

# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel
```

Follow prompts. Your frontend will be live!

#### **Step 2: Deploy Backend**
Use Heroku or Railway for backend (see above).

#### **Step 3: Update CORS**
In `dcrm_flask_api.py`:
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['https://your-vercel-url.vercel.app'])
```

---

## ⚙️ Environment Configuration

### **Environment Variables**

Create `.env` file in backend:
```
FLASK_ENV=production
PORT=5000
MODEL_PATH=./dcrm_fault_classifier_v2.joblib
ALLOWED_ORIGINS=https://your-frontend-url.com
```

Install python-dotenv:
```bash
pip install python-dotenv
```

Update `dcrm_flask_api.py`:
```python
from dotenv import load_dotenv
import os

load_dotenv()

# Use environment variables
port = int(os.getenv('PORT', 5000))
model_path = os.getenv('MODEL_PATH', 'dcrm_fault_classifier_v2.joblib')
```

---

## ✅ Production Checklist

### **Before Deployment**

- [ ] **Test locally** - Ensure everything works
- [ ] **Train AI model** - Generate .joblib file
- [ ] **Update API URLs** - Change localhost to production URLs
- [ ] **Test with real data** - Verify accuracy
- [ ] **Check CORS** - Allow frontend domain
- [ ] **Error handling** - Add try-catch blocks
- [ ] **Security** - Remove debug mode, add rate limiting

### **Backend Checklist**

- [ ] `requirements.txt` created
- [ ] `Procfile` added (for Heroku)
- [ ] Model file (.joblib) included
- [ ] Flask debug mode disabled
- [ ] CORS configured for frontend domain
- [ ] PORT environment variable used
- [ ] Error logging implemented

### **Frontend Checklist**

- [ ] API URL updated to production
- [ ] All file paths are relative
- [ ] Images optimized for web
- [ ] Test on multiple browsers
- [ ] Mobile responsive verified
- [ ] Loading states added
- [ ] Error messages user-friendly

### **Security Checklist**

- [ ] No hardcoded credentials
- [ ] API rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] HTTPS enabled (automatic on most platforms)
- [ ] CORS properly configured
- [ ] Error messages don't expose system details

---

## 🌐 Custom Domain (Optional)

### **Add Custom Domain to Heroku**
```bash
heroku domains:add www.dcrm-monitor.com
```

### **Add Custom Domain to Vercel**
1. Go to project settings
2. Add domain
3. Update DNS records as instructed

---

## 📊 Monitoring & Analytics

### **Heroku**
```bash
# View logs
heroku logs --tail

# Monitor resource usage
heroku ps
```

### **Railway**
```bash
# View logs
railway logs

# Open dashboard
railway open
```

### **Add Analytics (Optional)**

Add Google Analytics to `index_v2.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-ID');
</script>
```

---

## 🚨 Troubleshooting

### **Heroku Build Fails**
- ✅ Check `requirements.txt` is in backend folder
- ✅ Verify Python version in `runtime.txt`
- ✅ Ensure `Procfile` has no file extension
- ✅ Check build logs: `heroku logs --tail`

### **CORS Errors**
- ✅ Add frontend URL to CORS origins
- ✅ Check protocol (http vs https)
- ✅ Verify CORS middleware is before routes

### **Model Not Loading**
- ✅ Ensure .joblib file is committed to git
- ✅ Check file path is correct
- ✅ Verify model was trained with same scikit-learn version

### **Slow Performance**
- ✅ Use production WSGI server (gunicorn)
- ✅ Enable caching for static files
- ✅ Optimize model inference
- ✅ Consider CDN for frontend assets

---

## 💰 Cost Estimates

### **Heroku**
- **Free tier**: 550 dyno hours/month, sleeps after 30min inactivity
- **Hobby**: $7/month, never sleeps
- **Standard**: $25-50/month, auto-scaling

### **Railway**
- **Free**: $5 credit/month (~500 hours)
- **Developer**: $5/month + usage
- **Team**: $20/month + usage

### **Vercel**
- **Hobby**: Free, unlimited bandwidth
- **Pro**: $20/month, advanced features

---

## 📞 Support

For deployment issues:
- **Heroku**: [devcenter.heroku.com](https://devcenter.heroku.com)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)

---

**Made with ❤️ for Smart India Hackathon 2025**
