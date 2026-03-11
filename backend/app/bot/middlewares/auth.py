from aiogram import BaseMiddleware
from aiogram.types import TelegramObject
from typing import Callable, Any, Awaitable


class AuthMiddleware(BaseMiddleware):
    async def __call__(
        self,
        handler: Callable[[TelegramObject, dict], Awaitable[Any]],
        event: TelegramObject,
        data: dict,
    ) -> Any:
        # Can add user lookup from DB here
        return await handler(event, data)
