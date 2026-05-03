"""
api/eligibility.py — POST /api/eligibility/check

Eligibility logic is computed deterministically (no AI needed).
Responses use pre-written templates for consistency and cost savings.
"""

import json
from pathlib import Path
from typing import Literal
from fastapi import APIRouter, HTTPException, Security
from pydantic import BaseModel, Field
from ..core.auth import verify_api_key

router = APIRouter(prefix="/api/eligibility", tags=["Eligibility"])

# Load templates at startup
_templates = {}

def _load_templates():
    """Load eligibility templates from static JSON file."""
    global _templates
    try:
        data_file = Path(__file__).resolve().parent.parent / "data" / "eligibility_templates.json"
        with open(data_file, "r") as f:
            raw = json.load(f)
            _templates = raw.get("templates", {})
    except Exception as e:
        raise RuntimeError(f"Failed to load eligibility templates: {str(e)}")


# Initialize on module load
_load_templates()


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
async def check_eligibility(
    data: EligibilityInput,
    api_key: str = Security(verify_api_key)
):
    """
    Check voter eligibility based on deterministic rules.
    Returns pre-written helpful guidance tailored to why they may be ineligible.
    """
    # ── Step 1: Compute eligibility with deterministic logic ──────────────
    age_ok       = data.age >= 18
    citizen_ok   = data.isCitizen
    residence_ok = data.residenceDuration == "6months+"
    is_eligible  = age_ok and citizen_ok and residence_ok

    # Determine what form is needed (only if eligible and no voter ID yet)
    form_needed = "Form 6" if (is_eligible and not data.hasVoterId) else None

    # ── Step 2: Select appropriate template ──────────────────────────────
    template_key = None
    
    if is_eligible:
        template_key = "eligible_no_voter_id" if not data.hasVoterId else "eligible"
    elif not age_ok:
        template_key = "ineligible_age"
    elif not citizen_ok:
        template_key = "ineligible_citizenship"
    elif not residence_ok:
        template_key = "ineligible_residence"
    else:
        # Fallback (should not reach here)
        template_key = "ineligible_residence"
    
    # ── Step 3: Load template and return ────────────────────────────────
    if template_key not in _templates:
        raise HTTPException(status_code=500, detail="Template not found")
    
    template = _templates[template_key]
    
    return EligibilityResult(
        eligible=is_eligible,
        summary=template.get("summary", ""),
        form_needed=template.get("form_needed") if is_eligible else None,
        documents_needed=template.get("documents_needed", []),
        next_steps=template.get("next_steps", []),
        caveat=template.get("caveat", "")
    )

