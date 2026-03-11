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


@router.get("/", response_model=PaginatedResponse)
async def list_campaigns(
    city: Optional[str] = None,
    search: Optional[str] = None,
    needs_creative: Optional[bool] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    items, total = await get_campaigns(db, city, search, needs_creative, page, per_page)
    return PaginatedResponse(
        items=items, total=total, page=page, per_page=per_page,
        pages=math.ceil(total / per_page),
    )


@router.post("/", response_model=CampaignPublic, status_code=status.HTTP_201_CREATED)
async def create_new_campaign(
    data: CampaignCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await create_campaign(db, current_user.id, data)


@router.get("/mine", response_model=List[CampaignPublic])
async def my_campaigns(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_user_campaigns(db, current_user.id)


@router.get("/{campaign_id}", response_model=CampaignPublic)
async def get_campaign_detail(
    campaign_id: int,
    db: AsyncSession = Depends(get_db),
):
    campaign = await get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.post("/{campaign_id}/proposals", response_model=ProposalPublic, status_code=201)
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
