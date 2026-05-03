"""
api/journey.py — GET /api/journey/step/{step_id}?state={state}

Returns AI-generated, state-specific content for each of the 5 voter journey steps.
Results cached in-memory per (step_id, state) so Claude is only called once per pair.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from services.ai import call_ai, parse_json

router = APIRouter(prefix="/api/journey", tags=["Visual Journey"])

STEP_TITLES: dict[int, str] = {
    1: "Check your name on the Electoral Roll",
    2: "Register / Update your details",
    3: "Track your application status",
    4: "Find your polling booth",
    5: "Vote on election day",
}

# In-memory cache: (step_id, state_lower) → response dict
_cache: dict[tuple[int, str], dict] = {}

SYSTEM_PROMPT = """
You are a voter education assistant for India.
Explain one step of the voter registration/voting process in plain, simple English.
Keep all language at a Class 8 reading level. Never use legal jargon.
Never invent specific dates or deadlines.
Output ONLY valid JSON matching the schema below. No preamble, no code fences.

Schema:
{
  "step_id": number,
  "title": "string",
  "plain_english": "2-3 sentences, simple language",
  "how_to": ["step string"],
  "common_mistakes": ["mistake string"],
  "official_link": "https://..."
}
"""


class JourneyStepResponse(BaseModel):
    step_id: int
    title: str
    plain_english: str
    how_to: list[str]
    common_mistakes: list[str]
    official_link: str


@router.get("/step/{step_id}", response_model=JourneyStepResponse)
async def get_journey_step(
    step_id: int,
    state: str = Query(..., min_length=1),
):
    if step_id not in STEP_TITLES:
        raise HTTPException(status_code=400, detail="step_id must be 1–5")

    cache_key = (step_id, state.lower())
    if cache_key in _cache:
        return _cache[cache_key]

    user_msg = (
        f"The user is a first-time voter in {state}, India. "
        f"Explain step {step_id}: '{STEP_TITLES[step_id]}'. "
        f"Return the full JSON object with step_id={step_id} and title='{STEP_TITLES[step_id]}'."
    )

    try:
        raw = await call_ai(SYSTEM_PROMPT, user_msg)
        result = parse_json(raw)
        _cache[cache_key] = result
        return JourneyStepResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
