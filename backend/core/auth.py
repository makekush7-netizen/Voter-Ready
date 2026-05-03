"""
core/auth.py — Simple API key authentication.

All endpoints require the X-API-Key header with the correct key.
In production, use JWT or OAuth2 instead.
"""

from fastapi import HTTPException, Security, Header
from typing import Optional


async def verify_api_key(x_api_key: Optional[str] = Header(None)) -> str:
    """
    Simple API key verification.
    Pass the API key in X-API-Key header.
    """
    from .config import settings
    
    if not x_api_key:
        raise HTTPException(
            status_code=403,
            detail="Missing X-API-Key header"
        )
    
    if x_api_key != settings.API_KEY:
        raise HTTPException(
            status_code=403,
            detail="Invalid API key"
        )
    
    return x_api_key
