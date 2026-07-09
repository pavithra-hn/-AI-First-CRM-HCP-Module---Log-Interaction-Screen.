"""
SQLAlchemy ORM Models for the CRM HCP Module.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class HCP(Base):
    """Healthcare Professional model."""
    __tablename__ = "hcps"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    specialty = Column(String(150), nullable=False)
    hospital = Column(String(200), nullable=True)
    territory = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    email = Column(String(200), nullable=True)
    phone = Column(String(20), nullable=True)
    npi_number = Column(String(20), nullable=True, unique=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    interactions = relationship("Interaction", back_populates="hcp", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<HCP(id={self.id}, name='{self.first_name} {self.last_name}', specialty='{self.specialty}')>"

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "full_name": f"{self.first_name} {self.last_name}",
            "specialty": self.specialty,
            "hospital": self.hospital,
            "territory": self.territory,
            "city": self.city,
            "state": self.state,
            "email": self.email,
            "phone": self.phone,
            "npi_number": self.npi_number,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Interaction(Base):
    """Interaction log model — records each HCP interaction."""
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_id = Column(Integer, ForeignKey("hcps.id"), nullable=False)
    interaction_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    interaction_type = Column(String(50), nullable=False)  # e.g., "In-Person", "Virtual", "Phone", "Email"
    channel = Column(String(50), nullable=True)  # e.g., "Clinic Visit", "Conference", "Zoom"
    attendees = Column(JSON, nullable=True)  # List of people present in the interaction
    products_discussed = Column(JSON, nullable=True)  # List of product names
    key_topics = Column(JSON, nullable=True)  # List of key discussion topics (Topics Discussed)
    materials_shared = Column(JSON, nullable=True)  # List of materials/brochures shared
    samples_distributed = Column(JSON, nullable=True)  # List of samples distributed
    notes = Column(Text, nullable=True)  # Raw interaction notes
    ai_summary = Column(Text, nullable=True)  # AI-generated summary
    sentiment = Column(String(20), nullable=True)  # "Positive", "Neutral", "Negative"
    sentiment_score = Column(Float, nullable=True)  # 0.0 to 1.0
    follow_up_actions = Column(JSON, nullable=True)  # List of follow-up actions (user-entered)
    ai_suggested_follow_ups = Column(JSON, nullable=True)  # List of AI-suggested follow-ups
    follow_up_date = Column(DateTime, nullable=True)
    outcome = Column(String(100), nullable=True)  # e.g., "Sample Requested", "Info Shared"
    created_by = Column(String(100), default="Field Rep")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    hcp = relationship("HCP", back_populates="interactions")

    def __repr__(self):
        return f"<Interaction(id={self.id}, hcp_id={self.hcp_id}, type='{self.interaction_type}')>"

    def to_dict(self):
        return {
            "id": self.id,
            "hcp_id": self.hcp_id,
            "hcp_name": f"{self.hcp.first_name} {self.hcp.last_name}" if self.hcp else None,
            "hcp_specialty": self.hcp.specialty if self.hcp else None,
            "interaction_date": self.interaction_date.isoformat() if self.interaction_date else None,
            "interaction_type": self.interaction_type,
            "channel": self.channel,
            "attendees": self.attendees or [],
            "products_discussed": self.products_discussed or [],
            "key_topics": self.key_topics or [],
            "materials_shared": self.materials_shared or [],
            "samples_distributed": self.samples_distributed or [],
            "notes": self.notes,
            "ai_summary": self.ai_summary,
            "sentiment": self.sentiment,
            "sentiment_score": self.sentiment_score,
            "follow_up_actions": self.follow_up_actions or [],
            "ai_suggested_follow_ups": self.ai_suggested_follow_ups or [],
            "follow_up_date": self.follow_up_date.isoformat() if self.follow_up_date else None,
            "outcome": self.outcome,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
