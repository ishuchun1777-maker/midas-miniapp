from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Listing, Deal, Payment, UserRole
from app.api.v1.endpoints import serialize_user

router = APIRouter()

async def check_admin(user: User = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user

@router.get("/stats")
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(check_admin)
):
    user_count = await db.execute(select(func.count(User.id)))
    listing_count = await db.execute(select(func.count(Listing.id)))
    deal_count = await db.execute(select(func.count(Deal.id)))
    payment_total = await db.execute(select(func.sum(Payment.amount)).where(Payment.status == "paid"))
    
    return {
        "users": user_count.scalar(),
        "listings": listing_count.scalar(),
        "deals": deal_count.scalar(),
        "total_revenue": payment_total.scalar() or 0
    }

@router.get("/users")
async def list_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(check_admin)
):
    result = await db.execute(select(User).order_by(User.created_at.desc()).limit(100))
    users = result.scalars().all()
    return [serialize_user(u) for u in users]

@router.post("/users/{user_id}/verify")
async def verify_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(check_admin)
):
    from sqlalchemy import update
    await db.execute(update(User).where(User.id == user_id).values(is_verified=True))
    await db.commit()
    return {"status": "success"}
