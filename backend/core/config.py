"""core/config.py — Central settings loaded from .env"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")


class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = "gemini-2.5-flash"

    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    APP_TITLE: str = "Voter-Ready API"
    APP_VERSION: str = "1.0.0"

    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "https://*.vercel.app",
    ]


settings = Settings()
