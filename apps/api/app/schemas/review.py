import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    receiver_id: uuid.UUID
    application_id: uuid.UUID | None = None
    rating: int = Field(ge=1, le=5)
    comments: str | None = None


class ReviewResponse(BaseModel):
    id: uuid.UUID
    reviewer_id: uuid.UUID
    receiver_id: uuid.UUID
    application_id: uuid.UUID | None
    rating: int
    comments: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
