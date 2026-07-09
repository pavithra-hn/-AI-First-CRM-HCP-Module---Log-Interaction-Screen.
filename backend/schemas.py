"""
Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ===================== HCP Schemas =====================

class HCPBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    specialty: str = Field(..., min_length=1, max_length=150)
    hospital: Optional[str] = None
    territory: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    npi_number: Optional[str] = None
    notes: Optional[str] = None


class HCPCreate(HCPBase):
    pass


class HCPUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    specialty: Optional[str] = None
    hospital: Optional[str] = None
    territory: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    npi_number: Optional[str] = None
    notes: Optional[str] = None


class HCPResponse(HCPBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    full_name: Optional[str] = None

    class Config:
        from_attributes = True


# ===================== Interaction Schemas =====================

class InteractionBase(BaseModel):
    hcp_id: int
    interaction_date: Optional[datetime] = None
    interaction_type: str = Field(..., description="e.g., In-Person, Virtual, Phone, Email")
    channel: Optional[str] = None
    attendees: Optional[List[str]] = []
    products_discussed: Optional[List[str]] = []
    key_topics: Optional[List[str]] = []
    materials_shared: Optional[List[str]] = []
    samples_distributed: Optional[List[str]] = []
    notes: Optional[str] = None
    ai_summary: Optional[str] = None
    sentiment: Optional[str] = None
    sentiment_score: Optional[float] = None
    follow_up_actions: Optional[List[str]] = []
    ai_suggested_follow_ups: Optional[List[str]] = []
    follow_up_date: Optional[datetime] = None
    outcome: Optional[str] = None
    created_by: Optional[str] = "Field Rep"


class InteractionCreate(InteractionBase):
    pass


class InteractionUpdate(BaseModel):
    hcp_id: Optional[int] = None
    interaction_date: Optional[datetime] = None
    interaction_type: Optional[str] = None
    channel: Optional[str] = None
    attendees: Optional[List[str]] = None
    products_discussed: Optional[List[str]] = None
    key_topics: Optional[List[str]] = None
    materials_shared: Optional[List[str]] = None
    samples_distributed: Optional[List[str]] = None
    notes: Optional[str] = None
    ai_summary: Optional[str] = None
    sentiment: Optional[str] = None
    sentiment_score: Optional[float] = None
    follow_up_actions: Optional[List[str]] = None
    ai_suggested_follow_ups: Optional[List[str]] = None
    follow_up_date: Optional[datetime] = None
    outcome: Optional[str] = None
    created_by: Optional[str] = None


class InteractionResponse(InteractionBase):
    id: int
    hcp_name: Optional[str] = None
    hcp_specialty: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ===================== Chat Schemas =====================

class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, description="User's chat message")
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    tool_used: Optional[str] = None
    interaction_data: Optional[dict] = None
    suggestions: Optional[List[str]] = None
