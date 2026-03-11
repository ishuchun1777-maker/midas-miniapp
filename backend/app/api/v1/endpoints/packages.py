from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Package
from app.schemas.schemas import PackageCreate, PackagePublic

router = APIRouter()


@router.get("/", response_model=List[PackagePublic])
async def list_packages(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Package)
        .where(Package.is_active == True)
        .options(selectinload(Package.creator))
        .order_by(Package.view_count.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=PackagePublic, status_code=201)
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
