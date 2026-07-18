from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.deps import get_current_user
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services import review_service

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.post("", response_model=ReviewResponse, status_code=201)
async def create_review(
    data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await review_service.create_review(db, current_user, data)


@router.get("/{user_id}", response_model=list[ReviewResponse])
async def get_user_reviews(user_id: str, db: AsyncSession = Depends(get_db)):
    return await review_service.get_reviews_for_user(db, user_id)
