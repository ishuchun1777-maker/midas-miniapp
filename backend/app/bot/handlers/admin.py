from aiogram import Router, F, types
from aiogram.filters import Command
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import SessionLocal
from app.models.models import User, Listing, ListingStatus
from sqlalchemy import select, func, update
import logging

logger = logging.getLogger(__name__)
router = Router()

@router.message(Command("admin_stats"))
async def admin_stats(message: types.Message, user: User = None):
    if not user or not user.is_admin:
        return await message.answer("❌ Siz admin emassiz.")
    
    async with SessionLocal() as db:
        user_count = await db.execute(select(func.count(User.id)))
        listing_count = await db.execute(select(func.count(Listing.id)))
        
        text = (
            "📊 **MIDAS Statistikasi**\n\n"
            f"👤 Jami foydalanuvchilar: {user_count.scalar()}\n"
            f"📦 Jami e'lonlar: {listing_count.scalar()}\n"
        )
        await message.answer(text, parse_mode="Markdown")

@router.message(Command("broadcast"))
async def broadcast(message: types.Message, user: User = None):
    if not user or not user.is_admin:
        return await message.answer("❌ Siz admin emassiz.")
    
    msg_text = message.text.replace("/broadcast", "").strip()
    if not msg_text:
        return await message.answer("ℹ️ Foydalanish: `/broadcast xabar matni`", parse_mode="Markdown")
    
    async with SessionLocal() as db:
        result = await db.execute(select(User.telegram_id))
        ids = result.scalars().all()
    
    count = 0
    for tid in ids:
        try:
            await message.bot.send_message(tid, f"📣 **ADMIN XABARI**\n\n{msg_text}", parse_mode="Markdown")
            count += 1
        except Exception:
            pass
            
    await message.answer(f"✅ {count} ta foydalanuvchiga xabar yuborildi.")

@router.message(Command("approve_listing"))
async def approve_listing(message: types.Message, user: User = None):
    if not user or not user.is_admin:
        return await message.answer("❌ Siz admin emassiz.")
    
    parts = message.text.split()
    if len(parts) < 2:
        return await message.answer("ℹ️ Foydalanish: `/approve_listing <id>`")
        
    l_id = int(parts[1])
    async with SessionLocal() as db:
        await db.execute(
            update(Listing)
            .where(Listing.id == l_id)
            .values(status=ListingStatus.ACTIVE, verified=True)
        )
        await db.commit()
        
    await message.answer(f"✅ E'lon #{l_id} tasdiqlandi va faollashtirildi.")
