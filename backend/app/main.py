from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import asyncio

from app.core.config import settings
from app.db.database import engine, Base
from app.api.v1.router import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def run_bot():
    token = settings.TELEGRAM_BOT_TOKEN
    logger.info(f"BOT TOKEN CHECK: {'SET' if token else 'EMPTY'}")
    if not token:
        logger.warning("TELEGRAM_BOT_TOKEN not set — bot ishga tushmadi")
        return
    logger.info("Starting bot...")
    try:
        from aiogram import Bot, Dispatcher
        from aiogram.enums import ParseMode
        from aiogram.client.default import DefaultBotProperties
        from aiogram.fsm.storage.memory import MemoryStorage
        from app.bot.handlers.start import router as start_router
        from app.bot.handlers.notifications import router as notif_router
        from app.bot.middlewares.auth import AuthMiddleware

        bot = Bot(token=token, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
        dp = Dispatcher(storage=MemoryStorage())
        dp.message.middleware(AuthMiddleware())
        dp.include_router(start_router)
        dp.include_router(notif_router)
        logger.info("Bot polling started!")
        await dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types())
    except Exception as e:
        logger.error(f"Bot error: {e}", exc_info=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting MIDAS API...")

    # DB yaratish
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified")

    # Bot task boshlash
    logger.info("Launching bot task...")
    bot_task = asyncio.create_task(run_bot())
    logger.info("Bot task created!")

    yield

    # Shutdown
    bot_task.cancel()
    try:
        await bot_task
    except asyncio.CancelledError:
        logger.info("Bot task stopped.")


app = FastAPI(title="MIDAS API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0", "service": "MIDAS API"}
