# QueueEase — AI-Powered Smart Queue Management System

**University of Sri Jayewardenepura | Faculty of Computing**  
**CCS3102 / CSE3102 / CIS3112 — Mobile Computing | Group 24**

---

## 👥 Group Members

| Name | Index No | Registration No |
|------|----------|-----------------|
| W.D.P. Buddhima | FC222048 | FC116342 |
| K.H.A. Maneesha | FC222045 | FC115744 |
| M.N.F. Afrina | FC222001 | FC115557 |

---

## 📱 About QueueEase

QueueEase is an AI-powered mobile queue management application for private doctor clinics in Sri Lanka. Patients can remotely book, track, and manage their queue position — eliminating the need to wait in crowded clinic rooms.

### Key Features
- **Remote Queue Booking** — Book a slot without physically visiting the clinic
- **Real-Time Queue Status** — Live queue position with animated position tracking
- **AI Waiting Time Prediction** — Random Forest ML model predicts estimated wait times
- **AI Chatbot (GPT)** — Answers FAQs about clinic timings, queue availability, and general instructions
- **Push Notifications** — Firebase Cloud Messaging alerts 15 min before your turn
- **Admin Dashboard** — Doctor and receptionist queue management interface
- **Secure Authentication** — Firebase Auth + JWT backend

---

## 🏗️ Project Structure

```
QueueEase/
├── app/                    # React Native mobile app (Android)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   └── ui/         # Design system: Card, Button, Input, Badge...
│   │   ├── constants/      # AI system prompts
│   │   ├── navigation/     # RootNavigator (Stack + Tab)
│   │   ├── screens/
│   │   │   ├── auth/       # Login, Register
│   │   │   ├── patient/    # Dashboard, Queue Status, Book, Chatbot
│   │   │   ├── doctor/     # Doctor queue management dashboard
│   │   │   └── receptionist/  # Receptionist walk-in management
│   │   ├── services/       # API, Firebase, Chatbot, Toast
│   │   ├── stores/         # Zustand state (auth)
│   │   ├── types/          # TypeScript interfaces
│   │   ├── utils/          # AI safety utilities
│   │   └── theme.ts        # Design tokens (colors, spacing, typography)
│   ├── package.json
│   └── app.json
│
├── backend/                # Node.js + Express REST API
│   ├── src/
│   │   ├── controllers/    # Auth, Queue, Appointment, Chatbot, Analytics...
│   │   ├── middleware/     # JWT auth, CSRF, validators, error handler
│   │   ├── models/         # MongoDB schemas (User, Queue, Clinic...)
│   │   ├── routes/         # Express route definitions
│   │   ├── services/       # FCM, Gemini AI, ML model integration
│   │   ├── sockets/        # Socket.IO for real-time queue updates
│   │   └── server.js       # Main entry point
│   └── package.json
│
├── ai/                     # Python ML microservice
│   ├── app/
│   │   ├── ml_api.py       # FastAPI endpoints
│   │   ├── models.py       # Random Forest model
│   │   ├── features.py     # Feature engineering
│   │   ├── train_model.py  # Model training
│   │   └── data_generator.py  # Synthetic training data
│   ├── Dockerfile
│   └── requirements.txt
│
└── mobile/                 # Additional mobile utilities
    ├── components/         # ChatbotDisclaimerModal
    ├── constants/          # Gemini system prompt
    ├── services/           # Gemini client
    └── utils/              # AI safety utilities
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Java Development Kit (JDK 17)
- Android Studio with Android SDK
- Python 3.10+ (for AI service)
- MongoDB Atlas account
- Firebase project

### 1. Clone the repository
```bash
git clone https://github.com/your-org/QueueEase.git
cd QueueEase
```

### 2. Set up the Backend
```bash
cd backend
cp .env.example .env
# Fill in your MongoDB URI, Firebase credentials, JWT secret, OpenAI/Gemini key
npm install
npm run dev
```

### 3. Set up the AI Service
```bash
cd ai
pip install -r requirements.txt
python app/train_model.py   # Train the Random Forest model
python run.py               # Start FastAPI on port 8000
```

### 4. Set up the Mobile App
```bash
cd app
cp .env.example .env
# Fill in your backend API URL and Firebase config
npm install
npx react-native run-android
```

---

## 🔧 Environment Variables

### Backend (`backend/.env`)
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_super_secret_key
CORS_ORIGIN=http://localhost:3001
GEMINI_API_KEY=your_gemini_api_key
FCM_SERVER_KEY=your_fcm_server_key
AI_SERVICE_URL=http://localhost:8000
```

### Mobile App (`app/.env`)
```env
REACT_APP_API_BASE_URL=http://10.0.2.2:3000/api
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_CHATBOT_API_URL=http://10.0.2.2:3000/api/chatbot
```

---

## 🤖 AI Integration

### 1. Waiting Time Prediction (Random Forest)
- **Input**: queue length, avg consultation time, time of day, day of week, historical patterns
- **Output**: estimated waiting time in minutes
- **Endpoint**: `POST /api/queues/predict-wait`
- **Model**: scikit-learn RandomForestRegressor, trained on synthetic historical clinic data

### 2. AI Chatbot (Gemini / GPT)
- **Purpose**: Answer patient FAQs about clinic timings, queue, and bookings
- **Safety**: Multi-layer input/output filtering using `aiSafetyUtils.ts`
- **Disclaimer**: First-use modal informing users the AI is not a medical professional
- **Endpoint**: `POST /api/chatbot`

---

## 📱 Screenshots

| Login | Home | Queue Status | Chatbot |
|-------|------|--------------|---------|
| Patient/Doctor role toggle | Live queue position card | Animated queue list | GPT-powered assistant |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile App | React Native 0.73, TypeScript |
| State Management | Zustand |
| Navigation | React Navigation v6 |
| Backend API | Node.js, Express.js |
| Database | MongoDB Atlas, Firebase Realtime DB |
| Authentication | Firebase Auth + JWT |
| Real-time | Socket.IO |
| AI/ML | Python, scikit-learn (Random Forest) |
| Chatbot | Gemini API (via backend proxy) |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Containerisation | Docker (AI service) |

---

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/me` | Get current user profile |
| GET | `/api/queues/current` | Get patient's current queue data |
| POST | `/api/queues/book` | Book a queue slot |
| POST | `/api/queues/cancel` | Cancel a booking |
| POST | `/api/queues/call-next` | Doctor calls next patient |
| POST | `/api/chatbot` | Send message to AI chatbot |
| GET | `/api/analytics/daily` | Get daily clinic analytics |

---

## 📄 License

This project was developed as a university coursework submission for the Mobile Computing module at the Faculty of Computing, University of Sri Jayewardenepura.

---

*Group 24 — QueueEase v2.0.0*
