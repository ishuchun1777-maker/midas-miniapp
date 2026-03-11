from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import math, os, uuid, aiofiles

from app.db.database import get_db
from app.core.security import get_current_user, get_optional_user
from app.models.models import User, ListingCategory
from app.schemas.schemas import ListingCreate, ListingUpdate, ListingPublic, PaginatedResponse
from app.services.listing_service import (
    create_listing, get_listing, get_listings, update_listing,
    toggle_favorite, get_user_favorites, get_featured_listings
)
from app.core.config import settings

router = APIRouter()


@router.get("/featured", response_model=List[ListingPublic])
async def featured_listings(
    db: AsyncSession = Depends(get_db),
):
    return await get_featured_listings(db)


@router.get("/", response_model=PaginatedResponse)
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
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page),
    )


@router.post("/", response_model=ListingPublic, status_code=status.HTTP_201_CREATED)
async def create_new_listing(
    data: ListingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await create_listing(db, current_user.id, data)


@router.get("/{listing_id}", response_model=ListingPublic)
async def get_listing_detail(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
):
    listing = await get_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@router.patch("/{listing_id}", response_model=ListingPublic)
async def update_listing_endpoint(
    listing_id: int,
    data: ListingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = await update_listing(db, listing_id, current_user.id, data)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found or not authorized")
    return listing


@router.post("/{listing_id}/favorite")
async def toggle_listing_favorite(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    is_favorited = await toggle_favorite(db, current_user.id, listing_id)
    return {"favorited": is_favorited}


@router.get("/me/favorites", response_model=List[ListingPublic])
async def my_favorites(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_user_favorites(db, current_user.id)


@router.post("/{listing_id}/upload-image")
async def upload_listing_image(
    listing_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only images are allowed")

    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    upload_path = os.path.join(settings.UPLOAD_DIR, "listings", filename)
    os.makedirs(os.path.dirname(upload_path), exist_ok=True)

    async with aiofiles.open(upload_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    return {"url": f"/uploads/listings/{filename}"}
