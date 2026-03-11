from sqlalchemy import (
    Column, Integer, BigInteger, String, Text, Boolean, Float,
    DateTime, Enum, ForeignKey, JSON, Index, UniqueConstraint,
    TypeDecorator
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum
import json as _json


class SafeJSON(TypeDecorator):
    """JSON field — PostgreSQL va SQLite ikkalasida ishlaydi"""
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if dialect.name == "postgresql":
            return value
        if value is None:
            return None
        return _json.dumps(value, ensure_ascii=False)

    def process_result_value(self, value, dialect):
        if dialect.name == "postgresql":
            return value
        if value is None:
            return None
        try:
            return _json.loads(value)
        except Exception:
            return value

    def coerce_compared_value(self, op, value):
        return self



class UserRole(str, enum.Enum):
    BUYER = "buyer"
    AUDIENCE_OWNER = "audience_owner"
    MARKETING_OPERATOR = "marketing_operator"
    CREATIVE_PROVIDER = "creative_provider"
    ADMIN = "admin"


class ListingStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    SOLD = "sold"
    REJECTED = "rejected"


class CampaignStatus(str, enum.Enum):
    DRAFT = "draft"
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class DealStatus(str, enum.Enum):
    LEAD = "lead"
    NEGOTIATION = "negotiation"
    AGREED = "agreed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DISPUTED = "disputed"


class PricingType(str, enum.Enum):
    FIXED = "fixed"
    NEGOTIABLE = "negotiable"
    PROPOSAL = "proposal"
    PACKAGE = "package"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class NotificationType(str, enum.Enum):
    NEW_LEAD = "new_lead"
    NEW_MESSAGE = "new_message"
    PROPOSAL_RECEIVED = "proposal_received"
    DEAL_UPDATED = "deal_updated"
    CAMPAIGN_UPDATED = "campaign_updated"
    REVIEW_RECEIVED = "review_received"
    PAYMENT_RECEIVED = "payment_received"


# ─── USER & PROFILE ──────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(BigInteger, unique=True, nullable=False, index=True)
    telegram_username = Column(String(64), nullable=True)
    first_name = Column(String(64), nullable=False)
    last_name = Column(String(64), nullable=True)
    photo_url = Column(String(512), nullable=True)
    language_code = Column(String(8), default="uz")
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_seen_at = Column(DateTime(timezone=True), server_default=func.now())

    profiles = relationship("UserProfile", back_populates="user", cascade="all, delete-orphan")
    listings = relationship("Listing", back_populates="owner")
    campaigns = relationship("Campaign", back_populates="buyer")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    notifications = relationship("Notification", back_populates="user")
    reviews_given = relationship("Review", foreign_keys="Review.reviewer_id", back_populates="reviewer")
    reviews_received = relationship("Review", foreign_keys="Review.reviewee_id", back_populates="reviewee")
    favorites = relationship("Favorite", back_populates="user")
    payments = relationship("Payment", back_populates="user")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    display_name = Column(String(128), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(512), nullable=True)
    phone = Column(String(20), nullable=True)
    city = Column(String(64), nullable=True)
    website = Column(String(256), nullable=True)
    specializations = Column(SafeJSON, default=list)  # list of tags
    social_links = Column(SafeJSON, default=dict)
    is_primary = Column(Boolean, default=True)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    completed_deals = Column(Integer, default=0)
    response_rate = Column(Float, default=100.0)
    verified_badge = Column(Boolean, default=False)
    featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="profiles")

    __table_args__ = (
        UniqueConstraint("user_id", "role", name="uq_user_role"),
    )


# ─── LISTINGS ────────────────────────────────────────────────────────────────

class ListingCategory(str, enum.Enum):
    TELEGRAM_CHANNEL = "telegram_channel"
    YOUTUBE_CREATOR = "youtube_creator"
    INSTAGRAM = "instagram"
    TIKTOK = "tiktok"
    BILLBOARD = "billboard"
    LED_SCREEN = "led_screen"
    TRANSPORT = "transport"
    EVENT = "event"
    MEDIA_BUYER = "media_buyer"
    TARGETOLOGIST = "targetologist"
    SMM = "smm"
    MARKETING_AGENCY = "marketing_agency"
    GRAPHIC_DESIGNER = "graphic_designer"
    VIDEO_MAKER = "video_maker"
    COPYWRITER = "copywriter"
    MOTION_DESIGNER = "motion_designer"


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(Enum(ListingCategory), nullable=False)
    status = Column(Enum(ListingStatus), default=ListingStatus.ACTIVE)
    pricing_type = Column(Enum(PricingType), default=PricingType.NEGOTIABLE)
    price_from = Column(Float, nullable=True)
    price_to = Column(Float, nullable=True)
    currency = Column(String(8), default="UZS")

    # Location
    city = Column(String(64), nullable=True)
    region = Column(String(64), nullable=True)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)

    # Telegram channel specific
    telegram_channel_url = Column(String(256), nullable=True)
    subscriber_count = Column(Integer, nullable=True)
    avg_views = Column(Integer, nullable=True)
    engagement_rate = Column(Float, nullable=True)

    # Outdoor specific
    dimensions = Column(String(64), nullable=True)
    daily_traffic = Column(Integer, nullable=True)

    # Ad formats & availability
    ad_formats = Column(SafeJSON, default=list)  # ["post", "story", "integration"]
    availability = Column(SafeJSON, default=dict)  # {"available_from": "...", "booked_dates": []}

    # Media
    cover_image = Column(String(512), nullable=True)
    images = Column(SafeJSON, default=list)

    # Analytics
    view_count = Column(Integer, default=0)
    save_count = Column(Integer, default=0)
    lead_count = Column(Integer, default=0)

    # Trust
    verified = Column(Boolean, default=False)
    featured = Column(Boolean, default=False)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)

    # Extra metadata
    tags = Column(SafeJSON, default=list)
    extra_data = Column(SafeJSON, default=dict)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="listings")
    reviews = relationship("Review", back_populates="listing")
    favorites = relationship("Favorite", back_populates="listing")
    deals = relationship("Deal", back_populates="listing")

    __table_args__ = (
        Index("ix_listings_category_status", "category", "status"),
        Index("ix_listings_city", "city"),
    )


# ─── CAMPAIGNS ───────────────────────────────────────────────────────────────

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=True)
    business_type = Column(String(128), nullable=True)
    goal = Column(String(256), nullable=True)
    target_audience = Column(Text, nullable=True)
    city = Column(String(64), nullable=True)
    budget_min = Column(Float, nullable=True)
    budget_max = Column(Float, nullable=True)
    currency = Column(String(8), default="UZS")
    duration_days = Column(Integer, nullable=True)
    target_platforms = Column(SafeJSON, default=list)
    expected_result = Column(Text, nullable=True)
    needs_creative = Column(Boolean, default=False)
    needs_management = Column(Boolean, default=False)
    status = Column(Enum(CampaignStatus), default=CampaignStatus.OPEN)
    cover_image = Column(String(512), nullable=True)
    view_count = Column(Integer, default=0)
    proposal_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deadline = Column(DateTime(timezone=True), nullable=True)

    buyer = relationship("User", back_populates="campaigns")
    proposals = relationship("CampaignProposal", back_populates="campaign")
    deals = relationship("Deal", back_populates="campaign")


class CampaignProposal(Base):
    __tablename__ = "campaign_proposals"

    id = Column(Integer, primary_key=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    provider_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=True)
    message = Column(Text, nullable=False)
    price = Column(Float, nullable=True)
    currency = Column(String(8), default="UZS")
    delivery_days = Column(Integer, nullable=True)
    status = Column(String(32), default="pending")  # pending/accepted/rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    campaign = relationship("Campaign", back_populates="proposals")
    provider = relationship("User", foreign_keys=[provider_id])
    listing = relationship("Listing")


# ─── CONVERSATIONS & MESSAGES ─────────────────────────────────────────────────

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    participant_1_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    participant_2_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=True)
    last_message_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    messages = relationship("Message", back_populates="conversation", order_by="Message.created_at")
    participant_1 = relationship("User", foreign_keys=[participant_1_id])
    participant_2 = relationship("User", foreign_keys=[participant_2_id])

    __table_args__ = (
        UniqueConstraint("participant_1_id", "participant_2_id", name="uq_conversation_participants"),
        Index("ix_conv_p1", "participant_1_id"),
        Index("ix_conv_p2", "participant_2_id"),
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=True)
    message_type = Column(String(32), default="text")  # text/file/proposal/deal
    file_url = Column(String(512), nullable=True)
    file_name = Column(String(256), nullable=True)
    meta_data = Column(SafeJSON, default=dict)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")

    __table_args__ = (
        Index("ix_messages_conversation", "conversation_id"),
    )


# ─── DEALS ───────────────────────────────────────────────────────────────────

class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=True)
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    currency = Column(String(8), default="UZS")
    status = Column(Enum(DealStatus), default=DealStatus.LEAD)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    buyer = relationship("User", foreign_keys=[buyer_id])
    provider = relationship("User", foreign_keys=[provider_id])
    listing = relationship("Listing", back_populates="deals")
    campaign = relationship("Campaign", back_populates="deals")
    payments = relationship("Payment", back_populates="deal")
    reviews = relationship("Review", back_populates="deal")


# ─── REVIEWS ─────────────────────────────────────────────────────────────────

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reviewee_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=True)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=True)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    reviewer = relationship("User", foreign_keys=[reviewer_id], back_populates="reviews_given")
    reviewee = relationship("User", foreign_keys=[reviewee_id], back_populates="reviews_received")
    listing = relationship("Listing", back_populates="reviews")
    deal = relationship("Deal", back_populates="reviews")


# ─── FAVORITES ───────────────────────────────────────────────────────────────

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="favorites")
    listing = relationship("Listing", back_populates="favorites")

    __table_args__ = (
        UniqueConstraint("user_id", "listing_id", name="uq_favorite"),
    )


# ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(256), nullable=False)
    body = Column(Text, nullable=True)
    data = Column(SafeJSON, default=dict)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")

    __table_args__ = (
        Index("ix_notif_user_unread", "user_id", "is_read"),
    )


# ─── PAYMENTS ────────────────────────────────────────────────────────────────

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(8), default="UZS")
    provider = Column(String(32), nullable=False)  # click / payme
    external_id = Column(String(128), nullable=True)  # payment system's ID
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    description = Column(Text, nullable=True)
    meta_data = Column(SafeJSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="payments")
    deal = relationship("Deal", back_populates="payments")


# ─── PACKAGES ────────────────────────────────────────────────────────────────

class Package(Base):
    __tablename__ = "packages"

    id = Column(Integer, primary_key=True)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=True)
    listing_ids = Column(SafeJSON, default=list)
    total_price = Column(Float, nullable=False)
    currency = Column(String(8), default="UZS")
    cover_image = Column(String(512), nullable=True)
    tags = Column(SafeJSON, default=list)
    is_active = Column(Boolean, default=True)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    creator = relationship("User", foreign_keys=[creator_id])
