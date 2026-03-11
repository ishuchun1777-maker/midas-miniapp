from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Review
from app.schemas.schemas import ReviewCreate, ReviewPublic

router = APIRouter()


@router.post("/", response_model=ReviewPublic, status_code=201)
async def create_review(
    data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = Review(reviewer_id=current_user.id, **data.model_dump())
    db.add(review)
    await db.flush()

    from app.services.user_service import update_profile_rating
    from app.models.models import UserRole
    await update_profile_rating(db, data.reviewee_id, UserRole.AUDIENCE_OWNER)

    await db.refresh(review)
    return review


@router.get("/user/{user_id}", response_model=List[ReviewPublic])
async def get_user_reviews(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Review)
        .where(Review.reviewee_id == user_id)
        .options(selectinload(Review.reviewer))
        .order_by(Review.created_at.desc())
    )
    return result.scalars().all()
