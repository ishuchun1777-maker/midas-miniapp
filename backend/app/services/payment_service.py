import hmac
import hashlib
import base64
import json
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.models import Payment, Deal, PaymentStatus, DealStatus
from app.core.config import settings


# ─── CLICK ───────────────────────────────────────────────────────────────────

async def create_click_payment(
    db: AsyncSession,
    user_id: int,
    deal_id: int,
    amount: float,
    return_url: Optional[str] = None,
) -> Dict[str, Any]:
    payment = Payment(
        user_id=user_id,
        deal_id=deal_id,
        amount=amount,
        currency="UZS",
        provider="click",
        status=PaymentStatus.PENDING,
        description=f"MIDAS Deal #{deal_id}",
    )
    db.add(payment)
    await db.flush()

    # Click checkout URL
    merchant_id = settings.CLICK_MERCHANT_ID
    service_id = settings.CLICK_SERVICE_ID
    transaction_param = str(payment.id)
    amount_tiyin = int(amount * 100)

    checkout_url = (
        f"https://my.click.uz/services/pay"
        f"?service_id={service_id}"
        f"&merchant_id={merchant_id}"
        f"&amount={amount}"
        f"&transaction_param={transaction_param}"
        f"&return_url={return_url or ''}"
    )

    return {
        "payment_id": payment.id,
        "checkout_url": checkout_url,
        "amount": amount,
        "currency": "UZS",
        "provider": "click",
    }


async def verify_click_payment(
    db: AsyncSession,
    click_trans_id: str,
    service_id: str,
    click_paydoc_id: str,
    merchant_trans_id: str,
    amount: float,
    action: int,
    error: int,
    error_note: str,
    sign_time: str,
    sign_string: str,
) -> Dict[str, Any]:
    # Verify signature
    expected_sign = hashlib.md5(
        f"{click_trans_id}{service_id}{settings.CLICK_SECRET_KEY}{merchant_trans_id}{amount}{action}{sign_time}".encode()
    ).hexdigest()

    if expected_sign != sign_string:
        return {"error": -1, "error_note": "SIGN CHECK FAILED!"}

    payment_id = int(merchant_trans_id)
    result = await db.execute(
        select(Payment).where(Payment.id == payment_id)
    )
    payment = result.scalar_one_or_none()

    if not payment:
        return {"error": -5, "error_note": "User does not exist"}

    if action == 0:  # Prepare
        if payment.status == PaymentStatus.PAID:
            return {"error": -4, "error_note": "Already paid"}
        return {
            "click_trans_id": click_trans_id,
            "merchant_trans_id": merchant_trans_id,
            "merchant_prepare_id": payment_id,
            "error": 0,
            "error_note": "Success",
        }
    elif action == 1:  # Complete
        if error < 0:
            await db.execute(
                update(Payment)
                .where(Payment.id == payment_id)
                .values(status=PaymentStatus.FAILED)
            )
            return {"error": 0, "error_note": "Success"}

        await db.execute(
            update(Payment)
            .where(Payment.id == payment_id)
            .values(
                status=PaymentStatus.PAID,
                external_id=click_trans_id,
            )
        )
        # Update deal status
        if payment.deal_id:
            await db.execute(
                update(Deal)
                .where(Deal.id == payment.deal_id)
                .values(status=DealStatus.IN_PROGRESS)
            )

        return {
            "click_trans_id": click_trans_id,
            "merchant_trans_id": merchant_trans_id,
            "merchant_confirm_id": payment_id,
            "error": 0,
            "error_note": "Success",
        }


# ─── PAYME ───────────────────────────────────────────────────────────────────

def verify_payme_auth(authorization: str, is_test: bool = False) -> bool:
    try:
        encoded = authorization.split(" ")[1]
        decoded = base64.b64decode(encoded).decode()
        _, password = decoded.split(":")
        expected = settings.PAYME_TEST_SECRET_KEY if is_test else settings.PAYME_SECRET_KEY
        return password == expected
    except Exception:
        return False


async def handle_payme_request(
    db: AsyncSession,
    method: str,
    params: Dict[str, Any],
    request_id: Any,
) -> Dict[str, Any]:
    if method == "CheckPerformTransaction":
        amount = params.get("amount", 0)
        order_id = params.get("account", {}).get("order_id")

        if not order_id:
            return {
                "id": request_id,
                "error": {"code": -31050, "message": "Order not found"},
            }

        return {
            "id": request_id,
            "result": {"allow": True},
        }

    elif method == "CreateTransaction":
        transaction_id = params.get("id")
        amount = params.get("amount", 0)
        order_id = params.get("account", {}).get("order_id")

        # Resolve user_id from deal
        user_id = 0
        if order_id:
            deal_result = await db.execute(
                select(Deal).where(Deal.id == int(order_id))
            )
            deal = deal_result.scalar_one_or_none()
            if deal:
                user_id = deal.buyer_id

        payment = Payment(
            user_id=user_id,
            amount=amount / 100,
            currency="UZS",
            provider="payme",
            external_id=transaction_id,
            status=PaymentStatus.PENDING,
            description=f"MIDAS Order #{order_id}",
            meta_data=params,
        )
        db.add(payment)
        await db.flush()

        return {
            "id": request_id,
            "result": {
                "create_time": int(payment.created_at.timestamp() * 1000),
                "transaction": str(payment.id),
                "state": 1,
            },
        }

    elif method == "PerformTransaction":
        transaction_id = params.get("id")
        result = await db.execute(
            select(Payment).where(Payment.external_id == transaction_id)
        )
        payment = result.scalar_one_or_none()

        if not payment:
            return {
                "id": request_id,
                "error": {"code": -31003, "message": "Transaction not found"},
            }

        # Agar allaqachon bajarilgan bo'lsa (state 2)
        if payment.status == PaymentStatus.PAID:
             return {
                "id": request_id,
                "result": {
                    "transaction": str(payment.id),
                    "perform_time": int(payment.updated_at.timestamp() * 1000) if payment.updated_at else 0,
                    "state": 2,
                },
            }

        await db.execute(
            update(Payment)
            .where(Payment.id == payment.id)
            .values(status=PaymentStatus.PAID)
        )
        
        # Deal holatini yangilash
        if payment.deal_id:
            await db.execute(
                update(Deal)
                .where(Deal.id == payment.deal_id)
                .values(status=DealStatus.IN_PROGRESS)
            )

        from datetime import datetime
        return {
            "id": request_id,
            "result": {
                "transaction": str(payment.id),
                "perform_time": int(datetime.utcnow().timestamp() * 1000),
                "state": 2,
            },
        }

    elif method == "CancelTransaction":
        transaction_id = params.get("id")
        result = await db.execute(
            select(Payment).where(Payment.external_id == transaction_id)
        )
        payment = result.scalar_one_or_none()

        if payment:
            await db.execute(
                update(Payment)
                .where(Payment.id == payment.id)
                .values(status=PaymentStatus.REFUNDED)
            )

        from datetime import datetime
        return {
            "id": request_id,
            "result": {
                "transaction": str(payment.id) if payment else transaction_id,
                "cancel_time": int(datetime.utcnow().timestamp() * 1000),
                "state": -1,
            },
        }

    return {
        "id": request_id,
        "error": {"code": -32601, "message": "Method not found"},
    }
