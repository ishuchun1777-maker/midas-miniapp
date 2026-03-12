import hmac as hmac_lib
import hashlib
import json
import time
import logging
from typing import Optional, Dict, Any
from urllib.parse import unquote
from datetime import datetime, timedelta

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.database import get_db

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)


def verify_telegram_init_data(init_data: str) -> Optional[Dict[str, Any]]:
    """Verify Telegram Mini App initData"""
    try:
        if not init_data or init_data.strip() == "":
            logger.warning("Empty initData")
            return None

        # Dev mode: token yo'q bo'lsa yoki "test" bo'lsa — mock user qaytarish
        if not settings.TELEGRAM_BOT_TOKEN or settings.TELEGRAM_BOT_TOKEN == "":
            logger.warning("TELEGRAM_BOT_TOKEN not set — returning mock user for dev")
            return {
                "id": 999999999,
                "first_name": "Dev",
                "last_name": "User",
                "username": "devuser",
                "language_code": "uz",
            }

        # 1. Parse URL-encoded key=value pairs
        raw_parsed: Dict[str, str] = {}
        for item in init_data.split("&"):
            if "=" not in item:
                continue
            key, _, value = item.partition("=")
            raw_parsed[key] = value

        hash_value = raw_parsed.pop("hash", None)
        if not hash_value:
            logger.warning("No hash in initData")
            return None

        # 2. data_check_string
        data_check_string = "\n".join(
            f"{k}={v}" for k, v in sorted(raw_parsed.items())
        )

        secret_key = hmac_lib.new(
            b"WebAppData",
            settings.TELEGRAM_BOT_TOKEN.encode(),
            hashlib.sha256,
        ).digest()

        computed_hash = hmac_lib.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256,
        ).hexdigest()

        logger.info(f"computed: {computed_hash[:20]}... received: {hash_value[:20]}...")

        if not hmac_lib.compare_digest(computed_hash, hash_value):
            logger.warning("Hash mismatch!")
            # Dev mode da skip
            if settings.APP_ENV != "production":
                logger.warning("DEV MODE: skipping hash check")
            else:
                return None

        # 3. auth_date tekshirish — 24 soat (production da), dev da skip
        auth_date_str = raw_parsed.get("auth_date", "0")
        try:
            auth_date = int(auth_date_str)
            age = time.time() - auth_date
            logger.info(f"auth_date age: {age:.0f} seconds")
            if age > 86400 and settings.APP_ENV == "production":
                logger.warning(f"initData expired: {age:.0f}s old")
                return None
        except (ValueError, TypeError):
            logger.warning(f"Invalid auth_date: {auth_date_str}")

        # 4. user ni URL-decode qilib JSON parse
        user_raw = raw_parsed.get("user", "{}")
        user_decoded = unquote(user_raw)
        logger.info(f"user decoded: {user_decoded[:80]}")
        user_data = json.loads(user_decoded)

        if not user_data.get("id"):
            logger.warning("No user ID in decoded data")
            return None

        return user_data

    except Exception as e:
        logger.error(f"verify_telegram_init_data error: {e}", exc_info=True)
        return None


def create_access_token(user_id: int, telegram_id: int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "telegram_id": telegram_id,
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    from app.services.user_service import get_user_by_id

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id = int(payload.get("sub", 0))
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    if not credentials:
        return None
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None
