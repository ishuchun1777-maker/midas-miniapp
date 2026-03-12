from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.models import (
    UserRole, ListingStatus, ListingCategory, CampaignStatus,
    DealStatus, PricingType, PaymentStatus, NotificationType
)


# ─── AUTH ────────────────────────────────────────────────────────────────────

class TelegramAuthRequest(BaseModel):
    init_data: str

class TelegramAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserPublic"
    is_new_user: bool


# ─── USER ────────────────────────────────────────────────────────────────────

class UserPublic(BaseModel):
    id: int
    telegram_id: int
    telegram_username: Optional[str] = None
    first_name: str
    last_name: Optional[str] = None
    photo_url: Optional[str] = None
    language_code: str = "uz"
    is_verified: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfileCreate(BaseModel):
    role: UserRole
    display_name: Optional[str]
    bio: Optional[str]
    phone: Optional[str]
    city: Optional[str]
    website: Optional[str]
    specializations: List[str] = []
    social_links: Dict[str, str] = {}


class UserProfileUpdate(BaseModel):
    display_name: Optional[str]
    bio: Optional[str]
    phone: Optional[str]
    city: Optional[str]
    website: Optional[str]
    specializations: Optional[List[str]]
    social_links: Optional[Dict[str, str]]


class UserProfilePublic(BaseModel):
    id: int
    role: UserRole
    display_name: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    city: Optional[str]
    website: Optional[str]
    specializations: List[str]
    social_links: Dict[str, str]
    rating: float
    review_count: int
    completed_deals: int
    response_rate: float
    verified_badge: bool
    featured: bool
    created_at: datetime
    user: UserPublic

    class Config:
        from_attributes = True


# ─── LISTING ─────────────────────────────────────────────────────────────────

class ListingCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=256)
    description: Optional[str]
    category: ListingCategory
    pricing_type: PricingType = PricingType.NEGOTIABLE
    price_from: Optional[float]
    price_to: Optional[float]
    currency: str = "UZS"
    city: Optional[str]
    region: Optional[str]
    telegram_channel_url: Optional[str]
    subscriber_count: Optional[int]
    avg_views: Optional[int]
    engagement_rate: Optional[float]
    dimensions: Optional[str]
    daily_traffic: Optional[int]
    ad_formats: List[str] = []
    tags: List[str] = []
    extra_data: Dict[str, Any] = {}


class ListingUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    pricing_type: Optional[PricingType]
    price_from: Optional[float]
    price_to: Optional[float]
    city: Optional[str]
    subscriber_count: Optional[int]
    avg_views: Optional[int]
    engagement_rate: Optional[float]
    ad_formats: Optional[List[str]]
    tags: Optional[List[str]]
    status: Optional[ListingStatus]


class ListingPublic(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: ListingCategory
    status: ListingStatus = ListingStatus.ACTIVE
    pricing_type: PricingType = PricingType.NEGOTIABLE
    price_from: Optional[float] = None
    price_to: Optional[float] = None
    currency: str = "UZS"
    city: Optional[str] = None
    telegram_channel_url: Optional[str] = None
    subscriber_count: Optional[int] = None
    avg_views: Optional[int] = None
    engagement_rate: Optional[float] = None
    ad_formats: List[str] = []
    cover_image: Optional[str] = None
    images: List[str] = []
    view_count: int = 0
    save_count: int = 0
    lead_count: int = 0
    verified: bool = False
    featured: bool = False
    rating: float = 0.0
    review_count: int = 0
    tags: List[str] = []
    created_at: datetime
    owner: UserPublic

    class Config:
        from_attributes = True


class ListingListItem(BaseModel):
    id: int
    title: str
    category: ListingCategory
    pricing_type: PricingType = PricingType.NEGOTIABLE
    price_from: Optional[float] = None
    price_to: Optional[float] = None
    currency: str = "UZS"
    city: Optional[str] = None
    subscriber_count: Optional[int] = None
    avg_views: Optional[int] = None
    cover_image: Optional[str] = None
    verified: bool = False
    featured: bool = False
    rating: float = 0.0
    review_count: int = 0
    view_count: int = 0
    owner_name: Optional[str] = None
    owner_photo: Optional[str] = None

    class Config:
        from_attributes = True


# ─── CAMPAIGN ────────────────────────────────────────────────────────────────

class CampaignCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=256)
    description: Optional[str]
    business_type: Optional[str]
    goal: Optional[str]
    target_audience: Optional[str]
    city: Optional[str]
    budget_min: Optional[float]
    budget_max: Optional[float]
    currency: str = "UZS"
    duration_days: Optional[int]
    target_platforms: List[str] = []
    expected_result: Optional[str]
    needs_creative: bool = False
    needs_management: bool = False
    deadline: Optional[datetime]


class CampaignUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    status: Optional[CampaignStatus]
    budget_min: Optional[float]
    budget_max: Optional[float]


class CampaignPublic(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    business_type: Optional[str] = None
    goal: Optional[str] = None
    target_audience: Optional[str] = None
    city: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    currency: str = "UZS"
    duration_days: Optional[int] = None
    target_platforms: List[str] = []
    needs_creative: bool = False
    needs_management: bool = False
    status: CampaignStatus = CampaignStatus.OPEN
    view_count: int = 0
    proposal_count: int = 0
    deadline: Optional[datetime] = None
    created_at: datetime
    buyer: UserPublic

    class Config:
        from_attributes = True


class ProposalCreate(BaseModel):
    message: str = Field(..., min_length=10)
    price: Optional[float]
    currency: str = "UZS"
    delivery_days: Optional[int]
    listing_id: Optional[int]


class ProposalPublic(BaseModel):
    id: int
    campaign_id: int
    message: str
    price: Optional[float]
    currency: str
    delivery_days: Optional[int]
    status: str
    created_at: datetime
    provider: UserPublic

    class Config:
        from_attributes = True


# ─── MESSAGES ────────────────────────────────────────────────────────────────

class MessageCreate(BaseModel):
    content: Optional[str]
    message_type: str = "text"
    meta_data: Dict[str, Any] = {}


class MessagePublic(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    content: Optional[str]
    message_type: str
    file_url: Optional[str]
    file_name: Optional[str]
    meta_data: Dict[str, Any]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationPublic(BaseModel):
    id: int
    participant_1_id: int
    participant_2_id: int
    listing_id: Optional[int]
    campaign_id: Optional[int]
    last_message_at: datetime
    created_at: datetime
    other_user: Optional[UserPublic]
    last_message: Optional[MessagePublic]
    unread_count: int = 0

    class Config:
        from_attributes = True


# ─── DEALS ───────────────────────────────────────────────────────────────────

class DealCreate(BaseModel):
    provider_id: int
    listing_id: Optional[int]
    campaign_id: Optional[int]
    title: str
    description: Optional[str]
    price: float
    currency: str = "UZS"
    deadline: Optional[datetime]
    notes: Optional[str]


class DealUpdate(BaseModel):
    status: Optional[DealStatus]
    notes: Optional[str]
    price: Optional[float]


class DealPublic(BaseModel):
    id: int
    title: str
    description: Optional[str]
    price: float
    currency: str
    status: DealStatus
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    deadline: Optional[datetime]
    created_at: datetime
    buyer: UserPublic
    provider: UserPublic

    class Config:
        from_attributes = True


# ─── REVIEWS ─────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    reviewee_id: int
    listing_id: Optional[int]
    deal_id: Optional[int]
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str]


class ReviewPublic(BaseModel):
    id: int
    rating: int
    comment: Optional[str]
    created_at: datetime
    reviewer: UserPublic

    class Config:
        from_attributes = True


# ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

class NotificationPublic(BaseModel):
    id: int
    type: NotificationType
    title: str
    body: Optional[str]
    data: Dict[str, Any]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── PAYMENTS ────────────────────────────────────────────────────────────────

class PaymentInitiate(BaseModel):
    deal_id: int
    provider: str = Field(..., pattern="^(click|payme)$")
    return_url: Optional[str]


class PaymentPublic(BaseModel):
    id: int
    amount: float
    currency: str
    provider: str
    status: PaymentStatus
    created_at: datetime

    class Config:
        from_attributes = True


# ─── PACKAGES ────────────────────────────────────────────────────────────────

class PackageCreate(BaseModel):
    title: str
    description: Optional[str]
    listing_ids: List[int]
    total_price: float
    currency: str = "UZS"
    tags: List[str] = []


class PackagePublic(BaseModel):
    id: int
    title: str
    description: Optional[str]
    listing_ids: List[int]
    total_price: float
    currency: str
    tags: List[str]
    view_count: int
    created_at: datetime
    creator: UserPublic

    class Config:
        from_attributes = True


# ─── PAGINATION ──────────────────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    per_page: int
    pages: int
