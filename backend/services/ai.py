"""
services/ai.py — Gemini AI gateway.

Single function: call_ai(system, user) → str
All endpoints route through here.
"""

import json
import asyncio
from google import genai
from google.genai import types
from ..core.config import settings

_client = genai.Client(api_key=settings.GEMINI_API_KEY)


def _generate(system_prompt: str, user_message: str) -> str:
    """Synchronous Gemini call (run via asyncio.to_thread)."""
    response = _client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=user_message,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.4,
        ),
    )
    return response.text

def _generate_vision(system_prompt: str, user_message: str, image_bytes: bytes, mime_type: str) -> str:
    """Synchronous Gemini call with an image part."""
    response = _client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            user_message
        ],
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.4,
        ),
    )
    return response.text


async def call_ai(system_prompt: str, user_message: str) -> str:
    """Async wrapper around the blocking Gemini SDK call."""
    return await asyncio.to_thread(_generate, system_prompt, user_message)

async def call_ai_vision(system_prompt: str, user_message: str, image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    """Async wrapper for multimodal generation."""
    return await asyncio.to_thread(_generate_vision, system_prompt, user_message, image_bytes, mime_type)


def parse_json(text: str) -> dict:
    """Strip markdown fences if present, then parse JSON."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        # Drop first line (```json) and last line (```)
        text = "\n".join(lines[1:-1])
    return json.loads(text)
