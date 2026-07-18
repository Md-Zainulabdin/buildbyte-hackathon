"""create all tables

Revision ID: 001
Revises:
Create Date: 2026-07-18

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    sa.Enum("email", "google", name="auth_provider_enum").create(op.get_bind())
    sa.Enum("unverified", "email_verified", "identity_verified", name="verification_level_enum").create(op.get_bind())
    sa.Enum("low", "medium", "high", "critical", name="urgency_level_enum").create(op.get_bind())
    sa.Enum(
        "paid_work",
        "volunteer",
        "mentorship",
        "tutoring",
        "event_support",
        "technical_help",
        "design_request",
        "community_service",
        "short_term_project",
        name="opportunity_category_enum",
    ).create(op.get_bind())
    sa.Enum("open", "in_progress", "completed", "cancelled", name="opportunity_status_enum").create(op.get_bind())
    sa.Enum("pending", "accepted", "rejected", "withdrawn", name="application_status_enum").create(op.get_bind())

    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("password_hash", sa.String(255), nullable=True),
        sa.Column("google_id", sa.String(255), unique=True, nullable=True),
        sa.Column(
            "auth_provider",
            sa.Enum("email", "google", name="auth_provider_enum"),
            nullable=False,
            server_default="email",
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("bio", sa.Text, nullable=True),
        sa.Column("skills", sa.JSON, nullable=True),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("availability", sa.String(255), nullable=True),
        sa.Column("portfolio_links", sa.JSON, nullable=True),
        sa.Column(
            "verification_level",
            sa.Enum("unverified", "email_verified", "identity_verified", name="verification_level_enum"),
            nullable=False,
            server_default="unverified",
        ),
        sa.Column("reputation_score", sa.Float, nullable=False, server_default="0.0"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    op.create_table(
        "opportunities",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("organization", sa.String(255), nullable=False),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("required_skills", sa.JSON, nullable=True),
        sa.Column("is_paid", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("payment_amount", sa.Float, nullable=True),
        sa.Column("deadline", sa.DateTime(timezone=True), nullable=True),
        sa.Column("estimated_hours", sa.Integer, nullable=True),
        sa.Column(
            "urgency",
            sa.Enum("low", "medium", "high", "critical", name="urgency_level_enum"),
            nullable=False,
            server_default="medium",
        ),
        sa.Column(
            "category",
            sa.Enum(
                "paid_work",
                "volunteer",
                "mentorship",
                "tutoring",
                "event_support",
                "technical_help",
                "design_request",
                "community_service",
                "short_term_project",
                name="opportunity_category_enum",
            ),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum("open", "in_progress", "completed", "cancelled", name="opportunity_status_enum"),
            nullable=False,
            server_default="open",
        ),
        sa.Column("creator_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    op.create_table(
        "applications",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "opportunity_id", sa.Uuid(), sa.ForeignKey("opportunities.id"), nullable=False
        ),
        sa.Column(
            "status",
            sa.Enum("pending", "accepted", "rejected", "withdrawn", name="application_status_enum"),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("message", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "reviews",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("reviewer_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("receiver_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "application_id", sa.Uuid(), sa.ForeignKey("applications.id"), nullable=True
        ),
        sa.Column("rating", sa.Integer, nullable=False),
        sa.Column("comments", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("rating >= 1 AND rating <= 5", name="rating_range_check"),
    )


def downgrade() -> None:
    op.drop_table("reviews")
    op.drop_table("applications")
    op.drop_table("opportunities")
    op.drop_table("users")

    sa.Enum(name="application_status_enum").drop(op.get_bind())
    sa.Enum(name="opportunity_status_enum").drop(op.get_bind())
    sa.Enum(name="opportunity_category_enum").drop(op.get_bind())
    sa.Enum(name="urgency_level_enum").drop(op.get_bind())
    sa.Enum(name="verification_level_enum").drop(op.get_bind())
    sa.Enum(name="auth_provider_enum").drop(op.get_bind())
