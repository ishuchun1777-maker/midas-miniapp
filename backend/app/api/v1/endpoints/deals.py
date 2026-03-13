from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime, timezone

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Deal, DealStatus
from app.schemas.schemas import DealCreate, DealUpdate
from app.api.v1.endpoints import serialize_user

router = APIRouter()


def serialize_deal(d) -> dict:
    return {
        "id": d.id,
        "title": d.title,
        "description": d.description,
        "price": float(d.price),
        "currency": d.currency or "UZS",
        "status": d.status.value if hasattr(d.status, "value") else (d.status or "lead"),
        "started_at": d.started_at.isoformat() if d.started_at else None,
        "completed_at": d.completed_at.isoformat() if d.completed_at else None,
        "deadline": d.deadline.isoformat() if d.deadline else None,
        "created_at": d.created_at.isoformat() if d.created_at else None,
        "buyer": serialize_user(d.buyer),
        "provider": serialize_user(d.provider),
    }


@router.get("/")
async def list_deals(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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
    return [serialize_deal(d) for d in result.scalars().all()]


@router.post("/", status_code=201)
async def create_deal(
    data: DealCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deal = Deal(buyer_id=current_user.id, **data.model_dump())
    db.add(deal)
    await db.flush()
    # Reload with relationships
    result = await db.execute(
        select(Deal)
        .where(Deal.id == deal.id)
        .options(selectinload(Deal.buyer), selectinload(Deal.provider))
    )
    deal = result.scalar_one()
    return serialize_deal(deal)


@router.patch("/{deal_id}")
async def update_deal_status(
    deal_id: int,
    data: DealUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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
        deal.completed_at = datetime.now(timezone.utc)

    await db.flush()
    return serialize_deal(deal)
