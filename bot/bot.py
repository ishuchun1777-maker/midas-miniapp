"""
MIDAS Bot - Backend API orqali ishlaydi
"""
import os
import logging
import asyncio
import shelve
import aiohttp

from telegram import (
    Update, InlineKeyboardMarkup, InlineKeyboardButton,
    ReplyKeyboardMarkup, KeyboardButton, WebAppInfo, MenuButtonWebApp
)
from telegram.ext import (
    Application, CommandHandler, CallbackQueryHandler,
    MessageHandler, filters, ContextTypes
)

# ==================== CONFIG ====================
BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN")
MINI_APP_URL = os.getenv("MINI_APP_URL", "https://midas-frontend.onrender.com")
API_URL = os.getenv("API_URL", "https://midas-backend.onrender.com")
ADMIN_IDS_STR = os.getenv("ADMIN_IDS", "123456789")
ADMIN_IDS = [int(x.strip()) for x in ADMIN_IDS_STR.split(",") if x.strip()]

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# ==================== API HELPERS ====================
async def api_get(path):
    try:
        async with aiohttp.ClientSession() as s:
            async with s.get(f"{API_URL}{path}", timeout=aiohttp.ClientTimeout(total=10)) as r:
                if r.status == 200:
                    return await r.json()
    except Exception as e:
        logger.error(f"API GET {path}: {e}")
    return None

async def api_put(path, params=None):
    try:
        async with aiohttp.ClientSession() as s:
            async with s.put(f"{API_URL}{path}", params=params or {}, timeout=aiohttp.ClientTimeout(total=10)) as r:
                return r.status == 200
    except Exception as e:
        logger.error(f"API PUT {path}: {e}")
    return False

# ==================== STATE ====================
def get_state(user_id):
    try:
        with shelve.open("/tmp/midas_state") as db:
            return db.get(str(user_id))
    except: return None

def set_state(user_id, state):
    try:
        with shelve.open("/tmp/midas_state") as db:
            db[str(user_id)] = state
    except: pass

def clear_state(user_id):
    try:
        with shelve.open("/tmp/midas_state") as db:
            if str(user_id) in db:
                del db[str(user_id)]
    except: pass

# ==================== KEYBOARDS ====================
def main_kb():
    return ReplyKeyboardMarkup(
        [[KeyboardButton(text="🌐 Mini App ni ochish", web_app=WebAppInfo(url=MINI_APP_URL))]],
        resize_keyboard=True
    )

def mini_app_btn():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton(text="🚀 MIDAS Mini App ni ochish", web_app=WebAppInfo(url=MINI_APP_URL))],
    ])

def admin_kb():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton(text="📊 Statistika", callback_data="admin_stats")],
        [InlineKeyboardButton(text="✅ Profil tasdiqlash", callback_data="admin_verify")],
        [InlineKeyboardButton(text="⭐ Premium berish/olish", callback_data="admin_premium")],
        [InlineKeyboardButton(text="🚫 Bloklash", callback_data="admin_block")],
        [InlineKeyboardButton(text="📢 Xabar yuborish", callback_data="admin_broadcast")],
        [InlineKeyboardButton(text="🌐 Mini App", web_app=WebAppInfo(url=MINI_APP_URL))],
    ])

def back_admin_kb():
    return InlineKeyboardMarkup([[InlineKeyboardButton(text="◀️ Orqaga", callback_data="back_admin")]])

# ==================== HANDLERS ====================

async def cmd_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tg_id = update.effective_user.id
    name = update.effective_user.first_name or "Do'stim"

    user = await api_get(f"/api/users/{tg_id}")

    if user and user.get("is_blocked"):
        await update.message.reply_text("🚫 Siz bloklangansiz. Admin bilan bog'laning.")
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

    await update.message.reply_text(text, parse_mode="HTML", reply_markup=main_kb())
    await update.message.reply_text("⬇️ Quyidagi tugmani bosing:", reply_markup=mini_app_btn())

    try:
        await ctx.bot.set_chat_menu_button(
            chat_id=tg_id,
            menu_button=MenuButtonWebApp(text="🌐 Mini App", web_app=WebAppInfo(url=MINI_APP_URL))
        )
    except Exception as e:
        logger.error(f"Menu button: {e}")

async def cmd_help(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    text = (
        "ℹ️ <b>MIDAS — Yordam</b>\n\n"
        "🌐 <b>Mini App</b> orqali:\n"
        "• Ro'yxatdan o'tish\n"
        "• AI Matching — mos hamkor topish\n"
        "• Taklif yuborish va qabul qilish\n"
        "• Chat — bevosita muloqot\n\n"
        "📌 <b>Buyruqlar:</b>\n"
        "/start — Bosh menyu\n"
        "/profile — Profilim\n"
        "/stats — Statistikam\n"
        "/admin — Admin panel\n"
    )
    await update.message.reply_text(text, parse_mode="HTML", reply_markup=mini_app_btn())

async def cmd_profile(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tg_id = update.effective_user.id
    user = await api_get(f"/api/users/{tg_id}")
    if not user:
        await update.message.reply_text(
            "❌ Siz hali ro'yxatdan o'tmagansiz.\n\nMini App orqali ro'yxatdan o'ting:",
            reply_markup=mini_app_btn()
        )
        return
    stats = await api_get(f"/api/users/{tg_id}/stats") or {}
    role_icon = "🏢" if user.get("role") == "tadbirkor" else "📢"
    role_name = "Tadbirkor" if user.get("role") == "tadbirkor" else "Reklamachi"
    premium = "⭐ Ha" if user.get("is_premium") else "❌ Yo'q"
    text = (
        f"👤 <b>PROFILIM</b>\n\n"
        f"📛 Ism: <b>{user.get('full_name', '—')}</b>\n"
        f"{role_icon} Rol: <b>{role_name}</b>\n"
        f"⭐ Reyting: <b>{user.get('rating', 5.0):.1f}/5.0</b>\n"
        f"👑 Premium: <b>{premium}</b>\n"
        f"🤝 Bitimlar: <b>{stats.get('deals', 0)}</b>\n"
        f"📨 Takliflar: <b>{stats.get('total_offers', 0)}</b>\n"
        f"📅 Ro'yxat: <b>{str(user.get('created_at', ''))[:10]}</b>\n\n"
        f"✏️ Profilni tahrirlash uchun Mini App ni oching:"
    )
    await update.message.reply_text(text, parse_mode="HTML", reply_markup=mini_app_btn())

async def cmd_stats(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tg_id = update.effective_user.id
    user = await api_get(f"/api/users/{tg_id}")
    if not user:
        await update.message.reply_text("❌ Avval ro'yxatdan o'ting:", reply_markup=mini_app_btn())
        return
    stats = await api_get(f"/api/users/{tg_id}/stats") or {}
    text = (
        f"📊 <b>STATISTIKAM</b>\n\n"
        f"🤝 Bitimlar: <b>{stats.get('deals', 0)}</b>\n"
        f"📨 Takliflar: <b>{stats.get('total_offers', 0)}</b>\n"
        f"💬 Chatlar: <b>{stats.get('chats', 0)}</b>\n"
        f"⭐ Reyting: <b>{stats.get('rating', 5.0):.1f}/5.0</b>\n"
    )
    await update.message.reply_text(text, parse_mode="HTML", reply_markup=mini_app_btn())

async def cmd_admin(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id not in ADMIN_IDS:
        await update.message.reply_text("❌ Ruxsat yo'q.")
        return
    await update.message.reply_text("🛡 <b>ADMIN PANEL</b>", parse_mode="HTML", reply_markup=admin_kb())

# ==================== CALLBACKS ====================

async def callback_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    cb = update.callback_query
    await cb.answer()
    data = cb.data

    if cb.from_user.id not in ADMIN_IDS and data not in ["help"]:
        return

    if data == "back_admin":
        await cb.message.edit_text("🛡 <b>ADMIN PANEL</b>", parse_mode="HTML", reply_markup=admin_kb())

    elif data == "admin_stats":
        s = await api_get(f"/api/admin/stats?admin_id={cb.from_user.id}")
        if not s:
            await cb.message.edit_text("❌ Xatolik", reply_markup=back_admin_kb())
            return
        text = (
            f"📊 <b>STATISTIKA</b>\n\n"
            f"👥 Jami: <b>{s['total_users']}</b>\n"
            f"🏢 Tadbirkorlar: <b>{s['tadbirkorlar']}</b>\n"
            f"📢 Reklamachilar: <b>{s['reklamachilar']}</b>\n"
            f"⭐ Premium: <b>{s['premium']}</b>\n\n"
            f"📨 Takliflar: <b>{s['total_offers']}</b>\n"
            f"✅ Qabul qilingan: <b>{s['accepted_offers']}</b>\n"
            f"💬 Faol chatlar: <b>{s['active_chats']}</b>\n"
            f"📝 Xabarlar: <b>{s['total_messages']}</b>\n"
        )
        await cb.message.edit_text(text, parse_mode="HTML", reply_markup=back_admin_kb())

    elif data == "admin_verify":
        queue = await api_get(f"/api/admin/verify-queue?admin_id={cb.from_user.id}") or []
        if not queue:
            await cb.message.edit_text("✅ Barcha profillar tekshirilgan!", reply_markup=back_admin_kb())
            return
        text = f"⏳ <b>TEKSHIRISH NAVBATI</b> — {len(queue)} ta\n\n"
        buttons = []
        for p in queue[:8]:
            text += f"👤 {p['full_name']} | {p['platform']} | {p['followers']:,} obs\n"
            buttons.append([InlineKeyboardButton(text=f"👤 {p['full_name'][:20]}", callback_data=f"vp_{p['user_id']}")])
        buttons.append([InlineKeyboardButton(text="◀️ Orqaga", callback_data="back_admin")])
        await cb.message.edit_text(text, parse_mode="HTML", reply_markup=InlineKeyboardMarkup(buttons))

    elif data.startswith("vp_"):
        user_id = int(data.replace("vp_", ""))
        p = await api_get(f"/api/reklamachi-profiles/{user_id}")
        if not p:
            await cb.message.edit_text("❌ Topilmadi", reply_markup=back_admin_kb())
            return
        text = (
            f"👤 <b>{p['full_name']}</b>\n"
            f"📱 {p['platform']}\n"
            f"🔗 {p.get('profile_link','—')}\n"
            f"👥 {p['followers']:,} obunachi\n"
            f"📈 ER: {p['engagement']}%\n"
            f"💰 Post: {p['price_post']:,} so'm\n"
        )
        await cb.message.edit_text(text, parse_mode="HTML", reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton(text="✅ Tasdiqlash", callback_data=f"va_{user_id}"),
             InlineKeyboardButton(text="❌ Rad etish", callback_data=f"vr_{user_id}")],
            [InlineKeyboardButton(text="◀️ Orqaga", callback_data="admin_verify")]
        ]))

    elif data.startswith("va_"):
        user_id = int(data.replace("va_", ""))
        await api_put(f"/api/admin/verify/{user_id}", {"admin_id": cb.from_user.id, "value": 1})
        try:
            await ctx.bot.send_message(user_id, "✅ <b>PROFILINGIZ TASDIQLANDI!</b>", parse_mode="HTML", reply_markup=mini_app_btn())
        except: pass
        await cb.message.edit_text("✅ Profil tasdiqlandi!", reply_markup=back_admin_kb())

    elif data.startswith("vr_"):
        user_id = int(data.replace("vr_", ""))
        try:
            await ctx.bot.send_message(user_id, "❌ <b>Profilingiz tasdiqlanmadi.</b>", parse_mode="HTML", reply_markup=mini_app_btn())
        except: pass
        await cb.message.edit_text("❌ Rad etildi.", reply_markup=back_admin_kb())

    elif data == "admin_premium":
        await cb.message.edit_text(
            "⭐ <b>PREMIUM</b>\n\nTelegram ID yuboring:\n<i>Masalan: 123456789</i>",
            parse_mode="HTML", reply_markup=back_admin_kb()
        )
        set_state(cb.from_user.id, "premium")

    elif data == "admin_block":
        await cb.message.edit_text(
            "🚫 <b>BLOKLASH</b>\n\nID va sabab yuboring:\n<i>Masalan: 123456789 spam</i>",
            parse_mode="HTML", reply_markup=back_admin_kb()
        )
        set_state(cb.from_user.id, "block")

    elif data == "admin_broadcast":
        await cb.message.edit_text(
            "📢 <b>XABAR YUBORISH</b>\n\nXabar matnini yozing:",
            parse_mode="HTML", reply_markup=back_admin_kb()
        )
        set_state(cb.from_user.id, "broadcast")

# ==================== ADMIN TEXT ====================

async def admin_text_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id not in ADMIN_IDS:
        return
    state = get_state(update.effective_user.id)
    if not state:
        return
    text = update.message.text.strip()
    clear_state(update.effective_user.id)

    if state == "premium":
        try:
            user_id = int(text)
            user = await api_get(f"/api/users/{user_id}")
            if not user:
                await update.message.reply_text("❌ Foydalanuvchi topilmadi.")
                return
            current = user.get("is_premium", 0)
            new_val = 0 if current else 1
            await api_put(f"/api/admin/users/{user_id}/premium", {"admin_id": update.effective_user.id, "value": new_val})
            action = "olib tashlandi ❌" if current else "berildi ✅"
            await update.message.reply_text(f"⭐ {user['full_name']} ga premium {action}", reply_markup=admin_kb())
            try:
                msg = "⭐ <b>Sizga PREMIUM berildi!</b>" if new_val else "Premium statusingiz olib tashlandi."
                await ctx.bot.send_message(user_id, msg, parse_mode="HTML", reply_markup=mini_app_btn())
            except: pass
        except ValueError:
            await update.message.reply_text("❌ Faqat son kiriting.")

    elif state == "block":
        try:
            parts = text.split(None, 1)
            user_id = int(parts[0])
            reason = parts[1] if len(parts) > 1 else "Sabab ko'rsatilmagan"
            user = await api_get(f"/api/users/{user_id}")
            if not user:
                await update.message.reply_text("❌ Foydalanuvchi topilmadi.")
                return
            await api_put(f"/api/admin/users/{user_id}/block", {"admin_id": update.effective_user.id, "reason": reason})
            await update.message.reply_text(f"🚫 {user['full_name']} bloklandi.", reply_markup=admin_kb())
            try:
                await ctx.bot.send_message(user_id, f"🚫 <b>Siz bloklangansiz.</b>\nSabab: {reason}", parse_mode="HTML")
            except: pass
        except ValueError:
            await update.message.reply_text("❌ Format: ID sabab")

    elif state == "broadcast":
        users = await api_get(f"/api/admin/users?admin_id={update.effective_user.id}&page=1") or []
        sent = 0; failed = 0
        await update.message.reply_text(f"📢 Yuborilmoqda...")
        for u in users:
            try:
                await ctx.bot.send_message(u["telegram_id"], f"📢 <b>MIDAS:</b>\n\n{text}", parse_mode="HTML", reply_markup=mini_app_btn())
                sent += 1
                await asyncio.sleep(0.05)
            except:
                failed += 1
        await update.message.reply_text(f"✅ Yuborildi: {sent}\n❌ Xato: {failed}", reply_markup=admin_kb())

# ==================== HEALTH SERVER ====================

async def health_server():
    from aiohttp import web
    async def handle(request):
        return web.Response(text="MIDAS Bot OK")
    webapp = web.Application()
    webapp.router.add_get("/", handle)
    webapp.router.add_get("/health", handle)
    runner = web.AppRunner(webapp)
    await runner.setup()
    port = int(os.getenv("PORT", 8080))
    site = web.TCPSite(runner, "0.0.0.0", port)
    await site.start()
    logger.info(f"✅ Health server {port} portda ishga tushdi")

# ==================== MAIN ====================

async def main():
    application = Application.builder().token(BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", cmd_start))
    application.add_handler(CommandHandler("help", cmd_help))
    application.add_handler(CommandHandler("profile", cmd_profile))
    application.add_handler(CommandHandler("stats", cmd_stats))
    application.add_handler(CommandHandler("admin", cmd_admin))
    application.add_handler(CallbackQueryHandler(callback_handler))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, admin_text_handler))

    await health_server()
    logger.info("🤖 MIDAS Bot ishga tushdi!")
    await application.initialize()
    await application.start()
    await application.updater.start_polling(drop_pending_updates=True)
    await asyncio.Event().wait()

if __name__ == "__main__":
    asyncio.run(main())
