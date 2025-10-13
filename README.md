# 🎓 OMR Sheet Evaluator App

An intelligent **Optical Mark Recognition (OMR) and Result Processing System** for automated exam evaluation with modern web technologies.

## 🌐 Live Demo - FULLY OPERATIONAL

- **🚀 Frontend (Vercel)**: [https://scanalyze-gamma.vercel.app](https://scanalyze-gamma.vercel.app)
- **⚡ Backend (Railway)**: [https://omr-evaluator-production.up.railway.app](https://omr-evaluator-production.up.railway.app)
- **📚 API Documentation**: [https://omr-evaluator-production.up.railway.app/docs](https://omr-evaluator-production.up.railway.app/docs)

> ✅ **Status**: All systems operational | Last updated: October 13, 2025

## 🎯 Project Overview

The OMR Sheet Evaluator App is a comprehensive solution that automates the entire process of OMR-based exam evaluation. It enables teachers to create exams with customizable answer keys and allows students to submit OMR sheets for instant automated evaluation with detailed performance analytics.


## ✨ Key Features

### 👨‍🏫 For Teachers:
- ✅ **Smart Exam Creation** - Create exams with unique IDs and dynamic question counts
- ✅ **Flexible Answer Keys** - Set up to 8 answer choices (A-H) per question
- ✅ **Quick Fill Options** - Random or pattern-based answer key generation
- ✅ **Advanced Analytics** - Comprehensive performance statistics and charts
- ✅ **Export Results** - Download detailed performance reports
- ✅ **Real-time Monitoring** - Track student submissions in real-time

### 👨‍🎓 For Students:
- ✅ **Roll Number Authentication** - Secure login with student roll numbers
- ✅ **Multi-format Upload** - Support for JPG, PNG, and PDF files
- ✅ **Instant Results** - Real-time OMR processing and scoring
- ✅ **Detailed Analysis** - Question-wise performance breakdown
- ✅ **Visual Charts** - Interactive performance visualization
- ✅ **History Tracking** - View all past exam attempts

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite (fast build tool)
- **Styling:** Tailwind CSS 3 with custom design system
- **UI Components:** Heroicons, Custom premium components
- **Charts:** Recharts for data visualization
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast

### Backend
- **Framework:** FastAPI (Python) - High-performance async API
- **Database:** SQLAlchemy ORM with MySQL/SQLite support
- **Authentication:** JWT with bcrypt password hashing
- **File Processing:** Async file handling with aiofiles
- **Validation:** Pydantic models with email validation

### OMR Processing Engine
- **Computer Vision:** OpenCV 4.8 for image processing
- **Numerical Computing:** NumPy for mathematical operations
- **Image Processing:** Pillow (PIL) for image manipulation
- **OCR Support:** Tesseract integration
- **PDF Support:** PDF2Image converter

## 📁 Project Structure

```
omr-evaluator/
├── 📂 frontend/                    # React + Vite Frontend
│   ├── 📂 src/
│   │   ├── 📂 components/          # Reusable UI components
│   │   │   ├── 📂 ui/              # Base UI components (Button, Card, Input)
│   │   │   ├── LoadingSpinner.jsx  # Loading component
│   │   │   └── Navbar.jsx          # Navigation component
│   │   ├── 📂 context/             # React Context providers
│   │   │   └── AuthContext.jsx     # Authentication state management
│   │   ├── 📂 pages/               # Page components
│   │   │   ├── CreateExam.jsx      # Exam creation with random fill
│   │   │   ├── TeacherDashboard.jsx # Teacher analytics dashboard
│   │   │   ├── StudentDashboard.jsx # Student portal
│   │   │   ├── UploadOMR.jsx       # OMR sheet upload
│   │   │   └── ViewResult.jsx      # Result visualization
│   │   ├── 📂 utils/               # Utility functions
│   │   └── index.css               # Tailwind CSS styles
│   ├── package.json                # Optimized dependencies (9 core packages)
│   └── tailwind.config.js          # Custom design system
├── 📂 backend/                     # FastAPI Backend
│   ├── 📂 uploads/                 # File upload storage (auto-created)
│   ├── 📂 venv/                    # Python virtual environment
│   ├── auth.py                     # JWT authentication logic
│   ├── database.py                 # SQLAlchemy database configuration
│   ├── main.py                     # FastAPI application entry point
│   ├── models.py                   # Database models (User, Exam, Result)
│   ├── omr_processor.py            # OMR image processing engine
│   ├── schemas.py                  # Pydantic request/response models
│   ├── requirements.txt            # Optimized dependencies (16 core packages)
│   └── .env                        # Environment configuration
├── 📂 docs/                        # Project documentation
├── setup.bat                       # Windows setup script
└── README.md                       # This file
```

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **MySQL 8.0+** (for database) - *Recommended*
- **Git** (for cloning)

### 🎯 One-Click Setup (Windows)
```batch
# Clone the repository
git clone <repository-url>
cd omr-evaluator

# Option 1: MySQL Setup (Recommended)
setup_mysql_windows.bat

# Option 2: General Setup (uses SQLite by default)
setup.bat
```

### 🔧 Manual Setup

#### 1. Database Setup (MySQL Recommended)
```bash
# Install MySQL 8.0+ from https://dev.mysql.com/downloads/installer/
# Create database and user:
mysql -u root -p
CREATE DATABASE omr_evaluator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'omr_user'@'localhost' IDENTIFIED BY 'omr_password';
GRANT ALL PRIVILEGES ON omr_evaluator.* TO 'omr_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

# Install optimized dependencies (16 packages)
pip install -r requirements.txt
```

#### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install optimized dependencies (9 core packages)
npm install

# Build for production (optional)
npm run build
```

#### 4. Environment Configuration
Create `.env` file in `backend/` directory:
```env
# Database Configuration (MySQL recommended)
DATABASE_URL=mysql+pymysql://omr_user:omr_password@localhost:3306/omr_evaluator
# Alternative: DATABASE_URL=sqlite:///./omr_evaluator.db

SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30

# OMR Resubmission Settings
ALLOW_RESUBMISSION=true                    # Allow students to resubmit OMR sheets (true/false)
REQUIRE_TEACHER_APPROVAL=false             # Require teacher approval for resubmissions (future feature)
```

**Configuration Options:**
- `ALLOW_RESUBMISSION=true`: Students can resubmit OMR sheets (replaces previous submission)
- `ALLOW_RESUBMISSION=false`: Students get blocked after first submission (original behavior)
- Default: `true` (resubmissions allowed)

> 📝 **Note:** For detailed MySQL setup instructions and data migration, see [MYSQL_MIGRATION_GUIDE.md](MYSQL_MIGRATION_GUIDE.md)

## 🚀 Running the Application

### Development Mode

#### 1. Start Backend Server
```bash
cd backend
# Activate virtual environment first
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Start FastAPI development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
✅ **Backend:** http://localhost:8000  
📚 **API Docs:** http://localhost:8000/docs (Interactive Swagger UI)

#### 2. Start Frontend Development Server
```bash
cd frontend
# Start Vite development server
npm run dev
```
✅ **Frontend:** http://localhost:3001 (auto-opens in browser)

### Production Mode
```bash
# Build frontend for production
cd frontend
npm run build

# Start backend in production mode
cd ../backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 👤 Demo Accounts & Authentication

### 🏫 Teacher Account
- **Username:** `teacher`
- **Email:** `teacher@example.com`
- **Password:** `password`
- **Role:** Teacher
- **Permissions:** Create exams, view all results, analytics dashboard

### 🎓 Student Account
- **Username:** `student`  
- **Email:** `student@example.com`
- **Password:** `password`
- **Roll Number:** `2024001`
- **Role:** Student
- **Permissions:** Upload OMR, view own results

> 📝 **Note:** These are demo accounts for testing. In production:
> - Users must register with valid email addresses
> - Students must provide unique roll numbers
> - Passwords are bcrypt-hashed and stored securely
> - JWT tokens expire after 30 minutes

## 📋 How to Use

### 👨‍🏫 For Teachers:

#### 1. 🔐 Login & Setup
- Login with teacher credentials
- Access the teacher dashboard with analytics overview

#### 2. 📝 Create Exam
- Click **"Create New Exam"**
- Enter unique **Exam ID** (e.g., `MATH101`, `PHYS201`)
- Set **number of questions** (1-100)
- Choose **answer choices** (2-8 options: A-H)
- Set **maximum marks** for scoring

#### 3. 🎯 Setup Answer Key
- **Manual Entry:** Click each correct answer
- **Quick Fill:** Use "All A", "All B" etc. buttons
- **🎲 Random Fill:** NEW! Generate random answer patterns
- Save and share **Exam ID** with students

#### 4. 📊 Monitor Results
- View **real-time submissions** as students upload
- Access **detailed analytics**: scores, question-wise performance
- Export results for further analysis

### 👨‍🎓 For Students:

#### 1. 🔐 Register & Login
- Create account with **valid email** and **unique roll number**
- **IMPORTANT**: For students, roll number is **required**
- **IMPORTANT**: For teachers, do **NOT** include roll number
- Roll numbers are required for OMR submissions

#### 2. 🎯 Find Exam
- Enter **Exam ID** provided by teacher
- View exam details (questions, marks, time limit)

#### 3. 📄 Fill OMR Sheet
- Use **dark pencil/pen** for clear marks
- Fill bubbles **completely** - avoid partial marks
- Write **roll number clearly** on the sheet

#### 4. 📤 Upload & Submit
- Upload **clear photo/scan** (JPG, PNG, PDF)
- Wait for **automatic processing** (usually < 30 seconds)
- View **instant results** with detailed breakdown

#### 5. 📈 View Performance
- Check **score and percentage**
- Review **question-wise analysis**
- View **performance charts** and trends

## 📋 OMR Sheet Requirements

### 📷 Image Quality
- **📱 Format:** Clear photo or high-quality scan
- **📎 File Types:** JPG, PNG, PDF (max 10MB per file)
- **💡 Lighting:** Well-lit, avoid shadows and glare
- **📐 Alignment:** Straight, not tilted or skewed
- **🔍 Resolution:** Minimum 300 DPI for scans

### ✏️ Marking Guidelines
- **🎯 Bubble Filling:** Complete, dark fills - no partial marks
- **✏️ Writing Tool:** Dark pencil (2B/HB) or black pen
- **🚫 Avoid:** Light marks, crosses, checkmarks, or multiple marks per question
- **📝 Roll Number:** Clearly written and bubbled (if applicable)

### 📄 Layout Support
- **🔤 Choices:** Flexible support for A-H options (2-8 choices)
- **📊 Questions:** 1-100 questions per exam
- **🎨 Template:** Works with most standard OMR layouts
- **🔄 Processing:** Automatic skew correction and noise reduction

## 🔌 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | User registration with email validation | ❌ |
| `POST` | `/auth/login` | JWT token-based login | ❌ |
| `GET`  | `/auth/me` | Get current user profile | ✅ |

### 📚 Exam Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/exams/create` | Create new exam (Teacher only) | ✅ Teacher |
| `GET`  | `/exams` | List all available exams | ✅ |
| `GET`  | `/exams/{exam_id}` | Get specific exam details | ✅ |
| `PUT`  | `/exams/{exam_id}` | Update exam (Teacher only) | ✅ Teacher |
| `DELETE` | `/exams/{exam_id}` | Delete exam (Teacher only) | ✅ Teacher |

### 📄 OMR Processing
|| Method | Endpoint | Description | Auth Required |
||--------|----------|-------------|---------------|
|| `POST` | `/omr/upload` | Upload and process OMR sheet (supports resubmission) | ✅ Student |
|| `GET`  | `/omr/check-submission/{exam_id}` | Check if student has existing submission | ✅ Student |
|| `DELETE` | `/omr/submission/{exam_id}` | Delete student's submission for exam | ✅ Student |
|| `GET`  | `/omr/processing-status/{upload_id}` | Check processing status | ✅ |

### 📊 Results & Analytics
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/results/{exam_id}/{roll_number}` | Get student result | ✅ |
| `GET`  | `/results/exam/{exam_id}` | Get all results for exam (Teacher) | ✅ Teacher |
| `GET`  | `/results/analytics/{exam_id}` | Get exam analytics (Teacher) | ✅ Teacher |

### 📚 Interactive Documentation
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## ⚡ Performance & Optimization

### 🚀 Recent Optimizations
- **📦 Reduced Dependencies:** 
  - Frontend: 22 → 9 packages (59% reduction)
  - Backend: 19 → 16 packages (16% reduction)
- **⚡ Build Performance:** 25s → 15s (40% faster builds)
- **🧹 Clean Architecture:** Removed unused code and test dependencies
- **🎨 Optimized CSS:** Clean Tailwind configuration without dark mode
- **💾 Smaller Bundle:** Leaner virtual environment and node_modules

### 📊 Key Performance Metrics
- **OMR Processing:** < 30 seconds per image
- **Frontend Build:** ~15 seconds
- **API Response Time:** < 200ms average
- **Database Queries:** Optimized with proper indexing

## 🧠 Advanced OMR Processing

### 🎯 Core Features
- **🔍 Smart Bubble Detection:** Advanced contour analysis for accurate mark recognition
- **📐 Auto Skew Correction:** Handles tilted or rotated images automatically
- **🧹 Noise Reduction:** Removes artifacts and improves image quality
- **📱 Multi-format Support:** JPG, PNG, PDF with automatic format detection
- **🎨 Template-free:** Works without predefined templates
- **📊 Confidence Scoring:** Quality metrics for each detected mark

### 🔬 Processing Pipeline
1. **Image Preprocessing:** Grayscale conversion, noise reduction
2. **Geometric Correction:** Skew detection and correction
3. **Contour Detection:** Identify bubble candidates
4. **Mark Classification:** Determine filled vs empty bubbles
5. **Answer Extraction:** Map detected marks to question numbers
6. **Quality Assessment:** Generate confidence scores

### 🎛️ Processing Parameters
- **Bubble Size Range:** Auto-adaptive to different OMR formats
- **Fill Threshold:** Configurable sensitivity for mark detection
- **Error Recovery:** Handles partial marks and unclear images
- **Multi-page Support:** Process multiple pages from PDF files

## 🚀 Deployment

### 🐳 Docker Deployment (Recommended)
```bash
# Start MySQL and application
docker-compose up --build

# Or start only MySQL for development
docker-compose up mysql phpmyadmin -d
# Access phpMyAdmin at http://localhost:8080
```

### 🌐 Manual Deployment

#### Frontend (Static Hosting)
```bash
cd frontend
npm run build
# Deploy 'dist' folder to your static hosting (Netlify, Vercel, etc.)
```

#### Backend (Cloud Server)
```bash
cd backend
# Install dependencies
pip install -r requirements.txt
# Run with production ASGI server
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 🤝 Contributing

### 🔧 Development Setup
1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes with proper commit messages
5. **Test** thoroughly (add tests if needed)
6. **Push** to your branch: `git push origin feature/amazing-feature`
7. **Submit** a pull request with detailed description

### 📝 Code Standards
- **Python:** Follow PEP 8, use type hints
- **JavaScript:** Use ES6+, consistent formatting
- **CSS:** Follow Tailwind conventions
- **Git:** Conventional commit messages

## 🔧 Troubleshooting

### Common Issues

#### ❌ "Module not found" errors
```bash
# Ensure virtual environment is activated
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

#### ❌ Frontend build failures
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### ❌ OMR processing errors
- Ensure image is **well-lit** and **high quality**
- Check that bubbles are **completely filled**
- Verify **file size** is under 10MB
- Try **different image format** (JPG vs PNG)

#### ❌ Database connection issues
```bash
# For SQLite (development only)
cd backend
rm omr_evaluator.db
python -c "from database import init_db; init_db()"

# For MySQL connection issues:
# 1. Check if MySQL service is running
# 2. Verify DATABASE_URL in .env file
# 3. Test connection: mysql -u omr_user -pomr_password -h localhost
# 4. Recreate database if needed (see MYSQL_MIGRATION_GUIDE.md)
```

### 📧 Support
- **Issues:** Report bugs via GitHub Issues
- **Discussions:** Join GitHub Discussions for questions
- **Email:** Contact maintainers for urgent issues

## 📄 License

**MIT License** - see [LICENSE](LICENSE) file for details.

### 📊 Project Stats
- **Languages:** Python, JavaScript, CSS
- **Total Lines:** ~8,000+ LOC
- **Components:** 15+ React components
- **API Endpoints:** 12+ REST endpoints
- **Dependencies:** 25 total (optimized)

---

⭐ **Star this repo** if you found it helpful! ⭐
