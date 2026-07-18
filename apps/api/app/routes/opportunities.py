from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.deps import get_current_user
from app.models.user import User
from app.schemas.opportunity import OpportunityCreate, OpportunityResponse, OpportunityUpdate
from app.services import opportunity_service

router = APIRouter(prefix="/api/opportunities", tags=["opportunities"])


@router.post("", response_model=OpportunityResponse, status_code=201)
async def create_opportunity(
    data: OpportunityCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await opportunity_service.create_opportunity(db, current_user, data)


@router.get("", response_model=list[OpportunityResponse])
async def list_opportunities(
    category: str | None = Query(None),
    urgency: str | None = Query(None),
    is_paid: bool | None = Query(None),
    location: str | None = Query(None),
    skills: str | None = Query(None),
    status: str = Query("open"),
    db: AsyncSession = Depends(get_db),
):
    return await opportunity_service.list_opportunities(
        db, category, urgency, is_paid, location, skills, status
    )


@router.get("/{opportunity_id}", response_model=OpportunityResponse)
async def get_opportunity(opportunity_id: str, db: AsyncSession = Depends(get_db)):
    return await opportunity_service.get_opportunity(db, opportunity_id)


@router.patch("/{opportunity_id}", response_model=OpportunityResponse)
async def update_opportunity(
    opportunity_id: str,
    data: OpportunityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await opportunity_service.update_opportunity(db, current_user, opportunity_id, data)


@router.delete("/{opportunity_id}", status_code=204)
async def delete_opportunity(
    opportunity_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await opportunity_service.delete_opportunity(db, current_user, opportunity_id)
