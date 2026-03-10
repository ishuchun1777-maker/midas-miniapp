"""
MIDAS Platform - FastAPI Backend
Render.com ga deploy qilish uchun tayyor
"""
import os
import json
import hmac
import hashlib
import urllib.parse
import sqlite3
from datetime import datetime
from typing import Optional, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# ==================== CONFIG ====================
BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN")
DB_PATH = os.getenv("DB_PATH", "midas.db")
ADMIN_IDS_STR = os.getenv("ADMIN_IDS", "123456789")
ADMIN_IDS = [int(x.strip()) for x in ADMIN_IDS_STR.split(",") if x.strip()]

# ==================== DATABASE ====================
def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def init_db():
    conn = get_conn()
    c = conn.cursor()

    c.execute("""CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id INTEGER UNIQUE NOT NULL,
        username TEXT, full_name TEXT,
        role TEXT DEFAULT 'user', phone TEXT,
        lang TEXT DEFAULT 'uz',
        rating REAL DEFAULT 5.0, rating_count INTEGER DEFAULT 0,
        is_premium INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1,
        is_blocked INTEGER DEFAULT 0, block_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS business_targets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        sector TEXT DEFAULT '', ages TEXT DEFAULT '[]',
        target_gender TEXT DEFAULT 'all', location TEXT DEFAULT '[]',
        interests TEXT DEFAULT '[]', min_followers INTEGER DEFAULT 1000,
        max_budget INTEGER DEFAULT 0, campaign_goal TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS reklamachi_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        platform TEXT DEFAULT '', username TEXT DEFAULT '',
        profile_link TEXT DEFAULT '', followers INTEGER DEFAULT 0,
        engagement REAL DEFAULT 0, price_post INTEGER DEFAULT 0,
        price_story INTEGER DEFAULT 0, price_video INTEGER DEFAULT 0,
        audience_ages TEXT DEFAULT '[]', audience_gender TEXT DEFAULT 'all',
        audience_location TEXT DEFAULT 'all', interests TEXT DEFAULT '[]',
        verified INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS offers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_id INTEGER NOT NULL, to_id INTEGER NOT NULL,
        message TEXT, status TEXT DEFAULT 'pending',
        rating INTEGER DEFAULT 0, rated INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS private_chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user1_id INTEGER NOT NULL, user2_id INTEGER NOT NULL,
        offer_id INTEGER, last_message TEXT, last_message_time TIMESTAMP,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user1_id, user2_id)
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER NOT NULL, sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL, message_text TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL, title TEXT, body TEXT,
        type TEXT DEFAULT 'info', is_read INTEGER DEFAULT 0,
        ref_id INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""")

    conn.commit()
    conn.close()

# ==================== APP ====================
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="MIDAS API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    conn = get_conn()
    try:
        yield conn
    finally:
        conn.close()

# ==================== AUTH ====================
def verify_init_data(init_data: str) -> Optional[dict]:
    """Telegram WebApp init data tekshirish"""
    try:
        params = dict(urllib.parse.parse_qsl(init_data, keep_blank_values=True))
        check_hash = params.pop("hash", "")
        data_check = "\n".join(f"{k}={v}" for k, v in sorted(params.items()))
        secret = hmac.new(b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256).digest()
        calc = hmac.new(secret, data_check.encode(), hashlib.sha256).hexdigest()
        if hmac.compare_digest(calc, check_hash):
            user = json.loads(urllib.parse.unquote(params.get("user", "{}")))
            return user
    except Exception:
        pass
    # Dev mode
    if BOT_TOKEN == "YOUR_BOT_TOKEN":
        return {"id": 99999, "first_name": "Demo", "username": "demo"}
    return None

def get_current_user(request: Request, db: sqlite3.Connection = Depends(get_db)):
    init_data = request.headers.get("X-Init-Data", "")
    tg_user = verify_init_data(init_data)
    if not tg_user:
        raise HTTPException(status_code=401, detail="Ruxsat yo'q")
    c = db.cursor()
    c.execute("SELECT * FROM users WHERE telegram_id=?", (tg_user["id"],))
    user = c.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    return dict(user)

# ==================== MODELS ====================
class UserRegister(BaseModel):
    telegram_id: int
    username: Optional[str] = None
    full_name: str
    role: str
    phone: Optional[str] = None
    lang: str = "uz"

class BusinessTargetModel(BaseModel):
    sector: str = ""
    ages: List[str] = []
    target_gender: str = "all"
    location: List[str] = []
    interests: List[str] = []
    min_followers: int = 1000
    max_budget: int = 0
    campaign_goal: str = ""

class ReklamachiProfileModel(BaseModel):
    platform: str = ""
    username: str = ""
    profile_link: str = ""
    followers: int = 0
    engagement: float = 0
    price_post: int = 0
    price_story: int = 0
    price_video: int = 0
    audience_ages: List[str] = []
    audience_gender: str = "all"
    audience_location: str = "all"
    interests: List[str] = []

class OfferCreate(BaseModel):
    from_id: int
    to_id: int
    message: Optional[str] = None

class MessageCreate(BaseModel):
    chat_id: int
    sender_id: int
    receiver_id: int
    message_text: str

class RatingModel(BaseModel):
    offer_id: int
    rating: int

# ==================== MATCHING ====================
SECTOR_WEIGHTS = {
    "real_estate":            {"muhim":{"qiziqishlar":30,"hudud":25,"yosh":20},"orta":{"jins":15,"platforma":10},"kam":{"obunachilar":8,"aktivlik":5}},
    "construction_materials": {"muhim":{"qiziqishlar":30,"hudud":25,"yosh":20},"orta":{"jins":15,"platforma":10},"kam":{"obunachilar":5,"aktivlik":5}},
    "manufacturing":          {"muhim":{"hudud":28,"qiziqishlar":24,"yosh":18},"orta":{"platforma":14,"reyting":9},"kam":{"obunachilar":4,"aktivlik":3}},
    "banking":                {"muhim":{"yosh":30,"qiziqishlar":24,"hudud":16},"orta":{"platforma":13,"jins":9},"kam":{"obunachilar":5,"aktivlik":3}},
    "education":              {"muhim":{"yosh":35,"qiziqishlar":28,"hudud":17},"orta":{"jins":12,"platforma":5},"kam":{"obunachilar":3}},
    "auto_transport":         {"muhim":{"yosh":28,"jins":24,"hudud":18},"orta":{"qiziqishlar":14,"platforma":9},"kam":{"obunachilar":4,"aktivlik":3}},
    "retail":                 {"muhim":{"yosh":30,"jins":25,"hudud":20},"orta":{"qiziqishlar":15,"platforma":7},"kam":{"obunachilar":5,"aktivlik":3}},
    "restaurant":             {"muhim":{"hudud":32,"yosh":24,"qiziqishlar":18},"orta":{"jins":12,"platforma":8},"kam":{"obunachilar":3,"aktivlik":3}},
    "home_appliances":        {"muhim":{"jins":28,"yosh":24,"hudud":18},"orta":{"qiziqishlar":14,"platforma":9},"kam":{"obunachilar":4,"aktivlik":3}},
    "beverages":              {"muhim":{"yosh":30,"qiziqishlar":24,"hudud":16},"orta":{"platforma":13,"jins":9},"kam":{"obunachilar":4,"aktivlik":4}},
    "medical":                {"muhim":{"yosh":28,"jins":22,"qiziqishlar":20},"orta":{"hudud":15,"platforma":8},"kam":{"obunachilar":4,"aktivlik":3}},
    "internet_services":      {"muhim":{"yosh":30,"qiziqishlar":26,"platforma":14},"orta":{"hudud":12,"jins":10},"kam":{"obunachilar":5,"aktivlik":3}},
}

def _hudud(target, rek, w):
    tl = target.get("location",[])
    if isinstance(tl,str): tl=[tl]
    rl = rek.get("audience_location","all")
    if "all" in tl or rl in tl: return w
    if rl=="all": return int(w*0.7)
    return int(w*0.2)

def _yosh(target, rek, w):
    ta=set(target.get("ages",[])); ra=set(rek.get("audience_ages",[]))
    if not ta or not ra: return 0
    c=ta&ra
    return int(w*len(c)/len(ta)) if c else 0

def _jins(target, rek, w):
    tg=target.get("target_gender","all"); rg=rek.get("audience_gender","all")
    if tg=="all" or tg==rg: return w
    if rg=="all": return int(w*0.6)
    return 0

def _qiziqish(target, rek, w):
    ti=set(target.get("interests",[])); ri=set(rek.get("interests",[]))
    if not ti or not ri: return 0
    c=ti&ri
    return int(w*len(c)/len(ti)) if c else 0

def _platforma(rek, w):
    ranks={"instagram":1.0,"telegram_channel":0.9,"youtube":0.85,"telegram_bot":0.7,"mobile_app":0.6,"offline":0.5}
    return int(w*ranks.get(rek.get("platform",""),0.4))

def _obunachi(rek, w):
    f=rek.get("followers",0)
    if f>=100000: return w
    if f>=50000: return int(w*0.9)
    if f>=20000: return int(w*0.8)
    if f>=10000: return int(w*0.7)
    if f>=5000: return int(w*0.6)
    if f>=1000: return int(w*0.5)
    return int(w*0.3)

def _aktivlik(rek, w):
    e=rek.get("engagement",0)
    if e>=7: return w
    if e>=5: return int(w*0.9)
    if e>=3: return int(w*0.7)
    if e>=2: return int(w*0.5)
    return int(w*0.3)

def _reyting(rek, w):
    return int(w*(rek.get("rating",5.0)/5.0))

OMIL_FN = {
    "hudud":_hudud,"yosh":_yosh,"jins":_jins,
    "qiziqishlar":_qiziqish,"platforma":_platforma,
    "obunachilar":_obunachi,"aktivlik":_aktivlik,"reyting":_reyting
}

def calculate_match_score(target: dict, rek: dict) -> int:
    sector = target.get("sector","")
    weights = SECTOR_WEIGHTS.get(sector)
    if not weights:
        # Universal
        score=0
        score += _yosh(target,rek,20)
        score += _jins(target,rek,15)
        score += _hudud(target,rek,15)
        score += _qiziqish(target,rek,20)
        score += _obunachi(rek,15)
        rating=rek.get("rating",5.0)
        if rating>=4.9: score+=10
        elif rating>=4.5: score+=5
        return min(int(score),100)

    score=0
    for level in ["muhim","orta","kam"]:
        for omil, mw in weights.get(level,{}).items():
            fn=OMIL_FN.get(omil)
            if fn:
                if omil in ["platforma","obunachilar","aktivlik","reyting"]:
                    score += fn(rek,mw)
                else:
                    score += fn(target,rek,mw)
    # Bonus
    r=rek.get("rating",5.0)
    if r>=4.9: score+=8
    elif r>=4.5: score+=4
    return min(int(score),100)

# ==================== HELPERS ====================
def jl(val, default=[]):
    try: return json.loads(val) if val else default
    except: return default

def add_notification(db, user_id, title, body, ntype="info", ref_id=0):
    try:
        db.execute(
            "INSERT INTO notifications(user_id,title,body,type,ref_id) VALUES(?,?,?,?,?)",
            (user_id, title, body, ntype, ref_id)
        )
        db.commit()
    except: pass

# ==================== ROUTES ====================

@app.get("/")
def root():
    return {"status": "ok", "app": "MIDAS API v2.0"}

@app.get("/health")
def health():
    return {"status": "healthy", "db": DB_PATH}

# ---- USERS ----

@app.post("/api/users/register")
def register(data: UserRegister, db: sqlite3.Connection = Depends(get_db)):
    c = db.cursor()
    c.execute("""INSERT OR REPLACE INTO users
        (telegram_id,username,full_name,role,phone,lang)
        VALUES(?,?,?,?,?,?)""",
        (data.telegram_id, data.username, data.full_name, data.role, data.phone, data.lang))
    db.commit()
    return {"success": True}

@app.get("/api/users/{tg_id}")
def get_user(tg_id: int, db: sqlite3.Connection = Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM users WHERE telegram_id=?", (tg_id,))
    row = c.fetchone()
    if not row: raise HTTPException(404, "Topilmadi")
    return dict(row)

@app.put("/api/users/{tg_id}/lang")
def set_lang(tg_id: int, lang: str = Query(...), db: sqlite3.Connection = Depends(get_db)):
    db.execute("UPDATE users SET lang=? WHERE telegram_id=?", (lang, tg_id))
    db.commit()
    return {"success": True}

@app.get("/api/users/{tg_id}/stats")
def user_stats(tg_id: int, db: sqlite3.Connection = Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT COUNT(*) FROM offers WHERE status='accepted' AND (from_id=? OR to_id=?)", (tg_id,tg_id))
    deals = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM offers WHERE from_id=? OR to_id=?", (tg_id,tg_id))
    total_offers = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM private_chats WHERE user1_id=? OR user2_id=?", (tg_id,tg_id))
    chats = c.fetchone()[0]
    c.execute("SELECT rating FROM users WHERE telegram_id=?", (tg_id,))
    r = c.fetchone()
    return {"deals": deals, "total_offers": total_offers, "chats": chats, "rating": r[0] if r else 5.0}

# ---- BUSINESS TARGETS ----

@app.post("/api/business-targets/{tg_id}")
def save_bt(tg_id: int, data: BusinessTargetModel, db: sqlite3.Connection = Depends(get_db)):
    db.execute("""INSERT OR REPLACE INTO business_targets
        (user_id,sector,ages,target_gender,location,interests,min_followers,max_budget,campaign_goal,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)""",
        (tg_id, data.sector, json.dumps(data.ages), data.target_gender,
         json.dumps(data.location), json.dumps(data.interests),
         data.min_followers, data.max_budget, data.campaign_goal))
    db.commit()
    return {"success": True}

@app.get("/api/business-targets/{tg_id}")
def get_bt(tg_id: int, db: sqlite3.Connection = Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM business_targets WHERE user_id=?", (tg_id,))
    row = c.fetchone()
    if not row: raise HTTPException(404, "Topilmadi")
    d = dict(row)
    d["ages"] = jl(d["ages"])
    d["interests"] = jl(d["interests"])
    d["location"] = jl(d["location"])
    return d

# ---- REKLAMACHI PROFILES ----

@app.post("/api/reklamachi-profiles/{tg_id}")
def save_rp(tg_id: int, data: ReklamachiProfileModel, db: sqlite3.Connection = Depends(get_db)):
    db.execute("""INSERT OR REPLACE INTO reklamachi_profiles
        (user_id,platform,username,profile_link,followers,engagement,
         price_post,price_story,price_video,audience_ages,audience_gender,
         audience_location,interests,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)""",
        (tg_id, data.platform, data.username, data.profile_link,
         data.followers, data.engagement, data.price_post, data.price_story,
         data.price_video, json.dumps(data.audience_ages), data.audience_gender,
         data.audience_location, json.dumps(data.interests)))
    db.commit()
    return {"success": True}

@app.get("/api/reklamachi-profiles/{tg_id}")
def get_rp(tg_id: int, db: sqlite3.Connection = Depends(get_db)):
    c = db.cursor()
    c.execute("""SELECT rp.*, u.full_name, u.rating, u.is_premium
        FROM reklamachi_profiles rp
        JOIN users u ON u.telegram_id=rp.user_id
        WHERE rp.user_id=?""", (tg_id,))
    row = c.fetchone()
    if not row: raise HTTPException(404, "Topilmadi")
    d = dict(row)
    d["audience_ages"] = jl(d["audience_ages"])
    d["interests"] = jl(d["interests"])
    return d

# ---- MATCHING ----

@app.get("/api/match/{tg_id}")
def get_matches(tg_id: int, db: sqlite3.Connection = Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT role FROM users WHERE telegram_id=?", (tg_id,))
    u = c.fetchone()
    if not u: raise HTTPException(404, "Topilmadi")
    role = u[0]
    results = []

    if role == "tadbirkor":
        c.execute("SELECT * FROM business_targets WHERE user_id=?", (tg_id,))
        bt_row = c.fetchone()
        if not bt_row: return []
        target = dict(bt_row)
        target["ages"] = jl(target["ages"])
        target["interests"] = jl(target["interests"])
        target["location"] = jl(target["location"])

        c.execute("""SELECT rp.*, u.full_name, u.rating, u.is_premium, u.telegram_id as uid
            FROM reklamachi_profiles rp
            JOIN users u ON u.telegram_id=rp.user_id
            WHERE u.is_active=1 AND u.is_blocked=0 AND u.telegram_id!=?""", (tg_id,))
        for row in c.fetchall():
            rek = dict(row)
            rek["audience_ages"] = jl(rek["audience_ages"])
            rek["interests"] = jl(rek["interests"])
            score = calculate_match_score(target, rek)
            if score >= 25:
                results.append({**rek, "match_score": score})

    elif role == "reklamachi":
        c.execute("SELECT * FROM reklamachi_profiles WHERE user_id=?", (tg_id,))
        rp_row = c.fetchone()
        if not rp_row: return []
        rek = dict(rp_row)
        rek["audience_ages"] = jl(rek["audience_ages"])
        rek["interests"] = jl(rek["interests"])

        c.execute("""SELECT bt.*, u.full_name, u.rating, u.is_premium, u.telegram_id as uid
            FROM business_targets bt
            JOIN users u ON u.telegram_id=bt.user_id
            WHERE u.is_active=1 AND u.is_blocked=0 AND u.telegram_id!=?""", (tg_id,))
        for row in c.fetchall():
            target = dict(row)
            target["ages"] = jl(target["ages"])
            target["interests"] = jl(target["interests"])
            target["location"] = jl(target["location"])
            score = calculate_match_score(target, rek)
            if score >= 25:
                results.append({**target, "match_score": score})

    results.sort(key=lambda x: (x.get("is_premium",0), x["match_score"]), reverse=True)
    return results[:30]

# ---- OFFERS ----

@app.post("/api/offers")
def create_offer(data: OfferCreate, db: sqlite3.Connection = Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT id FROM offers WHERE from_id=? AND to_id=? AND status='pending'", (data.from_id, data.to_id))
    if c.fetchone(): raise HTTPException(400, "Allaqachon taklif yuborilgan")
    c.execute("INSERT INTO offers(from_id,to_id,message) VALUES(?,?,?)",
              (data.from_id, data.to_id, data.message))
    db.commit()
    offer_id = c.lastrowid
    # Bildirishnoma
    c.execute("SELECT full_name FROM users WHERE telegram_id=?", (data.from_id,))
    sender = c.fetchone()
    name = sender[0] if sender else "Kimdir"
    add_notification(db, data.to_id, "📩 Yangi taklif!", f"{name} sizga hamkorlik taklif qildi", "offer", offer_id)
    return {"success": True, "offer_id": offer_id}

@app.get("/api/offers/{tg_id}")
def get_offers(tg_id: int, db: sqlite3.Connection = Depends(get_db)):
    c = db.cursor()
    c.execute("""SELECT o.*, u1.full_name as from_name, u2.full_name as to_name,
        u1.rating as from_rating, u2.rating as to_rating
        FROM offers o
        LEFT JOIN users u1 ON u1.telegram_id=o.from_id
        LEFT JOIN users u2 ON u2.telegram_id=o.to_id
        WHERE o.from_id=? OR o.to_id=?
        ORDER BY o.created_at DESC""", (tg_id, tg_id))
    return [dict(r) for r in c.fetchall()]

@app.put("/api/offers/{offer_id}/status")
def update_offer_status(offer_id: int, status: str = Query(...), db: sqlite3.Connection = Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT from_id, to_id FROM offers WHERE id=?", (offer_id,))
    offer = c.fetchone()
    if not offer: raise HTTPException(404, "Taklif topilmadi")

    db.execute("UPDATE offers SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?", (status, offer_id))
    db.commit()

    if status == "accepted":
        try:
            db.execute("INSERT OR IGNORE INTO private_chats(user1_id,user2_id,offer_id) VALUES(?,?,?)",
                       (offer[0], offer[1], offer_id))
            db.commit()
        except: pass
        # Bildirishnoma
        c.execute("SELECT full_name FROM users WHERE telegram_id=?", (offer[1],))
        name_row = c.fetchone()
        name = name_row[0] if name_row else "Kimdir"
        add_notification(db, offer[0], "✅ Taklif qabul qilindi!", f"{name} taklifingizni qabul qildi", "offer", offer_id)
    elif status == "rejected":
        c.execute("SELECT full_name FROM users WHERE telegram_id=?", (offer[1],))
        name_row = c.fetchone()
        name = name_row[0] if name_row else "Kimdir"
        add_notification(db, offer[0], "❌ Taklif rad etildi", f"{name} taklifingizni rad etdi", "offer", offer_id)

    return {"success": True}

@app.post("/api/offers/{offer_id}/rate")
def rate_offer(offer_id: int, data: RatingModel, db: sqlite3.Connection = Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT to_id FROM offers WHERE id=?", (offer_id,))
    row = c.fetchone()
    if not row: raise HTTPException(404, "Topilmadi")
    db.execute("UPDATE offers SET rating=?, rated=1 WHERE id=?", (data.rating, offer_id))
    db.execute("""UPDATE users SET
        rating=(rating*rating_count+?)/(rating_count+1),
        rating_count=rating_count+1
        WHERE telegram_id=?""", (data.rating, row[0]))
    db.commit()
    return {"success": True}

# ---- CHATS ----

@app.get("/api/chats/{tg_id}")
def get_chats(tg_id: int, db: sqlite3.Connection = Depends(get_db)):
    c = db.cursor()
    c.execute("""SELECT c.*, u1.full_name as u1name, u2.full_name as u2name,
        (SELECT COUNT(*) FROM messages WHERE chat_id=c.id AND receiver_id=? AND is_read=0) as unread
        FROM private_chats c
        JOIN users u1 ON u1.telegram_id=c.user1_id
        JOIN users u2 ON u2.telegram_id=c.user2_id
        WHERE (c.user1_id=? OR c.user2_id=?) AND c.status='active'
        ORDER BY c.updated_at DESC""", (tg_id, tg_id, tg_id))
    chats = []
    for row in c.fetchall():
        ch = dict(row)
        ch["partner_id"] = ch["user2_id"] if ch["user1_id"]==tg_id else ch["user1_id"]
        ch["partner_name"] = ch["u2name"] if ch["user1_id"]==tg_id else ch["u1name"]
        chats.append(ch)
    return chats

@app.get("/api/chats/{chat_id}/messages")
def get_messages(chat_id: int, limit: int = 50, db: sqlite3.Connection = Depends(get_db)):
    c = db.cursor()
    c.execute("""SELECT m.*, u.full_name as sender_name
        FROM messages m JOIN users u ON u.telegram_id=m.sender_id
        WHERE m.chat_id=? ORDER BY m.created_at ASC LIMIT ?""", (chat_id, limit))
    return [dict(r) for r in c.fetchall()]

@app.post("/api/messages")
def send_message(data: MessageCreate, db: sqlite3.Connection = Depends(get_db)):
    c = db.cursor()
    c.execute("INSERT INTO messages(chat_id,sender_id,receiver_id,message_text) VALUES(?,?,?,?)",
              (data.chat_id, data.sender_id, data.receiver_id, data.message_text))
    db.execute("""UPDATE private_chats SET last_message=?, last_message_time=CURRENT_TIMESTAMP,
        updated_at=CURRENT_TIMESTAMP WHERE id=?""", (data.message_text[:60], data.chat_id))
    db.commit()
    msg_id = c.lastrowid
    # Bildirishnoma
    c.execute("SELECT full_name FROM users WHERE telegram_id=?", (data.sender_id,))
    sname = c.fetchone()
    if sname:
        add_notification(db, data.receiver_id, f"💬 {sname[0]}", data.message_text[:60], "message", data.chat_id)
    return {"success": True, "message_id": msg_id}

@app.put("/api/chats/{chat_id}/read")
def mark_read(chat_id: int, tg_id: int = Query(...), db: sqlite3.Connection = Depends(get_db)):
    db.execute("UPDATE messages SET is_read=1 WHERE chat_id=? AND receiver_id=? AND is_read=0", (chat_id, tg_id))
    db.commit()
    return {"success": True}

# ---- NOTIFICATIONS ----

@app.get("/api/notifications/{tg_id}")
def get_notifications(tg_id: int, db: sqlite3.Connection = Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 30", (tg_id,))
    return [dict(r) for r in c.fetchall()]

@app.put("/api/notifications/{tg_id}/read")
def read_notifications(tg_id: int, db: sqlite3.Connection = Depends(get_db)):
    db.execute("UPDATE notifications SET is_read=1 WHERE user_id=?", (tg_id,))
    db.commit()
    return {"success": True}

@app.get("/api/notifications/{tg_id}/count")
def notif_count(tg_id: int, db: sqlite3.Connection = Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT COUNT(*) FROM notifications WHERE user_id=? AND is_read=0", (tg_id,))
    return {"count": c.fetchone()[0]}

# ---- ADMIN ----

@app.get("/api/admin/stats")
def admin_stats(admin_id: int = Query(...), db: sqlite3.Connection = Depends(get_db)):
    if admin_id not in ADMIN_IDS: raise HTTPException(403, "Ruxsat yo'q")
    c = db.cursor()
    def q(sql, *args):
        c.execute(sql, args)
        return c.fetchone()[0]
    return {
        "total_users":     q("SELECT COUNT(*) FROM users"),
        "tadbirkorlar":    q("SELECT COUNT(*) FROM users WHERE role='tadbirkor'"),
        "reklamachilar":   q("SELECT COUNT(*) FROM users WHERE role='reklamachi'"),
        "premium":         q("SELECT COUNT(*) FROM users WHERE is_premium=1"),
        "blocked":         q("SELECT COUNT(*) FROM users WHERE is_blocked=1"),
        "total_offers":    q("SELECT COUNT(*) FROM offers"),
        "accepted_offers": q("SELECT COUNT(*) FROM offers WHERE status='accepted'"),
        "active_chats":    q("SELECT COUNT(*) FROM private_chats WHERE status='active'"),
        "total_messages":  q("SELECT COUNT(*) FROM messages"),
    }

@app.get("/api/admin/users")
def admin_users(admin_id: int = Query(...), page: int = 1, db: sqlite3.Connection = Depends(get_db)):
    if admin_id not in ADMIN_IDS: raise HTTPException(403, "Ruxsat yo'q")
    c = db.cursor()
    offset = (page-1)*20
    c.execute("SELECT * FROM users ORDER BY created_at DESC LIMIT 20 OFFSET ?", (offset,))
    return [dict(r) for r in c.fetchall()]

@app.put("/api/admin/users/{tg_id}/premium")
def admin_premium(tg_id: int, admin_id: int = Query(...), value: int = Query(1), db: sqlite3.Connection = Depends(get_db)):
    if admin_id not in ADMIN_IDS: raise HTTPException(403, "Ruxsat yo'q")
    db.execute("UPDATE users SET is_premium=? WHERE telegram_id=?", (value, tg_id))
    db.commit()
    return {"success": True}

@app.put("/api/admin/users/{tg_id}/block")
def admin_block(tg_id: int, admin_id: int = Query(...), reason: str = Query(""), db: sqlite3.Connection = Depends(get_db)):
    if admin_id not in ADMIN_IDS: raise HTTPException(403, "Ruxsat yo'q")
    db.execute("UPDATE users SET is_blocked=1, block_reason=? WHERE telegram_id=?", (reason, tg_id))
    db.commit()
    return {"success": True}

@app.put("/api/admin/users/{tg_id}/unblock")
def admin_unblock(tg_id: int, admin_id: int = Query(...), db: sqlite3.Connection = Depends(get_db)):
    if admin_id not in ADMIN_IDS: raise HTTPException(403, "Ruxsat yo'q")
    db.execute("UPDATE users SET is_blocked=0, block_reason='' WHERE telegram_id=?", (tg_id,))
    db.commit()
    return {"success": True}

@app.get("/api/admin/verify-queue")
def verify_queue(admin_id: int = Query(...), db: sqlite3.Connection = Depends(get_db)):
    if admin_id not in ADMIN_IDS: raise HTTPException(403, "Ruxsat yo'q")
    c = db.cursor()
    c.execute("""SELECT rp.*, u.full_name, u.rating FROM reklamachi_profiles rp
        JOIN users u ON u.telegram_id=rp.user_id WHERE rp.verified=0 ORDER BY rp.created_at ASC""")
    res = []
    for row in c.fetchall():
        d = dict(row)
        d["audience_ages"] = jl(d["audience_ages"])
        d["interests"] = jl(d["interests"])
        res.append(d)
    return res

@app.put("/api/admin/verify/{tg_id}")
def admin_verify(tg_id: int, admin_id: int = Query(...), value: int = Query(1), db: sqlite3.Connection = Depends(get_db)):
    if admin_id not in ADMIN_IDS: raise HTTPException(403, "Ruxsat yo'q")
    db.execute("UPDATE reklamachi_profiles SET verified=? WHERE user_id=?", (value, tg_id))
    db.commit()
    if value==1:
        add_notification(db, tg_id, "✅ Profil tasdiqlandi!", "Profilingiz admin tomonidan tasdiqlandi", "info")
    return {"success": True}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
