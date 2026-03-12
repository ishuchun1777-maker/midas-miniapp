from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "MIDAS"
    APP_ENV: str = "development"
    SECRET_KEY: str = "midas-super-secret-key-change-in-production"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./midas.db"

    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_WEBHOOK_SECRET: str = "midas-webhook-secret"
    TELEGRAM_MINI_APP_URL: str = "https://t.me/MidasUzBot/app"

    # JWT
    JWT_SECRET: str = "midas-jwt-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days

    # CORS — barcha kerakli URLlar
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://midas.uz",
        "https://app.midas.uz",
        "https://t.me",
        # Render URLs
        "https://midas-miniapp.onrender.com",
        "https://midas-frontend.onrender.com",
        "https://midas-backend.onrender.com",
        # Telegram WebApp (wildcard uchun)
        "null",
    ]

    # Click Payment
    CLICK_MERCHANT_ID: str = ""
    CLICK_SERVICE_ID: str = ""
    CLICK_SECRET_KEY: str = ""

    # Payme
    PAYME_MERCHANT_ID: str = ""
    PAYME_SECRET_KEY: str = ""
    PAYME_TEST_SECRET_KEY: str = ""

    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
