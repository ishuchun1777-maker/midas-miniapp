# MIDAS — Render.com ga Deploy qilish yo'riqnomasi

## 1. Render.com da servislar

### A. Backend (midas-backend)
- **Type:** Web Service
- **Root Directory:** `backend`
- **Build:** `pip install -r requirements.txt`
- **Start:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables:**
  ```
  TELEGRAM_BOT_TOKEN = <botdan olingan token>
  JWT_SECRET         = <random uzun matn>
  SECRET_KEY         = <boshqa random matn>
  DATABASE_URL       = sqlite+aiosqlite:///./midas.db
  TELEGRAM_MINI_APP_URL = https://t.me/YourBotName/app
  ```

### B. Miniapp (midas-miniapp) — ASOSIY
- **Type:** Static Site
- **Root Directory:** `miniapp`
- **Build:** `npm install && npm run build`
- **Publish Dir:** `dist`
- **Environment Variables:**
  ```
  VITE_API_URL = https://midas-backend.onrender.com/api/v1
  ```

### C. Frontend (midas-frontend) — ixtiyoriy
- **Type:** Static Site
- **Root Directory:** `frontend`
- **Build:** `npm install && npm run build`
- **Publish Dir:** `dist`
- **Environment Variables:**
  ```
  VITE_API_URL = https://midas-backend.onrender.com/api/v1
  ```

## 2. BotFather sozlamalari

1. `/mybots` → botni tanlang → `Bot Settings` → `Menu Button` → `Configure menu button`
2. URL: `https://midas-miniapp.onrender.com`
3. `/newapp` → Mini App yarating → URL: `https://midas-miniapp.onrender.com`

## 3. Backend CORS sozlamalari (.env)

Deploy qilgandan keyin backend `.env` ga qo'shing:
```
ALLOWED_ORIGINS=["https://midas-miniapp.onrender.com","https://t.me","http://localhost:5174"]
```

## 4. Tuzatilgan xatolar

| # | Xato | Joyi | Tuzatish |
|---|------|------|----------|
| 1 | **ASOSIY** URL-encoded `initData` JSON parse xatosi | `security.py` | `unquote()` qo'shildi |
| 2 | `isAuthenticated` bo'lsa auth skip — token expire muammosi | `App.tsx` | Har doim fresh auth |
| 3 | 401 da `/login` redirect — miniapp'da login page yo'q | `api.ts` | `reload()` ga o'zgartirildi |
| 4 | `BrowserRouter` — static hosting'da 404 | `App.tsx` | `HashRouter` ga o'zgartirildi |
| 5 | CORS `"*"` + `credentials=True` — browser bloki | `config.py` | `"*"` olib tashlandi |
| 6 | `render.yaml` bot alohida service — `bot/` papkasi yo'q | `render.yaml` | Bot backend ichida ishlaydi |
| 7 | `notifications` router import'da lekin qo'shilmagan | `main.py` | Router qo'shildi |
| 8 | `aiohttp` requirements'da yo'q | `requirements.txt` | Qo'shildi |
