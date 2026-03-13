from aiogram import BaseMiddleware
from aiogram.types import TelegramObject, Message, CallbackQuery
from typing import Callable, Any, Awaitable
from app.db.database import SessionLocal
from app.models.models import User
from sqlalchemy import select


class AuthMiddleware(BaseMiddleware):
    async def __call__(
        self,
        handler: Callable[[TelegramObject, dict], Awaitable[Any]],
        event: TelegramObject,
        data: dict,
    ) -> Any:
        user_id = None
        if isinstance(event, Message):
            user_id = event.from_user.id
        elif isinstance(event, CallbackQuery):
            user_id = event.from_user.id

        if user_id:
            async with SessionLocal() as db:
                result = await db.execute(select(User).where(User.telegram_id == user_id))
                user = result.scalar_one_or_none()
                data["user"] = user

        return await handler(event, data)
