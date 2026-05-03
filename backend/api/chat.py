from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import base64

from services.ai import call_ai, call_ai_vision

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

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    try:
        if req.image_base64:
            # Strip base64 header if present e.g. "data:image/png;base64,..."
            b64_data = req.image_base64
            if "," in b64_data:
                b64_data = b64_data.split(",", 1)[1]
            
            image_bytes = base64.b64decode(b64_data)
            reply = await call_ai_vision(
                system_prompt=SYSTEM_PROMPT,
                user_message=req.message or "Please analyze this image.",
                image_bytes=image_bytes,
                mime_type=req.mime_type or "image/jpeg"
            )
        else:
            if not req.message.strip():
                raise HTTPException(status_code=400, detail="Message cannot be empty")
            reply = await call_ai(
                system_prompt=SYSTEM_PROMPT,
                user_message=req.message
            )
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Chat error: {str(e)}")
