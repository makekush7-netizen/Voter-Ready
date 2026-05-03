"""core/config.py — Central settings loaded from .env"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class Settings:
    # API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    API_KEY: str = os.getenv("API_KEY", "")
    
    # Models
    GEMINI_MODEL: str = "gemini-2.5-pro"

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    APP_TITLE: str = "Voter-Ready API"
    APP_VERSION: str = "1.0.0"

    # CORS — parse from env comma-separated or use defaults
    _cors_env = os.getenv("CORS_ORIGINS", "http://localhost:3000")
    CORS_ORIGINS: list[str] = [origin.strip() for origin in _cors_env.split(",")]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "30"))


settings = Settings()
