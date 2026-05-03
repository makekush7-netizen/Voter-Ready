# Product Requirements Document — Voter-Ready
**Version:** 1.0  
**Hackathon:** Hack2Skill: Prompt Wars (Week 2)  
**Challenge:** Election Process Education  
**Status:** Ready for agent implementation  
**Date:** May 2026

---

## 1. Project Overview

Voter-Ready is a web application that educates first-time Indian voters through four interactive features. The goal is to remove the confusion, fear, and friction that prevents eligible citizens from exercising their vote. The target user is an 18–25 year old Indian citizen who has never voted, likely in a Tier-2 city like Indore (MP), using a smartphone.

The product does **not** automate government form submissions. It educates, guides, and builds confidence. The AI layer helps personalise explanations — it does not act as an agent performing actions on behalf of the user.

---

## 2. Verified Tech Stack

All versions below were confirmed current as of May 2026. Agents must use these exact versions and strings — do not substitute or upgrade without explicit instruction.

### Frontend
| Technology | Version | Notes |
|---|---|---|
| Next.js | 15.x | App Router |
| React | 19.x | |
| Tailwind CSS | 4.x | For utility styling |
| Framer Motion | 11.x | For premium animations |
| Lucide React | Latest | For iconography |
| Google Maps JS API | Latest stable | |

### Backend
| Technology | Version | Notes |
|---|---|---|
| Python | 3.11+ | Required for FastAPI |
| FastAPI | 0.115.x (latest) | ASGI, async-first |
| `google-genai` | Latest | For Gemini API calls |
| `python-dotenv` | Latest | For `.env` management |
| `cryptography` | Latest (Fernet) | For PII tokenization |

### AI Model
| Use | Model String |
|---|---|
| All AI features | `gemini-1.5-flash` |

Voter-Ready uses Google Gemini for all AI-driven features, including eligibility logic, personalized journey generation, and multi-modal vision chat.

### Hosting
| Service | What it hosts |
|---|---|
| Vercel | Next.js frontend — free tier, deploy from GitHub |
| Render | FastAPI backend — free tier (750 hrs/month), deploy from GitHub |

**Render free tier note:** Services spin down after 15 min of inactivity. For a hackathon demo this is acceptable. The first request after spin-down takes ~30 seconds — add a loading state in the frontend.

### AWS (optional, available credits: ~$200)
The developer has AWS credits but limited IAM experience and UPI-registered account (not all Bedrock models accessible). **Do not use AWS for the primary AI calls** — use the Anthropic API directly. AWS can be used for:
- S3 — static file storage if needed (optional)
- CloudWatch — logging (optional, not required for hackathon)

**Do not require the developer to set up IAM, Bedrock, or any AWS service** unless absolutely necessary. If AWS setup is needed for a specific reason, output exact CLI commands step by step.

---

## 3. Repository Structure

```
voter-ready/
├── frontend/              ← Next.js 15 App
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx       ← Single page with tab state
│   │   └── globals.css
│   ├── components/
│   │   ├── TabNav.tsx
│   │   ├── EligibilityChecker/
│   │   ├── VisualJourney/
│   │   ├── BoothLocator/
│   │   └── EVMSimulator/
│   ├── lib/
│   │   └── api.ts         ← All fetch calls to FastAPI
│   └── .env.local
│
├── backend/               ← FastAPI
│   ├── main.py
│   ├── routers/
│   │   ├── eligibility.py
│   │   └── journey.py
│   ├── services/
│   │   ├── tokenizer.py
│   │   └── claude.py
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

---

## 4. Navigation Architecture

**Critical constraint for agents:** This app uses **zero client-side routing**. There is one page (`app/page.tsx`) with a `useState` tab controller. Each feature is a component that renders/hides based on active tab. No `useRouter`, no dynamic routes, no `Link` components to other pages.

```tsx
// app/page.tsx — this is the entire navigation model
const [activeTab, setActiveTab] = useState<'eligibility' | 'journey' | 'booth' | 'evm'>('eligibility')
```

This keeps the app predictable for the developer and avoids routing complexity.

---

## 5. Features

### Feature A — Eligibility Checker
**Priority:** 1  
**AI-powered:** Yes (Gemini 1.5 Flash)  
**Backend endpoint:** `POST /api/eligibility/check`

**What it does:**  
A step-by-step form collects user info. The backend tokenizes PII and sends it to Gemini to generate a plain-English eligibility verdict and a personalized action plan.

**Form data shape:**
```typescript
interface EligibilityInput {
  age: number
  isCitizen: boolean
  state: string
  residenceDuration: '<1month' | '1-6months' | '6months+'
  hasVoterId: boolean
}
```

**PII tokenization (backend):**  
The state name and age are technically not sensitive but should still be tokenized for demo purposes — this is a hackathon showcase of the security concept. The tokenizer replaces values before sending to Claude:
```
age=21 → TKN_AGE_a3f2
state="Madhya Pradesh" → TKN_STATE_9c1a
```

**Claude prompt (backend — `services/claude.py`):**
```python
SYSTEM_PROMPT = """
You are a voter eligibility assistant for India.
You receive tokenized user data. Tokens like TKN_AGE_a3f2 represent real values you cannot see.
Treat tokens as placeholders and reason about them structurally.

Given the inputs, determine:
1. Is the user eligible to vote? (requires: age 18+, Indian citizen, 6+ months at current address)
2. If eligible and no Voter ID: which form to file (Form 6 for new registration)
3. If eligible and has Voter ID: confirm they are likely already registered, advise verification at nvsp.in
4. If not eligible: explain exactly why and what to do when they become eligible

Rules:
- Never invent specific deadlines or dates. Say "check nvsp.in for current deadlines."
- Never fabricate constituency-specific information.
- Output ONLY valid JSON. No markdown, no preamble.

Output schema:
{
  "eligible": boolean,
  "summary": "one sentence verdict in simple Hindi-friendly English",
  "form_needed": "Form 6" | "None" | null,
  "documents_needed": ["string"],
  "next_steps": ["string"],
  "caveat": "string (always end with: verify at nvsp.in or call 1950)"
}
"""
```

**Result card UI:**
- Green banner if eligible, amber if action needed, red if not eligible
- Show summary sentence prominently
- Collapsible list of documents needed
- Numbered list of next steps
- Small disclaimer linking to nvsp.in

---

### Feature B — Visual Journey
**Priority:** 2  
**AI-powered:** Yes (Gemini 1.5 Flash)  
**Backend endpoint:** `GET /api/journey/step/{step_id}?state={state}`

**What it does:**  
A premium vertical timeline showing the 5 steps of the voter journey. Gemini generates state-specific details (links, forms, tips) on demand, which are cached in-memory to save resources.

**Content structure per step (returned by API):**
```json
{
  "step_id": 1,
  "title": "Check your name on the Electoral Roll",
  "plain_english": "string (2-3 sentences, simple language)",
  "how_to": ["string"],
  "common_mistakes": ["string"],
  "official_link": "https://nvsp.in or equivalent"
}
```

**Claude prompt (backend):**
```python
SYSTEM_PROMPT = """
You are a voter education assistant for India.
Explain one step of the voter registration/voting process in plain, simple English.
The user is a first-time voter in {state}.
Keep all language at a Class 8 reading level.
Never use legal jargon. Never invent specific dates or deadlines.
Output ONLY valid JSON matching the schema provided. No preamble.
"""
```

**Performance note:** Cache step content per (step_id, state) on the backend using a simple Python dict — no database needed for hackathon.

---

### Feature C — Polling Booth Locator
**Priority:** 3  
**AI-powered:** No  
**What it does:**  
Interactive Google Map showing sample polling booths in Indore, MP. Users can search any address in India. Markers provide booth details, timings, and navigation links.

**Sample booth data (hardcode in `components/BoothLocator/boothData.ts`):**
```typescript
const SAMPLE_BOOTHS = [
  { id: 1, name: "Govt. Primary School, Vijay Nagar", lat: 22.7533, lng: 75.8937, ward: "Ward 62" },
  { id: 2, name: "Community Hall, Palasia", lat: 22.7222, lng: 75.8683, ward: "Ward 31" },
  // add 6 more realistic Indore locations
]
```

**Required documents at booth (same for all booths):**
- Voter ID card (EPIC), OR
- Any one: Aadhaar, Passport, Driving License, PAN card, Bank passbook with photo

**Google Maps setup:**  
Load via `<Script src="https://maps.googleapis.com/maps/api/js?key=...&libraries=places" />` in layout.  
Store API key in `.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.  
Agent must add a comment in code: `// Developer: add your Google Maps API key to .env.local`

**Important:** The Maps JS API key should be restricted to the Vercel deployment domain in Google Cloud Console. Include a note in the README.

---

### Feature D — EVM Simulator (Hardware Mirror)
**Priority:** 4  
**AI-powered:** No  
**What it does:**  
A strictly mirrored simulation of ECI hardware (Balloting Unit + Control Unit).
- **Control Unit:** Circular buttons, dual-row LED display.
- **Balloting Unit:** Individual blue square buttons, red LEDs, and a top-left Ready lamp.
- **VVPAT:** Animated paper slip printing for 7 seconds post-vote.
- **Audio:** Authentic haptic beep on selection.

---

### Feature E — Election AI Companion (Vision Enabled)
**Priority:** 5  
**AI-powered:** Yes (Gemini 1.5 Flash Multimodal)  
**Backend endpoint:** `POST /api/chat/`

**What it does:**  
A floating AI chatbot that handles text queries and **image uploads**. Users can upload screenshots of forms or voter IDs, and Gemini will analyze them to provide context-aware help.

**Sound:**  
On button press: generate a short beep using Web Audio API (no external audio file needed):
```javascript
const ctx = new AudioContext()
const osc = ctx.createOscillator()
osc.frequency.setValueAtTime(800, ctx.currentTime)
osc.connect(ctx.destination)
osc.start(); osc.stop(ctx.currentTime + 0.1)
```

**State machine:**
```typescript
type EVMState = 'voting' | 'vvpat' | 'confirmed'
const [screen, setScreen] = useState<EVMState>('voting')
const [selected, setSelected] = useState<number | null>(null)
```

---

## 6. PII Tokenization Layer (Backend)

This is a key demo feature — show it working visually if possible in the UI.

**Implementation (`backend/services/tokenizer.py`):**
```python
from cryptography.fernet import Fernet
import uuid

class PIITokenizer:
    def __init__(self):
        # In production: load key from AWS KMS or env var
        # For hackathon: generate once at startup, store in memory
        self.key = Fernet.generate_key()
        self.cipher = Fernet(self.key)
        self.vault: dict[str, bytes] = {}

    def tokenize(self, label: str, value: str) -> str:
        token = f"TKN_{label.upper()}_{uuid.uuid4().hex[:4]}"
        self.vault[token] = self.cipher.encrypt(value.encode())
        return token

    def detokenize(self, token: str) -> str:
        return self.cipher.decrypt(self.vault[token]).decode()

    def clear(self):
        self.vault.clear()

# Singleton — instantiated once at app startup
tokenizer = PIITokenizer()
```

**FastAPI usage:**
```python
from services.tokenizer import tokenizer

@router.post("/check")
async def check_eligibility(data: EligibilityInput):
    tokenized = {
        "age": tokenizer.tokenize("AGE", str(data.age)),
        "state": tokenizer.tokenize("STATE", data.state),
        "is_citizen": str(data.isCitizen),
        "residence": data.residenceDuration,
        "has_voter_id": str(data.hasVoterId),
    }
    result = await call_claude(tokenized)
    return result
```

---

## 7. Environment Variables

**frontend/.env.local:**
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000   # change to Render URL in production
```

**backend/.env:**
```
ANTHROPIC_API_KEY=your_key_here
ENVIRONMENT=development
```

---

## 8. CORS Configuration

The FastAPI backend must allow requests from the Next.js frontend. In `main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",  # replace with actual Vercel URL after deploy
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 9. Implementation Order for Agents

Agents must build features in this order. Do not start the next feature until the current one has working UI and backend (where applicable):

1. **Project scaffold** — both repos, tab nav shell, CORS, env files
2. **Feature D** — EVM Simulator (pure frontend, no AI, builds confidence)
3. **Feature A** — Eligibility Checker (frontend form + FastAPI + tokenizer + Claude)
4. **Feature B** — Visual Journey (frontend stepper + FastAPI + Claude)
5. **Feature C** — Booth Locator (Google Maps + sample data)
6. **Polish pass** — mobile responsiveness, loading states, error states

---

## 10. Agent Instructions

When an agent is handed this document:

- **Ask before assuming** anything not specified here, especially: Google Maps API key availability, Anthropic API key availability, preferred colour scheme.
- **Do not install packages not listed** in the tech stack without flagging it first.
- **Do not create page routes** — everything is a tab component on one page.
- **Use fictional candidate names** in EVM Simulator — no real political parties or candidates.
- **Always include loading and error states** for any component that makes a network call.
- **Comment your code** — the developer will review and learn from it.
- **No database** — all state is in-memory for the hackathon scope.

---

## 11. Out of Scope

These items are explicitly excluded from this build:

- User authentication / login
- Actual form submission to government portals
- Real-time polling booth data from ECI
- SMS/email notifications
- Multiple languages (English only for hackathon)
- Dark mode
- PWA / offline support
- Any agentic browser automation
