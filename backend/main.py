"""
MIDAS Platform - Flask Backend
Python 3.14 da muammosiz ishlaydi
"""
import os
import json
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS

BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN")
DB_PATH = os.getenv("DB_PATH", "midas.db")
ADMIN_IDS_STR = os.getenv("ADMIN_IDS", "123456789")
ADMIN_IDS = [int(x.strip()) for x in ADMIN_IDS_STR.split(",") if x.strip()]

app = Flask(__name__)
CORS(app)

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

init_db()

def jl(val, default=None):
    if default is None:
        default = []
    try:
        return json.loads(val) if val else default
    except:
        return default

def ok(data=None):
    if data is None:
        return jsonify({"success": True})
    return jsonify(data)

def err(msg, code=400):
    return jsonify({"error": msg}), code

def add_notification(conn, user_id, title, body, ntype="info", ref_id=0):
    try:
        conn.execute(
            "INSERT INTO notifications(user_id,title,body,type,ref_id) VALUES(?,?,?,?,?)",
            (user_id, title, body, ntype, ref_id))
        conn.commit()
    except:
        pass

SECTOR_WEIGHTS = {
    "real_estate":            {"muhim":{"qiziqishlar":30,"hudud":25,"yosh":20},"orta":{"jins":15,"platforma":10},"kam":{"obunachilar":8,"aktivlik":5}},
    "construction_materials": {"muhim":{"qiziqishlar":30,"hudud":25,"yosh":20},"orta":{"jins":15,"platforma":10},"kam":{"obunachilar":5,"aktivlik":5}},
    "banking":                {"muhim":{"yosh":30,"qiziqishlar":24,"hudud":16},"orta":{"platforma":13,"jins":9},"kam":{"obunachilar":5,"aktivlik":3}},
    "education":              {"muhim":{"yosh":35,"qiziqishlar":28,"hudud":17},"orta":{"jins":12,"platforma":5},"kam":{"obunachilar":3}},
    "retail":                 {"muhim":{"yosh":30,"jins":25,"hudud":20},"orta":{"qiziqishlar":15,"platforma":7},"kam":{"obunachilar":5,"aktivlik":3}},
    "restaurant":             {"muhim":{"hudud":32,"yosh":24,"qiziqishlar":18},"orta":{"jins":12,"platforma":8},"kam":{"obunachilar":3,"aktivlik":3}},
    "medical":                {"muhim":{"yosh":28,"jins":22,"qiziqishlar":20},"orta":{"hudud":15,"platforma":8},"kam":{"obunachilar":4,"aktivlik":3}},
    "internet_services":      {"muhim":{"yosh":30,"qiziqishlar":26,"platforma":14},"orta":{"hudud":12,"jins":10},"kam":{"obunachilar":5,"aktivlik":3}},
}

def calc_score(target, rek):
    sector = target.get("sector","")
    weights = SECTOR_WEIGHTS.get(sector)
    score = 0

    tl = target.get("location",[])
    if isinstance(tl,str): tl=[tl]
    rl = rek.get("audience_location","all")
    def hudud_s(w): return w if ("all" in tl or rl in tl) else (w*0.7 if rl=="all" else w*0.2)

    ta=set(target.get("ages",[])); ra=set(rek.get("audience_ages",[]))
    def yosh_s(w):
        if not ta or not ra: return 0
        c=ta&ra; return w*len(c)/len(ta) if c else 0

    tg=target.get("target_gender","all"); rg=rek.get("audience_gender","all")
    def jins_s(w): return w if (tg=="all" or tg==rg) else (w*0.6 if rg=="all" else 0)

    ti=set(target.get("interests",[])); ri=set(rek.get("interests",[]))
    def qiziq_s(w):
        if not ti or not ri: return 0
        c=ti&ri; return w*len(c)/len(ti) if c else 0

    ranks={"instagram":1.0,"telegram_channel":0.9,"youtube":0.85,"telegram_bot":0.7,"mobile_app":0.6,"offline":0.5}
    def plat_s(w): return w*ranks.get(rek.get("platform",""),0.4)

    f=rek.get("followers",0)
    def obun_s(w):
        if f>=100000: return w
        if f>=50000: return w*0.9
        if f>=20000: return w*0.8
        if f>=10000: return w*0.7
        if f>=5000: return w*0.6
        if f>=1000: return w*0.5
        return w*0.3

    e=rek.get("engagement",0)
    def aktiv_s(w): return w if e>=7 else (w*0.9 if e>=5 else (w*0.7 if e>=3 else w*0.3))
    def reyt_s(w): return w*(rek.get("rating",5.0)/5.0)

    fns={"hudud":hudud_s,"yosh":yosh_s,"jins":jins_s,"qiziqishlar":qiziq_s,
         "platforma":plat_s,"obunachilar":obun_s,"aktivlik":aktiv_s,"reyting":reyt_s}

    if weights:
        for level in ["muhim","orta","kam"]:
            for omil,mw in weights.get(level,{}).items():
                fn=fns.get(omil)
                if fn: score+=fn(mw)
    else:
        score += yosh_s(20)+jins_s(15)+hudud_s(15)+qiziq_s(20)+obun_s(15)

    r=rek.get("rating",5.0)
    if r>=4.9: score+=8
    elif r>=4.5: score+=4
    return min(int(score),100)

@app.route("/")
def root(): return ok({"status":"ok","app":"MIDAS API v2.0"})

@app.route("/health")
def health(): return ok({"status":"healthy"})

@app.route("/api/users/register", methods=["POST"])
def register():
    d=request.json; conn=get_conn()
    conn.execute("INSERT OR REPLACE INTO users(telegram_id,username,full_name,role,phone,lang) VALUES(?,?,?,?,?,?)",
        (d["telegram_id"],d.get("username"),d["full_name"],d["role"],d.get("phone"),d.get("lang","uz")))
    conn.commit(); conn.close(); return ok()

@app.route("/api/users/<int:tg_id>")
def get_user(tg_id):
    conn=get_conn()
    row=conn.execute("SELECT * FROM users WHERE telegram_id=?",(tg_id,)).fetchone()
    conn.close()
    if not row: return err("Topilmadi",404)
    return ok(dict(row))

@app.route("/api/users/<int:tg_id>/lang", methods=["PUT"])
def set_lang(tg_id):
    lang=request.args.get("lang","uz"); conn=get_conn()
    conn.execute("UPDATE users SET lang=? WHERE telegram_id=?",(lang,tg_id))
    conn.commit(); conn.close(); return ok()

@app.route("/api/users/<int:tg_id>/stats")
def user_stats(tg_id):
    conn=get_conn()
    def q(sql,*args): return conn.execute(sql,args).fetchone()[0]
    data={"deals":q("SELECT COUNT(*) FROM offers WHERE status='accepted' AND (from_id=? OR to_id=?)",tg_id,tg_id),
          "total_offers":q("SELECT COUNT(*) FROM offers WHERE from_id=? OR to_id=?",tg_id,tg_id),
          "chats":q("SELECT COUNT(*) FROM private_chats WHERE user1_id=? OR user2_id=?",tg_id,tg_id)}
    r=conn.execute("SELECT rating FROM users WHERE telegram_id=?",(tg_id,)).fetchone()
    data["rating"]=r[0] if r else 5.0; conn.close(); return ok(data)

@app.route("/api/business-targets/<int:tg_id>", methods=["POST"])
def save_bt(tg_id):
    d=request.json; conn=get_conn()
    conn.execute("INSERT OR REPLACE INTO business_targets(user_id,sector,ages,target_gender,location,interests,min_followers,max_budget,campaign_goal,updated_at) VALUES(?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)",
        (tg_id,d.get("sector",""),json.dumps(d.get("ages",[])),d.get("target_gender","all"),
         json.dumps(d.get("location",[])),json.dumps(d.get("interests",[])),
         d.get("min_followers",1000),d.get("max_budget",0),d.get("campaign_goal","")))
    conn.commit(); conn.close(); return ok()

@app.route("/api/business-targets/<int:tg_id>")
def get_bt(tg_id):
    conn=get_conn()
    row=conn.execute("SELECT * FROM business_targets WHERE user_id=?",(tg_id,)).fetchone()
    conn.close()
    if not row: return err("Topilmadi",404)
    d=dict(row); d["ages"]=jl(d["ages"]); d["interests"]=jl(d["interests"]); d["location"]=jl(d["location"])
    return ok(d)

@app.route("/api/reklamachi-profiles/<int:tg_id>", methods=["POST"])
def save_rp(tg_id):
    d=request.json; conn=get_conn()
    conn.execute("INSERT OR REPLACE INTO reklamachi_profiles(user_id,platform,username,profile_link,followers,engagement,price_post,price_story,price_video,audience_ages,audience_gender,audience_location,interests,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)",
        (tg_id,d.get("platform",""),d.get("username",""),d.get("profile_link",""),
         d.get("followers",0),d.get("engagement",0),d.get("price_post",0),d.get("price_story",0),
         d.get("price_video",0),json.dumps(d.get("audience_ages",[])),d.get("audience_gender","all"),
         d.get("audience_location","all"),json.dumps(d.get("interests",[]))))
    conn.commit(); conn.close(); return ok()

@app.route("/api/reklamachi-profiles/<int:tg_id>")
def get_rp(tg_id):
    conn=get_conn()
    row=conn.execute("SELECT rp.*,u.full_name,u.rating,u.is_premium FROM reklamachi_profiles rp JOIN users u ON u.telegram_id=rp.user_id WHERE rp.user_id=?",(tg_id,)).fetchone()
    conn.close()
    if not row: return err("Topilmadi",404)
    d=dict(row); d["audience_ages"]=jl(d["audience_ages"]); d["interests"]=jl(d["interests"]); return ok(d)

@app.route("/api/match/<int:tg_id>")
def get_matches(tg_id):
    conn=get_conn()
    u=conn.execute("SELECT role FROM users WHERE telegram_id=?",(tg_id,)).fetchone()
    if not u: conn.close(); return err("Topilmadi",404)
    role=u[0]; results=[]
    if role=="tadbirkor":
        bt=conn.execute("SELECT * FROM business_targets WHERE user_id=?",(tg_id,)).fetchone()
        if not bt: conn.close(); return ok([])
        target=dict(bt); target["ages"]=jl(target["ages"]); target["interests"]=jl(target["interests"]); target["location"]=jl(target["location"])
        rows=conn.execute("SELECT rp.*,u.full_name,u.rating,u.is_premium,u.telegram_id as uid FROM reklamachi_profiles rp JOIN users u ON u.telegram_id=rp.user_id WHERE u.is_active=1 AND u.is_blocked=0 AND u.telegram_id!=?",(tg_id,)).fetchall()
        for row in rows:
            rek=dict(row); rek["audience_ages"]=jl(rek["audience_ages"]); rek["interests"]=jl(rek["interests"])
            score=calc_score(target,rek)
            if score>=25: results.append({**rek,"match_score":score})
    elif role=="reklamachi":
        rp=conn.execute("SELECT * FROM reklamachi_profiles WHERE user_id=?",(tg_id,)).fetchone()
        if not rp: conn.close(); return ok([])
        rek=dict(rp); rek["audience_ages"]=jl(rek["audience_ages"]); rek["interests"]=jl(rek["interests"])
        rows=conn.execute("SELECT bt.*,u.full_name,u.rating,u.is_premium,u.telegram_id as uid FROM business_targets bt JOIN users u ON u.telegram_id=bt.user_id WHERE u.is_active=1 AND u.is_blocked=0 AND u.telegram_id!=?",(tg_id,)).fetchall()
        for row in rows:
            target=dict(row); target["ages"]=jl(target["ages"]); target["interests"]=jl(target["interests"]); target["location"]=jl(target["location"])
            score=calc_score(target,rek)
            if score>=25: results.append({**target,"match_score":score})
    conn.close()
    results.sort(key=lambda x:(x.get("is_premium",0),x["match_score"]),reverse=True)
    return ok(results[:30])

@app.route("/api/offers", methods=["POST"])
def create_offer():
    d=request.json; conn=get_conn()
    if conn.execute("SELECT id FROM offers WHERE from_id=? AND to_id=? AND status='pending'",(d["from_id"],d["to_id"])).fetchone():
        conn.close(); return err("Allaqachon taklif yuborilgan")
    conn.execute("INSERT INTO offers(from_id,to_id,message) VALUES(?,?,?)",(d["from_id"],d["to_id"],d.get("message")))
    conn.commit()
    offer_id=conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    sender=conn.execute("SELECT full_name FROM users WHERE telegram_id=?",(d["from_id"],)).fetchone()
    name=sender[0] if sender else "Kimdir"
    add_notification(conn,d["to_id"],"📩 Yangi taklif!",f"{name} sizga hamkorlik taklif qildi","offer",offer_id)
    conn.close(); return ok({"offer_id":offer_id})

@app.route("/api/offers/<int:tg_id>")
def get_offers(tg_id):
    conn=get_conn()
    rows=conn.execute("SELECT o.*,u1.full_name as from_name,u2.full_name as to_name,u1.rating as from_rating,u2.rating as to_rating FROM offers o LEFT JOIN users u1 ON u1.telegram_id=o.from_id LEFT JOIN users u2 ON u2.telegram_id=o.to_id WHERE o.from_id=? OR o.to_id=? ORDER BY o.created_at DESC",(tg_id,tg_id)).fetchall()
    conn.close(); return ok([dict(r) for r in rows])

@app.route("/api/offers/<int:offer_id>/status", methods=["PUT"])
def update_offer_status(offer_id):
    status=request.args.get("status"); conn=get_conn()
    offer=conn.execute("SELECT from_id,to_id FROM offers WHERE id=?",(offer_id,)).fetchone()
    if not offer: conn.close(); return err("Topilmadi",404)
    conn.execute("UPDATE offers SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",(status,offer_id))
    conn.commit()
    if status=="accepted":
        try: conn.execute("INSERT OR IGNORE INTO private_chats(user1_id,user2_id,offer_id) VALUES(?,?,?)",(offer[0],offer[1],offer_id)); conn.commit()
        except: pass
        n=conn.execute("SELECT full_name FROM users WHERE telegram_id=?",(offer[1],)).fetchone()
        add_notification(conn,offer[0],"✅ Taklif qabul qilindi!",f"{n[0] if n else 'Kimdir'} taklifingizni qabul qildi","offer",offer_id)
    elif status=="rejected":
        n=conn.execute("SELECT full_name FROM users WHERE telegram_id=?",(offer[1],)).fetchone()
        add_notification(conn,offer[0],"❌ Taklif rad etildi",f"{n[0] if n else 'Kimdir'} taklifingizni rad etdi","offer",offer_id)
    conn.close(); return ok()

@app.route("/api/offers/<int:offer_id>/rate", methods=["POST"])
def rate_offer(offer_id):
    d=request.json; conn=get_conn()
    row=conn.execute("SELECT to_id FROM offers WHERE id=?",(offer_id,)).fetchone()
    if not row: conn.close(); return err("Topilmadi",404)
    conn.execute("UPDATE offers SET rating=?,rated=1 WHERE id=?",(d["rating"],offer_id))
    conn.execute("UPDATE users SET rating=(rating*rating_count+?)/(rating_count+1),rating_count=rating_count+1 WHERE telegram_id=?",(d["rating"],row[0]))
    conn.commit(); conn.close(); return ok()

@app.route("/api/chats/<int:tg_id>")
def get_chats(tg_id):
    conn=get_conn()
    rows=conn.execute("SELECT c.*,u1.full_name as u1name,u2.full_name as u2name,(SELECT COUNT(*) FROM messages WHERE chat_id=c.id AND receiver_id=? AND is_read=0) as unread FROM private_chats c JOIN users u1 ON u1.telegram_id=c.user1_id JOIN users u2 ON u2.telegram_id=c.user2_id WHERE (c.user1_id=? OR c.user2_id=?) AND c.status='active' ORDER BY c.updated_at DESC",(tg_id,tg_id,tg_id)).fetchall()
    conn.close()
    chats=[]
    for row in rows:
        ch=dict(row)
        ch["partner_id"]=ch["user2_id"] if ch["user1_id"]==tg_id else ch["user1_id"]
        ch["partner_name"]=ch["u2name"] if ch["user1_id"]==tg_id else ch["u1name"]
        chats.append(ch)
    return ok(chats)

@app.route("/api/chats/<int:chat_id>/messages")
def get_messages(chat_id):
    limit=request.args.get("limit",50,type=int); conn=get_conn()
    rows=conn.execute("SELECT m.*,u.full_name as sender_name FROM messages m JOIN users u ON u.telegram_id=m.sender_id WHERE m.chat_id=? ORDER BY m.created_at ASC LIMIT ?",(chat_id,limit)).fetchall()
    conn.close(); return ok([dict(r) for r in rows])

@app.route("/api/messages", methods=["POST"])
def send_message():
    d=request.json; conn=get_conn()
    conn.execute("INSERT INTO messages(chat_id,sender_id,receiver_id,message_text) VALUES(?,?,?,?)",(d["chat_id"],d["sender_id"],d["receiver_id"],d["message_text"]))
    conn.execute("UPDATE private_chats SET last_message=?,last_message_time=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?",(d["message_text"][:60],d["chat_id"]))
    conn.commit()
    msg_id=conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    sname=conn.execute("SELECT full_name FROM users WHERE telegram_id=?",(d["sender_id"],)).fetchone()
    if sname: add_notification(conn,d["receiver_id"],f"💬 {sname[0]}",d["message_text"][:60],"message",d["chat_id"])
    conn.close(); return ok({"message_id":msg_id})

@app.route("/api/chats/<int:chat_id>/read", methods=["PUT"])
def mark_read(chat_id):
    tg_id=request.args.get("tg_id",type=int); conn=get_conn()
    conn.execute("UPDATE messages SET is_read=1 WHERE chat_id=? AND receiver_id=? AND is_read=0",(chat_id,tg_id))
    conn.commit(); conn.close(); return ok()

@app.route("/api/notifications/<int:tg_id>")
def get_notifications(tg_id):
    conn=get_conn()
    rows=conn.execute("SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 30",(tg_id,)).fetchall()
    conn.close(); return ok([dict(r) for r in rows])

@app.route("/api/notifications/<int:tg_id>/read", methods=["PUT"])
def read_notifications(tg_id):
    conn=get_conn()
    conn.execute("UPDATE notifications SET is_read=1 WHERE user_id=?",(tg_id,))
    conn.commit(); conn.close(); return ok()

@app.route("/api/notifications/<int:tg_id>/count")
def notif_count(tg_id):
    conn=get_conn()
    count=conn.execute("SELECT COUNT(*) FROM notifications WHERE user_id=? AND is_read=0",(tg_id,)).fetchone()[0]
    conn.close(); return ok({"count":count})

@app.route("/api/admin/stats")
def admin_stats():
    admin_id=request.args.get("admin_id",type=int)
    if admin_id not in ADMIN_IDS: return err("Ruxsat yo'q",403)
    conn=get_conn()
    def q(sql): return conn.execute(sql).fetchone()[0]
    data={"total_users":q("SELECT COUNT(*) FROM users"),"tadbirkorlar":q("SELECT COUNT(*) FROM users WHERE role='tadbirkor'"),
          "reklamachilar":q("SELECT COUNT(*) FROM users WHERE role='reklamachi'"),"premium":q("SELECT COUNT(*) FROM users WHERE is_premium=1"),
          "blocked":q("SELECT COUNT(*) FROM users WHERE is_blocked=1"),"total_offers":q("SELECT COUNT(*) FROM offers"),
          "accepted_offers":q("SELECT COUNT(*) FROM offers WHERE status='accepted'"),
          "active_chats":q("SELECT COUNT(*) FROM private_chats WHERE status='active'"),"total_messages":q("SELECT COUNT(*) FROM messages")}
    conn.close(); return ok(data)

@app.route("/api/admin/users")
def admin_users():
    admin_id=request.args.get("admin_id",type=int)
    if admin_id not in ADMIN_IDS: return err("Ruxsat yo'q",403)
    page=request.args.get("page",1,type=int); conn=get_conn()
    rows=conn.execute("SELECT * FROM users ORDER BY created_at DESC LIMIT 20 OFFSET ?",(((page-1)*20),)).fetchall()
    conn.close(); return ok([dict(r) for r in rows])

@app.route("/api/admin/users/<int:tg_id>/premium", methods=["PUT"])
def admin_premium(tg_id):
    admin_id=request.args.get("admin_id",type=int)
    if admin_id not in ADMIN_IDS: return err("Ruxsat yo'q",403)
    value=request.args.get("value",1,type=int); conn=get_conn()
    conn.execute("UPDATE users SET is_premium=? WHERE telegram_id=?",(value,tg_id))
    conn.commit(); conn.close(); return ok()

@app.route("/api/admin/users/<int:tg_id>/block", methods=["PUT"])
def admin_block(tg_id):
    admin_id=request.args.get("admin_id",type=int)
    if admin_id not in ADMIN_IDS: return err("Ruxsat yo'q",403)
    reason=request.args.get("reason",""); conn=get_conn()
    conn.execute("UPDATE users SET is_blocked=1,block_reason=? WHERE telegram_id=?",(reason,tg_id))
    conn.commit(); conn.close(); return ok()

@app.route("/api/admin/users/<int:tg_id>/unblock", methods=["PUT"])
def admin_unblock(tg_id):
    admin_id=request.args.get("admin_id",type=int)
    if admin_id not in ADMIN_IDS: return err("Ruxsat yo'q",403)
    conn=get_conn()
    conn.execute("UPDATE users SET is_blocked=0,block_reason='' WHERE telegram_id=?",(tg_id,))
    conn.commit(); conn.close(); return ok()

@app.route("/api/admin/verify-queue")
def verify_queue():
    admin_id=request.args.get("admin_id",type=int)
    if admin_id not in ADMIN_IDS: return err("Ruxsat yo'q",403)
    conn=get_conn()
    rows=conn.execute("SELECT rp.*,u.full_name,u.rating FROM reklamachi_profiles rp JOIN users u ON u.telegram_id=rp.user_id WHERE rp.verified=0 ORDER BY rp.created_at ASC").fetchall()
    conn.close()
    res=[]
    for row in rows:
        d=dict(row); d["audience_ages"]=jl(d["audience_ages"]); d["interests"]=jl(d["interests"]); res.append(d)
    return ok(res)

@app.route("/api/admin/verify/<int:tg_id>", methods=["PUT"])
def admin_verify(tg_id):
    admin_id=request.args.get("admin_id",type=int)
    if admin_id not in ADMIN_IDS: return err("Ruxsat yo'q",403)
    value=request.args.get("value",1,type=int); conn=get_conn()
    conn.execute("UPDATE reklamachi_profiles SET verified=? WHERE user_id=?",(value,tg_id))
    conn.commit()
    if value==1: add_notification(conn,tg_id,"✅ Profil tasdiqlandi!","Profilingiz admin tomonidan tasdiqlandi","info")
    conn.close(); return ok()

if __name__ == "__main__":
    port=int(os.getenv("PORT",8000))
    app.run(host="0.0.0.0",port=port,debug=False)
