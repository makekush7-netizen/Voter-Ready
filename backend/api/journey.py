"""
api/journey.py — GET /api/journey/step/{step_id}

Returns state-agnostic voter journey steps from static JSON data.
No AI calls needed — these steps are identical across all states,
only the official links change (handled by frontend).
"""

import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query, Security
from pydantic import BaseModel
from ..core.auth import verify_api_key

router = APIRouter(prefix="/api/journey", tags=["Visual Journey"])


class JourneyStepResponse(BaseModel):
    step_id: int
    title: str
    plain_english: str
    how_to: list[str]
    common_mistakes: list[str]
    official_link: str


# Load journey data once at startup
_journey_data = {}

def _load_journey_data():
    """Load journey steps from static JSON file."""
    global _journey_data
    try:
        data_file = Path(__file__).resolve().parent.parent / "data" / "journey_steps.json"
        with open(data_file, "r") as f:
            raw = json.load(f)
            _journey_data = raw.get("journey_steps", {})
    except Exception as e:
        raise RuntimeError(f"Failed to load journey data: {str(e)}")


# Initialize on module load
_load_journey_data()


@router.get("/step/{step_id}", response_model=JourneyStepResponse)
async def get_journey_step(
    step_id: int,
    state: str = Query(..., min_length=1),
    api_key: str = Security(verify_api_key)
):
    """
    Get a voter journey step.
    
    Steps are identical for all states — state param is for future expansion.
    """
    if str(step_id) not in _journey_data:
        raise HTTPException(status_code=400, detail="step_id must be 1–5")
    
    step_data = _journey_data[str(step_id)]
    return JourneyStepResponse(step_id=step_id, **step_data)

