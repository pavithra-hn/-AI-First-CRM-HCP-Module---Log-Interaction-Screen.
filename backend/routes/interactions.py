"""
Interaction API Routes.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
import crud
from schemas import InteractionCreate, InteractionUpdate
from agent.tools import get_llm, safe_parse_json

router = APIRouter(prefix="/api/interactions", tags=["Interactions"])


@router.get("", response_model=None)
def list_interactions(
    hcp_id: Optional[int] = Query(None, description="Filter by HCP ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """List all interactions, optionally filtered by HCP."""
    if hcp_id:
        interactions = crud.get_interactions_by_hcp(db, hcp_id)
    else:
        interactions = crud.get_interactions(db, skip=skip, limit=limit)
    return [i.to_dict() for i in interactions]


@router.get("/{interaction_id}", response_model=None)
def get_interaction(interaction_id: int, db: Session = Depends(get_db)):
    """Get a single interaction."""
    interaction = crud.get_interaction(db, interaction_id)
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return interaction.to_dict()


@router.post("", response_model=None, status_code=201)
def create_interaction(interaction: InteractionCreate, db: Session = Depends(get_db)):
    """Create a new interaction (form mode)."""
    # Verify HCP exists
    hcp = crud.get_hcp(db, interaction.hcp_id)
    if not hcp:
        raise HTTPException(status_code=404, detail="HCP not found")
    new_interaction = crud.create_interaction(db, interaction)
    return new_interaction.to_dict()


@router.put("/{interaction_id}", response_model=None)
def update_interaction(
    interaction_id: int,
    interaction_update: InteractionUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing interaction."""
    updated = crud.update_interaction(db, interaction_id, interaction_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return updated.to_dict()


@router.delete("/{interaction_id}")
def delete_interaction(interaction_id: int, db: Session = Depends(get_db)):
    """Delete an interaction."""
    success = crud.delete_interaction(db, interaction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return {"message": "Interaction deleted successfully"}


# ===================== AI form assistants =====================
# Lightweight LLM helpers used by the structured form (not the chat agent),
# so the rep can summarize free-text notes and get AI follow-up suggestions
# while still filling out the form.


class SummarizeRequest(BaseModel):
    text: str
    hcp_name: Optional[str] = None


class SuggestFollowUpsRequest(BaseModel):
    hcp_name: Optional[str] = None
    products_discussed: Optional[List[str]] = []
    key_topics: Optional[List[str]] = []
    notes: Optional[str] = None
    sentiment: Optional[str] = None
    outcome: Optional[str] = None


@router.post("/ai/summarize", response_model=None)
def ai_summarize(payload: SummarizeRequest):
    """Summarize raw notes / a transcribed voice note into a concise summary."""
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="No text provided to summarize")

    llm = get_llm()
    prompt = (
        "You are a pharmaceutical field-rep assistant. Summarize the following "
        "HCP interaction notes into 2-3 concise, professional sentences capturing "
        "the key discussion points, HCP stance, and any commitments.\n\n"
        f"HCP: {payload.hcp_name or 'the HCP'}\n"
        f"Notes:\n{payload.text}\n\nSummary:"
    )
    try:
        result = llm.invoke(prompt)
        summary = getattr(result, "content", str(result)).strip()
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")


@router.post("/ai/suggest-follow-ups", response_model=None)
def ai_suggest_follow_ups(payload: SuggestFollowUpsRequest):
    """Suggest 2-4 concrete follow-up actions for the current interaction draft."""
    llm = get_llm()
    prompt = (
        "You are a pharmaceutical field-rep assistant. Based on this HCP "
        "interaction, suggest 2-4 concrete, actionable follow-up steps. "
        'Respond ONLY as a JSON array of short strings, e.g. ["Schedule follow-up in 2 weeks", "Send clinical data"].\n\n'
        f"HCP: {payload.hcp_name or 'the HCP'}\n"
        f"Products discussed: {', '.join(payload.products_discussed or []) or 'N/A'}\n"
        f"Topics: {', '.join(payload.key_topics or []) or 'N/A'}\n"
        f"Sentiment: {payload.sentiment or 'N/A'}\n"
        f"Outcome: {payload.outcome or 'N/A'}\n"
        f"Notes: {payload.notes or 'N/A'}\n\nFollow-ups (JSON array):"
    )
    try:
        result = llm.invoke(prompt)
        content = getattr(result, "content", str(result)).strip()
        parsed = safe_parse_json(content)
        if isinstance(parsed, list):
            suggestions = [str(s).strip() for s in parsed if str(s).strip()]
        elif isinstance(parsed, dict):
            # tolerate {"suggestions": [...]} shape
            raw = parsed.get("suggestions") or parsed.get("follow_ups") or []
            suggestions = [str(s).strip() for s in raw if str(s).strip()]
        else:
            suggestions = []
        return {"suggestions": suggestions[:4]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Suggestion failed: {str(e)}")
