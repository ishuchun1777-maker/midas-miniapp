from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import CommandStart, Command
from aiogram.utils.keyboard import InlineKeyboardBuilder
import os

router = Router()

MINI_APP_URL = os.getenv("TELEGRAM_MINI_APP_URL", "https://t.me/MidasUzBot/app")


def get_url(path: str | None = None):
    """Deep link yoki oddiy URL qaytaradi"""
    base = os.getenv("TELEGRAM_MINI_APP_URL", "https://t.me/MidasUzBot/app")
    if "t.me/" in base:
        if not path: return base
        sep = "&" if "?" in base else "?"
        return f"{base}{sep}startapp={path.replace('/', '_')}"
    else:
        if not path: return base
        return f"{base.rstrip('/')}/{path.lstrip('/')}"


def main_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="💎 MIDAS: Platformani ochish", web_app={"url": get_url()})
    )
    builder.row(
        InlineKeyboardButton(text="🔍 Reklama bozorini ko'rish", web_app={"url": get_url("explore")})
    )
    builder.row(
        InlineKeyboardButton(text="📢 E'lon joylash", callback_data="list_ad"),
        InlineKeyboardButton(text="📊 Kampaniyalar", callback_data="campaigns")
    )
    builder.row(
        InlineKeyboardButton(text="❓ Yordam", callback_data="help")
    )
    return builder.as_markup()


@router.message(CommandStart())
async def cmd_start(message: Message):
    user_name = message.from_user.first_name if message.from_user else "Foydalanuvchi"

    text = (
        f"<b>Salom, {user_name}! 👋</b>\n\n"
        f"<b>MIDAS</b> — O'zbekistondagi professional reklama munosabatlari va hamkorlik platformasiga xush kelibsiz.\n\n"
        f"🚀 <b>Platforma imkoniyatlari:</b>\n"
        f"• <b>Reklama beruvchilar uchun:</b> Eng top Telegram kanallar, Influencerlar va LED ekranlar bazasi.\n"
        f"• <b>Ijrochilar uchun:</b> Doimiy buyurtmalar oqimi va xavfsiz to'lovlar (Telegram Stars, Click, Payme).\n"
        f"• <b>Xavfsiz bitim:</b> Midas barcha bitimlarda kafil (garant) sifatida ishtirok etadi.\n\n"
        f"🔥 <b>Hoziroq boshlang:</b>"
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
        "💡 <b>Savol va takliflar uchun:</b>\n"
        "@MidasUzSupport ga yozing"
    )
    await message.answer(text)


@router.callback_query(F.data == "list_ad")
async def cb_list_ad(callback: CallbackQuery):
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="📱 E'lon yaratish", web_app={"url": get_url("listing/create")})
    )
    builder.row(InlineKeyboardButton(text="⬅️ Orqaga", callback_data="back_main"))
    await callback.message.edit_text(
        "<b>📢 Reklama joylashtirish</b>\n\n"
        "Quyidagi turlardan biri bo'yicha e'lon yarating:\n\n"
        "• Telegram / YouTube / Social Media\n"
        "• Billboard / LED / Transport\n"
        "• Marketing / Creative xizmatlar\n\n"
        "Davom etish uchun pastdagi tugmani bosing 👇",
        reply_markup=builder.as_markup()
    )
    await callback.answer()


@router.callback_query(F.data == "campaigns")
async def cb_campaigns(callback: CallbackQuery):
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="📋 Kampaniyalarni ko'rish", web_app={"url": get_url("campaigns")})
    )
    builder.row(InlineKeyboardButton(text="⬅️ Orqaga", callback_data="back_main"))
    await callback.message.edit_text(
        "<b>📋 Kampaniyalar bo'limi</b>\n\n"
        "Tadbirkorlarning reklama so'rovlari va kastinglari.\n"
        "Taklif bering va buyurtma oling.\n\n"
        "MIDAS da ko'rish uchun 👇",
        reply_markup=builder.as_markup()
    )
    await callback.answer()


@router.callback_query(F.data == "back_main")
async def cb_back_main(callback: CallbackQuery):
    user_name = callback.from_user.first_name if callback.from_user else "Foydalanuvchi"
    await callback.message.edit_text(
        f"<b>Salom, {user_name}! 👋</b>\n\n"
        f"<b>MIDAS</b> — Professional reklama platformasi.\n\n"
        f"Boshlash uchun tanlang 👇",
        reply_markup=main_keyboard()
    )
    await callback.answer()


@router.callback_query(F.data == "help")
async def cb_help(callback: CallbackQuery):
    await callback.message.edit_text(
        "<b>💡 Yordam</b>\n\n"
        "MIDAS platformasi haqida savollaringiz bormi?\n\n"
        "• Har bir bitim xavfsiz garant orqali amalga oshadi.\n"
        "• To'lovlar Telegram Stars, Click va Payme orqali.\n\n"
        "Bog'lanish: @MidasUzSupport",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="back_main")]
        ])
    )
    await callback.answer()
