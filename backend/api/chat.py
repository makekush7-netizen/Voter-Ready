from fastapi import APIRouter, HTTPException, Security
from pydantic import BaseModel
from typing import Optional
import base64

from ..services.ai import call_ai, call_ai_vision
from ..core.auth import verify_api_key

router = APIRouter(prefix="/api/chat", tags=["AI Chatbot"])

SYSTEM_PROMPT = """
You are the official Election AI Assistant for Voter-Ready, a platform to help first-time Indian voters.
Your job is to answer questions about:
1. Voter eligibility and registration
2. Required documents (Voter ID, Aadhaar, PAN, etc.)
3. How to use an EVM
4. Finding polling booths

Be concise, incredibly polite, and highly accurate. Do NOT invent legal information.
If the user uploads an image (like a screenshot of an error, a form, or an ID card), 
analyze it carefully and guide them on what it means or what to do next. Do not process 
PII directly (advise them to redact sensitive details if they uploaded something sensitive).
Limit your responses to 2-3 short paragraphs at most.
"""

class ChatRequest(BaseModel):
    message: str
    image_base64: Optional[str] = None
    mime_type: Optional[str] = "image/jpeg"

class ChatResponse(BaseModel):
    reply: str

# Allowed MIME types for image uploads
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_IMAGE_SIZE_MB = 5  # 5 MB limit


@router.post("/", response_model=ChatResponse)
async def chat_endpoint(
    req: ChatRequest,
    api_key: str = Security(verify_api_key)
):
    """
    Chat with the AI Election Assistant.
    Supports text messages and image analysis (vision).
    """
    try:
        if req.image_base64:
            # Validate image size
            b64_data = req.image_base64
            if "," in b64_data:
                b64_data = b64_data.split(",", 1)[1]
            
            # Rough size check (base64 is ~33% larger than binary)
            size_mb = len(b64_data) / (1024 * 1024 * 1.33)
            if size_mb > MAX_IMAGE_SIZE_MB:
                raise HTTPException(
                    status_code=413,
                    detail=f"Image too large. Max {MAX_IMAGE_SIZE_MB} MB allowed."
                )
            
            # Validate MIME type
            mime_type = req.mime_type or "image/jpeg"
            if mime_type not in ALLOWED_MIME_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported image type. Allowed: {', '.join(ALLOWED_MIME_TYPES)}"
                )
            
            # Decode and validate base64
            try:
                image_bytes = base64.b64decode(b64_data)
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid base64 encoding")
            
            # Call vision API
            reply = await call_ai_vision(
                system_prompt=SYSTEM_PROMPT,
                user_message=req.message or "Please analyze this image.",
                image_bytes=image_bytes,
                mime_type=mime_type
            )
        else:
            # Text-only message
            if not req.message.strip():
                raise HTTPException(status_code=400, detail="Message cannot be empty")
            reply = await call_ai(
                system_prompt=SYSTEM_PROMPT,
                user_message=req.message
            )
        return ChatResponse(reply=reply)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Chat error: {str(e)}")

