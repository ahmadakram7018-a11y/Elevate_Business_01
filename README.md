# Elevate Business - AI-Powered Gmail Assistant

Elevate Business is a sophisticated, AI-driven Gmail assistant designed to streamline your email workflow. It automatically classifies incoming emails, generates concise summaries, and suggests professional replies using state-of-the-art LLMs.

## 🚀 Key Features

- **Automated Email Processing:** Fetches and processes your unread emails automatically.
- **AI Classification:** Categorizes emails as *Urgent*, *Important*, *Normal*, or *Spam*.
- **Smart Summarization:** Provides quick summaries of long or important emails.
- **AI Reply Generation:** Suggests context-aware, professional replies.
- **Integrated AI Chatbot:** An interactive assistant to help you compose or improve your emails.
- **Gmail OAuth Integration:** Securely connects to your Gmail account using Google's official API.
- **Modern Dashboard:** A clean, responsive web interface built with Next.js and Tailwind CSS.

## 🛠 Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Axios.
- **Backend:** FastAPI (Python), SQLModel, Groq (Llama 3.3).
- **Database:** SQLite (local development) / PostgreSQL (production).
- **Integrations:** Google Gmail API, Google OAuth 2.0.

## 📁 Project Structure

```text
Elevate_Business_01/
├── backend/            # FastAPI Backend
│   ├── main.py         # API Endpoints
│   ├── auth.py         # Authentication & JWT
│   ├── models.py       # SQLModel Data Models
│   └── database.py     # Database Configuration
├── frontend/           # Next.js Frontend
│   ├── src/app         # App Router Pages
│   ├── src/components  # UI Components
│   └── src/lib/api.ts  # Frontend API Client
└── skills/             # AI & Gmail Utility Skills
    ├── chatbot.py      # AI Chatbot Logic
    ├── classify_email.py # Classification Skill
    ├── read_email.py   # Gmail API Integration
    └── ...
```

## ⚙️ Setup & Installation

### Backend

1. Navigate to the backend directory: `cd Elevate_Business_01/backend`
2. Install dependencies: `pip install -r requirements.txt`
3. Configure environment variables in a `.env` file (see `.env.example`).
4. Place your Google `credentials.json` in the project root.
5. Start the server: `uvicorn main:app --reload`

### Frontend

1. Navigate to the frontend directory: `cd Elevate_Business_01/frontend`
2. Install dependencies: `npm install`
3. Configure environment variables in `.env.local`.
4. Start the development server: `npm run dev`

## 🔗 Deployment

- **Frontend:** Deployed on Vercel.
- **Backend:** Deployed on Hugging Face Spaces / Vercel.

---

*Final Touch by Gemini CLI Agent - 2026*
