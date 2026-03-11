# 🏆 MIDAS — Advertising & Marketing Collaboration Platform

> O'zbekistondagi birinchi professional reklama hamkorlik platformasi

---

## 📁 Loyiha Strukturasi

```
midas/
├── backend/          # FastAPI + PostgreSQL API
│   ├── app/
│   │   ├── api/v1/endpoints/   # Route handlerlar
│   │   ├── core/               # Config, Security
│   │   ├── db/                 # Database connection
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   └── services/           # Business logic
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/         # React + Vite Web App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/      # Zustand
│   │   ├── utils/      # API client
│   │   ├── i18n/       # uz/ru/en translations
│   │   └── styles/
│   └── package.json
│
├── miniapp/          # Telegram Mini App (mobile-first)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── utils/
│   └── package.json
│
├── bot/              # Telegram Bot (aiogram 3)
│   ├── handlers/
│   ├── middlewares/
│   ├── utils/notify.py  # Push notification sender
│   └── main.py
│
├── nginx/            # Reverse proxy config
├── docker-compose.yml
└── README.md
```

---

## ⚙️ O'rnatish

### 1. Backend

```bash
cd backend
cp .env.example .env
# .env faylini to'ldiring

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (Web App)

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

### 3. Mini App (Telegram)

```bash
cd miniapp
npm install
npm run dev
# http://localhost:5174
```

### 4. Telegram Bot

```bash
cd bot
pip install aiogram python-dotenv
python main.py
```

### 5. Docker (barcha xizmatlar)

```bash
# .env faylini to'ldiring
cp backend/.env.example backend/.env

docker-compose up -d
```

---

## 🔑 Muhit O'zgaruvchilari

```env
TELEGRAM_BOT_TOKEN=your_token_from_botfather
TELEGRAM_MINI_APP_URL=https://t.me/YourBotUsername/app
DATABASE_URL=postgresql+asyncpg://midas:midas123@localhost:5432/midas_db
JWT_SECRET=change-this-secret
CLICK_MERCHANT_ID=your_click_id
CLICK_SERVICE_ID=your_click_service_id
CLICK_SECRET_KEY=your_click_secret
PAYME_MERCHANT_ID=your_payme_id
PAYME_SECRET_KEY=your_payme_secret
```

---

## 📡 API Endpointlar

| Endpoint | Tavsif |
|----------|--------|
| `POST /api/v1/auth/telegram` | Telegram orqali login |
| `GET /api/v1/listings/` | E'lonlar ro'yxati |
| `POST /api/v1/listings/` | Yangi e'lon yaratish |
| `GET /api/v1/listings/featured` | Tanlangan e'lonlar |
| `GET /api/v1/campaigns/` | Kampaniyalar ro'yxati |
| `POST /api/v1/campaigns/` | Kampaniya yaratish |
| `POST /api/v1/campaigns/{id}/proposals` | Taklif yuborish |
| `GET /api/v1/chat/conversations` | Suhbatlar |
| `POST /api/v1/chat/conversations/{id}/messages` | Xabar yuborish |
| `GET /api/v1/deals/` | Bitimlar |
| `POST /api/v1/payments/initiate` | To'lov boshlash |
| `POST /api/v1/payments/click/webhook` | Click webhook |
| `POST /api/v1/payments/payme/webhook` | Payme webhook |

API dokumentatsiyasi: `http://localhost:8000/docs`

---

## 💳 To'lov Integratsiyasi

### Click
1. [merchant.click.uz](https://merchant.click.uz) da hisob yarating
2. Merchant ID va Service ID oling
3. Webhook URL: `https://midas.uz/api/v1/payments/click/webhook`

### Payme
1. [merchant.paycom.uz](https://merchant.paycom.uz) da hisob yarating
2. Merchant ID va Secret Key oling  
3. Webhook URL: `https://midas.uz/api/v1/payments/payme/webhook`

---

## 🤖 Telegram Bot Sozlash

1. [@BotFather](https://t.me/BotFather) orqali bot yarating
2. Token oling
3. Mini App uchun: `/newapp` buyrug'ini yuboring
4. Mini App URL: `https://app.midas.uz`

---

## 🏗️ Texnologiyalar

| Qatlam | Texnologiya |
|--------|-------------|
| Backend | FastAPI, SQLAlchemy, asyncpg |
| Database | PostgreSQL 16 |
| Frontend | React 18, Vite, TailwindCSS |
| Mini App | React + Telegram WebApp SDK |
| Bot | aiogram 3.x |
| State | Zustand |
| Data Fetching | TanStack Query |
| i18n | i18next (uz/ru/en) |
| Animations | Framer Motion |
| Deploy | Docker + Nginx |
| Payments | Click, Payme |

---

## 📊 Database Schema

Asosiy jadvallar:
- `users` — Foydalanuvchilar (Telegram auth)
- `user_profiles` — Rol-based profillar
- `listings` — Reklama joylari va xizmatlar
- `campaigns` — Kampaniya briflari
- `campaign_proposals` — Taklif/application
- `conversations` — Chat suhbatlar
- `messages` — Xabarlar
- `deals` — Bitimlar (lead → completed)
- `payments` — Click/Payme to'lovlar
- `reviews` — Baho va sharhlar
- `notifications` — Bildirishnomalar
- `favorites` — Saqlangan e'lonlar
- `packages` — Xizmat paketlari

---

## 🚀 Roadmap

### MVP (Hozir)
- [x] Telegram auth
- [x] Listings marketplace
- [x] Campaign briefs
- [x] Chat system
- [x] Deal flow
- [x] Click/Payme integration
- [x] Telegram Bot
- [x] Mini App
- [x] Ko'p tilli (uz/ru/en)

### V2
- [ ] Advanced analytics dashboard
- [ ] Campaign collaboration (team-up)
- [ ] AI matching system
- [ ] Outdoor verification system
- [ ] Escrow payment system
- [ ] Mobile app (React Native)

### V3
- [ ] YouTube creator integration
- [ ] Auto-analytics from channels
- [ ] Marketing packages marketplace
- [ ] API for agencies

---

## 📞 Support

- Telegram: @MidasUzSupport
- Email: hello@midas.uz
