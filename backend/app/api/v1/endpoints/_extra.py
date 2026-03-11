from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from typing import List

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Package, Notification
from app.schemas.schemas import PackageCreate, PackagePublic, NotificationPublic

packages_router = APIRouter()
notifications_router = APIRouter()


@packages_router.get("/", response_model=List[PackagePublic])
async def list_packages(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Package)
        .where(Package.is_active == True)
        .options(selectinload(Package.creator))
        .order_by(Package.view_count.desc())
    )
    return result.scalars().all()


@packages_router.post("/", response_model=PackagePublic, status_code=201)
async def create_package(
    data: PackageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pkg = Package(creator_id=current_user.id, **data.model_dump())
    db.add(pkg)
    await db.flush()
    await db.refresh(pkg)
    return pkg


@notifications_router.get("/", response_model=List[NotificationPublic])
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
    )
    return result.scalars().all()


@notifications_router.post("/mark-read")
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id)
        .values(is_read=True)
    )
    return {"success": True}
