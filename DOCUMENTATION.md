# MIDAS Marketplace Project Documentation

## 🚀 Proyekt haqida
MIDAS — reklama beruvchilar va platforma egalarini (Telegram kanallar, influencerlar va h.k.) bog'lovchi marketplace.

## 🛠 Texnologiyalar
- **Backend:** FastAPI (Python), SQLAlchemy, SQLite/PostgreSQL
- **Frontend:** React, Vite, TailwindCSS, Framer Motion
- **Bot:** Aiogram 3.x (Telegram Bot)
- **Mini App:** React-based Telegram Mini App

## 📂 Loyiha tuzilishi
- `backend/`: API va Bot mantiqi
- `frontend/`: Web Dashboard (Admin va oddiy foydalanuvchi)
- `miniapp/`: Telegram Mini App interfeysi
- `nginx/`: Reverse proxy sozlamalari

## 🔧 Sozlash (Local)
1. Backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
2. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 💳 To'lov tizimi
- **Click:** `POST /api/v1/payments/click/webhook` manzili orqali ishlaydi.
- **Payme:** `POST /api/v1/payments/payme/webhook` manzili orqali JSON-RPC 2.0 protokoli bilan ishlaydi.

## 🛡 Xavfsizlik
- Barcha backend so'rovlari JWT token orqali himoyalangan.
- Telegram Mini App ma'lumotlari (`initData`) har bir kirishda serverda `BOT_TOKEN` orqali tekshiriladi.

## 📊 Admin Dashboard
Admin panel `/admin` manzilida joylashgan bo'lib, quyidagilarni ta'minlaydi:
- Platforma statistikasi
- Foydalanuvchilarni tasdiqlash (Verification)
- Harakatlar tarixi
