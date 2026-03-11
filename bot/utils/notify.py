"""
Notification sender - called from FastAPI backend to push Telegram notifications.
"""
import asyncio
from aiogram import Bot
from aiogram.enums import ParseMode
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.types import InlineKeyboardButton
import os

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
MINI_APP_URL = os.getenv("TELEGRAM_MINI_APP_URL", "")


async def send_new_lead_notification(
    telegram_id: int,
    buyer_name: str,
    listing_title: str,
    listing_id: int,
):
    bot = Bot(token=BOT_TOKEN)
    try:
        builder = InlineKeyboardBuilder()
        builder.row(
            InlineKeyboardButton(
                text="📋 Ko'rish",
                web_app={"url": f"{MINI_APP_URL}?page=listing/{listing_id}"},
            )
        )
        await bot.send_message(
            chat_id=telegram_id,
            text=(
                f"🔔 <b>Yangi so'rov!</b>\n\n"
                f"<b>{buyer_name}</b> sizning\n"
                f"<i>{listing_title}</i>\n"
                f"e'loningizga qiziqish bildirdi.\n\n"
                f"Tezda javob bering! ⚡"
            ),
            reply_markup=builder.as_markup(),
            parse_mode=ParseMode.HTML,
        )
    finally:
        await bot.session.close()


async def send_new_message_notification(
    telegram_id: int,
    sender_name: str,
    preview: str,
    conv_id: int,
):
    bot = Bot(token=BOT_TOKEN)
    try:
        builder = InlineKeyboardBuilder()
        builder.row(
            InlineKeyboardButton(
                text="💬 Javob berish",
                web_app={"url": f"{MINI_APP_URL}?page=messages/{conv_id}"},
            )
        )
        await bot.send_message(
            chat_id=telegram_id,
            text=(
                f"💬 <b>Yangi xabar</b>\n\n"
                f"<b>{sender_name}</b>:\n"
                f"<i>{preview[:100]}{'...' if len(preview) > 100 else ''}</i>"
            ),
            reply_markup=builder.as_markup(),
            parse_mode=ParseMode.HTML,
        )
    finally:
        await bot.session.close()


async def send_proposal_notification(
    telegram_id: int,
    provider_name: str,
    campaign_title: str,
    price: float,
    campaign_id: int,
):
    bot = Bot(token=BOT_TOKEN)
    try:
        builder = InlineKeyboardBuilder()
        builder.row(
            InlineKeyboardButton(
                text="📋 Taklifni ko'rish",
                web_app={"url": f"{MINI_APP_URL}?page=campaigns/{campaign_id}"},
            )
        )
        await bot.send_message(
            chat_id=telegram_id,
            text=(
                f"📩 <b>Yangi taklif!</b>\n\n"
                f"<b>{provider_name}</b> sizning\n"
                f"<i>{campaign_title}</i>\n"
                f"kampaniyangizga taklif berdi.\n\n"
                f"💰 Narx: <b>{price:,.0f} so'm</b>"
            ),
            reply_markup=builder.as_markup(),
            parse_mode=ParseMode.HTML,
        )
    finally:
        await bot.session.close()


async def send_deal_update_notification(
    telegram_id: int,
    status: str,
    deal_title: str,
    deal_id: int,
):
    STATUS_LABELS = {
        "agreed": "✅ Kelishildi",
        "in_progress": "⚡ Boshlandi",
        "completed": "🎉 Yakunlandi",
        "cancelled": "❌ Bekor qilindi",
    }
    label = STATUS_LABELS.get(status, status)

    bot = Bot(token=BOT_TOKEN)
    try:
        builder = InlineKeyboardBuilder()
        builder.row(
            InlineKeyboardButton(
                text="📋 Bitimni ko'rish",
                web_app={"url": f"{MINI_APP_URL}?page=deals/{deal_id}"},
            )
        )
        await bot.send_message(
            chat_id=telegram_id,
            text=(
                f"🔄 <b>Bitim yangilandi</b>\n\n"
                f"<i>{deal_title}</i>\n\n"
                f"Holat: <b>{label}</b>"
            ),
            reply_markup=builder.as_markup(),
            parse_mode=ParseMode.HTML,
        )
    finally:
        await bot.session.close()
