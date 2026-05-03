"""
main.py — Voter-Ready FastAPI Application.

Entry point for the backend.  Start with:
    uvicorn main:app --reload

This file:
  • Creates the FastAPI app instance
  • Configures CORS so the Next.js frontend can call the API
  • Mounts routers for each feature
  • Provides a root health-check endpoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from api.eligibility import router as eligibility_router
from api.journey import router as journey_router
from api.chat import router as chat_router

# ── App instance ────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.APP_VERSION,
    description=(
        "Backend API for Voter-Ready — an educational app that helps "
        "first-time Indian voters understand the election process."
    ),
)

# ── CORS Middleware ─────────────────────────────────────────────
# The Next.js frontend runs on a different origin (port 3000 locally,
# *.vercel.app in production).  Without CORS headers the browser will
# block every fetch() call from the frontend.

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────────────

app.include_router(eligibility_router)
app.include_router(journey_router)
app.include_router(chat_router)

# ── Health check ────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    """Simple health-check — confirms the server is running."""
    return {
        "status": "ok",
        "app": settings.APP_TITLE,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }
