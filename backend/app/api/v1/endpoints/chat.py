from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Conversation
from app.schemas.schemas import MessageCreate, MessagePublic, ConversationPublic
from app.services.chat_service import (
    get_or_create_conversation, send_message, get_conversations,
    get_messages, mark_messages_read, get_unread_count
)

router = APIRouter()


async def _verify_participant(db: AsyncSession, conv_id: int, user_id: int) -> Conversation:
    """Verify user is a participant of the conversation, raise 403 if not."""
    result = await db.execute(
        select(Conversation).where(Conversation.id == conv_id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv.participant_1_id != user_id and conv.participant_2_id != user_id:
        raise HTTPException(status_code=403, detail="Not a participant of this conversation")
    return conv


@router.get("/conversations")
async def list_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_conversations(db, current_user.id)


@router.post("/conversations/start")
async def start_conversation(
    recipient_id: int,
    listing_id: Optional[int] = None,
    campaign_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if recipient_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot message yourself")

    conv = await get_or_create_conversation(
        db, current_user.id, recipient_id, listing_id, campaign_id
    )
    return {"conversation_id": conv.id}


@router.get("/conversations/{conv_id}/messages", response_model=List[MessagePublic])
async def get_conversation_messages(
    conv_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _verify_participant(db, conv_id, current_user.id)
    messages, _ = await get_messages(db, conv_id, page, per_page)
    await mark_messages_read(db, conv_id, current_user.id)
    return messages


@router.post("/conversations/{conv_id}/messages", response_model=MessagePublic, status_code=201)
async def send_chat_message(
    conv_id: int,
    data: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _verify_participant(db, conv_id, current_user.id)
    msg = await send_message(
        db,
        conversation_id=conv_id,
        sender_id=current_user.id,
        content=data.content,
        message_type=data.message_type,
        meta_data=data.meta_data,
    )
    return msg


@router.get("/unread-count")
async def unread_messages_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = await get_unread_count(db, current_user.id)
    return {"unread_count": count}
