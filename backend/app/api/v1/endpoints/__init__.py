def serialize_user(u) -> dict:
    if not u:
        return {"id": 0, "telegram_id": 0, "first_name": "Unknown",
                "language_code": "uz", "is_verified": False, "created_at": None}
    return {
        "id": u.id,
        "telegram_id": u.telegram_id,
        "telegram_username": u.telegram_username,
        "first_name": u.first_name,
        "last_name": u.last_name,
        "photo_url": u.photo_url,
        "language_code": u.language_code or "uz",
        "is_verified": bool(u.is_verified),
        "created_at": u.created_at.isoformat() if u.created_at else None,
    }
