import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: str | None = None
    bio: str | None = None
    skills: list[str] | None = None
    location: str | None = None
    availability: str | None = None
    portfolio_links: list[str] | None = None


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    bio: str | None
    skills: list | None
    location: str | None
    availability: str | None
    portfolio_links: list | None
    verification_level: str
    reputation_score: float
    created_at: datetime

    model_config = {"from_attributes": True}


class GoogleAuthRequest(BaseModel):
    code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
