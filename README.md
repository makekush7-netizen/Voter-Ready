# Voter-Ready: The Ultimate First-Time Voter Guide 🗳️

**Voter-Ready** is a premium, AI-powered civic education platform designed specifically for first-time voters in India. It simplifies the democratic process by providing personalized guidance, interactive hardware simulations, and real-time booth location.

## 🚀 Key Features

- **AI Eligibility Checker:** Instantly find out if you can vote and get a personalized action plan based on your age, state, and residency status.
- **Dynamic Voter Journey:** A beautiful, vertical dual-pane timeline that walks you through every step of the registration process with state-specific official links and common mistakes to avoid.
- **High-Fidelity EVM Simulator:** A strictly mirrored simulation of the official ECI Balloting and Control Units. Practice voting and see the VVPAT slip printed in real-time to build confidence.
- **AI Election Assistant:** A vision-enabled chatbot powered by Gemini. Ask any question or **upload a photo/screenshot** of a government form or voter ID for instant AI analysis and help.
- **Booth Locator:** Interactive Google Maps integration to find your polling booth in real-time.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, Framer Motion (for animations), Lucide React (icons), TailwindCSS.
- **Backend:** FastAPI (Python), Google GenAI (Gemini 1.5 Flash), Pydantic.
- **Security:** AES-256 PII masking for user-provided data.
- **Maps:** Google Maps JavaScript API.

## 📦 Project Structure

```text
/backend
  ├── api/           # FastAPI routers (eligibility, journey, chat)
  ├── core/          # Security, config, and core logic
  ├── services/      # AI gateway (Gemini integration)
  └── main.py        # Entry point
/frontend
  ├── app/           # Next.js pages and layouts
  ├── components/    # Reusable UI components (EVM, Map, etc.)
  ├── lib/           # API client and utilities
  └── .env.local     # Environment variables (API Keys)
```

## 🛠️ Setup & Installation

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. Add your `GEMINI_API_KEY` to `.env`
4. `uvicorn main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. Add your `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local`
4. `npm run dev`

---
*Created for a more transparent and accessible democracy.*