import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, JSON, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UrgencyLevel(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class OpportunityCategory(str, enum.Enum):
    paid_work = "paid_work"
    volunteer = "volunteer"
    mentorship = "mentorship"
    tutoring = "tutoring"
    event_support = "event_support"
    technical_help = "technical_help"
    design_request = "design_request"
    community_service = "community_service"
    short_term_project = "short_term_project"


class OpportunityStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class Opportunity(Base):
    __tablename__ = "opportunities"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    organization: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    required_skills: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    is_paid: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    payment_amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    estimated_hours: Mapped[int | None] = mapped_column(Integer, nullable=True)
    urgency: Mapped[UrgencyLevel] = mapped_column(
        Enum(UrgencyLevel, name="urgency_level_enum", create_constraint=True),
        default=UrgencyLevel.medium,
        nullable=False,
    )
    category: Mapped[OpportunityCategory] = mapped_column(
        Enum(OpportunityCategory, name="opportunity_category_enum", create_constraint=True),
        nullable=False,
    )
    status: Mapped[OpportunityStatus] = mapped_column(
        Enum(OpportunityStatus, name="opportunity_status_enum", create_constraint=True),
        default=OpportunityStatus.open,
        nullable=False,
    )
    creator_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), ForeignKey("users.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    creator = relationship("User", back_populates="opportunities")
    applications = relationship("Application", back_populates="opportunity")
