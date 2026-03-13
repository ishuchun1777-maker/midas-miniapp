from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func, or_
from sqlalchemy.orm import selectinload
from typing import Optional, List, Tuple
from app.models.models import Campaign, CampaignProposal, CampaignStatus
from app.schemas.schemas import CampaignCreate, CampaignUpdate, ProposalCreate


async def create_campaign(
    db: AsyncSession,
    buyer_id: int,
    data: CampaignCreate,
) -> Campaign:
    campaign = Campaign(buyer_id=buyer_id, **data.model_dump(exclude_none=True))
    db.add(campaign)
    await db.flush()
    # buyer relationshipni yuklash — serializer uchun zarur
    result = await db.execute(
        select(Campaign)
        .where(Campaign.id == campaign.id)
        .options(
            selectinload(Campaign.buyer),
            selectinload(Campaign.proposals),
        )
    )
    return result.scalar_one()


async def get_campaign(db: AsyncSession, campaign_id: int, viewer_id: Optional[int] = None) -> Optional[Campaign]:
    result = await db.execute(
        select(Campaign)
        .where(Campaign.id == campaign_id)
        .options(
            selectinload(Campaign.buyer),
            selectinload(Campaign.proposals).selectinload(CampaignProposal.provider),
        )
    )
    campaign = result.scalar_one_or_none()
    if campaign and (viewer_id is None or campaign.buyer_id != viewer_id):
        await db.execute(
            update(Campaign)
            .where(Campaign.id == campaign_id)
            .values(view_count=Campaign.view_count + 1)
        )
    return campaign


async def get_campaigns(
    db: AsyncSession,
    city: Optional[str] = None,
    search: Optional[str] = None,
    needs_creative: Optional[bool] = None,
    page: int = 1,
    per_page: int = 20,
) -> Tuple[List[Campaign], int]:
    query = (
        select(Campaign)
        
        .options(selectinload(Campaign.buyer))
    )

    if city:
        query = query.where(Campaign.city.ilike(f"%{city}%"))
    if search:
        query = query.where(
            or_(
                Campaign.title.ilike(f"%{search}%"),
                Campaign.description.ilike(f"%{search}%"),
            )
        )
    if needs_creative is not None:
        query = query.where(Campaign.needs_creative == needs_creative)

    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()

    result = await db.execute(
        query
        .order_by(Campaign.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    return result.scalars().all(), total


async def create_proposal(
    db: AsyncSession,
    campaign_id: int,
    provider_id: int,
    data: ProposalCreate,
) -> CampaignProposal:
    proposal = CampaignProposal(
        campaign_id=campaign_id,
        provider_id=provider_id,
        **data.model_dump(),
    )
    db.add(proposal)
    await db.execute(
        update(Campaign)
        .where(Campaign.id == campaign_id)
        .values(proposal_count=Campaign.proposal_count + 1)
    )
    await db.flush()
    return proposal


async def get_user_campaigns(db: AsyncSession, user_id: int) -> List[Campaign]:
    result = await db.execute(
        select(Campaign)
        .where(Campaign.buyer_id == user_id)
        .options(selectinload(Campaign.buyer))
        .order_by(Campaign.created_at.desc())
    )
    return result.scalars().all()
