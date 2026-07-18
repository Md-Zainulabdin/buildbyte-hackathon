from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application, ApplicationStatus
from app.models.opportunity import Opportunity, OpportunityStatus
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationUpdate


async def apply_for_opportunity(
    db: AsyncSession, user: User, opportunity_id: str, data: ApplicationCreate
) -> ApplicationResponse:
    opp_result = await db.execute(select(Opportunity).where(Opportunity.id == opportunity_id))
    opportunity = opp_result.scalar_one_or_none()
    if not opportunity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    if opportunity.status != OpportunityStatus.open:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Opportunity is not open for applications")
    if str(opportunity.creator_id) == str(user.id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot apply to your own opportunity")

    existing = await db.execute(
        select(Application).where(
            Application.user_id == user.id,
            Application.opportunity_id == opportunity_id,
            Application.status != ApplicationStatus.withdrawn,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already applied to this opportunity")

    application = Application(
        user_id=user.id,
        opportunity_id=opportunity_id,
        message=data.message,
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return ApplicationResponse.model_validate(application)


async def list_applications_for_user(
    db: AsyncSession, user: User, role: str = "provider"
) -> list[ApplicationResponse]:
    if role == "provider":
        query = select(Application).where(Application.user_id == user.id)
    else:
        query = (
            select(Application)
            .join(Opportunity)
            .where(Opportunity.creator_id == user.id)
        )
    query = query.order_by(Application.created_at.desc())
    result = await db.execute(query)
    applications = result.scalars().all()
    return [ApplicationResponse.model_validate(a) for a in applications]


async def list_applications_for_opportunity(
    db: AsyncSession, user: User, opportunity_id: str
) -> list[ApplicationResponse]:
    opp_result = await db.execute(select(Opportunity).where(Opportunity.id == opportunity_id))
    opportunity = opp_result.scalar_one_or_none()
    if not opportunity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    if str(opportunity.creator_id) != str(user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    result = await db.execute(
        select(Application)
        .where(Application.opportunity_id == opportunity_id)
        .order_by(Application.created_at.desc())
    )
    applications = result.scalars().all()
    return [ApplicationResponse.model_validate(a) for a in applications]


async def update_application_status(
    db: AsyncSession, user: User, application_id: str, data: ApplicationUpdate
) -> ApplicationResponse:
    result = await db.execute(
        select(Application).where(Application.id == application_id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    opp_result = await db.execute(
        select(Opportunity).where(Opportunity.id == application.opportunity_id)
    )
    opportunity = opp_result.scalar_one_or_none()

    if str(opportunity.creator_id) != str(user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this application")

    application.status = data.status
    await db.commit()
    await db.refresh(application)
    return ApplicationResponse.model_validate(application)
