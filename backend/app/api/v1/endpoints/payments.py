from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User
from app.schemas.schemas import PaymentInitiate, PaymentPublic
from app.services.payment_service import (
    create_click_payment, verify_click_payment,
    handle_payme_request, verify_payme_auth
)

router = APIRouter()


@router.post("/initiate", response_model=dict)
async def initiate_payment(
    data: PaymentInitiate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import select
    from app.models.models import Deal
    result = await db.execute(select(Deal).where(Deal.id == data.deal_id))
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if data.provider == "click":
        return await create_click_payment(
            db, current_user.id, deal.id, deal.price, data.return_url
        )
    elif data.provider == "payme":
        merchant_id = __import__("app.core.config", fromlist=["settings"]).settings.PAYME_MERCHANT_ID
        amount_tiyin = int(deal.price * 100)
        checkout_url = (
            f"https://checkout.paycom.uz/{merchant_id}"
            f"?amount={amount_tiyin}&order_id={deal.id}"
        )
        return {
            "checkout_url": checkout_url,
            "amount": deal.price,
            "currency": "UZS",
            "provider": "payme",
        }

    raise HTTPException(status_code=400, detail="Invalid payment provider")


@router.post("/click/webhook")
async def click_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    form = await request.form()
    return await verify_click_payment(
        db,
        click_trans_id=form.get("click_trans_id"),
        service_id=form.get("service_id"),
        click_paydoc_id=form.get("click_paydoc_id"),
        merchant_trans_id=form.get("merchant_trans_id"),
        amount=float(form.get("amount", 0)),
        action=int(form.get("action", 0)),
        error=int(form.get("error", 0)),
        error_note=form.get("error_note", ""),
        sign_time=form.get("sign_time", ""),
        sign_string=form.get("sign_string", ""),
    )


@router.post("/payme/webhook")
async def payme_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    authorization = request.headers.get("Authorization", "")
    if not verify_payme_auth(authorization):
        return {"error": {"code": -32504, "message": "Insufficient privilege to perform this method"}}

    body = await request.json()
    return await handle_payme_request(
        db,
        method=body.get("method"),
        params=body.get("params", {}),
        request_id=body.get("id"),
    )
