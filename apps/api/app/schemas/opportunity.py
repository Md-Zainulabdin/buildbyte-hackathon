import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.opportunity import OpportunityCategory, UrgencyLevel


class OpportunityCreate(BaseModel):
    title: str
    description: str
    organization: str
    location: str | None = None
    required_skills: list[str] | None = None
    is_paid: bool = False
    payment_amount: float | None = None
    deadline: datetime | None = None
    estimated_hours: int | None = None
    urgency: UrgencyLevel = UrgencyLevel.medium
    category: OpportunityCategory


class OpportunityUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    organization: str | None = None
    location: str | None = None
    required_skills: list[str] | None = None
    is_paid: bool | None = None
    payment_amount: float | None = None
    deadline: datetime | None = None
    estimated_hours: int | None = None
    urgency: UrgencyLevel | None = None
    category: OpportunityCategory | None = None
    status: str | None = None


class OpportunityResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    organization: str
    location: str | None
    required_skills: list | None
    is_paid: bool
    payment_amount: float | None
    deadline: datetime | None
    estimated_hours: int | None
    urgency: str
    category: str
    status: str
    creator_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
