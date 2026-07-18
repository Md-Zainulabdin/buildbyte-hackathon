from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.deps import get_current_user
from app.models.user import User
from app.schemas.opportunity import OpportunityResponse
from app.services import matching_service

router = APIRouter(prefix="/api/match", tags=["matching"])


@router.get("", response_model=list[OpportunityResponse])
async def get_matched_opportunities(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await matching_service.get_matched_opportunities(db, current_user)
