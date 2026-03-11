from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import CommandStart, Command
from aiogram.utils.keyboard import InlineKeyboardBuilder
import os

router = Router()

MINI_APP_URL = os.getenv("TELEGRAM_MINI_APP_URL", "https://t.me/MidasUzBot/app")


def main_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(
            text="🚀 MIDAS ni ochish",
            web_app={"url": MINI_APP_URL},
        )
    )
    builder.row(
        InlineKeyboardButton(text="📢 Reklama joylash", callback_data="list_ad"),
        InlineKeyboardButton(text="🔍 Reklama topish", callback_data="find_ad"),
    )
    builder.row(
        InlineKeyboardButton(text="📊 Kampaniyalar", callback_data="campaigns"),
        InlineKeyboardButton(text="💬 Xabarlar", callback_data="messages"),
    )
    builder.row(
        InlineKeyboardButton(text="❓ Yordam", callback_data="help"),
    )
    return builder.as_markup()


@router.message(CommandStart())
async def cmd_start(message: Message):
    user_name = message.from_user.first_name if message.from_user else "Foydalanuvchi"

    text = (
        f"<b>Salom, {user_name}! 👋</b>\n\n"
        f"<b>MIDAS</b> ga xush kelibsiz — O'zbekistondagi birinchi professional reklama hamkorlik platformasi.\n\n"
        f"🎯 <b>Bu yerda siz:</b>\n"
        f"• Telegram kanallar va influencerlarni topasiz\n"
        f"• Media buyer va targetologlar bilan ishlaysiz\n"
        f"• Dizayner va kreativlar topasiz\n"
        f"• Kampaniyalarni tuzib, natija olasiz\n\n"
        f"Boshlash uchun quyidagi tugmani bosing 👇"
    )

    await message.answer(text, reply_markup=main_keyboard())


@router.message(Command("help"))
async def cmd_help(message: Message):
    text = (
        "<b>MIDAS — Yordam markazi</b>\n\n"
        "📌 <b>Asosiy buyruqlar:</b>\n"
        "/start — Bosh menyu\n"
        "/profile — Mening profilim\n"
        "/listings — Mening e'lonlarim\n"
        "/deals — Faol bitimlar\n"
        "/notifications — Bildirishnomalar\n\n"
        "💡 <b>Savol va takliflar uchun:</b>\n"
        "@MidasUzSupport ga yozing"
    )
    await message.answer(text)


@router.callback_query(F.data == "list_ad")
async def cb_list_ad(callback: CallbackQuery):
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(
            text="📱 E'lon yaratish",
            web_app={"url": f"{MINI_APP_URL}?page=create-listing"},
        )
    )
    builder.row(InlineKeyboardButton(text="⬅️ Orqaga", callback_data="back_main"))
    await callback.message.edit_text(
        "<b>📢 Reklama joylashtirish</b>\n\n"
        "Quyidagi turlardan birini tanlang:\n\n"
        "📱 Telegram kanal\n"
        "📺 YouTube kanal\n"
        "🖼 Billboard / LED\n"
        "🎯 Media buyer xizmati\n"
        "🎨 Kreativ xizmat\n\n"
        "E'lon yaratish uchun MIDAS ni oching 👇",
        reply_markup=builder.as_markup()
    )
    await callback.answer()


@router.callback_query(F.data == "find_ad")
async def cb_find_ad(callback: CallbackQuery):
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(
            text="🔍 Bozorni ko'rish",
            web_app={"url": f"{MINI_APP_URL}?page=explore"},
        )
    )
    builder.row(InlineKeyboardButton(text="⬅️ Orqaga", callback_data="back_main"))
    await callback.message.edit_text(
        "<b>🔍 Reklama topish</b>\n\n"
        "Sizga kerakli reklama turini topishga yordam beramiz:\n\n"
        "• Telegram kanallar\n"
        "• YouTube creatorlar\n"
        "• Billboard va LED ekranlar\n"
        "• Media buyerlar\n"
        "• Dizaynerlar\n\n"
        "MIDAS bozorini ochib ko'ring 👇",
        reply_markup=builder.as_markup()
    )
    await callback.answer()


@router.callback_query(F.data == "back_main")
async def cb_back_main(callback: CallbackQuery):
    user_name = callback.from_user.first_name if callback.from_user else "Foydalanuvchi"
    await callback.message.edit_text(
        f"<b>Salom, {user_name}! 👋</b>\n\n"
        f"<b>MIDAS</b> ga xush kelibsiz — professional reklama platformasi.\n\n"
        f"Boshlash uchun tanlang 👇",
        reply_markup=main_keyboard()
    )
    await callback.answer()


@router.callback_query(F.data == "campaigns")
async def cb_campaigns(callback: CallbackQuery):
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(
            text="📋 Kampaniyalarni ko'rish",
            web_app={"url": f"{MINI_APP_URL}?page=campaigns"},
        )
    )
    builder.row(InlineKeyboardButton(text="⬅️ Orqaga", callback_data="back_main"))
    await callback.message.edit_text(
        "<b>📋 Kampaniyalar</b>\n\n"
        "Tadbirkorlarning reklama brieflariga taklif bering\n"
        "yoki o'zingizning kampaniyangizni yarating.\n\n"
        "MIDAS da ko'rish uchun 👇",
        reply_markup=builder.as_markup()
    )
    await callback.answer()
