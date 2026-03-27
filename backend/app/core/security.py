import hmac as hmac_lib
import hashlib
import json
import time
import logging
from typing import Optional, Dict, Any
from urllib.parse import unquote
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.database import get_db

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)


def verify_telegram_init_data(init_data: str) -> Optional[Dict[str, Any]]:
    try:
        if not init_data or not init_data.strip():
            logger.warning("Empty initData")
            return None

        # RAW qiymatlarni saqlash (hash uchun)
        raw_parsed: Dict[str, str] = {}
        # DECODED qiymatlar (user parse uchun)
        decoded_parsed: Dict[str, str] = {}

        for item in init_data.split("&"):
            if "=" not in item:
                continue
            key, _, value = item.partition("=")
            raw_parsed[key] = value          # ← original encoded (hash uchun)
            decoded_parsed[key] = unquote(value)  # ← decoded (user uchun)

        hash_value = raw_parsed.pop("hash", None)
        decoded_parsed.pop("hash", None)
        raw_parsed.pop("signature", None)
        decoded_parsed.pop("signature", None)

        if not hash_value:
            logger.warning("No hash in initData")
            return None

        hash_value = unquote(hash_value)  # hash o'zi ham decode qilinadi

        # auth_date tekshirish
        try:
            auth_date = int(decoded_parsed.get("auth_date", "0"))
            age = time.time() - auth_date
            if age > 86400 * 7:
                logger.warning(f"initData too old: {age:.0f}s")
                return None
        except (ValueError, TypeError):
            pass

        # user parse — decoded version ishlatiladi
        user_raw = decoded_parsed.get("user", "")
        if not user_raw:
            logger.warning("No user field in initData")
            return None

        try:
            user_data = json.loads(user_raw)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse user JSON: {e}")
            return None

        if not user_data.get("id"):
            logger.warning("No user.id in initData")
            return None

        if not settings.TELEGRAM_BOT_TOKEN:
            logger.error("TELEGRAM_BOT_TOKEN not set")
            return None

        token = settings.TELEGRAM_BOT_TOKEN.strip()

        # ✅ data_check_string — RAW (encoded) qiymatlar bilan!
        data_check_string = "\n".join(
            f"{k}={v}" for k, v in sorted(raw_parsed.items())
        )

        logger.debug(f"data_check_string:\n{data_check_string[:500]}")

        secret_key = hmac_lib.new(
            token.encode(),
            b"WebAppData",
            hashlib.sha256,
        ).digest()

        computed = hmac_lib.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256,
        ).hexdigest()

        if not hmac_lib.compare_digest(computed, hash_value):
            logger.warning(
                f"Hash mismatch!\n"
                f"computed : {computed}\n"
                f"received : {hash_value}\n"
                f"data_check_string:\n{data_check_string}"
            )
            return None

        logger.info(f"Telegram auth success for user_id={user_data.get('id')}")
        return user_data

    except Exception as e:
        logger.error(f"verify_telegram_init_data error: {e}", exc_info=True)
        return None


def create_access_token(user_id: int, telegram_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "telegram_id": telegram_id,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
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
