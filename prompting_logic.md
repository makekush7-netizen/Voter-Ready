# Prompting Logic & Development Process

## 1. Research & Problem Identification
My initial research into the civic participation of youth in India revealed three primary barriers for first-time voters:
- **Eligibility Confusion:** Uncertainty about whether they meet the legal requirements to vote.
- **Complicated Registration:** The official process is often perceived as daunting and bureaucratic.
- **Logistical Hurdles:** Difficulty in locating their specific polling booth on election day.

## 2. Innovative Feature: Hardware Familiarization
To go beyond just providing information, I conceived an extra layer of engagement: **Hardware Familiarization**. Most first-time voters have never seen or touched an Electronic Voting Machine (EVM). By designing a high-fidelity, interactive UI that mirrors the actual hardware used by the Election Commission of India (ECI), I aimed to reduce "booth anxiety" and make users feel comfortable and prepared before they even step into a polling station.

## 3. The "Pair-AI" Workflow
To build this project efficiently, I utilized a multi-model AI strategy within my Antigravity environment:
- **Phase 1 (Backend):** I tasked **Claude** to read the PRD and architect the FastAPI backend, focusing on security (PII masking), state-specific logic, and Gemini AI integration.
- **Phase 2 (Frontend):** I tasked **Gemini 1.5 Pro** to read the design specifications and build the modern, glassmorphism-inspired React frontend, ensuring high visual fidelity and interactive components like the vertical journey timeline.
- **Phase 3 (Integration & Optimization):** Once the core modules were ready, I asked **Gemini** to link the frontend and backend, debug connection issues (CORS, fetch errors), restore the Google Maps integration, and structure the entire repository for final deployment.

This collaborative approach allowed me to leverage the specific strengths of different models to create a professional-grade civic tool in record time.
