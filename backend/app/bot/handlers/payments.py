from aiogram import Router, F, types
from aiogram.types import PreCheckoutQuery, SuccessfulPayment
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import SessionLocal
from app.models.models import Deal, Payment, PaymentStatus, DealStatus
from sqlalchemy import select, update
import logging

logger = logging.getLogger(__name__)
router = Router()

@router.pre_checkout_query()
async def on_pre_checkout_query(pre_checkout_query: PreCheckoutQuery):
    # Har doim tasdiqlaymiz (agar cheklovlar bo'lmasa)
    await pre_checkout_query.answer(ok=True)

@router.message(F.successful_payment)
async def on_successful_payment(message: types.Message):
    sp = message.successful_payment
    payload = sp.invoice_payload
    
    logger.info(f"Successful payment received: {payload}")
    
    if payload.startswith("deal_"):
        parts = payload.split("_")
        deal_id = int(parts[1])
        user_id = int(parts[2])
        
        async with SessionLocal() as db:
            # Payment yaratish
            new_payment = Payment(
                user_id=user_id,
                deal_id=deal_id,
                amount=sp.total_amount,
                currency="XTR",
                provider="stars",
                external_id=sp.telegram_payment_charge_id,
                status=PaymentStatus.PAID
            )
            db.add(new_payment)
            
            # Deal holatini yangilash
            await db.execute(
                update(Deal)
                .where(Deal.id == deal_id)
                .values(status=DealStatus.IN_PROGRESS)
            )
            await db.commit()
            
            await message.answer("To'lov muvaffaqiyatli qabul qilindi! Bitim jarayoni boshlandi.")
