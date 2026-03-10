"""
MIDAS Bot - Mini App yordamchi bot
Asosiy vazifa: Mini App ga yo'naltirish + bildirishnomalar
"""
import os
import json
import logging
import sqlite3
import asyncio
from datetime import datetime

from aiogram import Bot, Dispatcher, F
from aiogram.types import (
    Message, CallbackQuery,
    InlineKeyboardMarkup, InlineKeyboardButton,
    WebAppInfo, MenuButtonWebApp,
    ReplyKeyboardMarkup, KeyboardButton
)
from aiogram.filters import Command
from aiogram.fsm.storage.memory import MemoryStorage

# ==================== CONFIG ====================
BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN")
MINI_APP_URL = os.getenv("MINI_APP_URL", "https://midas-frontend.onrender.com")
DB_PATH = os.getenv("DB_PATH", "/opt/render/project/src/midas.db")
ADMIN_IDS_STR = os.getenv("ADMIN_IDS", "123456789")
ADMIN_IDS = [int(x.strip()) for x in ADMIN_IDS_STR.split(",") if x.strip()]

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

bot = Bot(token=BOT_TOKEN, parse_mode="HTML")
dp = Dispatcher(storage=MemoryStorage())

# ==================== DATABASE ====================
def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def get_user(tg_id):
    conn = get_conn()
    row = conn.execute("SELECT * FROM users WHERE telegram_id=?", (tg_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def get_stats():
    conn = get_conn()
    def q(sql): return conn.execute(sql).fetchone()[0]
    data = {
        "total": q("SELECT COUNT(*) FROM users"),
        "tadbirkorlar": q("SELECT COUNT(*) FROM users WHERE role='tadbirkor'"),
        "reklamachilar": q("SELECT COUNT(*) FROM users WHERE role='reklamachi'"),
        "premium": q("SELECT COUNT(*) FROM users WHERE is_premium=1"),
        "offers": q("SELECT COUNT(*) FROM offers"),
        "accepted": q("SELECT COUNT(*) FROM offers WHERE status='accepted'"),
        "chats": q("SELECT COUNT(*) FROM private_chats WHERE status='active'"),
    }
    conn.close()
    return data

def get_unverified():
    conn = get_conn()
    rows = conn.execute("""
        SELECT rp.user_id, u.full_name, rp.platform, rp.followers, rp.profile_link
        FROM reklamachi_profiles rp
        JOIN users u ON u.telegram_id = rp.user_id
        WHERE rp.verified = 0
        ORDER BY rp.created_at ASC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def set_premium(tg_id, value):
    conn = get_conn()
    conn.execute("UPDATE users SET is_premium=? WHERE telegram_id=?", (value, tg_id))
    conn.commit()
    conn.close()

def set_blocked(tg_id, value, reason=""):
    conn = get_conn()
    conn.execute("UPDATE users SET is_blocked=?, block_reason=? WHERE telegram_id=?", (value, reason, tg_id))
    conn.commit()
    conn.close()

def set_verified(tg_id, value):
    conn = get_conn()
    conn.execute("UPDATE reklamachi_profiles SET verified=? WHERE user_id=?", (value, tg_id))
    conn.commit()
    conn.close()

def get_all_users():
    conn = get_conn()
    rows = conn.execute("SELECT telegram_id FROM users WHERE is_blocked=0 AND is_active=1").fetchall()
    conn.close()
    return [r[0] for r in rows]

# ==================== KEYBOARDS ====================
def main_kb(user=None):
    """Asosiy klaviatura"""
    buttons = [
        [KeyboardButton(text="🌐 Mini App ni ochish", web_app=WebAppInfo(url=MINI_APP_URL))]
    ]
    return ReplyKeyboardMarkup(keyboard=buttons, resize_keyboard=True)

def mini_app_btn():
    """Mini App inline tugmasi"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🚀 MIDAS Mini App", web_app=WebAppInfo(url=MINI_APP_URL))],
        [InlineKeyboardButton(text="ℹ️ Yordam", callback_data="help")]
    ])

def admin_kb():
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="📊 Statistika", callback_data="admin_stats")],
        [InlineKeyboardButton(text="✅ Profil tasdiqlash", callback_data="admin_verify")],
        [InlineKeyboardButton(text="⭐ Premium berish", callback_data="admin_premium")],
        [InlineKeyboardButton(text="🚫 Bloklash", callback_data="admin_block")],
        [InlineKeyboardButton(text="📢 Xabar yuborish", callback_data="admin_broadcast")],
        [InlineKeyboardButton(text="🌐 Mini App", web_app=WebAppInfo(url=MINI_APP_URL))],
    ])

# ==================== HANDLERS ====================

@dp.message(Command("start"))
async def cmd_start(message: Message):
    user = get_user(message.from_user.id)
    name = message.from_user.first_name or "Do'stim"

    if user and user.get("is_blocked"):
        await message.answer("🚫 Siz bloklangansiz. Admin bilan bog'laning.")
        return

    if user:
        role_icon = "🏢" if user.get("role") == "tadbirkor" else "📢"
        role_name = "Tadbirkor" if user.get("role") == "tadbirkor" else "Reklamachi"
        text = (
            f"👋 Xush kelibsiz, <b>{name}</b>!\n\n"
            f"{role_icon} Rolingiz: <b>{role_name}</b>\n"
            f"⭐ Reyting: <b>{user.get('rating', 5.0):.1f}</b>\n\n"
            f"🌐 Mini App orqali barcha imkoniyatlardan foydalaning:"
        )
    else:
        text = (
            f"👋 Assalomu alaykum, <b>{name}</b>!\n\n"
            f"🌟 <b>MIDAS</b> — O'zbekistonning #1 reklama platformasi\n\n"
            f"✅ Tadbirkorlar va reklamachilarni AI orqali birlashtiradi\n"
            f"🎯 100 ballik aqlli matching tizimi\n"
            f"💬 Xavfsiz muloqot va hamkorlik\n\n"
            f"👇 Mini App ni oching va ro'yxatdan o'ting:"
        )

    await message.answer(text, reply_markup=main_kb(user))
    await message.answer(
        "⬇️ Quyidagi tugmani bosing:",
        reply_markup=mini_app_btn()
    )

    # Menu tugmasini o'rnatish
    try:
        await bot.set_chat_menu_button(
            chat_id=message.from_user.id,
            menu_button=MenuButtonWebApp(
                text="🌐 Mini App",
                web_app=WebAppInfo(url=MINI_APP_URL)
            )
        )
    except Exception as e:
        logger.error(f"Menu button xatolik: {e}")

@dp.message(Command("help"))
async def cmd_help(message: Message):
    text = (
        "ℹ️ <b>MIDAS — Yordam</b>\n\n"
        "🌐 <b>Mini App</b> orqali:\n"
        "• Ro'yxatdan o'tish\n"
        "• AI Matching — mos hamkor topish\n"
        "• Taklif yuborish va qabul qilish\n"
        "• Chat — bevosita muloqot\n"
        "• Bildirishnomalar\n\n"
        "📌 <b>Buyruqlar:</b>\n"
        "/start — Bosh menyu\n"
        "/help — Yordam\n"
        "/profile — Profilim\n"
        "/stats — Statistikam\n\n"
        "🆘 Muammo bo'lsa admin bilan bog'laning."
    )
    await message.answer(text, reply_markup=mini_app_btn())

@dp.message(Command("profile"))
async def cmd_profile(message: Message):
    user = get_user(message.from_user.id)
    if not user:
        await message.answer(
            "❌ Siz hali ro'yxatdan o'tmagansiz.\n\nMini App orqali ro'yxatdan o'ting:",
            reply_markup=mini_app_btn()
        )
        return

    role_icon = "🏢" if user.get("role") == "tadbirkor" else "📢"
    role_name = "Tadbirkor" if user.get("role") == "tadbirkor" else "Reklamachi"
    premium = "⭐ Ha" if user.get("is_premium") else "❌ Yo'q"

    conn = get_conn()
    deals = conn.execute(
        "SELECT COUNT(*) FROM offers WHERE status='accepted' AND (from_id=? OR to_id=?)",
        (user["telegram_id"], user["telegram_id"])
    ).fetchone()[0]
    conn.close()

    text = (
        f"👤 <b>PROFILIM</b>\n\n"
        f"📛 Ism: <b>{user.get('full_name', '—')}</b>\n"
        f"{role_icon} Rol: <b>{role_name}</b>\n"
        f"⭐ Reyting: <b>{user.get('rating', 5.0):.1f}/5.0</b>\n"
        f"👑 Premium: <b>{premium}</b>\n"
        f"🤝 Bitimlar: <b>{deals}</b>\n"
        f"📅 Ro'yxat: <b>{str(user.get('created_at', ''))[:10]}</b>\n\n"
        f"✏️ Profilni tahrirlash uchun Mini App ni oching:"
    )
    await message.answer(text, reply_markup=mini_app_btn())

@dp.message(Command("stats"))
async def cmd_stats(message: Message):
    user = get_user(message.from_user.id)
    if not user:
        await message.answer("❌ Avval ro'yxatdan o'ting:", reply_markup=mini_app_btn())
        return

    conn = get_conn()
    tg_id = message.from_user.id
    sent = conn.execute("SELECT COUNT(*) FROM offers WHERE from_id=?", (tg_id,)).fetchone()[0]
    received = conn.execute("SELECT COUNT(*) FROM offers WHERE to_id=?", (tg_id,)).fetchone()[0]
    accepted = conn.execute(
        "SELECT COUNT(*) FROM offers WHERE status='accepted' AND (from_id=? OR to_id=?)",
        (tg_id, tg_id)
    ).fetchone()[0]
    chats = conn.execute(
        "SELECT COUNT(*) FROM private_chats WHERE user1_id=? OR user2_id=?",
        (tg_id, tg_id)
    ).fetchone()[0]
    conn.close()

    text = (
        f"📊 <b>STATISTIKAM</b>\n\n"
        f"📤 Yuborilgan takliflar: <b>{sent}</b>\n"
        f"📥 Kelgan takliflar: <b>{received}</b>\n"
        f"✅ Qabul qilingan: <b>{accepted}</b>\n"
        f"💬 Faol chatlar: <b>{chats}</b>\n"
        f"⭐ Reyting: <b>{user.get('rating', 5.0):.1f}/5.0</b>\n"
    )
    await message.answer(text, reply_markup=mini_app_btn())

@dp.message(Command("admin"))
async def cmd_admin(message: Message):
    if message.from_user.id not in ADMIN_IDS:
        await message.answer("❌ Ruxsat yo'q.")
        return
    await message.answer("🛡 <b>ADMIN PANEL</b>", reply_markup=admin_kb())

# ==================== ADMIN CALLBACKS ====================

@dp.callback_query(F.data == "admin_stats")
async def cb_admin_stats(cb: CallbackQuery):
    if cb.from_user.id not in ADMIN_IDS:
        return
    s = get_stats()
    text = (
        f"📊 <b>STATISTIKA</b>\n\n"
        f"👥 Jami foydalanuvchilar: <b>{s['total']}</b>\n"
        f"🏢 Tadbirkorlar: <b>{s['tadbirkorlar']}</b>\n"
        f"📢 Reklamachilar: <b>{s['reklamachilar']}</b>\n"
        f"⭐ Premium: <b>{s['premium']}</b>\n\n"
        f"📨 Jami takliflar: <b>{s['offers']}</b>\n"
        f"✅ Qabul qilingan: <b>{s['accepted']}</b>\n"
        f"💬 Faol chatlar: <b>{s['chats']}</b>\n"
    )
    await cb.message.edit_text(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="◀️ Orqaga", callback_data="back_admin")]
    ]))

@dp.callback_query(F.data == "admin_verify")
async def cb_admin_verify(cb: CallbackQuery):
    if cb.from_user.id not in ADMIN_IDS:
        return
    queue = get_unverified()
    if not queue:
        await cb.answer("✅ Barcha profillar tekshirilgan!", show_alert=True)
        return

    text = f"⏳ <b>TEKSHIRISH NAVBATI</b> — {len(queue)} ta\n\n"
    buttons = []
    for p in queue[:8]:
        text += f"👤 {p['full_name']} | {p['platform']} | {p['followers']:,} obs\n"
        buttons.append([
            InlineKeyboardButton(text=f"👤 {p['full_name'][:20]}", callback_data=f"vp_{p['user_id']}")
        ])
    buttons.append([InlineKeyboardButton(text="◀️ Orqaga", callback_data="back_admin")])
    await cb.message.edit_text(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))

@dp.callback_query(F.data.startswith("vp_"))
async def cb_verify_profile(cb: CallbackQuery):
    if cb.from_user.id not in ADMIN_IDS:
        return
    user_id = int(cb.data.replace("vp_", ""))
    conn = get_conn()
    row = conn.execute("""
        SELECT rp.*, u.full_name FROM reklamachi_profiles rp
        JOIN users u ON u.telegram_id=rp.user_id WHERE rp.user_id=?
    """, (user_id,)).fetchone()
    conn.close()
    if not row:
        await cb.answer("Topilmadi", show_alert=True)
        return
    p = dict(row)
    text = (
        f"👤 <b>{p['full_name']}</b>\n"
        f"📱 Platforma: {p['platform']}\n"
        f"🔗 {p.get('profile_link','—')}\n"
        f"👥 {p['followers']:,} obunachi\n"
        f"📈 ER: {p['engagement']}%\n"
        f"💰 Post: {p['price_post']:,} so'm\n"
    )
    await cb.message.edit_text(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="✅ Tasdiqlash", callback_data=f"va_{user_id}"),
            InlineKeyboardButton(text="❌ Rad etish", callback_data=f"vr_{user_id}"),
        ],
        [InlineKeyboardButton(text="◀️ Orqaga", callback_data="admin_verify")]
    ]))

@dp.callback_query(F.data.startswith("va_"))
async def cb_verify_accept(cb: CallbackQuery):
    if cb.from_user.id not in ADMIN_IDS:
        return
    user_id = int(cb.data.replace("va_", ""))
    set_verified(user_id, 1)
    await cb.answer("✅ Tasdiqlandi!")
    try:
        await bot.send_message(
            user_id,
            "✅ <b>PROFILINGIZ TASDIQLANDI!</b>\n\nEndi profilingiz boshqa foydalanuvchilarga ko'rinadi.",
            reply_markup=mini_app_btn()
        )
    except:
        pass
    await cb.message.edit_text("✅ Profil tasdiqlandi!", reply_markup=InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="◀️ Orqaga", callback_data="admin_verify")]
    ]))

@dp.callback_query(F.data.startswith("vr_"))
async def cb_verify_reject(cb: CallbackQuery):
    if cb.from_user.id not in ADMIN_IDS:
        return
    user_id = int(cb.data.replace("vr_", ""))
    await cb.answer("❌ Rad etildi!")
    try:
        await bot.send_message(
            user_id,
            "❌ <b>Profilingiz tasdiqlanmadi.</b>\n\nMa'lumotlarni to'g'rilang va qayta yuboring.",
            reply_markup=mini_app_btn()
        )
    except:
        pass
    await cb.message.edit_text("❌ Rad etildi.", reply_markup=InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="◀️ Orqaga", callback_data="admin_verify")]
    ]))

@dp.callback_query(F.data == "admin_premium")
async def cb_admin_premium(cb: CallbackQuery):
    if cb.from_user.id not in ADMIN_IDS:
        return
    await cb.message.edit_text(
        "⭐ <b>PREMIUM BERISH</b>\n\nFoydalanuvchi Telegram ID sini yuboring:\n\n<i>Masalan: 123456789</i>",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="◀️ Orqaga", callback_data="back_admin")]
        ])
    )
    # State saqlaymiz
    import shelve
    with shelve.open("/tmp/midas_admin_state") as db:
        db[str(cb.from_user.id)] = "premium"

@dp.callback_query(F.data == "admin_block")
async def cb_admin_block(cb: CallbackQuery):
    if cb.from_user.id not in ADMIN_IDS:
        return
    await cb.message.edit_text(
        "🚫 <b>BLOKLASH</b>\n\nFoydalanuvchi Telegram ID sini yuboring:",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="◀️ Orqaga", callback_data="back_admin")]
        ])
    )
    import shelve
    with shelve.open("/tmp/midas_admin_state") as db:
        db[str(cb.from_user.id)] = "block"

@dp.callback_query(F.data == "admin_broadcast")
async def cb_admin_broadcast(cb: CallbackQuery):
    if cb.from_user.id not in ADMIN_IDS:
        return
    await cb.message.edit_text(
        "📢 <b>XABAR YUBORISH</b>\n\nBarcha foydalanuvchilarga yuboriladigan xabarni yozing:",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="◀️ Bekor qilish", callback_data="back_admin")]
        ])
    )
    import shelve
    with shelve.open("/tmp/midas_admin_state") as db:
        db[str(cb.from_user.id)] = "broadcast"

@dp.callback_query(F.data == "back_admin")
async def cb_back_admin(cb: CallbackQuery):
    if cb.from_user.id not in ADMIN_IDS:
        return
    await cb.message.edit_text("🛡 <b>ADMIN PANEL</b>", reply_markup=admin_kb())

@dp.callback_query(F.data == "help")
async def cb_help(cb: CallbackQuery):
    await cb.answer()
    text = (
        "ℹ️ <b>MIDAS — Yordam</b>\n\n"
        "Mini App orqali:\n"
        "• Ro'yxatdan o'tish\n"
        "• AI Matching\n"
        "• Takliflar\n"
        "• Chat\n\n"
        "/profile — Profilim\n"
        "/stats — Statistika"
    )
    await cb.message.answer(text)

# ==================== ADMIN MESSAGE HANDLER ====================

@dp.message(F.text & F.from_user.id.in_(set(ADMIN_IDS)))
async def admin_message_handler(message: Message):
    import shelve
    with shelve.open("/tmp/midas_admin_state") as db:
        state = db.get(str(message.from_user.id))

    if not state:
        return

    if state == "premium":
        try:
            user_id = int(message.text.strip())
            user = get_user(user_id)
            if not user:
                await message.answer("❌ Foydalanuvchi topilmadi.")
                return
            current = user.get("is_premium", 0)
            set_premium(user_id, 0 if current else 1)
            action = "olib tashlandi" if current else "berildi"
            await message.answer(f"✅ {user['full_name']} ga premium {action}!")
            try:
                msg = "⭐ Sizga PREMIUM berildi!" if not current else "Premium statusingiz olib tashlandi."
                await bot.send_message(user_id, msg, reply_markup=mini_app_btn())
            except:
                pass
        except ValueError:
            await message.answer("❌ Faqat son kiriting. Masalan: 123456789")

    elif state == "block":
        try:
            parts = message.text.strip().split(None, 1)
            user_id = int(parts[0])
            reason = parts[1] if len(parts) > 1 else "Sabab ko'rsatilmagan"
            user = get_user(user_id)
            if not user:
                await message.answer("❌ Foydalanuvchi topilmadi.")
                return
            set_blocked(user_id, 1, reason)
            await message.answer(f"🚫 {user['full_name']} bloklandi. Sabab: {reason}")
            try:
                await bot.send_message(user_id, f"🚫 Siz bloklangansiz.\nSabab: {reason}")
            except:
                pass
        except ValueError:
            await message.answer("❌ Format: <ID> <sabab>\nMasalan: 123456789 spam")

    elif state == "broadcast":
        text = message.text.strip()
        users = get_all_users()
        sent = 0
        failed = 0
        await message.answer(f"📢 {len(users)} ta foydalanuvchiga yuborilmoqda...")
        for uid in users:
            try:
                await bot.send_message(uid, f"📢 <b>MIDAS xabari:</b>\n\n{text}", reply_markup=mini_app_btn())
                sent += 1
                await asyncio.sleep(0.05)
            except:
                failed += 1
        await message.answer(f"✅ Yuborildi: {sent}\n❌ Xato: {failed}")

    # Stateni tozalash
    import shelve
    with shelve.open("/tmp/midas_admin_state") as db:
        if str(message.from_user.id) in db:
            del db[str(message.from_user.id)]

# ==================== STARTUP ====================

async def on_startup():
    logger.info("✅ MIDAS Bot ishga tushdi!")
    # Global menu tugmasini o'rnatish
    try:
        await bot.set_my_commands([])
        await bot.delete_webhook(drop_pending_updates=True)
        logger.info("✅ Webhook tozalandi")
    except Exception as e:
        logger.error(f"Startup xatolik: {e}")

async def main():
    await on_startup()
    logger.info("🤖 Polling boshlandi...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
