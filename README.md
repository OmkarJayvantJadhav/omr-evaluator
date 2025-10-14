<div align="center">

# 🎓 SCANALYZE

### Smart OMR Sheet Evaluator

*Automated exam evaluation with AI-grade accuracy*

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://scanalyze-smart-omr-evaluator.vercel.app)
[![Backend API](https://img.shields.io/badge/API-operational-blue?style=for-the-badge)](https://omr-evaluator-production.up.railway.app)
[![License](https://img.shields.io/badge/license-MIT-purple?style=for-the-badge)](LICENSE)

[Live Demo](https://scanalyze-smart-omr-evaluator.vercel.app) • [API Docs](https://omr-evaluator-production.up.railway.app/docs) • [Report Bug](https://github.com/OmkarJayvantJadhav/omr-evaluator/issues)

</div>

---



## 🎯 Overview

SCANALYZE is a comprehensive OMR (Optical Mark Recognition) evaluation system that automates exam grading with AI-powered accuracy. Teachers create exams with customizable answer keys, students upload their OMR sheets, and get instant results with detailed analytics.

## ✨ Features

<table>
<tr>
<td width="50%">

### 👨‍🏫 For Teachers
- 📝 Smart exam creation with flexible answer keys (A-H)
- 🎲 Random answer key generation
- 📊 Real-time analytics & performance tracking
- 📥 Export results to CSV/PDF
- 🔍 Question-wise performance insights

</td>
<td width="50%">

### 👨‍🎓 For Students
- 🔐 Secure roll number authentication
- 📤 Multi-format upload (JPG, PNG, PDF)
- ⚡ Instant automated grading
- 📈 Detailed performance breakdown
- 📊 Interactive charts & history

</td>
</tr>
</table>

## 🛠️ Tech Stack

```mermaid
graph LR
    A[React + Vite] --> B[FastAPI]
    B --> C[MySQL/SQLite]
    B --> D[OpenCV OMR Engine]
    D --> E[Result Analytics]
```

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Axios |
| **Backend** | FastAPI, SQLAlchemy, JWT Auth, Pydantic |
| **Database** | MySQL 8.0+ / SQLite |
| **OMR Engine** | OpenCV 4.8, NumPy, Pillow, Tesseract OCR |
| **Deployment** | Vercel (Frontend), Railway (Backend), Docker |

## 📁 Project Structure

```
omr-evaluator/
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route pages
│   │   ├── context/       # Auth & state
│   │   └── utils/         # Helpers
│   └── package.json
│
├── backend/               # FastAPI
│   ├── main.py           # API entry
│   ├── auth.py           # JWT auth
│   ├── database.py       # DB config
│   ├── models.py         # DB models
│   ├── omr_processor.py  # OMR engine
│   └── requirements.txt
│
└── docker-compose.yml    # Docker setup
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8.0+ (recommended) or SQLite

### Installation

```bash
# Clone repository
git clone https://github.com/OmkarJayvantJadhav/omr-evaluator.git
cd omr-evaluator

# Backend setup
cd backend
python -m venv venv
venv\Scripts\activate  # Windows | source venv/bin/activate (Linux/Mac)
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install

# Configure environment
# Create backend/.env with your database URL and secret key
```

### Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
venv\Scripts\activate
uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 👤 Demo Accounts

| Role | Username | Password | Roll Number |
|------|----------|----------|-------------|
| 👨‍🏫 Teacher | `teacher` | `password` | - |
| 👨‍🎓 Student | `student` | `password` | `2024001` |

> **Note:** Demo accounts for testing. Production requires email validation and secure passwords.

## 📋 Usage Guide

### 👨‍🏫 Teachers
1. **Create Exam** → Set exam ID, questions (1-100), answer choices (A-H)
2. **Setup Answer Key** → Manual entry, quick fill, or random generation
3. **Monitor Results** → Real-time analytics, question-wise performance, export reports

### 👨‍🎓 Students
1. **Register** → Valid email + unique roll number (required)
2. **Find Exam** → Enter exam ID from teacher
3. **Fill OMR** → Use dark pen/pencil, fill bubbles completely
4. **Upload** → Clear photo/scan (JPG, PNG, PDF, max 10MB)
5. **View Results** → Instant scoring with detailed breakdown

## 📋 OMR Sheet Requirements

| Aspect | Requirements |
|--------|-------------|
| **Format** | JPG, PNG, PDF (max 10MB) |
| **Quality** | Clear, well-lit, 300+ DPI |
| **Alignment** | Straight, no tilt/skew |
| **Marking** | Complete dark fills (2B pencil/black pen) |
| **Layout** | 1-100 questions, A-H answer choices |

> **Tip:** Auto skew correction and noise reduction included!

## 🔌 API Documentation

**Interactive API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

Key endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - JWT authentication
- `POST /api/exams/create` - Create exam (Teacher)
- `POST /api/omr/upload` - Upload & process OMR (Student)
- `GET /api/exams/{exam_id}/statistics` - Exam analytics (Teacher)

## ⚡ Performance

- **OMR Processing:** < 30 seconds per image
- **API Response:** < 200ms average
- **Frontend Build:** ~15 seconds
- **Dependencies:** Optimized (9 frontend, 16 backend packages)

### OMR Engine Features
- ✅ Smart bubble detection with contour analysis
- ✅ Auto skew correction for tilted images
- ✅ Noise reduction & quality enhancement
- ✅ Template-free processing
- ✅ Multi-page PDF support
- ✅ Confidence scoring for accuracy

## 🚀 Deployment

### Docker (Recommended)
```bash
# Using Docker Compose (MySQL + Backend + phpMyAdmin)
docker compose up -d --build

# Access services
# Backend: http://localhost:8000
# phpMyAdmin: http://localhost:8080
```

### Manual Deployment
```bash
# Frontend (Vercel/Netlify)
cd frontend && npm run build
# Deploy 'dist' folder

# Backend (Railway/Render)
cd backend
pip install -r requirements.txt
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

> See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Module not found | Activate venv: `venv\Scripts\activate` then `pip install -r requirements.txt` |
| Build failures | Clear cache: `rm -rf node_modules && npm install` |
| OMR errors | Ensure well-lit, high-quality images with complete bubble fills |
| DB connection | Check MySQL service, verify `DATABASE_URL` in `.env` |

## ⚙️ Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL=mysql+pymysql://user:pass@localhost:3306/omr_evaluator
SECRET_KEY=your-secret-key-here
JWT_EXPIRE_MINUTES=30
ALLOW_RESUBMISSION=true
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8000
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the SCANALYZE Team**

⭐ Star this repo if you found it helpful!

[Report Bug](https://github.com/OmkarJayvantJadhav/omr-evaluator/issues) • [Request Feature](https://github.com/OmkarJayvantJadhav/omr-evaluator/issues) • [Documentation](https://omr-evaluator-production.up.railway.app/docs)

</div>
