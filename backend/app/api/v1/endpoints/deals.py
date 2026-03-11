from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List, Optional

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Deal, DealStatus, Review, Notification, Package
from app.schemas.schemas import (
    DealCreate, DealUpdate, DealPublic,
    ReviewCreate, ReviewPublic, NotificationPublic, PackageCreate, PackagePublic
)

router = APIRouter()


@router.get("/", response_model=List[DealPublic])
async def list_deals(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy.orm import selectinload
    from sqlalchemy import or_
    result = await db.execute(
        select(Deal)
        .where(
            or_(Deal.buyer_id == current_user.id, Deal.provider_id == current_user.id)
        )
        .options(
            selectinload(Deal.buyer),
            selectinload(Deal.provider),
        )
        .order_by(Deal.created_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=DealPublic, status_code=201)
async def create_deal(
    data: DealCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deal = Deal(buyer_id=current_user.id, **data.model_dump())
    db.add(deal)
    await db.flush()
    await db.refresh(deal)
    return deal


@router.patch("/{deal_id}", response_model=DealPublic)
async def update_deal_status(
    deal_id: int,
    data: DealUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy.orm import selectinload
    from sqlalchemy import or_
    result = await db.execute(
        select(Deal)
        .where(
            Deal.id == deal_id,
            or_(Deal.buyer_id == current_user.id, Deal.provider_id == current_user.id),
        )
        .options(selectinload(Deal.buyer), selectinload(Deal.provider))
    )
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(deal, k, v)

    if data.status == DealStatus.COMPLETED:
        from datetime import datetime
        deal.completed_at = datetime.utcnow()

    await db.flush()
    return deal
