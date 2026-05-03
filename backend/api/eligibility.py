"""
api/eligibility.py — POST /api/eligibility/check

Eligibility logic is computed here (server-side, deterministic).
Gemini is only used to write the human-readable explanation text.
This avoids the broken pattern of asking AI to reason about opaque tokens.
"""

from typing import Literal
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from core.security import tokenizer
from services.ai import call_ai, parse_json

router = APIRouter(prefix="/api/eligibility", tags=["Eligibility"])

# Gemini only writes the explanation — eligibility logic is already computed.
SYSTEM_PROMPT = """
You are a friendly voter education assistant for India, helping first-time voters.
You will receive a structured eligibility determination that has already been computed.
Your job is ONLY to write clear, encouraging, plain-English explanations — not to re-evaluate eligibility.

Rules:
- Write at Class 8 reading level. Short sentences. No legal jargon.
- Never invent dates or deadlines. Say "check nvsp.in for current deadlines."
- Be encouraging. A "not eligible" result should still feel supportive, not discouraging.
- Output ONLY valid JSON. No markdown, no preamble, no code fences.

Output schema:
{
  "eligible": boolean,
  "summary": "one clear sentence — what the result means for this person",
  "form_needed": "Form 6" | "None" | null,
  "documents_needed": ["string — plain description, not legalese"],
  "next_steps": ["string — concrete action the person can take right now"],
  "caveat": "one sentence ending with: verify at nvsp.in or call 1950"
}
"""


class EligibilityInput(BaseModel):
    age: int = Field(..., ge=1, le=150)
    isCitizen: bool
    state: str = Field(..., min_length=1)
    residenceDuration: Literal["<1month", "1-6months", "6months+"]
    hasVoterId: bool


class EligibilityResult(BaseModel):
    eligible: bool
    summary: str
    form_needed: str | None = None
    documents_needed: list[str] = []
    next_steps: list[str] = []
    caveat: str = ""


@router.post("/check", response_model=EligibilityResult)
async def check_eligibility(data: EligibilityInput):
    # ── Step 1: Compute eligibility with deterministic logic ──────────────
    # Never ask AI to evaluate booleans — it can't see the actual values
    # behind tokens. We compute the verdict ourselves.
    age_ok       = data.age >= 18
    citizen_ok   = data.isCitizen
    residence_ok = data.residenceDuration == "6months+"
    is_eligible  = age_ok and citizen_ok and residence_ok

    # Determine what form is needed (only if eligible and no voter ID yet)
    form_needed = "Form 6" if (is_eligible and not data.hasVoterId) else None

    # ── Step 2: Build a clear, factual brief for the AI ───────────────────
    # Only the state is tokenized (it's the only non-logical value AI uses for context)
    tokenized_state = tokenizer.tokenize("STATE", data.state)

    reasons_not_eligible = []
    if not age_ok:
        reasons_not_eligible.append(f"age is {data.age} (must be 18 or above)")
    if not citizen_ok:
        reasons_not_eligible.append("not an Indian citizen")
    if not residence_ok:
        label = {"<1month": "less than 1 month", "1-6months": "1–6 months"}.get(data.residenceDuration, data.residenceDuration)
        reasons_not_eligible.append(f"has only lived at current address for {label} (needs 6+ months)")

    user_msg = f"""
Eligibility determination (already computed — do NOT change the 'eligible' field):
- eligible: {str(is_eligible).lower()}
- age_meets_requirement: {str(age_ok).lower()}
- is_indian_citizen: {str(citizen_ok).lower()}
- residence_meets_requirement: {str(residence_ok).lower()}
- has_voter_id: {str(data.hasVoterId).lower()}
- state (tokenized for privacy): {tokenized_state}
- form_needed: {"Form 6" if form_needed else "none"}
- ineligibility_reasons: {reasons_not_eligible if reasons_not_eligible else "none — user is fully eligible"}

Generate the JSON explanation. The 'eligible' field in your output MUST match: {str(is_eligible).lower()}
"""

    try:
        raw = await call_ai(SYSTEM_PROMPT, user_msg)
        result_dict = parse_json(raw)
        # Enforce our own eligibility verdict — never trust AI to override it
        result_dict["eligible"] = is_eligible
        if form_needed:
            result_dict["form_needed"] = form_needed
        return EligibilityResult(**result_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
