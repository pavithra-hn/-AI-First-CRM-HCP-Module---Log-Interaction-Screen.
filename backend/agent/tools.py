"""
LangGraph Tools for the CRM HCP Agent.
Defines 5 tools for sales-related activities:
1. log_interaction - Log a new HCP interaction
2. edit_interaction - Edit an existing interaction
3. lookup_hcp - Search for Healthcare Professionals
4. analyze_sentiment - Analyze interaction sentiment
5. suggest_follow_up - Suggest follow-up actions
"""

import json
import os
import sys
from datetime import datetime
from typing import Optional

from langchain_core.tools import tool
from langchain_groq import ChatGroq
from sqlalchemy import func
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models import HCP, Interaction
from agent.prompts import (
    LOG_INTERACTION_PROMPT,
    EDIT_INTERACTION_PROMPT,
    SENTIMENT_ANALYSIS_PROMPT,
    FOLLOW_UP_PROMPT,
)

load_dotenv()


def get_llm():
    """Get the Groq LLM instance."""
    return ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        # gemma2-9b-it (assignment default) was decommissioned by Groq; using the
        # doc-permitted llama-3.3-70b-versatile instead.
        model_name=os.getenv("LLM_MODEL", "llama-3.3-70b-versatile"),
        temperature=0.1,
    )


def get_db_session():
    """Get a database session."""
    return SessionLocal()


def safe_parse_json(text: str) -> dict:
    """Safely parse JSON from LLM output, handling markdown code blocks."""
    text = text.strip()
    # Remove markdown code block markers if present
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {}


# ===================== TOOL 1: Log Interaction =====================

@tool
def log_interaction(description: str, hcp_id: Optional[int] = None) -> str:
    """Log a new HCP interaction from a natural language description.
    Uses LLM for entity extraction, summarization, and structuring.

    Args:
        description: Natural language description of the interaction with the HCP.
        hcp_id: Optional HCP ID. If not provided, the tool will try to find the HCP by name.
    """
    db = get_db_session()
    try:
        llm = get_llm()

        # Use LLM to extract structured data from the description
        prompt = LOG_INTERACTION_PROMPT.format(description=description)
        response = llm.invoke(prompt)
        extracted = safe_parse_json(response.content)

        if not extracted:
            return "[ERROR] Could not extract interaction data from the description. Please provide more details."

        # Try to find HCP if hcp_id not provided
        if not hcp_id and extracted.get("hcp_name"):
            hcp_name = extracted["hcp_name"]
            parts = hcp_name.split()
            if len(parts) >= 2:
                hcp = db.query(HCP).filter(
                    HCP.first_name.ilike(f"%{parts[0]}%"),
                    HCP.last_name.ilike(f"%{parts[-1]}%")
                ).first()
            else:
                hcp = db.query(HCP).filter(
                    HCP.first_name.ilike(f"%{hcp_name}%") |
                    HCP.last_name.ilike(f"%{hcp_name}%")
                ).first()

            if hcp:
                hcp_id = hcp.id
            else:
                return f"[ERROR] Could not find HCP '{hcp_name}' in the database. Please check the name or provide the HCP ID. Use the lookup_hcp tool to search for HCPs."

        if not hcp_id:
            return "[ERROR] No HCP specified. Please provide the HCP name or ID."

        # Verify HCP exists
        hcp = db.query(HCP).filter(HCP.id == hcp_id).first()
        if not hcp:
            return f"[ERROR] HCP with ID {hcp_id} not found in the database."

        # Parse date
        interaction_date = datetime.utcnow()
        if extracted.get("interaction_date"):
            try:
                interaction_date = datetime.fromisoformat(extracted["interaction_date"])
            except (ValueError, TypeError):
                interaction_date = datetime.utcnow()

        # Create the interaction
        new_interaction = Interaction(
            hcp_id=hcp_id,
            interaction_date=interaction_date,
            interaction_type=extracted.get("interaction_type", "In-Person"),
            channel=extracted.get("channel", ""),
            products_discussed=extracted.get("products_discussed", []),
            key_topics=extracted.get("key_topics", []),
            notes=extracted.get("notes", description),
            ai_summary=extracted.get("ai_summary", ""),
            sentiment=extracted.get("sentiment", "Neutral"),
            sentiment_score=0.5,
            follow_up_actions=extracted.get("follow_up_actions", []),
            outcome=extracted.get("outcome", ""),
            created_by="Field Rep",
        )

        db.add(new_interaction)
        db.commit()
        db.refresh(new_interaction)

        return json.dumps({
            "status": "success",
            "message": f"[SUCCESS] Interaction logged successfully! (ID: {new_interaction.id})",
            "interaction": {
                "id": new_interaction.id,
                "hcp_name": f"{hcp.first_name} {hcp.last_name}",
                "hcp_specialty": hcp.specialty,
                "interaction_type": new_interaction.interaction_type,
                "products_discussed": new_interaction.products_discussed,
                "key_topics": new_interaction.key_topics,
                "ai_summary": new_interaction.ai_summary,
                "sentiment": new_interaction.sentiment,
                "follow_up_actions": new_interaction.follow_up_actions,
                "date": new_interaction.interaction_date.isoformat(),
            }
        })
    except Exception as e:
        return f"[ERROR] Error logging interaction: {str(e)}"
    finally:
        db.close()


# ===================== TOOL 2: Edit Interaction =====================

@tool
def edit_interaction(interaction_id: int, edit_request: str) -> str:
    """Edit an existing HCP interaction using natural language instructions.

    Args:
        interaction_id: The ID of the interaction to edit.
        edit_request: Natural language description of what to change.
    """
    db = get_db_session()
    try:
        # Get the existing interaction
        interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
        if not interaction:
            return f"[ERROR] Interaction with ID {interaction_id} not found."

        # Get current data as dict
        current_data = interaction.to_dict()

        # Use LLM to determine what to update
        llm = get_llm()
        prompt = EDIT_INTERACTION_PROMPT.format(
            current_data=json.dumps(current_data, indent=2),
            edit_request=edit_request
        )
        response = llm.invoke(prompt)
        updates = safe_parse_json(response.content)

        if not updates:
            return "[ERROR] Could not understand the edit request. Please be more specific about what you'd like to change."

        # Apply updates
        for field, value in updates.items():
            if hasattr(interaction, field) and field not in ("id", "created_at", "hcp_id"):
                if field == "interaction_date" and isinstance(value, str):
                    try:
                        value = datetime.fromisoformat(value)
                    except ValueError:
                        continue
                elif field == "follow_up_date" and isinstance(value, str):
                    try:
                        value = datetime.fromisoformat(value)
                    except ValueError:
                        continue
                setattr(interaction, field, value)

        interaction.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(interaction)

        return json.dumps({
            "status": "success",
            "message": f"[SUCCESS] Interaction {interaction_id} updated successfully!",
            "updated_fields": list(updates.keys()),
            "interaction": interaction.to_dict()
        })
    except Exception as e:
        return f"[ERROR] Error editing interaction: {str(e)}"
    finally:
        db.close()


# ===================== TOOL 3: Lookup HCP =====================

@tool
def lookup_hcp(query: str) -> str:
    """Search for Healthcare Professionals by name, specialty, hospital, or territory.

    Args:
        query: Search term to find HCPs (name, specialty, hospital, city, or territory).
    """
    db = get_db_session()
    try:
        search_term = f"%{query}%"
        # Full name ("Dr. Sarah Mitchell") spans first_name + last_name, so match
        # the concatenated name as well as each individual column.
        full_name = func.concat(HCP.first_name, " ", HCP.last_name)
        hcps = db.query(HCP).filter(
            HCP.first_name.ilike(search_term) |
            HCP.last_name.ilike(search_term) |
            full_name.ilike(search_term) |
            HCP.specialty.ilike(search_term) |
            HCP.hospital.ilike(search_term) |
            HCP.territory.ilike(search_term) |
            HCP.city.ilike(search_term)
        ).limit(10).all()

        if not hcps:
            return f"[ERROR] No HCPs found matching '{query}'. Try a different search term."

        results = []
        for hcp in hcps:
            results.append({
                "id": hcp.id,
                "name": f"{hcp.first_name} {hcp.last_name}",
                "specialty": hcp.specialty,
                "hospital": hcp.hospital,
                "territory": hcp.territory,
                "city": hcp.city,
                "state": hcp.state,
                "phone": hcp.phone,
                "email": hcp.email,
            })

        return json.dumps({
            "status": "success",
            "message": f"[SUCCESS] Found {len(results)} HCP(s) matching '{query}'",
            "hcps": results
        })
    except Exception as e:
        return f"[ERROR] Error looking up HCP: {str(e)}"
    finally:
        db.close()


# ===================== TOOL 4: Analyze Sentiment =====================

@tool
def analyze_sentiment(interaction_id: Optional[int] = None, notes: Optional[str] = None) -> str:
    """Analyze the sentiment and extract key discussion points from interaction notes.

    Args:
        interaction_id: Optional ID of an existing interaction to analyze.
        notes: Optional raw notes text to analyze. Either interaction_id or notes must be provided.
    """
    db = get_db_session()
    try:
        text_to_analyze = notes

        if interaction_id:
            interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
            if not interaction:
                return f"[ERROR] Interaction with ID {interaction_id} not found."
            text_to_analyze = interaction.notes or interaction.ai_summary or ""

        if not text_to_analyze:
            return "[ERROR] No text provided for sentiment analysis. Provide either an interaction ID or notes text."

        # Use LLM for sentiment analysis
        llm = get_llm()
        prompt = SENTIMENT_ANALYSIS_PROMPT.format(notes=text_to_analyze)
        response = llm.invoke(prompt)
        analysis = safe_parse_json(response.content)

        if not analysis:
            return "[ERROR] Could not analyze the sentiment. Please try again."

        # Update the interaction record if an ID was provided
        if interaction_id:
            interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
            if interaction:
                interaction.sentiment = analysis.get("sentiment", interaction.sentiment)
                interaction.sentiment_score = analysis.get("sentiment_score", interaction.sentiment_score)
                interaction.updated_at = datetime.utcnow()
                db.commit()

        return json.dumps({
            "status": "success",
            "message": "[SUCCESS] Sentiment analysis complete!",
            "analysis": analysis
        })
    except Exception as e:
        return f"[ERROR] Error analyzing sentiment: {str(e)}"
    finally:
        db.close()


# ===================== TOOL 5: Suggest Follow-Up =====================

@tool
def suggest_follow_up(hcp_id: int) -> str:
    """Suggest optimal follow-up actions based on HCP interaction history.

    Args:
        hcp_id: The ID of the Healthcare Professional to generate follow-up suggestions for.
    """
    db = get_db_session()
    try:
        # Get HCP info
        hcp = db.query(HCP).filter(HCP.id == hcp_id).first()
        if not hcp:
            return f"[ERROR] HCP with ID {hcp_id} not found."

        # Get recent interactions
        interactions = db.query(Interaction).filter(
            Interaction.hcp_id == hcp_id
        ).order_by(Interaction.interaction_date.desc()).limit(5).all()

        hcp_info = hcp.to_dict()
        interaction_history = [i.to_dict() for i in interactions]

        if not interactions:
            return json.dumps({
                "status": "success",
                "message": f"No previous interactions found for {hcp.first_name} {hcp.last_name}.",
                "suggestions": {
                    "recommended_actions": [
                        "Schedule an introductory meeting",
                        "Prepare a product overview presentation",
                        "Research their clinical interests and specialization"
                    ],
                    "talking_points": [
                        "Introduction and company overview",
                        "Key products relevant to their specialty",
                        "Current clinical challenges in their area"
                    ],
                    "suggested_timeline": "Within the next week",
                    "priority": "High",
                    "rationale": "New HCP relationship - establishing initial contact is critical."
                }
            })

        # Use LLM for follow-up suggestions
        llm = get_llm()
        prompt = FOLLOW_UP_PROMPT.format(
            hcp_info=json.dumps(hcp_info, indent=2),
            interaction_history=json.dumps(interaction_history, indent=2)
        )
        response = llm.invoke(prompt)
        suggestions = safe_parse_json(response.content)

        if not suggestions:
            return "[ERROR] Could not generate follow-up suggestions. Please try again."

        return json.dumps({
            "status": "success",
            "message": f"[SUCCESS] Follow-up suggestions for {hcp.first_name} {hcp.last_name}",
            "hcp_name": f"{hcp.first_name} {hcp.last_name}",
            "suggestions": suggestions
        })
    except Exception as e:
        return f"[ERROR] Error generating follow-up suggestions: {str(e)}"
    finally:
        db.close()


# Export all tools
ALL_TOOLS = [log_interaction, edit_interaction, lookup_hcp, analyze_sentiment, suggest_follow_up]
