from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func, or_, and_
from sqlalchemy.orm import selectinload
from typing import Optional, List, Tuple
from app.models.models import Listing, ListingCategory, ListingStatus, User, Favorite
from app.schemas.schemas import ListingCreate, ListingUpdate


async def create_listing(
    db: AsyncSession,
    owner_id: int,
    data: ListingCreate,
) -> Listing:
    listing = Listing(owner_id=owner_id, **data.model_dump(exclude_none=True))
    db.add(listing)
    await db.flush()
    # owner relationshipni yuklash — serializer uchun zarur
    result = await db.execute(
        select(Listing)
        .where(Listing.id == listing.id)
        .options(selectinload(Listing.owner))
    )
    return result.scalar_one()


async def get_listing(db: AsyncSession, listing_id: int, viewer_id: Optional[int] = None) -> Optional[Listing]:
    result = await db.execute(
        select(Listing)
        .where(Listing.id == listing_id)
        .options(selectinload(Listing.owner))
    )
    listing = result.scalar_one_or_none()
    if listing and (viewer_id is None or listing.owner_id != viewer_id):
        await db.execute(
            update(Listing)
            .where(Listing.id == listing_id)
            .values(view_count=Listing.view_count + 1)
        )
    return listing


async def get_listings(
    db: AsyncSession,
    category: Optional[ListingCategory] = None,
    city: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    verified_only: bool = False,
    page: int = 1,
    per_page: int = 20,
    owner_id: Optional[int] = None,
) -> Tuple[List[Listing], int]:
    query = (
        select(Listing)
        .options(selectinload(Listing.owner))
    )
    # owner_id filter bo'lsa — status filtrsiz (o'z e'lonlari draft ham ko'rinsin)
    if owner_id:
        query = query.where(Listing.owner_id == owner_id)
    else:
        query = query.where(
            (Listing.status == ListingStatus.ACTIVE) | (Listing.status == None)
        )

    if category:
        query = query.where(Listing.category == category)
    if city:
        query = query.where(Listing.city.ilike(f"%{city}%"))
    if search:
        query = query.where(
            or_(
                Listing.title.ilike(f"%{search}%"),
                Listing.description.ilike(f"%{search}%"),
            )
        )
    if min_price is not None:
        query = query.where(Listing.price_to >= min_price)
    if max_price is not None:
        query = query.where(Listing.price_from <= max_price)
    if verified_only:
        query = query.where(Listing.verified == True)

    count_result = await db.execute(
        select(func.count()).select_from(query.subquery())
    )
    total = count_result.scalar()

    query = (
        query
        .order_by(Listing.featured.desc(), Listing.rating.desc(), Listing.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )

    result = await db.execute(query)
    return result.scalars().all(), total


async def update_listing(
    db: AsyncSession,
    listing_id: int,
    owner_id: int,
    data: ListingUpdate,
) -> Optional[Listing]:
    result = await db.execute(
        select(Listing).where(
            Listing.id == listing_id,
            Listing.owner_id == owner_id,
        )
    )
    listing = result.scalar_one_or_none()
    if not listing:
        return None

    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(listing, k, v)

    await db.flush()
    # Reload with owner relationship for serialization
    result = await db.execute(
        select(Listing)
        .where(Listing.id == listing_id)
        .options(selectinload(Listing.owner))
    )
    return result.scalar_one()


async def toggle_favorite(
    db: AsyncSession,
    user_id: int,
    listing_id: int,
) -> bool:
    result = await db.execute(
        select(Favorite).where(
            Favorite.user_id == user_id,
            Favorite.listing_id == listing_id,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        await db.delete(existing)
        await db.execute(
            update(Listing)
            .where(Listing.id == listing_id)
            .values(save_count=Listing.save_count - 1)
        )
        return False
    else:
        fav = Favorite(user_id=user_id, listing_id=listing_id)
        db.add(fav)
        await db.execute(
            update(Listing)
            .where(Listing.id == listing_id)
            .values(save_count=Listing.save_count + 1)
        )
        return True


async def get_user_favorites(
    db: AsyncSession,
    user_id: int,
) -> List[Listing]:
    result = await db.execute(
        select(Listing)
        .join(Favorite, Favorite.listing_id == Listing.id)
        .where(Favorite.user_id == user_id)
        .options(selectinload(Listing.owner))
    )
    return result.scalars().all()


async def get_featured_listings(db: AsyncSession, limit: int = 6) -> List[Listing]:
    result = await db.execute(
        select(Listing)
        .where(
            ((Listing.status == ListingStatus.ACTIVE) | (Listing.status == None)),
            Listing.featured == True,
        )
        .options(selectinload(Listing.owner))
        .order_by(Listing.rating.desc())
        .limit(limit)
    )
    return result.scalars().all()
