from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import math

from app.db.database import get_db
from app.core.security import get_current_user, get_optional_user
from app.models.models import User
from app.schemas.schemas import CampaignCreate, CampaignUpdate, ProposalCreate
from app.services.campaign_service import (
    create_campaign, get_campaign, get_campaigns,
    get_user_campaigns, create_proposal
)
from app.api.v1.endpoints import serialize_user


def serialize_campaign(c) -> dict:
    return {
        "id": c.id,
        "title": c.title,
        "description": c.description,
        "business_type": c.business_type,
        "goal": c.goal,
        "target_audience": c.target_audience,
        "city": c.city,
        "budget_min": c.budget_min,
        "budget_max": c.budget_max,
        "currency": c.currency or "UZS",
        "duration_days": c.duration_days,
        "target_platforms": c.target_platforms or [],
        "needs_creative": bool(c.needs_creative),
        "needs_management": bool(c.needs_management),
        "status": c.status.value if hasattr(c.status, "value") else (c.status or "open"),
        "view_count": c.view_count or 0,
        "proposal_count": c.proposal_count or 0,
        "deadline": c.deadline.isoformat() if c.deadline else None,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "buyer": serialize_user(c.buyer),
    }


router = APIRouter()


@router.get("/")
async def list_campaigns(
    city: Optional[str] = None,
    search: Optional[str] = None,
    needs_creative: Optional[bool] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    items, total = await get_campaigns(db, city, search, needs_creative, page, per_page)
    return {
        "items": [serialize_campaign(c) for c in items],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": math.ceil(total / per_page) if total else 1,
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_new_campaign(
    data: CampaignCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    campaign = await create_campaign(db, current_user.id, data)
    return serialize_campaign(campaign)


@router.get("/mine")
async def my_campaigns(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = await get_user_campaigns(db, current_user.id)
    return [serialize_campaign(c) for c in items]


@router.get("/{campaign_id}")
async def get_campaign_detail(
    campaign_id: int,
    db: AsyncSession = Depends(get_db),
):
    campaign = await get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return serialize_campaign(campaign)


@router.post("/{campaign_id}/proposals", status_code=201)
async def submit_campaign_proposal(
    campaign_id: int,
    data: ProposalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    campaign = await get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.buyer_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot propose on your own campaign")
    proposal = await create_proposal(db, campaign_id, current_user.id, data)
    p = proposal
    return {
        "id": p.id,
        "campaign_id": p.campaign_id,
        "message": p.message,
        "price": p.price,
        "currency": p.currency or "UZS",
        "delivery_days": p.delivery_days,
        "status": p.status.value if hasattr(p.status, "value") else (p.status or "pending"),
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "provider": serialize_user(current_user),
    }
