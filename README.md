# 🌟 MIDAS Mini App — To'liq Qo'llanma

## Loyiha tuzilmasi
```
midas/
├── backend/
│   ├── main.py              ← FastAPI server
│   └── requirements.txt
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── App.jsx          ← Butun React ilovasi
│   │   └── index.js
│   ├── package.json
│   └── .env.example
├── render.yaml              ← Render.com deploy config
└── README.md
```

---

## ✅ 1-QADAM: GitHub ga yuklash

### GitHub account yo'q bo'lsa:
1. https://github.com → "Sign up"
2. Bepul account yarating

### Yangi repository yaratish:
1. GitHub ga kiring → "New repository"
2. Nom: `midas-miniapp`
3. "Create repository"

### Fayllarni yuklash:
```bash
# Terminal/cmd da (loyiha papkasida):
git init
git add .
git commit -m "MIDAS Mini App v2"
git remote add origin https://github.com/USERNAME/midas-miniapp.git
git push -u origin main
```

**Yoki drag-and-drop:** GitHub repository sahifasida fayllarni to'g'ridan tortib tashlang.

---

## 🚀 2-QADAM: Render.com ga Backend Deploy

### Render account:
1. https://render.com → "Get Started for Free"
2. GitHub bilan kiring

### Backend deploy:
1. **Dashboard** → "New +" → "Web Service"
2. GitHub repository ni tanlang (`midas-miniapp`)
3. Sozlamalar:
   - **Name:** `midas-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables** bo'limida:
   ```
   BOT_TOKEN   = 1234567890:ABCdef...  (botingiz tokeni)
   ADMIN_IDS   = 123456789             (sizning Telegram ID)
   DB_PATH     = /opt/render/project/src/midas.db
   ```
5. **Disk** bo'limida:
   - "Add Disk" → Name: `midas-db`, Mount: `/opt/render/project/src`, Size: `1 GB`
6. "Create Web Service" ✅

**Backend URL olasiz:** `https://midas-backend.onrender.com`

> ⚠️ Tekin plan: 15 daqiqa faoliyat bo'lmasa "uyquga ketadi", birinchi so'rov 30-60 soniya kuta.

---

## 🌐 3-QADAM: Render.com ga Frontend Deploy

1. **Dashboard** → "New +" → "Static Site"
2. GitHub repository ni tanlang
3. Sozlamalar:
   - **Name:** `midas-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
4. **Environment Variables:**
   ```
   REACT_APP_API_URL    = https://midas-backend.onrender.com
   REACT_APP_ADMIN_IDS  = 123456789
   ```
5. "Create Static Site" ✅

**Frontend URL olasiz:** `https://midas-frontend.onrender.com`

---

## 🤖 4-QADAM: Telegram Bot ga Mini App Ulash

`bot.py` faylida `on_startup()` funksiyasiga qo'shing:

```python
from aiogram.types import MenuButtonWebApp, WebAppInfo

async def on_startup():
    # ... mavjud kod ...
    
    # Mini App tugmasi qo'shish
    try:
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(
                text="🌐 Mini App",
                web_app=WebAppInfo(url="https://midas-frontend.onrender.com")
            )
        )
        logger.info("✅ Mini App menu button o'rnatildi")
    except Exception as e:
        logger.error(f"Menu button xatolik: {e}")
```

Botni qayta ishga tushiring. Endi Telegram da bot menu tugmasida "🌐 Mini App" ko'rinadi.

---

## 🔧 5-QADAM: Bot va Backend bitta DB ishlatishi

Agar bot va backend bitta serverda bo'lsa, `DB_PATH` ni bir xil yo'lga ko'rsating:

**bot.py:**
```python
# Fayl boshida:
DB_PATH = os.getenv("DB_PATH", "midas.db")

class Database:
    def __init__(self):
        self.db_name = DB_PATH  # hardcoded "midas.db" o'rniga
```

**Render Environment Variables:**
```
DB_PATH = /opt/render/project/src/midas.db
```

> ⚠️ **Muhim:** Agar bot alohida serverda bo'lsa, bitta SQLite faylni share qilib bo'lmaydi. Bu holda:
> - Bot Telegram polling bilan ishlaydi (o'z serverida)
> - Mini App backend Render.com da ishlaydi (o'z DB bilan)
> - **Yechim:** Foydalanuvchi mini app da ham ro'yxatdan o'tadi (bot bilan sinxronizatsiya yo'q, lekin alohida to'liq ishlaydi)

---

## 📱 Mini App Funksiyalari

| Sahifa | Tavsif |
|--------|--------|
| 🎯 Match | AI orqali mos reklamachi/tadbirkor qidirish |
| 📨 Offers | Kelgan/yuborilgan takliflar, qabul/rad etish, baholash |
| 💬 Chats | Real-time xabar almashish (3 soniya polling) |
| 🔔 Notif | Bildirishnomalar (taklif, xabar, tasdiqlash) |
| 👤 Profil | Statistika, til tanlash (UZ/RU), profil tahrirlash |
| 🛡 Admin | Faqat adminlar uchun: statistika, foydalanuvchilar boshqaruvi, profil tasdiqlash |

---

## 🛠 Mahalliy Test (ixtiyoriy)

```bash
# Backend test
cd backend
pip install -r requirements.txt
BOT_TOKEN="test" python main.py
# http://localhost:8000 da ishlaydi

# Frontend test
cd frontend
npm install
# .env fayl yaratish:
echo "REACT_APP_API_URL=http://localhost:8000" > .env
echo "REACT_APP_ADMIN_IDS=99999" >> .env
npm start
# http://localhost:3000 da ishlaydi
```

> ⚠️ Telegram Mini App localhost da to'liq ishlamaydi (Telegram WebApp API yo'q),
> lekin oddiy brauzerda demo sifatida ko'rish mumkin.

---

## ❓ Ko'p Uchraydigan Muammolar

**Backend ishlamaydi:**
- Render loglarni tekshiring (Dashboard → Service → Logs)
- BOT_TOKEN to'g'ri kiritilganini tekshiring
- Disk mount qilinganini tekshiring

**Frontend API ga ulanmaydi:**
- `REACT_APP_API_URL` to'g'ri ekanini tekshiring (https:// bilan)
- Backend URL oxirida `/` bo'lmasin
- Render → Frontend → Environment Variables

**Mini App ochilmaydi:**
- Frontend URL https:// bo'lishi shart
- Bot da WebApp URL ni tekshiring

**"Foydalanuvchi topilmadi" xatosi:**
- Mini app da alohida ro'yxatdan o'tish kerak (bot bilan bitta DB bo'lmasa)

---

## 💰 Xarajatlar

| Xizmat | Narx |
|--------|------|
| Render Backend (Web Service) | **Bepul** (750 soat/oy) |
| Render Frontend (Static Site) | **Bepul** (cheksiz) |
| Render Disk (1GB) | **Bepul** |
| GitHub | **Bepul** |
| **JAMI** | **$0/oy** ✅ |

> Tekin plan cheklovi: Backend 15 daqiqa so'rov bo'lmasa uyquga ketadi.
> Katta traffic uchun $7/oy "Starter" planiga o'ting.
"# midas-miniapp" 
