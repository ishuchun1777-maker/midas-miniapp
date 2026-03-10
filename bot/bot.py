"""
MIDAS Bot v7 — Barcha xatolar tuzatildi
- /start har doim ishlaydi (API fail bo'lsa ham)
- Referral kodi qabul qilish
- Media (audio/video/fayl) yo'naltirish
- render.yaml: worker type, health server olib tashlandi
"""
import os
import logging
import asyncio
import aiohttp

from telegram import (
    Update, InlineKeyboardMarkup, InlineKeyboardButton,
    WebAppInfo, MenuButtonWebApp
)
from telegram.ext import (
    Application, CommandHandler, CallbackQueryHandler,
    MessageHandler, filters, ContextTypes
)

BOT_TOKEN    = os.getenv("BOT_TOKEN", "")
MINI_APP_URL = os.getenv("MINI_APP_URL", "https://midas-frontend.onrender.com")
API_URL      = os.getenv("API_URL",      "https://midas-backend.onrender.com")
ADMIN_IDS    = [int(x.strip()) for x in os.getenv("ADMIN_IDS", "").split(",") if x.strip().isdigit()]

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# ── API ────────────────────────────────────────────────
async def api_get(path):
    try:
        async with aiohttp.ClientSession() as s:
            async with s.get(f"{API_URL}{path}", timeout=aiohttp.ClientTimeout(total=15)) as r:
                if r.status == 200:
                    return await r.json()
                logger.warning(f"API GET {path} → {r.status}")
    except Exception as e:
        logger.error(f"API GET {path}: {e}")
    return None

async def api_post(path, data=None):
    try:
        async with aiohttp.ClientSession() as s:
            async with s.post(f"{API_URL}{path}", json=data or {}, timeout=aiohttp.ClientTimeout(total=15)) as r:
                if r.status in (200, 201):
                    return await r.json()
    except Exception as e:
        logger.error(f"API POST {path}: {e}")
    return None

async def api_put(path, params=None):
    try:
        async with aiohttp.ClientSession() as s:
            async with s.put(f"{API_URL}{path}", params=params or {}, timeout=aiohttp.ClientTimeout(total=15)) as r:
                return r.status in (200, 201)
    except Exception as e:
        logger.error(f"API PUT {path}: {e}")
    return False

# ── STATE ──────────────────────────────────────────────
_state = {}
def get_state(uid):    return _state.get(str(uid))
def set_state(uid, s): _state[str(uid)] = s
def clear_state(uid):  _state.pop(str(uid), None)

# ── KEYBOARDS ──────────────────────────────────────────
def main_kb():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🚀 MIDAS Mini App ni ochish", web_app=WebAppInfo(url=MINI_APP_URL))],
        [InlineKeyboardButton("👤 Profilim",  callback_data="profile"),
         InlineKeyboardButton("📊 Statistika", callback_data="stats")],
        [InlineKeyboardButton("🎁 Referral",  callback_data="referral"),
         InlineKeyboardButton("ℹ️ Yordam",    callback_data="help")],
    ])

def admin_kb():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("📊 Statistika",           callback_data="admin_stats")],
        [InlineKeyboardButton("✅ Profil tasdiqlash",    callback_data="admin_verify")],
        [InlineKeyboardButton("⭐ Premium berish/olish", callback_data="admin_premium")],
        [InlineKeyboardButton("🚫 Bloklash",             callback_data="admin_block")],
        [InlineKeyboardButton("📢 Xabar yuborish",       callback_data="admin_broadcast")],
        [InlineKeyboardButton("🌐 Mini App", web_app=WebAppInfo(url=MINI_APP_URL))],
    ])

def back_kb(): return InlineKeyboardMarkup([[InlineKeyboardButton("◀️ Orqaga", callback_data="back_admin")]])

# ── HANDLERS ───────────────────────────────────────────
async def cmd_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tg_id = update.effective_user.id
    name  = update.effective_user.first_name or "Do'stim"
    args  = ctx.args or []

    # /start chat_12345 — chat yo'naltirish
    if args and args[0].startswith("chat_"):
        partner_id = args[0].replace("chat_", "")
        await update.message.reply_text(
            "💬 <b>Chat</b>\n\nMini App da hamkoringiz bilan muloqot qiling:",
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup([[
                InlineKeyboardButton("💬 Chatni ochish", web_app=WebAppInfo(url=f"{MINI_APP_URL}?chat={partner_id}"))
            ]])
        )
        return

    # /start MIDAS-XXXXXX — referral
    ref_code = args[0] if args and args[0].startswith("MIDAS-") else None

    if tg_id in ADMIN_IDS:
        await update.message.reply_text(
            f"👑 <b>Admin panel</b>, {name}!\nPlatformani boshqarish:",
            parse_mode="HTML", reply_markup=admin_kb()
        )
        return

    # API dan foydalanuvchi ma'lumoti (xato bo'lsa ham davom et)
    user = None
    try:
        user = await api_get(f"/api/users/{tg_id}")
    except Exception:
        pass

    if user and user.get("is_blocked"):
        await update.message.reply_text("🚫 Siz bloklangansiz. @midas_support")
        return

    # Referral kodni ulash
    if ref_code and not user:
        try:
            await api_post("/api/referral/use", {"code": ref_code, "telegram_id": tg_id})
        except Exception:
            pass

    if user:
        role      = user.get("role", "")
        icon      = "🏢" if role == "tadbirkor" else "📢"
        role_name = "Tadbirkor" if role == "tadbirkor" else "Reklamachi"
        trust     = int(user.get("trust_score") or 50)
        try:
            rating = f"{float(user.get('rating', 5.0)):.1f}"
        except Exception:
            rating = "5.0"
        trust_bar = "█" * (trust // 10) + "░" * (10 - trust // 10)
        text = (
            f"👋 Xush kelibsiz, <b>{name}</b>!\n\n"
            f"{icon} <b>{role_name}</b>\n"
            f"⭐ Reyting: <b>{rating}</b>  🛡 Ishonch: <b>{trust}/100</b>\n"
            f"<code>{trust_bar}</code>\n\n"
            f"🌐 Mini App orqali ishlang:"
        )
    else:
        text = (
            f"👋 Assalomu alaykum, <b>{name}</b>!\n\n"
            f"🌟 <b>MIDAS</b> — O'zbekistonning #1 reklama platformasi\n\n"
            f"✅ Tadbirkorlar va reklamachilarni AI orqali birlashtiradi\n"
            f"🎯 100 ballik aqlli matching tizimi\n"
            f"💬 Xavfsiz muloqot va hamkorlik\n\n"
            f"👇 Ro'yxatdan o'tish uchun Mini App ni oching:"
        )

    await update.message.reply_text(text, parse_mode="HTML", reply_markup=main_kb())

    try:
        await ctx.bot.set_chat_menu_button(
            chat_id=tg_id,
            menu_button=MenuButtonWebApp(text="🌐 MIDAS", web_app=WebAppInfo(url=MINI_APP_URL))
        )
    except Exception as e:
        logger.warning(f"Menu button: {e}")

async def cmd_help(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "ℹ️ <b>MIDAS — Yordam</b>\n\n"
        "🌐 <b>Mini App:</b> Matching, taklif, chat, tender\n"
        "🤖 <b>Bot:</b> Audio, video, katta fayllar almashish\n\n"
        "/start — Bosh menyu\n"
        "/profile — Profilim\n"
        "/help — Yordam\n\n"
        "📞 Muammo: @midas_support",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton("🚀 Mini App", web_app=WebAppInfo(url=MINI_APP_URL))
        ]])
    )

async def cmd_profile(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tg_id = update.effective_user.id
    user  = await api_get(f"/api/users/{tg_id}")
    if not user:
        await update.message.reply_text(
            "❌ Profil topilmadi. Ro'yxatdan o'ting:",
            reply_markup=InlineKeyboardMarkup([[
                InlineKeyboardButton("📝 Ro'yxatdan o'tish", web_app=WebAppInfo(url=MINI_APP_URL))
            ]])
        )
        return
    stats = await api_get(f"/api/users/{tg_id}/stats") or {}
    role  = user.get("role", "")
    icon  = "🏢" if role == "tadbirkor" else "📢"
    trust = int(user.get("trust_score") or 50)
    try:
        rating = f"{float(user.get('rating', 5.0)):.1f}"
    except Exception:
        rating = "5.0"
    trust_bar = "█" * (trust // 10) + "░" * (10 - trust // 10)
    text = (
        f"👤 <b>{user.get('full_name', '')}</b>\n"
        f"{icon} {'Tadbirkor' if role == 'tadbirkor' else 'Reklamachi'}"
        f" | {'⭐ Premium' if user.get('is_premium') else '🔓 Oddiy'}"
        f" | {'✅ Tasdiqlangan' if user.get('is_verified') else '⏳ Tasdiqlanmoqda'}\n\n"
        f"⭐ Reyting: <b>{rating}/5.0</b>\n"
        f"🛡 Ishonch: <b>{trust}/100</b>\n"
        f"<code>{trust_bar}</code>\n\n"
        f"🤝 Bitimlar: <b>{stats.get('deals',0)}</b>  "
        f"🚀 Kampaniyalar: <b>{stats.get('campaigns',0)}</b>  "
        f"💼 Portfolio: <b>{stats.get('portfolio',0)}</b>"
    )
    await update.message.reply_text(
        text, parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton("👤 To'liq profil", web_app=WebAppInfo(url=MINI_APP_URL))
        ]])
    )

async def cmd_admin(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id not in ADMIN_IDS:
        await update.message.reply_text("❌ Ruxsat yo'q.")
        return
    await update.message.reply_text("👑 Admin panel:", reply_markup=admin_kb())

# ── CALLBACK ───────────────────────────────────────────
async def callback_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    cb    = update.callback_query
    tg_id = cb.from_user.id
    data  = cb.data
    await cb.answer()

    if data == "help":
        await cmd_help(update, ctx); return
    if data in ("profile", "stats"):
        await cmd_profile(update, ctx); return
    if data == "referral":
        ref = await api_get(f"/api/referral/{tg_id}")
        code = (ref or {}).get("referral_code") or f"MIDAS-{tg_id}"
        count = (ref or {}).get("referral_count", 0)
        bonus = (ref or {}).get("bonus_days", 0)
        await cb.message.reply_text(
            f"🎁 <b>Referral dasturi</b>\n\n"
            f"Kodingiz: <code>{code}</code>\n\n"
            f"<b>Bonus jadval:</b>\n"
            f"1 kishi → 10 kun · 3 → 50 kun\n"
            f"5 → 90 kun · 7 → 120 kun\n"
            f"15 kishi → 1 yillik Premium 🏆\n\n"
            f"Taklif qilganlar: <b>{count}</b>\n"
            f"Yig'ilgan bonus: <b>{bonus} kun</b>\n\n"
            f"Havola: <code>https://t.me/midas_bot?start={code}</code>",
            parse_mode="HTML"
        )
        return
    if data == "back_admin":
        await cb.message.edit_reply_markup(reply_markup=admin_kb()); return

    if tg_id not in ADMIN_IDS: return

    if data == "admin_stats":
        s = await api_get(f"/api/admin/stats?admin_id={tg_id}") or {}
        await cb.message.reply_text(
            f"📊 <b>Statistika</b>\n\n"
            f"👥 Jami: <b>{s.get('total_users',0)}</b>\n"
            f"🏢 Tadbirkorlar: <b>{s.get('tadbirkorlar',0)}</b>\n"
            f"📢 Reklamachilar: <b>{s.get('reklamachilar',0)}</b>\n"
            f"⭐ Premium: <b>{s.get('premium_users',0)}</b>\n"
            f"📩 Takliflar: <b>{s.get('total_offers',0)}</b>\n"
            f"📋 Tenderlar: <b>{s.get('total_tenders',0)}</b>",
            parse_mode="HTML", reply_markup=back_kb()
        )
    elif data == "admin_verify":
        queue = await api_get(f"/api/admin/verify-queue?admin_id={tg_id}") or []
        if not queue:
            await cb.message.reply_text("✅ Navbat bo'sh.", reply_markup=back_kb()); return
        for u in queue[:5]:
            icon = "🏢" if u.get("role") == "tadbirkor" else "📢"
            await cb.message.reply_text(
                f"{icon} <b>{u.get('full_name','?')}</b>\nID: <code>{u.get('telegram_id')}</code>\nTel: {u.get('phone','—')}",
                parse_mode="HTML",
                reply_markup=InlineKeyboardMarkup([[
                    InlineKeyboardButton("✅ Tasdiqlash", callback_data=f"verify_{u['telegram_id']}"),
                    InlineKeyboardButton("❌ Rad", callback_data=f"reject_{u['telegram_id']}")
                ]])
            )
    elif data == "admin_broadcast":
        set_state(tg_id, {"action": "broadcast"})
        await cb.message.reply_text("📢 Xabarni yozing (barcha foydalanuvchilarga yuboriladi):", reply_markup=back_kb())
    elif data == "admin_premium":
        set_state(tg_id, {"action": "premium_input"})
        await cb.message.reply_text("⭐ Foydalanuvchi ID sini yozing:", reply_markup=back_kb())
    elif data == "admin_block":
        set_state(tg_id, {"action": "block_input"})
        await cb.message.reply_text("🚫 Bloklash uchun ID kiriting:", reply_markup=back_kb())
    elif data.startswith("verify_"):
        uid = int(data.split("_")[1])
        ok  = await api_put(f"/api/admin/verify/{uid}?admin_id={tg_id}&action=verify")
        await cb.message.reply_text("✅ Tasdiqlandi!" if ok else "❌ Xato.")
    elif data.startswith("reject_"):
        uid = int(data.split("_")[1])
        ok  = await api_put(f"/api/admin/verify/{uid}?admin_id={tg_id}&action=reject")
        await cb.message.reply_text("❌ Rad etildi." if ok else "❌ Xato.")

# ── MATN HANDLER ───────────────────────────────────────
async def text_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tg_id = update.effective_user.id
    state = get_state(tg_id)
    if not state or tg_id not in ADMIN_IDS:
        if tg_id not in ADMIN_IDS:
            await update.message.reply_text(
                "Mini App ni ochish uchun 👇",
                reply_markup=InlineKeyboardMarkup([[
                    InlineKeyboardButton("🚀 Mini App", web_app=WebAppInfo(url=MINI_APP_URL))
                ]])
            )
        return

    action = state.get("action")
    if action == "broadcast":
        msg   = update.message.text
        users = await api_get(f"/api/admin/all-users?admin_id={tg_id}") or []
        sent  = 0
        for u in users:
            try:
                await ctx.bot.send_message(
                    chat_id=u["telegram_id"],
                    text=f"📢 <b>MIDAS xabari:</b>\n\n{msg}",
                    parse_mode="HTML"
                )
                sent += 1
                await asyncio.sleep(0.05)
            except Exception:
                pass
        clear_state(tg_id)
        await update.message.reply_text(f"✅ {sent} ta foydalanuvchiga yuborildi.", reply_markup=admin_kb())

    elif action == "premium_input":
        try:
            uid = int(update.message.text.strip())
            ok  = await api_put(f"/api/admin/premium/{uid}?admin_id={tg_id}&days=30")
            clear_state(tg_id)
            await update.message.reply_text(f"⭐ {uid}: {'berildi' if ok else 'xato'}", reply_markup=admin_kb())
        except ValueError:
            await update.message.reply_text("❌ Raqam kiriting:")

    elif action == "block_input":
        try:
            uid = int(update.message.text.strip())
            ok  = await api_put(f"/api/admin/block/{uid}?admin_id={tg_id}")
            clear_state(tg_id)
            await update.message.reply_text(f"🚫 {uid}: {'bloklandi' if ok else 'xato'}", reply_markup=admin_kb())
        except ValueError:
            await update.message.reply_text("❌ Raqam kiriting:")
    else:
        clear_state(tg_id)

# ── MEDIA HANDLER ──────────────────────────────────────
async def media_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """Bot orqali kelgan media → chat partneriga forward"""
    tg_id = update.effective_user.id
    user  = await api_get(f"/api/users/{tg_id}")
    if not user:
        return

    chats = await api_get(f"/api/chats/{tg_id}") or []
    if not chats:
        await update.message.reply_text(
            "💬 Ochiq chatlaringiz yo'q. Mini App da taklif qabul qiling.",
            reply_markup=InlineKeyboardMarkup([[
                InlineKeyboardButton("🚀 Mini App", web_app=WebAppInfo(url=MINI_APP_URL))
            ]])
        )
        return

    last_chat  = chats[0]
    partner_id = last_chat.get("partner_id")
    if not partner_id:
        return

    # Fayl turini aniqlash
    if update.message.photo:       ftype = "📷 Rasm"
    elif update.message.video:     ftype = "🎬 Video"
    elif update.message.voice:     ftype = "🎤 Ovozli xabar"
    elif update.message.audio:     ftype = "🎵 Audio"
    elif update.message.document:  ftype = f"📎 {update.message.document.file_name or 'Fayl'}"
    else:                          ftype = "📁 Fayl"

    # DB ga yozish
    await api_post("/api/messages", {
        "chat_id":     last_chat["id"],
        "sender_id":   tg_id,
        "receiver_id": partner_id,
        "message_text": f"[Bot: {ftype}]",
    })

    # Telegram orqali forward
    try:
        await update.message.copy_to(chat_id=partner_id)
        await update.message.reply_text(f"✅ {ftype} hamkoringizga yuborildi!")
    except Exception as e:
        logger.warning(f"Copy to {partner_id}: {e}")
        await update.message.reply_text(
            f"⚠️ Avtomatik yuborib bo'lmadi.\n"
            f"Hamkoringiz bilan to'g'ridan muloqot qiling.",
            reply_markup=InlineKeyboardMarkup([[
                InlineKeyboardButton("💬 Chat", web_app=WebAppInfo(url=MINI_APP_URL))
            ]])
        )

# ── MAIN ───────────────────────────────────────────────
async def main():
    if not BOT_TOKEN:
        logger.error("❌ BOT_TOKEN topilmadi! Environment variable o'rnating.")
        return

    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start",   cmd_start))
    app.add_handler(CommandHandler("help",    cmd_help))
    app.add_handler(CommandHandler("profile", cmd_profile))
    app.add_handler(CommandHandler("stats",   cmd_profile))
    app.add_handler(CommandHandler("admin",   cmd_admin))
    app.add_handler(CallbackQueryHandler(callback_handler))
    app.add_handler(MessageHandler(
        filters.PHOTO | filters.VIDEO | filters.VOICE |
        filters.AUDIO | filters.Document.ALL,
        media_handler
    ))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_handler))

    logger.info("🤖 MIDAS Bot v7 ishga tushdi!")
    await app.initialize()
    await app.start()
    await app.updater.start_polling(
        drop_pending_updates=True,
        allowed_updates=["message", "callback_query"]
    )
    await asyncio.Event().wait()

if __name__ == "__main__":
    asyncio.run(main())
