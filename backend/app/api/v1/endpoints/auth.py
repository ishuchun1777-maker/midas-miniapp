from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.security import verify_telegram_init_data, create_access_token, get_current_user
from app.schemas.schemas import TelegramAuthRequest, TelegramAuthResponse
from app.services.user_service import get_user_by_telegram_id, create_user, update_user_last_seen
from app.models.models import User

router = APIRouter()


@router.post("/telegram", response_model=TelegramAuthResponse)
async def telegram_auth(
    request: TelegramAuthRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate via Telegram Mini App initData"""
    user_data = verify_telegram_init_data(request.init_data)

    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Telegram data",
        )

    telegram_id = user_data.get("id")
    if not telegram_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing user ID in Telegram data",
        )

    user = await get_user_by_telegram_id(db, telegram_id)
    is_new_user = False

    if not user:
        user = await create_user(
            db,
            telegram_id=telegram_id,
            first_name=user_data.get("first_name", "User"),
            last_name=user_data.get("last_name"),
            telegram_username=user_data.get("username"),
            photo_url=user_data.get("photo_url"),
            language_code=user_data.get("language_code", "uz"),
        )
        is_new_user = True
    else:
        await update_user_last_seen(db, user.id)

    token = create_access_token(user.id, telegram_id)

    return TelegramAuthResponse(
        access_token=token,
        user=user,
        is_new_user=is_new_user,
    )


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
