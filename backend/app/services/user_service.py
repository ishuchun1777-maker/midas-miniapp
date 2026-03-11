from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from typing import Optional, List
from app.models.models import User, UserProfile, UserRole
from app.schemas.schemas import UserProfileCreate, UserProfileUpdate


async def get_user_by_telegram_id(db: AsyncSession, telegram_id: int) -> Optional[User]:
    result = await db.execute(
        select(User)
        .where(User.telegram_id == telegram_id)
        .options(selectinload(User.profiles))
    )
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    result = await db.execute(
        select(User)
        .where(User.id == user_id)
        .options(selectinload(User.profiles))
    )
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession,
    telegram_id: int,
    first_name: str,
    last_name: Optional[str] = None,
    telegram_username: Optional[str] = None,
    photo_url: Optional[str] = None,
    language_code: str = "uz",
) -> User:
    user = User(
        telegram_id=telegram_id,
        first_name=first_name,
        last_name=last_name,
        telegram_username=telegram_username,
        photo_url=photo_url,
        language_code=language_code,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def update_user_last_seen(db: AsyncSession, user_id: int):
    from sqlalchemy.sql import func
    await db.execute(
        update(User)
        .where(User.id == user_id)
        .values(last_seen_at=func.now())
    )


async def create_or_update_profile(
    db: AsyncSession,
    user: User,
    data: UserProfileCreate,
) -> UserProfile:
    result = await db.execute(
        select(UserProfile).where(
            UserProfile.user_id == user.id,
            UserProfile.role == data.role,
        )
    )
    profile = result.scalar_one_or_none()

    if profile:
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(profile, k, v)
    else:
        profile = UserProfile(
            user_id=user.id,
            **data.model_dump()
        )
        db.add(profile)

    await db.flush()
    await db.refresh(profile)
    return profile


async def get_user_profiles(db: AsyncSession, user_id: int) -> List[UserProfile]:
    result = await db.execute(
        select(UserProfile)
        .where(UserProfile.user_id == user_id)
        .options(selectinload(UserProfile.user))
    )
    return result.scalars().all()


async def update_profile_rating(db: AsyncSession, user_id: int, role: UserRole):
    from sqlalchemy import func
    from app.models.models import Review

    avg_result = await db.execute(
        select(func.avg(Review.rating), func.count(Review.id))
        .where(Review.reviewee_id == user_id)
    )
    avg_rating, count = avg_result.one()

    await db.execute(
        update(UserProfile)
        .where(UserProfile.user_id == user_id, UserProfile.role == role)
        .values(rating=avg_rating or 0, review_count=count or 0)
    )
