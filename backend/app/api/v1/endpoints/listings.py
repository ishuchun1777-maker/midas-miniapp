from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import math, os, uuid

from app.db.database import get_db
from app.core.security import get_current_user, get_optional_user
from app.models.models import User, ListingCategory
from app.schemas.schemas import ListingCreate, ListingUpdate
from app.services.listing_service import (
    create_listing, get_listing, get_listings, update_listing,
    toggle_favorite, get_user_favorites, get_featured_listings
)
from app.core.config import settings


def _owner_dict(owner):
    if not owner:
        return {"id": 0, "telegram_id": 0, "first_name": "Unknown",
                "language_code": "uz", "is_verified": False, "created_at": None}
    return {
        "id": owner.id,
        "telegram_id": owner.telegram_id,
        "telegram_username": owner.telegram_username,
        "first_name": owner.first_name,
        "last_name": owner.last_name,
        "photo_url": owner.photo_url,
        "language_code": owner.language_code or "uz",
        "is_verified": bool(owner.is_verified),
        "created_at": owner.created_at.isoformat() if owner.created_at else None,
    }


def sl(l) -> dict:
    return {
        "id": l.id,
        "title": l.title,
        "description": l.description,
        "category": l.category.value if hasattr(l.category, "value") else str(l.category),
        "status": l.status.value if hasattr(l.status, "value") else (l.status or "active"),
        "pricing_type": l.pricing_type.value if hasattr(l.pricing_type, "value") else (l.pricing_type or "negotiable"),
        "price_from": l.price_from,
        "price_to": l.price_to,
        "currency": l.currency or "UZS",
        "city": l.city,
        "telegram_channel_url": l.telegram_channel_url,
        "subscriber_count": l.subscriber_count,
        "avg_views": l.avg_views,
        "engagement_rate": l.engagement_rate,
        "ad_formats": l.ad_formats or [],
        "cover_image": l.cover_image,
        "images": l.images or [],
        "view_count": l.view_count or 0,
        "save_count": l.save_count or 0,
        "lead_count": l.lead_count or 0,
        "verified": bool(l.verified),
        "featured": bool(l.featured),
        "rating": float(l.rating or 0),
        "review_count": l.review_count or 0,
        "tags": l.tags or [],
        "created_at": l.created_at.isoformat() if l.created_at else None,
        "owner": _owner_dict(l.owner),
    }


router = APIRouter()


@router.get("/featured")
async def featured_listings(db: AsyncSession = Depends(get_db)):
    items = await get_featured_listings(db)
    return [sl(l) for l in items]


@router.get("/")
async def list_listings(
    category: Optional[ListingCategory] = None,
    city: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    verified_only: bool = False,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    items, total = await get_listings(
        db, category, city, search, min_price, max_price, verified_only, page, per_page
    )
    return {
        "items": [sl(l) for l in items],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": math.ceil(total / per_page) if total else 1,
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_new_listing(
    data: ListingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = await create_listing(db, current_user.id, data)
    return sl(listing)


@router.get("/me/favorites")
async def my_favorites(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favs = await get_user_favorites(db, current_user.id)
    return [sl(l) for l in favs]


@router.get("/{listing_id}")
async def get_listing_detail(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
):
    listing = await get_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return sl(listing)


@router.patch("/{listing_id}")
async def update_listing_endpoint(
    listing_id: int,
    data: ListingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = await update_listing(db, listing_id, current_user.id, data)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found or not authorized")
    return sl(listing)


@router.post("/{listing_id}/favorite")
async def toggle_listing_favorite(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await toggle_favorite(db, current_user.id, listing_id)
    return {"saved": result}
