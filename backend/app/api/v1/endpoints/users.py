from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from typing import List

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User, UserProfile, Notification
from app.schemas.schemas import UserProfileCreate, UserProfileUpdate, UserProfilePublic, NotificationPublic
from app.services.user_service import (
    create_or_update_profile, get_user_profiles, get_user_by_id
)

router = APIRouter()


@router.get("/me/profiles", response_model=List[UserProfilePublic])
async def get_my_profiles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_user_profiles(db, current_user.id)


@router.post("/me/profiles", response_model=UserProfilePublic, status_code=201)
async def create_my_profile(
    data: UserProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await create_or_update_profile(db, current_user, data)


@router.get("/{user_id}", response_model=UserProfilePublic)
async def get_user_profile(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    profiles = await get_user_profiles(db, user_id)
    if not profiles:
        raise HTTPException(status_code=404, detail="User not found")
    return profiles[0]
