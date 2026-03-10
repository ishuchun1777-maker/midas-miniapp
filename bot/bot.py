"""
MIDAS Bot v8
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ /start har doim ishlaydi
✅ Inline tugmalar — miniapp, chatlar, offers
✅ Chatlar inline tugma — qabul qilingan takliflar
✅ Media forward — rasm, video, audio, file, voice
✅ Har bir chat uchun stop/start (tugma + buyruq)
✅ Referral /start MIDAS-XXXXX
✅ Deep link /start chat_12345
✅ 5 rol qo'llab-quvvatlash
✅ Render worker (PORT yo'q)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
import os, logging
import aiohttp
from telegram import (
    Update, InlineKeyboardMarkup, InlineKeyboardButton,
    WebAppInfo, MenuButtonWebApp
)
from telegram.ext import (
    Application, CommandHandler, CallbackQueryHandler,
    MessageHandler, filters, ContextTypes
)
from telegram.constants import ParseMode

BOT_TOKEN    = os.getenv("BOT_TOKEN", "")
MINI_APP_URL = os.getenv("MINI_APP_URL", "https://midas-frontend.onrender.com")
API_URL      = os.getenv("API_URL",      "https://midas-backend.onrender.com")
ADMIN_IDS    = [int(x.strip()) for x in os.getenv("ADMIN_IDS","").split(",") if x.strip().isdigit()]

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# ── In-memory state ───────────────────────────────────
# {user_id: {"active": bool, "partner_id": int, "chat_id": int|None}}
chat_state = {}

ROLE_ICONS = {
    "tadbirkor": "🏢", "reklamachi": "📢",
    "agentlik": "🏆", "dizayner": "🎨", "media_buyer": "📊",
}

def role_icon(r): return ROLE_ICONS.get(r, "👤")
def fmt(n):
    try: return f"{int(n):,}".replace(",", " ")
    except: return str(n)
def trust_bar(s):
    b = "█"*int(s/10) + "░"*(10-int(s/10))
    e = "🟢" if s>=80 else "🟡" if s>=60 else "🟠" if s>=40 else "🔴"
    return f"{e} [{b}] {s}/100"
def mini_btn(text="🌟 MIDAS ni Ochish"):
    return InlineKeyboardMarkup([[InlineKeyboardButton(text, web_app=WebAppInfo(url=MINI_APP_URL))]])

# ── API ───────────────────────────────────────────────
async def api_get(path):
    try:
        async with aiohttp.ClientSession() as s:
            async with s.get(f"{API_URL}{path}", timeout=aiohttp.ClientTimeout(total=15)) as r:
                if r.status == 200: return await r.json()
    except Exception as e:
        logger.error(f"GET {path}: {e}")
    return None

async def api_post(path, data=None):
    try:
        async with aiohttp.ClientSession() as s:
            async with s.post(f"{API_URL}{path}", json=data or {}, timeout=aiohttp.ClientTimeout(total=15)) as r:
                if r.status in (200,201): return await r.json()
    except Exception as e:
        logger.error(f"POST {path}: {e}")
    return None

# ── /START ────────────────────────────────────────────
async def cmd_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    args = ctx.args or []
    arg  = args[0] if args else ""

    # Chat deep link
    if arg.startswith("chat_"):
        pid_str = arg.replace("chat_","")
        if pid_str.isdigit():
            partner_id = int(pid_str)
            chats = await api_get(f"/api/chats/{user.id}") or []
            chat_id = next((c["id"] for c in chats if c.get("partner_id")==partner_id), None)
            chat_state[user.id] = {"active": True, "partner_id": partner_id, "chat_id": chat_id}
            partner = await api_get(f"/api/users/{partner_id}") or {}
            pname = partner.get("full_name", f"ID {partner_id}")
            await update.message.reply_text(
                f"💬 *{pname}* bilan chat ochildi!\n\n"
                "Matn, rasm, video, audio, fayl yuboring.\n❌ To'xtatish: /stopchat",
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=InlineKeyboardMarkup([[
                    InlineKeyboardButton("⏹ To'xtatish", callback_data=f"stopchat_{partner_id}"),
                    InlineKeyboardButton("🌟 MiniApp", web_app=WebAppInfo(url=MINI_APP_URL)),
                ]])
            )
            return

    # Referral
    if arg.startswith("MIDAS-"):
        await api_post("/api/referral/use", {"code": arg, "telegram_id": user.id})

    # Menu button
    try:
        await ctx.bot.set_chat_menu_button(
            chat_id=update.effective_chat.id,
            menu_button=MenuButtonWebApp(text="🌟 MIDAS", web_app=WebAppInfo(url=MINI_APP_URL))
        )
    except Exception: pass

    # User info
    u = await api_get(f"/api/users/{user.id}")
    if not u or not u.get("telegram_id"):
        await update.message.reply_text(
            "👑 *MIDAS* — O'zbekistonning #1 reklama platformasi\n\n"
            "🏢 Tadbirkorlar · 📢 Reklamachilar · 🏆 Agentliklar\n\n"
            "Ro'yxatdan o'tish uchun quyidagi tugmani bosing 👇",
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=InlineKeyboardMarkup([[
                InlineKeyboardButton("🚀 Boshlash", web_app=WebAppInfo(url=MINI_APP_URL))
            ]])
        )
        return

    name  = u.get("full_name", user.first_name or "Siz")
    role  = u.get("role", "")
    trust = u.get("trust_score", 50)
    prem  = u.get("is_premium", 0)
    code  = u.get("referral_code") or f"MIDAS-{user.id}"

    offers = await api_get(f"/api/offers/{user.id}") or []
    pending = [o for o in offers if o.get("status")=="pending"]

    txt = (
        f"👑 *MIDAS* — Salom, *{name}*!\n"
        f"━━━━━━━━━━━━━━━━\n"
        f"{role_icon(role)} Rol: *{role}*\n"
        f"⭐ Reyting: *{float(u.get('rating') or 5):.1f}/5.0*\n"
        f"🛡 Ishonch: {trust_bar(trust)}\n"
    )
    if prem: txt += "✨ *Premium* aktiv\n"
    txt += f"🎁 Referral: `{code}`\n"
    if pending: txt += f"\n📩 *{len(pending)} ta yangi taklif!*\n"
    txt += "\n⬇️ Platformani ochish uchun 👇"

    kb = [
        [InlineKeyboardButton("🌟 MIDAS ni Ochish", web_app=WebAppInfo(url=MINI_APP_URL))],
        [InlineKeyboardButton("📩 Takliflar", callback_data="offers"),
         InlineKeyboardButton("💬 Chatlar",   callback_data="chats")],
        [InlineKeyboardButton("👤 Profil",    callback_data="profile"),
         InlineKeyboardButton("🎁 Referral",  callback_data="referral")],
    ]
    await update.message.reply_text(txt, parse_mode=ParseMode.MARKDOWN, reply_markup=InlineKeyboardMarkup(kb))

# ── /PROFILE ──────────────────────────────────────────
async def cmd_profile(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    u = await api_get(f"/api/users/{user.id}")
    msg = update.message or update.callback_query.message
    if not u:
        await msg.reply_text("❌ Profil topilmadi. /start", reply_markup=mini_btn())
        return
    role  = u.get("role","")
    trust = u.get("trust_score",50)
    txt = (
        f"{role_icon(role)} *{u.get('full_name','—')}*\n"
        f"━━━━━━━━━━━━━━━━\n"
        f"📋 Rol: {role}\n"
        f"⭐ Reyting: {float(u.get('rating') or 5):.1f} / 5.0\n"
        f"🛡 Ishonch: {trust_bar(trust)}\n"
    )
    for label, key, fmt_fn in [
        ("🏭 Soha",     "sector",     str),
        ("👥 Obunachilar", "followers", fmt),
        ("💰 Post narxi",  "price_post", lambda v: f"{fmt(v)} so'm"),
        ("🏢 Kompaniya",   "company_name", str),
        ("📞 Tel",         "phone",     str),
    ]:
        val = u.get(key)
        if val: txt += f"{label}: {fmt_fn(val)}\n"
    await msg.reply_text(txt, parse_mode=ParseMode.MARKDOWN,
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton("✏️ Tahrirlash", web_app=WebAppInfo(url=f"{MINI_APP_URL}?tab=profile"))
        ]]))

# ── /CHATS ────────────────────────────────────────────
async def cmd_chats(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    msg  = update.message or (update.callback_query.message if update.callback_query else None)
    if not msg: return

    chats = await api_get(f"/api/chats/{user.id}") or []
    if not chats:
        await msg.reply_text(
            "💬 Hozircha chat yo'q.\nTaklif qabul qilinganidan so'ng chat ochiladi.",
            reply_markup=mini_btn("📩 Takliflarga o'tish")
        )
        return

    txt = "💬 *Faol chatlaringiz:*\n\n"
    kb  = []
    state = chat_state.get(user.id, {})

    for c in chats[:10]:
        pid    = c.get("partner_id",0)
        pname  = c.get("partner_name", f"ID {pid}")
        unread = c.get("unread", 0)
        last   = c.get("last_message","")
        active = state.get("active") and state.get("partner_id")==pid

        st = "🟢" if active else "⚪"
        txt += f"{st} *{pname}*"
        if unread > 0: txt += f" [{unread}🔴]"
        if last: txt += f"\n  └ _{last[:40]}_"
        txt += "\n\n"

        if active:
            kb.append([
                InlineKeyboardButton(f"🟢 {pname[:12]}", callback_data=f"openchat_{pid}_{c.get('id','')}"),
                InlineKeyboardButton("⏹ To'xtatish", callback_data=f"stopchat_{pid}"),
            ])
        else:
            kb.append([
                InlineKeyboardButton(f"💬 {pname[:12]}", callback_data=f"openchat_{pid}_{c.get('id','')}"),
                InlineKeyboardButton("▶️ Boshlash", callback_data=f"startchat_{pid}_{c.get('id','')}"),
            ])

    kb.append([InlineKeyboardButton("🌟 MiniApp", web_app=WebAppInfo(url=MINI_APP_URL))])
    await msg.reply_text(txt, parse_mode=ParseMode.MARKDOWN, reply_markup=InlineKeyboardMarkup(kb))

# ── /OFFERS ───────────────────────────────────────────
async def cmd_offers(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    msg  = update.message or (update.callback_query.message if update.callback_query else None)
    if not msg: return

    offers  = await api_get(f"/api/offers/{user.id}") or []
    pending = [o for o in offers if o.get("status")=="pending"]

    if not pending:
        await msg.reply_text("📭 Hozircha yangi taklif yo'q.", reply_markup=mini_btn("🎯 Match ga o'tish"))
        return

    txt = f"📩 *{len(pending)} ta yangi taklif:*\n\n"
    kb  = []
    for o in pending[:8]:
        fname = o.get("from_name","Kimdir")
        omsg  = o.get("message","")
        txt  += f"👤 *{fname}*\n_{omsg[:80]}_\n\n"
        kb.append([
            InlineKeyboardButton(f"✅ {fname[:10]}", callback_data=f"accept_{o['id']}"),
            InlineKeyboardButton("❌ Rad",           callback_data=f"reject_{o['id']}"),
        ])
    kb.append([InlineKeyboardButton("🌟 MiniApp", web_app=WebAppInfo(url=MINI_APP_URL))])
    await msg.reply_text(txt, parse_mode=ParseMode.MARKDOWN, reply_markup=InlineKeyboardMarkup(kb))

# ── /STOPCHAT ─────────────────────────────────────────
async def cmd_stopchat(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    if chat_state.get(user.id,{}).get("active"):
        chat_state[user.id]["active"] = False
        await update.message.reply_text("⏹ Chat to'xtatildi.\n/chats — ro'yxat", reply_markup=mini_btn())
    else:
        await update.message.reply_text("ℹ️ Faol chat yo'q.", reply_markup=mini_btn())

# ── /REFERRAL ─────────────────────────────────────────
async def cmd_referral(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    msg  = update.message or (update.callback_query.message if update.callback_query else None)
    if not msg: return

    data = await api_get(f"/api/referral/{user.id}") or {}
    code  = data.get("referral_code") or f"MIDAS-{user.id}"
    count = data.get("referral_count", 0)
    bonus = data.get("bonus_days", 0)
    link  = f"https://t.me/midas_bot?start={code}"

    TIERS = [(1,10),(3,50),(5,90),(7,120),(15,365)]
    nxt = next((t for t in TIERS if t[0]>count), None)
    prv = next((t for t in reversed(TIERS) if t[0]<=count), None)

    txt = (
        f"🎁 *Referral dasturi*\n━━━━━━━━━━━━━━━━\n"
        f"🔑 Kod: `{code}`\n"
        f"👥 Taklif qilinganlar: *{count}*\n"
        f"🎉 Bonus kunlar: *{bonus}*\n\n"
        f"📤 Havola:\n`{link}`\n\n"
    )
    if prv: txt += f"✅ Joriy daraja: *{prv[1]} kun Premium*\n"
    if nxt: txt += f"🎯 Keyingi: {nxt[0]-count} kishi → *{nxt[1]} kun*\n\n"
    txt += "📊 *Jadval:* 1→10k · 3→50k · 5→90k · 7→120k · 15→1yil 👑"

    await msg.reply_text(txt, parse_mode=ParseMode.MARKDOWN,
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton("🌟 MiniApp", web_app=WebAppInfo(url=MINI_APP_URL))
        ]]))

# ── /HELP ─────────────────────────────────────────────
async def cmd_help(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🤖 *MIDAS Bot v8 — Buyruqlar*\n\n"
        "/start — Asosiy menyu\n"
        "/profile — Profilim\n"
        "/chats — Chatlar ro'yxati\n"
        "/offers — Takliflar\n"
        "/stopchat — Chatni to'xtatish\n"
        "/referral — Referral dasturi\n"
        "/help — Yordam\n\n"
        "💡 *Media yuborish:*\n"
        "/chats → ▶️ Boshlash → media yuboring\n"
        "📸 Rasm · 🎬 Video · 🎵 Audio · 📎 Fayl · 🎙 Ovoz",
        parse_mode=ParseMode.MARKDOWN, reply_markup=mini_btn()
    )

# ── CALLBACK ──────────────────────────────────────────
async def callback_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    user = q.from_user
    data = q.data
    await q.answer()

    if   data == "profile":   await cmd_profile(update, ctx)
    elif data == "offers":    await cmd_offers(update, ctx)
    elif data == "chats":     await cmd_chats(update, ctx)
    elif data == "referral":  await cmd_referral(update, ctx)

    elif data.startswith("accept_"):
        oid = int(data.split("_")[1])
        r = await api_post(f"/api/offers/{oid}/accept", {"user_id": user.id})
        if r:
            await q.edit_message_text(
                "✅ *Taklif qabul qilindi!*\nChat ochildi — /chats",
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=InlineKeyboardMarkup([[
                    InlineKeyboardButton("💬 Chatga o'tish", callback_data="chats"),
                    InlineKeyboardButton("🌟 MiniApp", web_app=WebAppInfo(url=MINI_APP_URL)),
                ]])
            )
        else:
            await q.answer("❌ Xato. Qaytadan urinib ko'ring.", show_alert=True)

    elif data.startswith("reject_"):
        oid = int(data.split("_")[1])
        await api_post(f"/api/offers/{oid}/reject", {"user_id": user.id})
        await q.answer("❌ Taklif rad etildi.", show_alert=True)
        try: await q.edit_message_reply_markup(reply_markup=None)
        except Exception: pass

    elif data.startswith("startchat_"):
        parts = data.split("_")
        pid = int(parts[1]) if len(parts)>1 and parts[1].isdigit() else 0
        cid = int(parts[2]) if len(parts)>2 and parts[2].isdigit() else None
        chat_state[user.id] = {"active": True, "partner_id": pid, "chat_id": cid}
        partner = await api_get(f"/api/users/{pid}") or {}
        pname = partner.get("full_name", f"ID {pid}")
        await q.edit_message_text(
            f"💬 *{pname}* bilan chat faollashtirildi!\n\n"
            "✉️ Matn · 📸 Rasm · 🎬 Video · 🎵 Audio · 📎 Fayl\n"
            "❌ To'xtatish: /stopchat",
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=InlineKeyboardMarkup([[
                InlineKeyboardButton("⏹ To'xtatish", callback_data=f"stopchat_{pid}"),
                InlineKeyboardButton("💬 Chatlar",   callback_data="chats"),
            ]])
        )

    elif data.startswith("stopchat_"):
        parts = data.split("_")
        pid = int(parts[1]) if len(parts)>1 and parts[1].isdigit() else 0
        if chat_state.get(user.id,{}).get("active") and chat_state[user.id].get("partner_id")==pid:
            chat_state[user.id]["active"] = False
        await q.edit_message_text(
            "⏹ Chat to'xtatildi.\nXabarlar endi yo'naltirilmaydi.",
            reply_markup=InlineKeyboardMarkup([[
                InlineKeyboardButton("💬 Chatlar ro'yxati", callback_data="chats"),
                InlineKeyboardButton("🌟 MiniApp", web_app=WebAppInfo(url=MINI_APP_URL)),
            ]])
        )

    elif data.startswith("openchat_"):
        parts = data.split("_")
        pid = int(parts[1]) if len(parts)>1 and parts[1].isdigit() else 0
        cid = int(parts[2]) if len(parts)>2 and parts[2].isdigit() else None
        chat_state[user.id] = {"active": True, "partner_id": pid, "chat_id": cid}
        partner = await api_get(f"/api/users/{pid}") or {}
        pname = partner.get("full_name", f"ID {pid}")
        await q.answer(f"✅ {pname} bilan chat faollashtirildi!")
        await cmd_chats(update, ctx)

# ── XABAR HANDLER ─────────────────────────────────────
async def message_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    user  = update.effective_user
    msg   = update.message
    state = chat_state.get(user.id, {})

    if not state.get("active"):
        if msg.text:
            await msg.reply_text(
                "ℹ️ Faol chat yo'q.\n\n/chats — chatlar ro'yxati\n/start — asosiy menyu",
                reply_markup=mini_btn()
            )
        else:
            await msg.reply_text(
                "📎 Media yuborish uchun avval chatni faollashtiring.\n/chats",
                reply_markup=mini_btn()
            )
        return

    pid    = state.get("partner_id")
    cid    = state.get("chat_id")
    me     = await api_get(f"/api/users/{user.id}") or {}
    sname  = me.get("full_name", user.first_name or "Kimdir")

    # Matn
    if msg.text:
        text = msg.text.strip()
        if cid:
            await api_post("/api/messages", {
                "chat_id": cid, "sender_id": user.id,
                "receiver_id": pid, "message_text": text[:2000],
            })
        try:
            await ctx.bot.send_message(
                chat_id=pid,
                text=f"💬 *{sname}*:\n{text}",
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=InlineKeyboardMarkup([[
                    InlineKeyboardButton("↩️ Javob berish", callback_data=f"openchat_{user.id}_{cid or ''}"),
                ]])
            )
            await msg.reply_text("✅ Yuborildi",
                reply_markup=InlineKeyboardMarkup([[
                    InlineKeyboardButton("⏹ To'xtatish", callback_data=f"stopchat_{pid}")
                ]]))
        except Exception as e:
            err = str(e).lower()
            if "forbidden" in err or "blocked" in err:
                await msg.reply_text("⚠️ Hamkoringiz botni bloklagan.\nUlarga /start bosishini so'rang.")
            else:
                logger.error(f"Forward text: {e}")
                await msg.reply_text("⚠️ Yuborib bo'lmadi. Qaytadan urinib ko'ring.")
        return

    # Media
    try:
        stop_kb = InlineKeyboardMarkup([[InlineKeyboardButton("⏹ To'xtatish", callback_data=f"stopchat_{pid}")]])
        cap_prefix = f"📨 *{sname}*"

        if msg.photo:
            cap = cap_prefix + (f":\n{msg.caption}" if msg.caption else " rasm yubordi")
            await ctx.bot.send_photo(chat_id=pid, photo=msg.photo[-1].file_id, caption=cap, parse_mode=ParseMode.MARKDOWN)
            await msg.reply_text("📸 Rasm yuborildi ✅", reply_markup=stop_kb)
        elif msg.video:
            cap = cap_prefix + (f":\n{msg.caption}" if msg.caption else " video yubordi")
            await ctx.bot.send_video(chat_id=pid, video=msg.video.file_id, caption=cap, parse_mode=ParseMode.MARKDOWN)
            await msg.reply_text("🎬 Video yuborildi ✅", reply_markup=stop_kb)
        elif msg.audio:
            await ctx.bot.send_audio(chat_id=pid, audio=msg.audio.file_id, caption=cap_prefix, parse_mode=ParseMode.MARKDOWN)
            await msg.reply_text("🎵 Audio yuborildi ✅", reply_markup=stop_kb)
        elif msg.voice:
            await ctx.bot.send_voice(chat_id=pid, voice=msg.voice.file_id, caption=cap_prefix+" ovozli xabar", parse_mode=ParseMode.MARKDOWN)
            await msg.reply_text("🎙 Ovozli xabar yuborildi ✅", reply_markup=stop_kb)
        elif msg.document:
            cap = cap_prefix + f" fayl: {msg.document.file_name or ''}"
            await ctx.bot.send_document(chat_id=pid, document=msg.document.file_id, caption=cap, parse_mode=ParseMode.MARKDOWN)
            await msg.reply_text("📎 Fayl yuborildi ✅", reply_markup=stop_kb)
        elif msg.video_note:
            await ctx.bot.send_video_note(chat_id=pid, video_note=msg.video_note.file_id)
            await msg.reply_text("🎥 Video note yuborildi ✅", reply_markup=stop_kb)
        elif msg.sticker:
            await ctx.bot.send_sticker(chat_id=pid, sticker=msg.sticker.file_id)
            await msg.reply_text("🎭 Sticker yuborildi ✅", reply_markup=stop_kb)
        elif msg.location:
            await ctx.bot.send_location(chat_id=pid, latitude=msg.location.latitude, longitude=msg.location.longitude)
            await msg.reply_text("📍 Joylashuv yuborildi ✅", reply_markup=stop_kb)
        else:
            await msg.reply_text("❓ Bu turdagi kontent qo'llab-quvvatlanmaydi.")
    except Exception as e:
        err = str(e).lower()
        if "forbidden" in err or "blocked" in err:
            await msg.reply_text("⚠️ Hamkoringiz botni bloklagan. Ularga /start bosishini so'rang.")
        else:
            logger.error(f"Forward media: {e}")
            await msg.reply_text(f"⚠️ Media yuborishda xato.")

# ── MAIN ──────────────────────────────────────────────
def main():
    if not BOT_TOKEN:
        logger.error("BOT_TOKEN topilmadi!")
        return
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start",    cmd_start))
    app.add_handler(CommandHandler("profile",  cmd_profile))
    app.add_handler(CommandHandler("chats",    cmd_chats))
    app.add_handler(CommandHandler("offers",   cmd_offers))
    app.add_handler(CommandHandler("stopchat", cmd_stopchat))
    app.add_handler(CommandHandler("referral", cmd_referral))
    app.add_handler(CommandHandler("help",     cmd_help))
    app.add_handler(CallbackQueryHandler(callback_handler))
    app.add_handler(MessageHandler(filters.ALL & ~filters.COMMAND, message_handler))
    logger.info("🚀 MIDAS Bot v8 ishga tushdi")
    app.run_polling(allowed_updates=Update.ALL_TYPES, drop_pending_updates=True)

if __name__ == "__main__":
    main()
