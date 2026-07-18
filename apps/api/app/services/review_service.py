from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application, ApplicationStatus
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse


async def create_review(db: AsyncSession, reviewer: User, data: ReviewCreate) -> ReviewResponse:
    if reviewer.id == data.receiver_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot review yourself")

    receiver_result = await db.execute(select(User).where(User.id == data.receiver_id))
    receiver = receiver_result.scalar_one_or_none()
    if not receiver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receiver not found")

    if data.application_id:
        app_result = await db.execute(
            select(Application).where(Application.id == data.application_id)
        )
        application = app_result.scalar_one_or_none()
        if not application:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
        if application.status != ApplicationStatus.accepted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only review completed applications",
            )

    existing = await db.execute(
        select(Review).where(
            Review.reviewer_id == reviewer.id,
            Review.application_id == data.application_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already reviewed this application")

    review = Review(
        reviewer_id=reviewer.id,
        receiver_id=data.receiver_id,
        application_id=data.application_id,
        rating=data.rating,
        comments=data.comments,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    avg_result = await db.execute(
        select(func.avg(Review.rating)).where(Review.receiver_id == data.receiver_id)
    )
    avg_rating = avg_result.scalar()
    if avg_rating:
        receiver.reputation_score = round(avg_rating, 2)
        await db.commit()

    return ReviewResponse.model_validate(review)


async def get_reviews_for_user(db: AsyncSession, user_id: str) -> list[ReviewResponse]:
    result = await db.execute(
        select(Review)
        .where(Review.receiver_id == user_id)
        .order_by(Review.created_at.desc())
    )
    reviews = result.scalars().all()
    return [ReviewResponse.model_validate(r) for r in reviews]
