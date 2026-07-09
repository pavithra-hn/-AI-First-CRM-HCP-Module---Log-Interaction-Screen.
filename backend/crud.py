"""
CRUD operations for HCP and Interaction models.
"""

from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import HCP, Interaction
from schemas import InteractionCreate, InteractionUpdate, HCPCreate, HCPUpdate
from datetime import datetime
from typing import Optional, List


# ===================== HCP CRUD =====================

def get_hcps(db: Session, skip: int = 0, limit: int = 100) -> List[HCP]:
    """Get all HCPs with pagination."""
    return db.query(HCP).offset(skip).limit(limit).all()


def get_hcp(db: Session, hcp_id: int) -> Optional[HCP]:
    """Get a single HCP by ID."""
    return db.query(HCP).filter(HCP.id == hcp_id).first()


def search_hcps(db: Session, query: str) -> List[HCP]:
    """Search HCPs by name, specialty, hospital, or territory."""
    search_term = f"%{query}%"
    return db.query(HCP).filter(
        or_(
            HCP.first_name.ilike(search_term),
            HCP.last_name.ilike(search_term),
            HCP.specialty.ilike(search_term),
            HCP.hospital.ilike(search_term),
            HCP.territory.ilike(search_term),
            HCP.city.ilike(search_term),
        )
    ).all()


def create_hcp(db: Session, hcp: HCPCreate) -> HCP:
    """Create a new HCP."""
    db_hcp = HCP(**hcp.model_dump())
    db.add(db_hcp)
    db.commit()
    db.refresh(db_hcp)
    return db_hcp


def update_hcp(db: Session, hcp_id: int, hcp_update: HCPUpdate) -> Optional[HCP]:
    """Update an existing HCP."""
    db_hcp = db.query(HCP).filter(HCP.id == hcp_id).first()
    if not db_hcp:
        return None
    update_data = hcp_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_hcp, field, value)
    db_hcp.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_hcp)
    return db_hcp


def delete_hcp(db: Session, hcp_id: int) -> bool:
    """Delete an HCP."""
    db_hcp = db.query(HCP).filter(HCP.id == hcp_id).first()
    if not db_hcp:
        return False
    db.delete(db_hcp)
    db.commit()
    return True


# ===================== Interaction CRUD =====================

def get_interactions(db: Session, skip: int = 0, limit: int = 100) -> List[Interaction]:
    """Get all interactions with pagination."""
    return db.query(Interaction).order_by(Interaction.interaction_date.desc()).offset(skip).limit(limit).all()


def get_interaction(db: Session, interaction_id: int) -> Optional[Interaction]:
    """Get a single interaction by ID."""
    return db.query(Interaction).filter(Interaction.id == interaction_id).first()


def get_interactions_by_hcp(db: Session, hcp_id: int) -> List[Interaction]:
    """Get all interactions for a specific HCP."""
    return db.query(Interaction).filter(
        Interaction.hcp_id == hcp_id
    ).order_by(Interaction.interaction_date.desc()).all()


def create_interaction(db: Session, interaction: InteractionCreate) -> Interaction:
    """Create a new interaction."""
    data = interaction.model_dump()
    if data.get("interaction_date") is None:
        data["interaction_date"] = datetime.utcnow()
    db_interaction = Interaction(**data)
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction


def create_interaction_from_dict(db: Session, data: dict) -> Interaction:
    """Create an interaction from a dictionary (used by AI agent)."""
    if data.get("interaction_date") is None:
        data["interaction_date"] = datetime.utcnow()
    elif isinstance(data["interaction_date"], str):
        try:
            data["interaction_date"] = datetime.fromisoformat(data["interaction_date"])
        except ValueError:
            data["interaction_date"] = datetime.utcnow()
    db_interaction = Interaction(**data)
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction


def update_interaction(db: Session, interaction_id: int, interaction_update: InteractionUpdate) -> Optional[Interaction]:
    """Update an existing interaction."""
    db_interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not db_interaction:
        return None
    update_data = interaction_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_interaction, field, value)
    db_interaction.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_interaction)
    return db_interaction


def update_interaction_from_dict(db: Session, interaction_id: int, data: dict) -> Optional[Interaction]:
    """Update an interaction from a dictionary (used by AI agent)."""
    db_interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not db_interaction:
        return None
    for field, value in data.items():
        if hasattr(db_interaction, field) and field not in ("id", "created_at"):
            if field == "interaction_date" and isinstance(value, str):
                try:
                    value = datetime.fromisoformat(value)
                except ValueError:
                    continue
            setattr(db_interaction, field, value)
    db_interaction.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_interaction)
    return db_interaction


def delete_interaction(db: Session, interaction_id: int) -> bool:
    """Delete an interaction."""
    db_interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not db_interaction:
        return False
    db.delete(db_interaction)
    db.commit()
    return True
