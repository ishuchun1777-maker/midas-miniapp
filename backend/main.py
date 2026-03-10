# ═══════════════════════════════════════════════════════
# MIDAS V8 — BACKEND (Flask)
# 5 rol, portfel, campaigns, kafolat, bozor analitika,
# referral, xavfsizlik, rate limiting
# ═══════════════════════════════════════════════════════
import os, sqlite3, json, time, hashlib, hmac, logging
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from matching import calc_score as _calc_score

OFFLINE_PLATFORMS = {"billboard","tv","radio","print","event","influencer"}

def calculate_match_score(user, candidate):
    try:
        c_plats = candidate.get("platforms") or []
        if isinstance(c_plats, str):
            try: c_plats = json.loads(c_plats)
            except: c_plats = []
        return _calc_score(user, candidate)
    except Exception:
        return 50

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

DB_PATH    = os.getenv("DB_PATH",    "/opt/render/project/src/midas.db")
BOT_TOKEN  = os.getenv("BOT_TOKEN",  "")
ADMIN_IDS  = [int(x) for x in os.getenv("ADMIN_IDS","").split(",") if x.strip().isdigit()]

# ── RATE LIMITING ─────────────────────────────────────
_rate_store = {}  # {ip: [timestamps]}
def rate_limit(max_calls=60, window=60):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            ip = request.remote_addr or "unknown"
            now = time.time()
            calls = _rate_store.get(ip, [])
            calls = [t for t in calls if now - t < window]
            if len(calls) >= max_calls:
                return jsonify({"error": "Rate limit exceeded"}), 429
            calls.append(now)
            _rate_store[ip] = calls
            return f(*args, **kwargs)
        return wrapper
    return decorator

# ── DB YORDAMCHI ─────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def row2dict(row):
    return dict(row) if row else None

def rows2list(rows):
    return [dict(r) for r in rows]

# ── MIGRATSIYA ────────────────────────────────────────
def run_migrations():
    with get_db() as db:
        # Asosiy foydalanuvchilar jadvali
        db.execute("""CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id INTEGER UNIQUE NOT NULL,
            username TEXT, full_name TEXT, phone TEXT,
            role TEXT NOT NULL DEFAULT 'reklamachi',
            lang TEXT DEFAULT 'uz',
            bio TEXT, address TEXT, sector TEXT, region TEXT,
            regions TEXT DEFAULT '[]',
            company_name TEXT, website TEXT, profile_link TEXT,
            platforms TEXT DEFAULT '[]',
            followers INTEGER DEFAULT 0,
            engagement REAL DEFAULT 0,
            price_post INTEGER DEFAULT 0,
            price_story INTEGER DEFAULT 0,
            price_video INTEGER DEFAULT 0,
            monthly_budget INTEGER DEFAULT 0,
            min_budget INTEGER DEFAULT 0,
            managed_budget INTEGER DEFAULT 0,
            roi_avg REAL DEFAULT 0,
            team_size INTEGER DEFAULT 0,
            portfolio_url TEXT,
            design_tools TEXT,
            content_types TEXT DEFAULT '[]',
            audience_gender TEXT DEFAULT 'all',
            audience_ages TEXT DEFAULT '[]',
            audience_regions TEXT DEFAULT '[]',
            instagram TEXT, telegram_channel TEXT,
            tiktok TEXT, youtube TEXT,
            rating REAL DEFAULT 5.0,
            rating_count INTEGER DEFAULT 0,
            trust_score INTEGER DEFAULT 50,
            is_verified INTEGER DEFAULT 0,
            is_premium INTEGER DEFAULT 0,
            premium_until TEXT,
            is_blocked INTEGER DEFAULT 0,
            profile_views INTEGER DEFAULT 0,
            referral_code TEXT UNIQUE,
            referred_by TEXT,
            notif_settings TEXT DEFAULT '{"offers":true,"match":true,"messages":true,"deals":true}',
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )""")

        # Takliflar
        db.execute("""CREATE TABLE IF NOT EXISTS offers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_id INTEGER, to_id INTEGER,
            message TEXT, status TEXT DEFAULT 'pending',
            is_free INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        )""")

        # Chatlar
        db.execute("""CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user1_id INTEGER, user2_id INTEGER,
            offer_id INTEGER,
            status TEXT DEFAULT 'active',
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )""")

        # Xabarlar
        db.execute("""CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id INTEGER, sender_id INTEGER, receiver_id INTEGER,
            message_text TEXT, is_read INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        )""")

        # Tenderlar
        db.execute("""CREATE TABLE IF NOT EXISTS tenders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_id INTEGER, title TEXT, sector TEXT,
            description TEXT,
            budget_min INTEGER DEFAULT 0, budget_max INTEGER DEFAULT 0,
            deadline TEXT, goal TEXT,
            platforms TEXT DEFAULT '[]', regions TEXT DEFAULT '[]',
            status TEXT DEFAULT 'active',
            is_open INTEGER DEFAULT 1,
            proposal_count INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )""")

        # Tender takliflari
        db.execute("""CREATE TABLE IF NOT EXISTS tender_proposals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tender_id INTEGER, user_id INTEGER,
            price INTEGER, timeline TEXT, message TEXT,
            status TEXT DEFAULT 'pending',
            created_at TEXT DEFAULT (datetime('now'))
        )""")

        # Bildirishnomalar
        db.execute("""CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER, type TEXT, title TEXT, body TEXT,
            is_read INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        )""")

        # Reytinglar
        db.execute("""CREATE TABLE IF NOT EXISTS ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_id INTEGER, to_id INTEGER,
            rating INTEGER, review_text TEXT,
            tags TEXT DEFAULT '[]',
            created_at TEXT DEFAULT (datetime('now'))
        )""")

        # Portfolio
        db.execute("""CREATE TABLE IF NOT EXISTS portfolio (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER, title TEXT, platform TEXT,
            sector TEXT, client_name TEXT,
            description TEXT, link TEXT,
            reach INTEGER DEFAULT 0, clicks INTEGER DEFAULT 0,
            roi INTEGER DEFAULT 0, sales INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )""")

        # Kampaniyalar
        db.execute("""CREATE TABLE IF NOT EXISTS campaigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER, name TEXT, platform TEXT,
            goal TEXT, status TEXT DEFAULT 'active',
            budget INTEGER DEFAULT 0, spent INTEGER DEFAULT 0,
            revenue INTEGER DEFAULT 0,
            reach INTEGER DEFAULT 0, clicks INTEGER DEFAULT 0,
            start_date TEXT, end_date TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )""")

        # Kafolat/tasdiqlash
        db.execute("""CREATE TABLE IF NOT EXISTS guarantees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            deal_id INTEGER, user_id INTEGER,
            proof_link TEXT, proof_type TEXT,
            notes TEXT, status TEXT DEFAULT 'pending',
            created_at TEXT DEFAULT (datetime('now'))
        )""")

        # Bitimlar
        db.execute("""CREATE TABLE IF NOT EXISTS deals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user1_id INTEGER, user2_id INTEGER,
            offer_id INTEGER, status TEXT DEFAULT 'active',
            proof_status TEXT DEFAULT 'none',
            created_at TEXT DEFAULT (datetime('now'))
        )""")

        # Referral bonuslar
        db.execute("""CREATE TABLE IF NOT EXISTS referral_bonuses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            referrer_id INTEGER, referred_id INTEGER,
            bonus_days INTEGER,
            created_at TEXT DEFAULT (datetime('now'))
        )""")

        # Foydalanuvchilar profiliga yangi ustunlar qo'shish (mavjud DB uchun)
        for col, definition in [
            ("instagram",         "TEXT"),
            ("telegram_channel",  "TEXT"),
            ("tiktok",            "TEXT"),
            ("youtube",           "TEXT"),
            ("roi_avg",           "REAL DEFAULT 0"),
            ("managed_budget",    "INTEGER DEFAULT 0"),
            ("design_tools",      "TEXT"),
            ("portfolio_url",     "TEXT"),
            ("team_size",         "INTEGER DEFAULT 0"),
            ("min_budget",        "INTEGER DEFAULT 0"),
            ("regions",           "TEXT DEFAULT '[]'"),
            ("audience_ages",     "TEXT DEFAULT '[]'"),
            ("audience_regions",  "TEXT DEFAULT '[]'"),
            ("profile_views",     "INTEGER DEFAULT 0"),
        ]:
            try:
                db.execute(f"ALTER TABLE users ADD COLUMN {col} {definition}")
            except Exception:
                pass

        db.commit()
    logger.info("✅ Migrations OK")

# ── YORDAMCHI ─────────────────────────────────────────
def now_str():
    return datetime.utcnow().isoformat()

def send_notification(db, user_id, ntype, title, body):
    try:
        db.execute(
            "INSERT INTO notifications (user_id, type, title, body) VALUES (?,?,?,?)",
            (user_id, ntype, title, body)
        )
    except Exception as e:
        logger.warning(f"Notification: {e}")

def recalc_trust(db, user_id):
    u = row2dict(db.execute("SELECT * FROM users WHERE telegram_id=?", (user_id,)).fetchone())
    if not u: return 50
    score = 20
    if u.get("is_verified"):       score += 20
    if u.get("phone"):             score += 5
    if u.get("bio"):               score += 5
    if u.get("profile_link"):      score += 5
    if u.get("company_name"):      score += 5
    deals  = db.execute("SELECT COUNT(*) FROM deals WHERE (user1_id=? OR user2_id=?) AND status='completed'", (user_id, user_id)).fetchone()[0]
    pf     = db.execute("SELECT COUNT(*) FROM portfolio WHERE user_id=?", (user_id,)).fetchone()[0]
    gf     = db.execute("SELECT COUNT(*) FROM guarantees WHERE user_id=? AND status='verified'", (user_id,)).fetchone()[0]
    ratings = db.execute("SELECT AVG(rating), COUNT(*) FROM ratings WHERE to_id=?", (user_id,)).fetchone()
    score += min(deals * 3, 15)
    score += min(pf * 2, 10)
    score += min(gf * 5, 15)
    if ratings[1] and ratings[1] >= 3:
        score += int((ratings[0] / 5) * 10)
    score = max(0, min(score, 100))
    db.execute("UPDATE users SET trust_score=? WHERE telegram_id=?", (score, user_id))
    return score

def generate_referral_code(tg_id):
    import random, string
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(random.choices(chars, k=6))
    return f"MIDAS-{suffix}"

# ── FOYDALANUVCHILAR ──────────────────────────────────
@app.route("/api/users/<int:tg_id>", methods=["GET"])
@rate_limit(120, 60)
def get_user(tg_id):
    with get_db() as db:
        u = row2dict(db.execute("SELECT * FROM users WHERE telegram_id=?", (tg_id,)).fetchone())
        if not u: return jsonify({"error": "not found"}), 404
        # Profile views +1
        db.execute("UPDATE users SET profile_views=COALESCE(profile_views,0)+1 WHERE telegram_id=?", (tg_id,))
        db.commit()
        # JSON parse
        for f in ["platforms","regions","audience_ages","audience_regions","content_types"]:
            try: u[f] = json.loads(u.get(f) or "[]")
            except: u[f] = []
        try: u["notif_settings"] = json.loads(u.get("notif_settings") or "{}")
        except: u["notif_settings"] = {}
        return jsonify(u)

@app.route("/api/users", methods=["POST"])
@rate_limit(10, 60)
def create_user():
    d = request.json or {}
    tg_id = d.get("telegram_id")
    if not tg_id: return jsonify({"error": "telegram_id required"}), 400

    # XSS himoya
    def sanitize(v):
        if isinstance(v, str):
            return v.replace("<","&lt;").replace(">","&gt;").replace("&","&amp;")[:500]
        return v

    ref_code = generate_referral_code(tg_id)

    with get_db() as db:
        existing = db.execute("SELECT id FROM users WHERE telegram_id=?", (tg_id,)).fetchone()
        if existing:
            return jsonify({"error": "already exists"}), 409

        db.execute("""INSERT INTO users
            (telegram_id, username, full_name, phone, role, lang, bio, address,
             sector, region, regions, company_name, website, profile_link,
             platforms, followers, engagement, price_post, price_story, price_video,
             monthly_budget, min_budget, managed_budget, roi_avg, team_size,
             portfolio_url, design_tools, content_types,
             audience_gender, audience_ages, audience_regions,
             instagram, telegram_channel, tiktok, youtube,
             referral_code, referred_by,
             notif_settings)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (tg_id,
             sanitize(d.get("username","")),
             sanitize(d.get("full_name","Foydalanuvchi")),
             sanitize(d.get("phone","")),
             d.get("role","reklamachi"),
             d.get("lang","uz"),
             sanitize(d.get("bio","")),
             sanitize(d.get("address","")),
             d.get("sector",""),
             d.get("region",""),
             json.dumps(d.get("regions",[])),
             sanitize(d.get("company_name","")),
             sanitize(d.get("website","")),
             sanitize(d.get("profile_link","")),
             json.dumps(d.get("platforms",[])),
             int(d.get("followers",0)),
             float(d.get("engagement",0)),
             int(d.get("price_post",0)),
             int(d.get("price_story",0)),
             int(d.get("price_video",0)),
             int(d.get("monthly_budget",0)),
             int(d.get("min_budget",0)),
             int(d.get("managed_budget",0)),
             float(d.get("roi_avg",0)),
             int(d.get("team_size",0)),
             sanitize(d.get("portfolio_url","")),
             sanitize(d.get("design_tools","")),
             json.dumps(d.get("content_types",[])),
             d.get("audience_gender","all"),
             json.dumps(d.get("audience_ages",[])),
             json.dumps(d.get("audience_regions",[])),
             sanitize(d.get("instagram","")),
             sanitize(d.get("telegram_channel","")),
             sanitize(d.get("tiktok","")),
             sanitize(d.get("youtube","")),
             ref_code,
             d.get("referred_by",""),
             json.dumps({"offers":True,"match":True,"messages":True,"deals":True}),
             ))
        db.commit()

        # Referral bonus
        if d.get("referred_by"):
            referrer = db.execute("SELECT telegram_id FROM users WHERE referral_code=?", (d["referred_by"],)).fetchone()
            if referrer:
                ref_count = db.execute("SELECT COUNT(*) FROM referral_bonuses WHERE referrer_id=?", (referrer[0],)).fetchone()[0] + 1
                bonus = 10
                if ref_count >= 15: bonus = 365
                elif ref_count >= 7: bonus = 120
                elif ref_count >= 5: bonus = 90
                elif ref_count >= 3: bonus = 50
                db.execute("INSERT INTO referral_bonuses (referrer_id, referred_id, bonus_days) VALUES (?,?,?)", (referrer[0], tg_id, bonus))
                until = (datetime.utcnow() + timedelta(days=bonus)).isoformat()
                db.execute("UPDATE users SET is_premium=1, premium_until=? WHERE telegram_id=?", (until, referrer[0]))
                db.commit()

    return jsonify({"ok": True, "referral_code": ref_code}), 201

@app.route("/api/users/<int:tg_id>", methods=["PUT"])
@rate_limit(30, 60)
def update_user(tg_id):
    d = request.json or {}

    def sanitize(v):
        if isinstance(v, str):
            return v.replace("<","&lt;").replace(">","&gt;")[:500]
        return v

    with get_db() as db:
        db.execute("""UPDATE users SET
            full_name=?, phone=?, bio=?, address=?,
            company_name=?, website=?, profile_link=?,
            platforms=?, followers=?, engagement=?,
            price_post=?, price_story=?, price_video=?,
            monthly_budget=?, min_budget=?, managed_budget=?,
            roi_avg=?, team_size=?, portfolio_url=?,
            design_tools=?, content_types=?,
            audience_gender=?, audience_ages=?, audience_regions=?,
            instagram=?, telegram_channel=?, tiktok=?, youtube=?,
            sector=?, region=?, regions=?,
            updated_at=datetime('now')
            WHERE telegram_id=?""",
            (sanitize(d.get("full_name","")),
             sanitize(d.get("phone","")),
             sanitize(d.get("bio","")),
             sanitize(d.get("address","")),
             sanitize(d.get("company_name","")),
             sanitize(d.get("website","")),
             sanitize(d.get("profile_link","")),
             json.dumps(d.get("platforms",[])),
             int(d.get("followers",0)),
             float(d.get("engagement",0)),
             int(d.get("price_post",0)),
             int(d.get("price_story",0)),
             int(d.get("price_video",0)),
             int(d.get("monthly_budget",0)),
             int(d.get("min_budget",0)),
             int(d.get("managed_budget",0)),
             float(d.get("roi_avg",0)),
             int(d.get("team_size",0)),
             sanitize(d.get("portfolio_url","")),
             sanitize(d.get("design_tools","")),
             json.dumps(d.get("content_types",[])),
             d.get("audience_gender","all"),
             json.dumps(d.get("audience_ages",[])),
             json.dumps(d.get("audience_regions",[])),
             sanitize(d.get("instagram","")),
             sanitize(d.get("telegram_channel","")),
             sanitize(d.get("tiktok","")),
             sanitize(d.get("youtube","")),
             d.get("sector",""),
             d.get("region",""),
             json.dumps(d.get("regions",[])),
             tg_id,
             ))
        recalc_trust(db, tg_id)
        db.commit()
    return jsonify({"ok": True})

@app.route("/api/users/<int:tg_id>/stats", methods=["GET"])
def user_stats(tg_id):
    with get_db() as db:
        deals     = db.execute("SELECT COUNT(*) FROM deals WHERE (user1_id=? OR user2_id=?) AND status='completed'", (tg_id, tg_id)).fetchone()[0]
        portfolio = db.execute("SELECT COUNT(*) FROM portfolio WHERE user_id=?", (tg_id,)).fetchone()[0]
        campaigns = db.execute("SELECT COUNT(*) FROM campaigns WHERE user_id=?", (tg_id,)).fetchone()[0]
        offers    = db.execute("SELECT COUNT(*) FROM offers WHERE from_id=? OR to_id=?", (tg_id, tg_id)).fetchone()[0]
        tenders   = db.execute("SELECT COUNT(*) FROM tenders WHERE owner_id=?", (tg_id,)).fetchone()[0]
    return jsonify({"deals": deals, "portfolio": portfolio, "campaigns": campaigns, "offers": offers, "tenders": tenders})

@app.route("/api/users/<int:tg_id>/notif-settings", methods=["GET", "PUT"])
def notif_settings(tg_id):
    with get_db() as db:
        if request.method == "GET":
            u = db.execute("SELECT notif_settings FROM users WHERE telegram_id=?", (tg_id,)).fetchone()
            if not u: return jsonify({}), 404
            try: return jsonify(json.loads(u[0] or "{}"))
            except: return jsonify({})
        else:
            data = request.json or {}
            db.execute("UPDATE users SET notif_settings=? WHERE telegram_id=?", (json.dumps(data), tg_id))
            db.commit()
            return jsonify({"ok": True})

# ── MATCH ─────────────────────────────────────────────
@app.route("/api/match/<int:tg_id>", methods=["GET"])
@rate_limit(60, 60)
def get_matches(tg_id):
    platform_filter = request.args.get("platform_filter", "")
    ages   = request.args.get("ages", "").split(",") if request.args.get("ages") else []
    gender = request.args.get("gender", "")
    budget = int(request.args.get("budget", 0) or 0)
    goal   = request.args.get("goal","")

    with get_db() as db:
        user = row2dict(db.execute("SELECT * FROM users WHERE telegram_id=?", (tg_id,)).fetchone())
        if not user: return jsonify([]), 404

        # Opponent role
        if user["role"] == "tadbirkor":
            opponent_roles = ("reklamachi","agentlik","dizayner","media_buyer")
        else:
            opponent_roles = ("tadbirkor",)

        placeholders = ",".join("?" * len(opponent_roles))
        candidates = rows2list(db.execute(
            f"SELECT * FROM users WHERE role IN ({placeholders}) AND is_blocked=0 AND telegram_id!=?",
            (*opponent_roles, tg_id)
        ).fetchall())

        results = []
        for c in candidates:
            # JSON parse
            for f in ["platforms","regions","audience_ages","audience_regions"]:
                try: c[f] = json.loads(c.get(f) or "[]")
                except: c[f] = []

            # Platform filter
            if platform_filter and platform_filter not in c.get("platforms",[]) and c.get("platform") != platform_filter:
                continue

            # Byudjet filter
            if budget > 0 and c.get("price_post",0) > budget:
                continue

            score = calculate_match_score(user, c)
            if score < 30: continue

            # Portfolio soni
            pf_count = db.execute("SELECT COUNT(*) FROM portfolio WHERE user_id=?", (c["telegram_id"],)).fetchone()[0]
            c["portfolio_count"] = pf_count
            c["match_score"] = score
            results.append(c)

        results.sort(key=lambda x: (-(x.get("is_premium",0)), -x["match_score"]))
        return jsonify(results[:50])

# ── TAKLIFLAR ─────────────────────────────────────────
@app.route("/api/offers/<int:tg_id>", methods=["GET"])
def get_offers(tg_id):
    with get_db() as db:
        rows = db.execute("""
            SELECT o.*, u.full_name as from_name, u.role as from_role
            FROM offers o LEFT JOIN users u ON o.from_id=u.telegram_id
            WHERE o.to_id=? ORDER BY o.created_at DESC LIMIT 50
        """, (tg_id,)).fetchall()
        return jsonify(rows2list(rows))

@app.route("/api/offers", methods=["POST"])
@rate_limit(20, 60)
def create_offer():
    d = request.json or {}
    from_id = d.get("from_id"); to_id = d.get("to_id"); msg = d.get("message","")
    if not from_id or not to_id or not msg.strip():
        return jsonify({"error": "from_id, to_id, message required"}), 400

    # Sanitize
    msg = msg[:1000].replace("<","&lt;").replace(">","&gt;")

    with get_db() as db:
        db.execute("INSERT INTO offers (from_id, to_id, message, is_free) VALUES (?,?,?,?)",
                   (from_id, to_id, msg, int(d.get("is_free",0))))

        sender = row2dict(db.execute("SELECT full_name FROM users WHERE telegram_id=?", (from_id,)).fetchone())
        send_notification(db, to_id, "offer",
                          f"📩 Yangi taklif",
                          f"{sender.get('full_name','Kimdir')} taklif yubordi")
        db.commit()
    return jsonify({"ok": True}), 201

@app.route("/api/offers/<int:offer_id>/accept", methods=["POST"])
def accept_offer(offer_id):
    d = request.json or {}
    user_id = d.get("user_id")
    with get_db() as db:
        offer = row2dict(db.execute("SELECT * FROM offers WHERE id=?", (offer_id,)).fetchone())
        if not offer: return jsonify({"error": "not found"}), 404

        db.execute("UPDATE offers SET status='accepted' WHERE id=?", (offer_id,))

        # Chat ochish
        existing = db.execute("SELECT id FROM chats WHERE (user1_id=? AND user2_id=?) OR (user1_id=? AND user2_id=?)",
                              (offer["from_id"], offer["to_id"], offer["to_id"], offer["from_id"])).fetchone()
        if not existing:
            db.execute("INSERT INTO chats (user1_id, user2_id, offer_id) VALUES (?,?,?)",
                      (offer["from_id"], offer["to_id"], offer_id))
            db.execute("INSERT INTO deals (user1_id, user2_id, offer_id) VALUES (?,?,?)",
                      (offer["from_id"], offer["to_id"], offer_id))

        send_notification(db, offer["from_id"], "deal", "✅ Taklif qabul qilindi!", "Hamkorlik boshlandi")
        db.commit()
    return jsonify({"ok": True})

@app.route("/api/offers/<int:offer_id>/reject", methods=["POST"])
def reject_offer(offer_id):
    with get_db() as db:
        db.execute("UPDATE offers SET status='rejected' WHERE id=?", (offer_id,))
        db.commit()
    return jsonify({"ok": True})

# ── CHATLAR ───────────────────────────────────────────
@app.route("/api/chats/<int:tg_id>", methods=["GET"])
def get_chats(tg_id):
    with get_db() as db:
        rows = rows2list(db.execute("""
            SELECT c.*,
                CASE WHEN c.user1_id=? THEN c.user2_id ELSE c.user1_id END as partner_id,
                u.full_name as partner_name, u.role as partner_role,
                (SELECT message_text FROM messages WHERE chat_id=c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT COUNT(*) FROM messages WHERE chat_id=c.id AND receiver_id=? AND is_read=0) as unread
            FROM chats c
            JOIN users u ON u.telegram_id = CASE WHEN c.user1_id=? THEN c.user2_id ELSE c.user1_id END
            WHERE (c.user1_id=? OR c.user2_id=?) AND c.status='active'
            ORDER BY c.updated_at DESC
        """, (tg_id, tg_id, tg_id, tg_id, tg_id)).fetchall())
        return jsonify(rows)

@app.route("/api/messages/<int:chat_id>", methods=["GET"])
def get_messages(chat_id):
    user_id = request.args.get("user_id", 0, type=int)
    with get_db() as db:
        # O'qildi deb belgilash
        if user_id:
            db.execute("UPDATE messages SET is_read=1 WHERE chat_id=? AND receiver_id=?", (chat_id, user_id))
            db.commit()
        rows = rows2list(db.execute(
            "SELECT * FROM messages WHERE chat_id=? ORDER BY created_at ASC LIMIT 200", (chat_id,)
        ).fetchall())
        return jsonify(rows)

@app.route("/api/messages", methods=["POST"])
@rate_limit(120, 60)
def send_message():
    d = request.json or {}
    chat_id = d.get("chat_id"); sender_id = d.get("sender_id")
    receiver_id = d.get("receiver_id"); text = d.get("message_text","")
    if not chat_id or not sender_id or not text.strip():
        return jsonify({"error": "required fields missing"}), 400

    text = text[:2000].replace("<","&lt;").replace(">","&gt;")

    with get_db() as db:
        db.execute("INSERT INTO messages (chat_id, sender_id, receiver_id, message_text) VALUES (?,?,?,?)",
                  (chat_id, sender_id, receiver_id, text))
        db.execute("UPDATE chats SET updated_at=datetime('now') WHERE id=?", (chat_id,))

        # Notif sozlamasini tekshirish
        ns = db.execute("SELECT notif_settings FROM users WHERE telegram_id=?", (receiver_id,)).fetchone()
        try:
            settings = json.loads(ns[0] or "{}")
            if settings.get("messages", True):
                send_notification(db, receiver_id, "message", "💬 Yangi xabar", text[:50])
        except Exception:
            pass
        db.commit()
    return jsonify({"ok": True}), 201

# ── BILDIRISHNOMALAR ──────────────────────────────────
@app.route("/api/notifications/<int:tg_id>", methods=["GET"])
def get_notifications(tg_id):
    with get_db() as db:
        rows = rows2list(db.execute(
            "SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50", (tg_id,)
        ).fetchall())
        return jsonify(rows)

@app.route("/api/notifications/unread-count/<int:tg_id>", methods=["GET"])
def unread_count(tg_id):
    with get_db() as db:
        c = db.execute("SELECT COUNT(*) FROM notifications WHERE user_id=? AND is_read=0", (tg_id,)).fetchone()[0]
        return jsonify({"count": c})

@app.route("/api/notifications/<int:notif_id>/read", methods=["PUT"])
def mark_read(notif_id):
    with get_db() as db:
        db.execute("UPDATE notifications SET is_read=1 WHERE id=?", (notif_id,))
        db.commit()
    return jsonify({"ok": True})

# ── TENDERLAR ─────────────────────────────────────────
@app.route("/api/tenders", methods=["GET"])
def get_tenders():
    user_id = request.args.get("user_id", 0, type=int)
    role    = request.args.get("role","")
    with get_db() as db:
        rows = rows2list(db.execute(
            "SELECT * FROM tenders ORDER BY created_at DESC LIMIT 100"
        ).fetchall())
        for r in rows:
            for f in ["platforms","regions"]:
                try: r[f] = json.loads(r.get(f) or "[]")
                except: r[f] = []
        return jsonify(rows)

@app.route("/api/tenders", methods=["POST"])
@rate_limit(10, 60)
def create_tender():
    d = request.json or {}
    if not d.get("owner_id") or not d.get("title"):
        return jsonify({"error": "required fields missing"}), 400
    with get_db() as db:
        db.execute("""INSERT INTO tenders
            (owner_id, title, sector, description, budget_min, budget_max,
             deadline, goal, platforms, regions, is_open)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (d["owner_id"],
             d.get("title","")[:200],
             d.get("sector",""),
             d.get("description","")[:2000],
             int(d.get("budget_min",0)),
             int(d.get("budget_max",0)),
             d.get("deadline",""),
             d.get("goal",""),
             json.dumps(d.get("platforms",[])),
             json.dumps(d.get("regions",[])),
             int(d.get("is_open",1)),
             ))
        db.commit()
    return jsonify({"ok": True}), 201

@app.route("/api/tenders/<int:tid>/proposals", methods=["GET"])
def get_proposals(tid):
    with get_db() as db:
        rows = rows2list(db.execute("""
            SELECT tp.*, u.full_name FROM tender_proposals tp
            LEFT JOIN users u ON tp.user_id=u.telegram_id
            WHERE tp.tender_id=? ORDER BY tp.created_at DESC
        """, (tid,)).fetchall())
        return jsonify(rows)

@app.route("/api/tenders/<int:tid>/proposals", methods=["POST"])
@rate_limit(10, 60)
def create_proposal(tid):
    d = request.json or {}
    with get_db() as db:
        db.execute("INSERT INTO tender_proposals (tender_id, user_id, price, timeline, message) VALUES (?,?,?,?,?)",
                  (tid, d.get("user_id"), int(d.get("price",0)), d.get("timeline",""), d.get("message","")[:1000]))
        db.execute("UPDATE tenders SET proposal_count=proposal_count+1 WHERE id=?", (tid,))
        tender = row2dict(db.execute("SELECT owner_id FROM tenders WHERE id=?", (tid,)).fetchone())
        if tender:
            send_notification(db, tender["owner_id"], "tender", "📩 Yangi taklif", "Tenderingizga taklif keldi")
        db.commit()
    return jsonify({"ok": True}), 201

@app.route("/api/tenders/<int:tid>/proposals/<int:pid>/accept", methods=["POST"])
def accept_proposal(tid, pid):
    with get_db() as db:
        db.execute("UPDATE tender_proposals SET status='accepted' WHERE id=?", (pid,))
        db.execute("UPDATE tenders SET status='closed' WHERE id=?", (tid,))
        db.commit()
    return jsonify({"ok": True})

@app.route("/api/tenders/<int:tid>/close", methods=["POST"])
def close_tender(tid):
    with get_db() as db:
        db.execute("UPDATE tenders SET status='closed', updated_at=datetime('now') WHERE id=?", (tid,))
        db.commit()
    return jsonify({"ok": True})

# ── REYTINGLAR ────────────────────────────────────────
@app.route("/api/ratings", methods=["POST"])
@rate_limit(20, 60)
def create_rating():
    d = request.json or {}
    with get_db() as db:
        db.execute("INSERT INTO ratings (from_id, to_id, rating, review_text, tags) VALUES (?,?,?,?,?)",
                  (d.get("from_id"), d.get("to_id"), int(d.get("rating",5)),
                   d.get("review_text","")[:500], json.dumps(d.get("tags",[]))))
        avg = db.execute("SELECT AVG(rating), COUNT(*) FROM ratings WHERE to_id=?", (d.get("to_id"),)).fetchone()
        db.execute("UPDATE users SET rating=?, rating_count=? WHERE telegram_id=?",
                  (round(avg[0],2), avg[1], d.get("to_id")))
        recalc_trust(db, d.get("to_id"))
        db.commit()
    return jsonify({"ok": True}), 201

# ── PORTFOLIO ─────────────────────────────────────────
@app.route("/api/portfolio/<int:user_id>", methods=["GET"])
def get_portfolio(user_id):
    with get_db() as db:
        rows = rows2list(db.execute(
            "SELECT * FROM portfolio WHERE user_id=? ORDER BY created_at DESC", (user_id,)
        ).fetchall())
        return jsonify(rows)

@app.route("/api/portfolio", methods=["POST"])
@rate_limit(20, 60)
def create_portfolio():
    d = request.json or {}
    with get_db() as db:
        db.execute("""INSERT INTO portfolio
            (user_id, title, platform, sector, client_name, description, link, reach, clicks, roi, sales)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (d.get("user_id"), d.get("title","")[:200], d.get("platform",""),
             d.get("sector",""), d.get("client_name","")[:100],
             d.get("description","")[:2000], d.get("link","")[:500],
             int(d.get("reach",0)), int(d.get("clicks",0)),
             int(d.get("roi",0)), int(d.get("sales",0))))
        recalc_trust(db, d.get("user_id"))
        db.commit()
    return jsonify({"ok": True}), 201

@app.route("/api/portfolio/<int:item_id>", methods=["PUT", "DELETE"])
def update_portfolio(item_id):
    d = request.json or {}
    with get_db() as db:
        if request.method == "DELETE":
            db.execute("DELETE FROM portfolio WHERE id=?", (item_id,))
        else:
            db.execute("""UPDATE portfolio SET
                title=?, platform=?, sector=?, client_name=?,
                description=?, link=?, reach=?, clicks=?, roi=?, sales=?,
                updated_at=datetime('now') WHERE id=?""",
                (d.get("title",""), d.get("platform",""), d.get("sector",""),
                 d.get("client_name",""), d.get("description",""), d.get("link",""),
                 int(d.get("reach",0)), int(d.get("clicks",0)),
                 int(d.get("roi",0)), int(d.get("sales",0)), item_id))
        db.commit()
    return jsonify({"ok": True})

# ── KAMPANIYALAR ──────────────────────────────────────
@app.route("/api/campaigns/<int:user_id>", methods=["GET"])
def get_campaigns(user_id):
    with get_db() as db:
        rows = rows2list(db.execute(
            "SELECT * FROM campaigns WHERE user_id=? ORDER BY created_at DESC", (user_id,)
        ).fetchall())
        return jsonify(rows)

@app.route("/api/campaigns", methods=["POST"])
@rate_limit(20, 60)
def create_campaign():
    d = request.json or {}
    with get_db() as db:
        db.execute("""INSERT INTO campaigns
            (user_id, name, platform, goal, status, budget, spent, revenue, reach, clicks, start_date, end_date)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
            (d.get("user_id"), d.get("name","")[:200], d.get("platform",""),
             d.get("goal",""), d.get("status","active"),
             int(d.get("budget",0)), int(d.get("spent",0)), int(d.get("revenue",0)),
             int(d.get("reach",0)), int(d.get("clicks",0)),
             d.get("start_date",""), d.get("end_date","")))
        db.commit()
    return jsonify({"ok": True}), 201

# ── KAFOLAT ───────────────────────────────────────────
@app.route("/api/guarantee/deals/<int:user_id>", methods=["GET"])
def get_guarantee_deals(user_id):
    with get_db() as db:
        rows = rows2list(db.execute("""
            SELECT d.*,
                CASE WHEN d.user1_id=? THEN d.user2_id ELSE d.user1_id END as partner_id,
                u.full_name as partner_name,
                g.status as proof_status, g.proof_link
            FROM deals d
            LEFT JOIN users u ON u.telegram_id = CASE WHEN d.user1_id=? THEN d.user2_id ELSE d.user1_id END
            LEFT JOIN guarantees g ON g.deal_id=d.id AND g.user_id=?
            WHERE d.user1_id=? OR d.user2_id=?
            ORDER BY d.created_at DESC
        """, (user_id, user_id, user_id, user_id, user_id)).fetchall())
        return jsonify(rows)

@app.route("/api/guarantee/proof", methods=["POST"])
@rate_limit(20, 60)
def submit_proof():
    d = request.json or {}
    with get_db() as db:
        db.execute("INSERT INTO guarantees (deal_id, user_id, proof_link, proof_type, notes, status) VALUES (?,?,?,?,?,?)",
                  (d.get("deal_id"), d.get("user_id"),
                   d.get("proof_link","")[:500], d.get("proof_type","link"),
                   d.get("notes","")[:500], "pending"))
        recalc_trust(db, d.get("user_id"))
        db.commit()
    return jsonify({"ok": True}), 201

# ── AI MASLAHAT ───────────────────────────────────────
@app.route("/api/ai-advisor/<int:tg_id>", methods=["GET"])
@rate_limit(30, 60)
def ai_advisor(tg_id):
    from ai_advisor import get_advice
    topic = request.args.get("topic", "budget")
    lang  = request.args.get("lang", "uz")
    with get_db() as db:
        user = row2dict(db.execute("SELECT * FROM users WHERE telegram_id=?", (tg_id,)).fetchone())
        if not user: return jsonify({"error": "not found"}), 404
    try:
        advice = get_advice(user, topic, lang)
        return jsonify(advice)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/ai-advisor/<int:tg_id>/chat", methods=["POST"])
@rate_limit(20, 60)
def ai_chat(tg_id):
    from ai_advisor import answer_question
    d = request.json or {}
    q = d.get("question","")[:500]
    lang = d.get("lang","uz")
    sector = d.get("sector","")
    try:
        answer = answer_question(q, sector, lang)
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"answer": "Xato yuz berdi, qaytadan urinib ko'ring."}), 200

# ── BOZOR ANALITIKASI ──────────────────────────────────
@app.route("/api/market/insights", methods=["GET"])
def market_insights():
    with get_db() as db:
        # Soha bo'yicha foydalanuvchilar soni
        rows = rows2list(db.execute("""
            SELECT sector, COUNT(*) as count FROM users
            WHERE sector IS NOT NULL AND sector != ''
            GROUP BY sector ORDER BY count DESC LIMIT 8
        """).fetchall())

        total = sum(r["count"] for r in rows) or 1
        top_sectors = [{"name": r["sector"], "percentage": round(r["count"]/total*100)} for r in rows]

        # O'rtacha narxlar
        avg_price = db.execute("SELECT AVG(price_post) FROM users WHERE price_post > 0").fetchone()[0]
        avg_trust = db.execute("SELECT AVG(trust_score) FROM users").fetchone()[0]

        return jsonify({
            "top_sectors": top_sectors,
            "avg_price_post": int(avg_price or 0),
            "avg_trust": int(avg_trust or 50),
        })

# ── REFERRAL ──────────────────────────────────────────
@app.route("/api/referral/<int:tg_id>", methods=["GET"])
def get_referral(tg_id):
    with get_db() as db:
        u = row2dict(db.execute("SELECT referral_code, referred_by FROM users WHERE telegram_id=?", (tg_id,)).fetchone())
        if not u: return jsonify({}), 404
        count = db.execute("SELECT COUNT(*) FROM referral_bonuses WHERE referrer_id=?", (tg_id,)).fetchone()[0]
        bonus = db.execute("SELECT SUM(bonus_days) FROM referral_bonuses WHERE referrer_id=?", (tg_id,)).fetchone()[0] or 0
        refs  = rows2list(db.execute("""
            SELECT u.full_name, u.role, u.is_verified, u.created_at
            FROM referral_bonuses rb JOIN users u ON rb.referred_id=u.telegram_id
            WHERE rb.referrer_id=? ORDER BY rb.created_at DESC LIMIT 20
        """, (tg_id,)).fetchall())
        return jsonify({
            "referral_code": u.get("referral_code") or f"MIDAS-{tg_id}",
            "referral_count": count,
            "bonus_days": bonus,
            "referrals": refs,
        })

@app.route("/api/referral/use", methods=["POST"])
def use_referral():
    d = request.json or {}
    code = d.get("code",""); tg_id = d.get("telegram_id")
    if not code or not tg_id: return jsonify({"error": "required"}), 400
    with get_db() as db:
        referrer = row2dict(db.execute("SELECT telegram_id FROM users WHERE referral_code=?", (code,)).fetchone())
        if referrer and referrer["telegram_id"] != tg_id:
            db.execute("UPDATE users SET referred_by=? WHERE telegram_id=?", (code, tg_id))
            db.commit()
    return jsonify({"ok": True})

# ── TRUST SKORI ───────────────────────────────────────
@app.route("/api/users/<int:tg_id>/trust", methods=["POST"])
def recalc_trust_endpoint(tg_id):
    with get_db() as db:
        score = recalc_trust(db, tg_id)
        db.commit()
    return jsonify({"trust_score": score})

# ── ADMIN ─────────────────────────────────────────────
def require_admin(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        admin_id = request.args.get("admin_id", 0, type=int)
        if admin_id not in ADMIN_IDS:
            return jsonify({"error": "Forbidden"}), 403
        return f(*args, **kwargs)
    return wrapper

@app.route("/api/admin/stats", methods=["GET"])
@require_admin
def admin_stats():
    with get_db() as db:
        return jsonify({
            "total_users":    db.execute("SELECT COUNT(*) FROM users").fetchone()[0],
            "tadbirkorlar":   db.execute("SELECT COUNT(*) FROM users WHERE role='tadbirkor'").fetchone()[0],
            "reklamachilar":  db.execute("SELECT COUNT(*) FROM users WHERE role='reklamachi'").fetchone()[0],
            "agentliklar":    db.execute("SELECT COUNT(*) FROM users WHERE role='agentlik'").fetchone()[0],
            "dizaynerlar":    db.execute("SELECT COUNT(*) FROM users WHERE role='dizayner'").fetchone()[0],
            "premium_users":  db.execute("SELECT COUNT(*) FROM users WHERE is_premium=1").fetchone()[0],
            "verified_users": db.execute("SELECT COUNT(*) FROM users WHERE is_verified=1").fetchone()[0],
            "total_offers":   db.execute("SELECT COUNT(*) FROM offers").fetchone()[0],
            "total_tenders":  db.execute("SELECT COUNT(*) FROM tenders").fetchone()[0],
            "total_deals":    db.execute("SELECT COUNT(*) FROM deals").fetchone()[0],
            "total_chats":    db.execute("SELECT COUNT(*) FROM chats").fetchone()[0],
        })

@app.route("/api/admin/verify-queue", methods=["GET"])
@require_admin
def verify_queue():
    with get_db() as db:
        return jsonify(rows2list(db.execute(
            "SELECT * FROM users WHERE is_verified=0 AND is_blocked=0 ORDER BY created_at LIMIT 30"
        ).fetchall()))

@app.route("/api/admin/verify/<int:uid>", methods=["PUT"])
@require_admin
def admin_verify(uid):
    action = request.args.get("action","verify")
    with get_db() as db:
        if action == "verify":
            db.execute("UPDATE users SET is_verified=1 WHERE telegram_id=?", (uid,))
            recalc_trust(db, uid)
            send_notification(db, uid, "verify", "✅ Profilingiz tasdiqlandi!", "MIDAS jamoasi profilingizni tasdiqladi")
        else:
            db.execute("UPDATE users SET is_verified=0 WHERE telegram_id=?", (uid,))
        db.commit()
    return jsonify({"ok": True})

@app.route("/api/admin/premium/<int:uid>", methods=["PUT"])
@require_admin
def admin_premium(uid):
    days = request.args.get("days", 30, type=int)
    until = (datetime.utcnow() + timedelta(days=days)).isoformat()
    with get_db() as db:
        db.execute("UPDATE users SET is_premium=1, premium_until=? WHERE telegram_id=?", (until, uid))
        send_notification(db, uid, "premium", "⭐ Premium aktivlashtirildi!", f"{days} kunlik Premium sizga berildi")
        db.commit()
    return jsonify({"ok": True})

@app.route("/api/admin/block/<int:uid>", methods=["PUT"])
@require_admin
def admin_block(uid):
    with get_db() as db:
        u = row2dict(db.execute("SELECT is_blocked FROM users WHERE telegram_id=?", (uid,)).fetchone())
        new_status = 0 if (u and u["is_blocked"]) else 1
        db.execute("UPDATE users SET is_blocked=? WHERE telegram_id=?", (new_status, uid))
        db.commit()
    return jsonify({"ok": True, "blocked": bool(new_status)})

@app.route("/api/admin/all-users", methods=["GET"])
@require_admin
def all_users():
    with get_db() as db:
        return jsonify(rows2list(db.execute(
            "SELECT telegram_id, full_name, role, lang FROM users WHERE is_blocked=0 LIMIT 1000"
        ).fetchall()))

@app.route("/api/admin/broadcast", methods=["POST"])
@require_admin
def broadcast():
    d = request.json or {}
    msg = d.get("message","")[:1000]
    if not msg.strip(): return jsonify({"error": "message required"}), 400
    import requests as req
    with get_db() as db:
        users = rows2list(db.execute("SELECT telegram_id FROM users WHERE is_blocked=0").fetchall())
    sent = 0
    for u in users:
        try:
            req.post(f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                    json={"chat_id": u["telegram_id"], "text": f"📢 MIDAS xabari:\n\n{msg}", "parse_mode": "HTML"},
                    timeout=5)
            sent += 1
            time.sleep(0.05)
        except Exception:
            pass
    return jsonify({"ok": True, "sent": sent})

# ── SOG'LIQNI TEKSHIRISH ──────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "version": "v8", "time": now_str()})

@app.route("/", methods=["GET"])
def root():
    return jsonify({"name": "MIDAS API v8", "status": "running"})

# ── XATO HANDLER ──────────────────────────────────────
@app.errorhandler(404)
def not_found(e): return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def server_error(e):
    logger.error(f"500: {e}")
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    run_migrations()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=False)
