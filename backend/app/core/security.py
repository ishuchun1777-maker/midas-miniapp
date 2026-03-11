import hmac
import hashlib
import json
import time
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from urllib.parse import unquote
import jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.database import get_db

security = HTTPBearer(auto_error=False)


def verify_telegram_init_data(init_data: str) -> Optional[Dict[str, Any]]:
    """Verify Telegram Mini App initData"""
    try:
        # 1. URL-decode qilmasdan parse — hash verification uchun raw value kerak
        raw_parsed: Dict[str, str] = {}
        for item in init_data.split("&"):
            if "=" not in item:
                continue
            key, _, value = item.partition("=")
            raw_parsed[key] = value

        hash_value = raw_parsed.pop("hash", None)
        if not hash_value:
            return None

        # 2. data_check_string — raw (URL-encoded) valuelar bilan
        data_check_string = "\n".join(
            f"{k}={v}" for k, v in sorted(raw_parsed.items())
        )

        secret_key = hmac.new(
            b"WebAppData",
            settings.TELEGRAM_BOT_TOKEN.encode(),
            hashlib.sha256,
        ).digest()

        computed_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(computed_hash, hash_value):
            return None

        # 3. auth_date tekshirish — 24 soat ichida bo'lishi kerak
        auth_date = int(raw_parsed.get("auth_date", 0))
        if time.time() - auth_date > 86400:
            return None

        # 4. user fieldini URL-decode qilib JSON parse
        user_raw = raw_parsed.get("user", "{}")
        user_data = json.loads(unquote(user_raw))
        return user_data

    except Exception:
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


def decode_token(token: str) -> Optional[Dict]:
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.PyJWTError:
        return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    from app.services.user_service import get_user_by_id

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    user = await get_user_by_id(db, int(payload["sub"]))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

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
