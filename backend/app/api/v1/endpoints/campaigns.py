from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import math

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User
from app.schemas.schemas import (
    CampaignCreate, CampaignUpdate, CampaignPublic,
    ProposalCreate, ProposalPublic, PaginatedResponse
)
from app.services.campaign_service import (
    create_campaign, get_campaign, get_campaigns,
    create_proposal, get_user_campaigns
)

router = APIRouter()


def serialize_campaign(c) -> dict:
    """Campaign modelini dict ga — None fieldlar xato bermasligi uchun"""
    buyer = c.buyer
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
        "needs_creative": c.needs_creative or False,
        "needs_management": c.needs_management or False,
        "status": c.status.value if hasattr(c.status, 'value') else (c.status or "open"),
        "view_count": c.view_count or 0,
        "proposal_count": c.proposal_count or 0,
        "deadline": c.deadline.isoformat() if c.deadline else None,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "buyer": {
            "id": buyer.id,
            "telegram_id": buyer.telegram_id,
            "telegram_username": buyer.telegram_username,
            "first_name": buyer.first_name,
            "last_name": buyer.last_name,
            "photo_url": buyer.photo_url,
            "language_code": buyer.language_code or "uz",
            "is_verified": buyer.is_verified or False,
            "created_at": buyer.created_at.isoformat() if buyer.created_at else None,
        } if buyer else None,
    }


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
        "total": total, "page": page, "per_page": per_page,
        "pages": math.ceil(total / per_page),
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
async def submit_proposal(
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
    return await create_proposal(db, campaign_id, current_user.id, data)
