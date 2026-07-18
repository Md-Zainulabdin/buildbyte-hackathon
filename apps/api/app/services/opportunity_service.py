from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.opportunity import Opportunity, OpportunityStatus
from app.models.user import User
from app.schemas.opportunity import OpportunityCreate, OpportunityResponse, OpportunityUpdate


async def create_opportunity(db: AsyncSession, user: User, data: OpportunityCreate) -> OpportunityResponse:
    opportunity = Opportunity(
        **data.model_dump(),
        creator_id=user.id,
    )
    db.add(opportunity)
    await db.commit()
    await db.refresh(opportunity)
    return OpportunityResponse.model_validate(opportunity)


async def list_opportunities(
    db: AsyncSession,
    category: str | None = None,
    urgency: str | None = None,
    is_paid: bool | None = None,
    location: str | None = None,
    skills: str | None = None,
    status: str = "open",
) -> list[OpportunityResponse]:
    query = select(Opportunity).where(Opportunity.status == status)

    if category:
        query = query.where(Opportunity.category == category)
    if urgency:
        query = query.where(Opportunity.urgency == urgency)
    if is_paid is not None:
        query = query.where(Opportunity.is_paid == is_paid)
    if location:
        query = query.where(Opportunity.location.ilike(f"%{location}%"))
    if skills:
        skill_list = [s.strip() for s in skills.split(",")]
        query = query.where(Opportunity.required_skills.overlap(skill_list))

    query = query.order_by(Opportunity.created_at.desc())
    result = await db.execute(query)
    opportunities = result.scalars().all()
    return [OpportunityResponse.model_validate(o) for o in opportunities]


async def get_opportunity(db: AsyncSession, opportunity_id: str) -> OpportunityResponse:
    result = await db.execute(select(Opportunity).where(Opportunity.id == opportunity_id))
    opportunity = result.scalar_one_or_none()
    if not opportunity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    return OpportunityResponse.model_validate(opportunity)


async def update_opportunity(
    db: AsyncSession, user: User, opportunity_id: str, data: OpportunityUpdate
) -> OpportunityResponse:
    result = await db.execute(select(Opportunity).where(Opportunity.id == opportunity_id))
    opportunity = result.scalar_one_or_none()
    if not opportunity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    if str(opportunity.creator_id) != str(user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this opportunity")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(opportunity, field, value)
    await db.commit()
    await db.refresh(opportunity)
    return OpportunityResponse.model_validate(opportunity)


async def delete_opportunity(db: AsyncSession, user: User, opportunity_id: str) -> None:
    result = await db.execute(select(Opportunity).where(Opportunity.id == opportunity_id))
    opportunity = result.scalar_one_or_none()
    if not opportunity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    if str(opportunity.creator_id) != str(user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this opportunity")

    await db.delete(opportunity)
    await db.commit()
