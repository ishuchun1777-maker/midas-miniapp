"""
MIDAS Bot - python-telegram-bot kutubxonasi bilan
"""
import os
import json
import logging
import sqlite3
import asyncio
import shelve

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
DB_PATH = os.getenv("DB_PATH", "/opt/render/project/src/midas.db")
ADMIN_IDS_STR = os.getenv("ADMIN_IDS", "123456789")
ADMIN_IDS = [int(x.strip()) for x in ADMIN_IDS_STR.split(",") if x.strip()]

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

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
        WHERE rp.verified = 0 ORDER BY rp.created_at ASC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def set_premium(tg_id, value):
    conn = get_conn()
    conn.execute("UPDATE users SET is_premium=? WHERE telegram_id=?", (value, tg_id))
    conn.commit(); conn.close()

def set_blocked(tg_id, value, reason=""):
    conn = get_conn()
    conn.execute("UPDATE users SET is_blocked=?, block_reason=? WHERE telegram_id=?", (value, reason, tg_id))
    conn.commit(); conn.close()

def set_verified(tg_id, value):
    conn = get_conn()
    conn.execute("UPDATE reklamachi_profiles SET verified=? WHERE user_id=?", (value, tg_id))
    conn.commit(); conn.close()

def get_all_users():
    conn = get_conn()
    rows = conn.execute("SELECT telegram_id FROM users WHERE is_blocked=0 AND is_active=1").fetchall()
    conn.close()
    return [r[0] for r in rows]

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
        [InlineKeyboardButton(text="🚀 MIDAS Mini App", web_app=WebAppInfo(url=MINI_APP_URL))],
        [InlineKeyboardButton(text="ℹ️ Yordam", callback_data="help")]
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
    user = get_user(update.effective_user.id)
    name = update.effective_user.first_name or "Do'stim"

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
            chat_id=update.effective_user.id,
            menu_button=MenuButtonWebApp(text="🌐 Mini App", web_app=WebAppInfo(url=MINI_APP_URL))
        )
    except Exception as e:
        logger.error(f"Menu button xatolik: {e}")

async def cmd_help(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
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
    await update.message.reply_text(text, parse_mode="HTML", reply_markup=mini_app_btn())

async def cmd_profile(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    user = get_user(update.effective_user.id)
    if not user:
        await update.message.reply_text(
            "❌ Siz hali ro'yxatdan o'tmagansiz.\n\nMini App orqali ro'yxatdan o'ting:",
            reply_markup=mini_app_btn()
        )
        return
    role_icon = "🏢" if user.get("role") == "tadbirkor" else "📢"
    role_name = "Tadbirkor" if user.get("role") == "tadbirkor" else "Reklamachi"
    premium = "⭐ Ha" if user.get("is_premium") else "❌ Yo'q"
    conn = get_conn()
    tg_id = update.effective_user.id
    deals = conn.execute(
        "SELECT COUNT(*) FROM offers WHERE status='accepted' AND (from_id=? OR to_id=?)",
        (tg_id, tg_id)
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
    await update.message.reply_text(text, parse_mode="HTML", reply_markup=mini_app_btn())

async def cmd_stats(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    user = get_user(update.effective_user.id)
    if not user:
        await update.message.reply_text("❌ Avval ro'yxatdan o'ting:", reply_markup=mini_app_btn())
        return
    tg_id = update.effective_user.id
    conn = get_conn()
    sent = conn.execute("SELECT COUNT(*) FROM offers WHERE from_id=?", (tg_id,)).fetchone()[0]
    received = conn.execute("SELECT COUNT(*) FROM offers WHERE to_id=?", (tg_id,)).fetchone()[0]
    accepted = conn.execute("SELECT COUNT(*) FROM offers WHERE status='accepted' AND (from_id=? OR to_id=?)", (tg_id, tg_id)).fetchone()[0]
    chats = conn.execute("SELECT COUNT(*) FROM private_chats WHERE user1_id=? OR user2_id=?", (tg_id, tg_id)).fetchone()[0]
    conn.close()
    text = (
        f"📊 <b>STATISTIKAM</b>\n\n"
        f"📤 Yuborilgan takliflar: <b>{sent}</b>\n"
        f"📥 Kelgan takliflar: <b>{received}</b>\n"
        f"✅ Qabul qilingan: <b>{accepted}</b>\n"
        f"💬 Faol chatlar: <b>{chats}</b>\n"
        f"⭐ Reyting: <b>{user.get('rating', 5.0):.1f}/5.0</b>\n"
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

    if data == "help":
        await cb.message.reply_text(
            "ℹ️ <b>Yordam</b>\n\n/profile — Profilim\n/stats — Statistika\n/help — Yordam",
            parse_mode="HTML"
        )
        return

    if cb.from_user.id not in ADMIN_IDS:
        return

    if data == "back_admin":
        await cb.message.edit_text("🛡 <b>ADMIN PANEL</b>", parse_mode="HTML", reply_markup=admin_kb())

    elif data == "admin_stats":
        s = get_stats()
        text = (
            f"📊 <b>STATISTIKA</b>\n\n"
            f"👥 Jami: <b>{s['total']}</b>\n"
            f"🏢 Tadbirkorlar: <b>{s['tadbirkorlar']}</b>\n"
            f"📢 Reklamachilar: <b>{s['reklamachilar']}</b>\n"
            f"⭐ Premium: <b>{s['premium']}</b>\n\n"
            f"📨 Takliflar: <b>{s['offers']}</b>\n"
            f"✅ Qabul qilingan: <b>{s['accepted']}</b>\n"
            f"💬 Faol chatlar: <b>{s['chats']}</b>\n"
        )
        await cb.message.edit_text(text, parse_mode="HTML", reply_markup=back_admin_kb())

    elif data == "admin_verify":
        queue = get_unverified()
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
        conn = get_conn()
        row = conn.execute("SELECT rp.*,u.full_name FROM reklamachi_profiles rp JOIN users u ON u.telegram_id=rp.user_id WHERE rp.user_id=?", (user_id,)).fetchone()
        conn.close()
        if not row:
            await cb.message.edit_text("❌ Topilmadi", reply_markup=back_admin_kb())
            return
        p = dict(row)
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
        set_verified(user_id, 1)
        try:
            await ctx.bot.send_message(user_id, "✅ <b>PROFILINGIZ TASDIQLANDI!</b>\n\nEndi profilingiz ko'rinadi.", parse_mode="HTML", reply_markup=mini_app_btn())
        except: pass
        await cb.message.edit_text("✅ Profil tasdiqlandi!", reply_markup=back_admin_kb())

    elif data.startswith("vr_"):
        user_id = int(data.replace("vr_", ""))
        try:
            await ctx.bot.send_message(user_id, "❌ <b>Profilingiz tasdiqlanmadi.</b>\n\nMa'lumotlarni to'g'rilang.", parse_mode="HTML", reply_markup=mini_app_btn())
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

# ==================== ADMIN TEXT HANDLER ====================

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
            user = get_user(user_id)
            if not user:
                await update.message.reply_text("❌ Foydalanuvchi topilmadi.")
                return
            current = user.get("is_premium", 0)
            set_premium(user_id, 0 if current else 1)
            action = "olib tashlandi ❌" if current else "berildi ✅"
            await update.message.reply_text(f"⭐ {user['full_name']} ga premium {action}", reply_markup=admin_kb())
            try:
                msg = "⭐ <b>Sizga PREMIUM berildi!</b>" if not current else "Premium statusingiz olib tashlandi."
                await ctx.bot.send_message(user_id, msg, parse_mode="HTML", reply_markup=mini_app_btn())
            except: pass
        except ValueError:
            await update.message.reply_text("❌ Faqat son kiriting. Masalan: 123456789")

    elif state == "block":
        try:
            parts = text.split(None, 1)
            user_id = int(parts[0])
            reason = parts[1] if len(parts) > 1 else "Sabab ko'rsatilmagan"
            user = get_user(user_id)
            if not user:
                await update.message.reply_text("❌ Foydalanuvchi topilmadi.")
                return
            set_blocked(user_id, 1, reason)
            await update.message.reply_text(f"🚫 {user['full_name']} bloklandi.\nSabab: {reason}", reply_markup=admin_kb())
            try:
                await ctx.bot.send_message(user_id, f"🚫 <b>Siz bloklangansiz.</b>\nSabab: {reason}", parse_mode="HTML")
            except: pass
        except ValueError:
            await update.message.reply_text("❌ Format: ID sabab\nMasalan: 123456789 spam")

    elif state == "broadcast":
        users = get_all_users()
        sent = 0; failed = 0
        await update.message.reply_text(f"📢 {len(users)} ta foydalanuvchiga yuborilmoqda...")
        for uid in users:
            try:
                await ctx.bot.send_message(uid, f"📢 <b>MIDAS:</b>\n\n{text}", parse_mode="HTML", reply_markup=mini_app_btn())
                sent += 1
                await asyncio.sleep(0.05)
            except:
                failed += 1
        await update.message.reply_text(f"✅ Yuborildi: {sent}\n❌ Xato: {failed}", reply_markup=admin_kb())

# ==================== MAIN ====================

async def health_server():
    """Render uchun HTTP health check server"""
    from aiohttp import web
    async def handle(request):
        return web.Response(text="MIDAS Bot ishlayapti!")
    app = web.Application()
    app.router.add_get("/", handle)
    app.router.add_get("/health", handle)
    runner = web.AppRunner(app)
    await runner.setup()
    port = int(os.getenv("PORT", 8080))
    site = web.TCPSite(runner, "0.0.0.0", port)
    await site.start()
    logger.info(f"✅ Health server port {port} da ishga tushdi")

async def main():
    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("help", cmd_help))
    app.add_handler(CommandHandler("profile", cmd_profile))
    app.add_handler(CommandHandler("stats", cmd_stats))
    app.add_handler(CommandHandler("admin", cmd_admin))
    app.add_handler(CallbackQueryHandler(callback_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, admin_text_handler))

    logger.info("🤖 MIDAS Bot ishga tushdi!")
    await health_server()
    await app.initialize()
    await app.start()
    await app.updater.start_polling(drop_pending_updates=True)
    await asyncio.Event().wait()

if __name__ == "__main__":
    asyncio.run(main())
