from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.deps import get_current_user
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationUpdate
from app.services import application_service

router = APIRouter(prefix="/api", tags=["applications"])


@router.post("/opportunities/{opportunity_id}/apply", response_model=ApplicationResponse, status_code=201)
async def apply_for_opportunity(
    opportunity_id: str,
    data: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await application_service.apply_for_opportunity(db, current_user, opportunity_id, data)


@router.get("/applications", response_model=list[ApplicationResponse])
async def list_applications(
    role: str = Query("provider"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await application_service.list_applications_for_user(db, current_user, role)


@router.get("/opportunities/{opportunity_id}/applications", response_model=list[ApplicationResponse])
async def list_opportunity_applications(
    opportunity_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await application_service.list_applications_for_opportunity(db, current_user, opportunity_id)


@router.patch("/applications/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: str,
    data: ApplicationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await application_service.update_application_status(db, current_user, application_id, data)
