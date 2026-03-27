from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import asyncio
import sys
import traceback


def handle_exception(exc_type, exc_value, exc_tb):
    logging.error("STARTUP ERROR:")
    logging.error("".join(traceback.format_exception(exc_type, exc_value, exc_tb)))


sys.excepthook = handle_exception

from app.core.config import settings
from app.db.database import engine, Base
from app.api.v1.router import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def run_bot(bot):
    logger.info("Bot polling started!")
    try:
        from aiogram import Dispatcher
        from aiogram.fsm.storage.memory import MemoryStorage
        from app.bot.handlers.start import router as start_router
        from app.bot.handlers.notifications import router as notif_router
        from app.bot.handlers.payments import router as payments_router
        from app.bot.handlers.admin import router as bot_admin_router
        from app.bot.middlewares.auth import AuthMiddleware

        dp = Dispatcher(storage=MemoryStorage())
        dp.message.middleware(AuthMiddleware())
        dp.include_router(start_router)
        dp.include_router(notif_router)
        dp.include_router(payments_router)
        dp.include_router(bot_admin_router)

        await dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types())
    except asyncio.CancelledError:
        logger.info("Bot polling cancelled.")
    except Exception as e:
        logger.error(f"Bot error: {e}", exc_info=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=== MIDAS API starting up ===")

    # DB yaratish
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified")

    bot = None
    bot_task = None

    if settings.TELEGRAM_BOT_TOKEN:
        from aiogram import Bot
        from aiogram.client.default import DefaultBotProperties
        from aiogram.enums import ParseMode

        bot = Bot(
            token=settings.TELEGRAM_BOT_TOKEN,
            default=DefaultBotProperties(parse_mode=ParseMode.HTML)
        )
        app.state.bot = bot
        logger.info("Bot instance created.")

        # ✅ Webhook tozalash — yield DAN OLDIN (conflict oldini olish)
        await bot.delete_webhook(drop_pending_updates=True)
        logger.info("Webhook deleted.")

        # ✅ Bot task — yield DAN OLDIN, background da ishlaydi
        bot_task = asyncio.create_task(run_bot(bot))
        logger.info("Bot task created!")
    else:
        logger.warning("TELEGRAM_BOT_TOKEN not set — bot ishga tushmadi")

    yield  # ✅ Server port ochiladi, requests qabul qiladi

    # Shutdown
    if bot_task:
        bot_task.cancel()
        try:
            await bot_task
        except asyncio.CancelledError:
            logger.info("Bot task stopped.")

    if bot:
        await bot.session.close()
        logger.info("Bot session closed.")


app = FastAPI(
    title="MIDAS API",
    version="1.0.0",
    lifespan=lifespan,
    redirect_slashes=False,
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    logger.error(f"422 Validation error on {request.method} {request.url.path}")
    logger.error(f"Errors: {errors}")
    try:
        body = await request.json()
        logger.error(f"Request body: {body}")
    except Exception:
        pass
    return JSONResponse(status_code=422, content={"detail": errors})


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0", "service": "MIDAS API"}
