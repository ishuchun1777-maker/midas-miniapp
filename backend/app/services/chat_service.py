from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func, or_, and_
from sqlalchemy.orm import selectinload
from typing import Optional, List, Tuple
from app.models.models import Conversation, Message, User, NotificationType, Notification


async def get_or_create_conversation(
    db: AsyncSession,
    user1_id: int,
    user2_id: int,
    listing_id: Optional[int] = None,
    campaign_id: Optional[int] = None,
) -> Conversation:
    p1 = min(user1_id, user2_id)
    p2 = max(user1_id, user2_id)

    result = await db.execute(
        select(Conversation).where(
            Conversation.participant_1_id == p1,
            Conversation.participant_2_id == p2,
        )
    )
    conv = result.scalar_one_or_none()

    if not conv:
        conv = Conversation(
            participant_1_id=p1,
            participant_2_id=p2,
            listing_id=listing_id,
            campaign_id=campaign_id,
        )
        db.add(conv)
        await db.flush()
        await db.refresh(conv)

    return conv


async def send_message(
    db: AsyncSession,
    conversation_id: int,
    sender_id: int,
    content: Optional[str],
    message_type: str = "text",
    file_url: Optional[str] = None,
    file_name: Optional[str] = None,
    meta_data: dict = None,
) -> Message:
    msg = Message(
        conversation_id=conversation_id,
        sender_id=sender_id,
        content=content,
        message_type=message_type,
        file_url=file_url,
        file_name=file_name,
        meta_data=meta_data or {},
    )
    db.add(msg)

    await db.execute(
        update(Conversation)
        .where(Conversation.id == conversation_id)
        .values(last_message_at=func.now())
    )

    await db.flush()
    await db.refresh(msg)
    return msg


async def get_conversations(
    db: AsyncSession,
    user_id: int,
) -> List[Conversation]:
    result = await db.execute(
        select(Conversation)
        .where(
            or_(
                Conversation.participant_1_id == user_id,
                Conversation.participant_2_id == user_id,
            )
        )
        .options(
            selectinload(Conversation.participant_1),
            selectinload(Conversation.participant_2),
            selectinload(Conversation.messages),
        )
        .order_by(Conversation.last_message_at.desc())
    )
    return result.scalars().all()


async def get_messages(
    db: AsyncSession,
    conversation_id: int,
    page: int = 1,
    per_page: int = 50,
) -> Tuple[List[Message], int]:
    count_result = await db.execute(
        select(func.count(Message.id))
        .where(Message.conversation_id == conversation_id)
    )
    total = count_result.scalar()

    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .options(selectinload(Message.sender))
        .order_by(Message.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    messages = result.scalars().all()
    return list(reversed(messages)), total


async def mark_messages_read(
    db: AsyncSession,
    conversation_id: int,
    user_id: int,
):
    await db.execute(
        update(Message)
        .where(
            Message.conversation_id == conversation_id,
            Message.sender_id != user_id,
            Message.is_read == False,
        )
        .values(is_read=True)
    )


async def get_unread_count(db: AsyncSession, user_id: int) -> int:
    result = await db.execute(
        select(func.count(Message.id))
        .join(Conversation, Message.conversation_id == Conversation.id)
        .where(
            or_(
                Conversation.participant_1_id == user_id,
                Conversation.participant_2_id == user_id,
            ),
            Message.sender_id != user_id,
            Message.is_read == False,
        )
    )
    return result.scalar() or 0


async def create_notification(
    db: AsyncSession,
    user_id: int,
    type: NotificationType,
    title: str,
    body: Optional[str] = None,
    data: dict = None,
) -> Notification:
    notif = Notification(
        user_id=user_id,
        type=type,
        title=title,
        body=body,
        data=data or {},
    )
    db.add(notif)
    await db.flush()
    return notif
