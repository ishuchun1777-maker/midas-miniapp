from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, users, listings, campaigns, chat, deals, reviews, payments, packages, notifications
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(listings.router, prefix="/listings", tags=["Listings"])
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["Campaigns"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(deals.router, prefix="/deals", tags=["Deals"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(packages.router, prefix="/packages", tags=["Packages"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
