// ═══════════════════════════════════════════════════════
// MIDAS V8 — AUTH: Onboarding · Legal · Ro'yxatdan o'tish
// Barcha 5 rol, ko'p qadam, soha→hudud alohida sahifalar
// ═══════════════════════════════════════════════════════
import { useState } from "react";
import { Btn, Inp, Modal, StepDots, TagCloud, MoneyInp } from "../core";
import { MidasLogo, MidasWordmark } from "../logo";
import { ROLES, SECTORS, REGIONS, PLATFORMS_ONLINE, PLATFORMS_OFFLINE, PLATFORMS_ALL, FOLLOWER_RANGES, AD_GOALS } from "../constants";
import { http, fmtMoney, parseMoney, L } from "../core";

const tg = window.Telegram?.WebApp;

// ── ONBOARDING SLAYDLARI ───────────────────────────────
const SLIDES = [
  {
    icon: null, isLogo: true,
    uz: { title: "MIDAS ga xush kelibsiz!", sub: "O'zbekistonning #1 reklama platformasi" },
    ru: { title: "Добро пожаловать в MIDAS!", sub: "Платформа рекламы №1 в Узбекистане" },
  },
  {
    icon: "🤝",
    uz: { title: "Aqlli matching", sub: "AI algoritm sizga eng mos hamkorni tanlaydi. 100 balllik tizim." },
    ru: { title: "Умный подбор", sub: "AI алгоритм подберёт вам лучшего партнёра. Система 100 баллов." },
  },
  {
    icon: "🛡",
    uz: { title: "Xavfsiz hamkorlik", sub: "Kafolat tizimi, ishonch skori va shaffof shartnomalar." },
    ru: { title: "Безопасное сотрудничество", sub: "Система гарантий, рейтинг доверия и прозрачные контракты." },
  },
  {
    icon: "📊",
    uz: { title: "Real analitika", sub: "Kampaniya natijalari, ROI kalkulyator va bozor trendlari." },
    ru: { title: "Реальная аналитика", sub: "Результаты кампаний, калькулятор ROI и рыночные тренды." },
  },
  {
    icon: "💰",
    uz: { title: "Daromadingizni oshiring", sub: "Tadbirkorlar va reklamachilarni birlashtirib savdoni o'stiring." },
    ru: { title: "Увеличьте доход", sub: "Соедините предпринимателей и рекламщиков, увеличьте продажи." },
  },
];

export function OnboardingPage({ onDone, lang }) {
  const [cur, setCur] = useState(0);
  const last = cur === SLIDES.length - 1;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: "radial-gradient(ellipse at top, #0F1A10 0%, #0D1117 45%, #0A0D14 100%)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Dekorativ fon */}
      <svg style={{ position: "absolute", inset: 0, opacity: 0.06 }} width="100%" height="100%">
        <defs>
          <radialGradient id="obg1" cx="30%" cy="20%" r="50%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="obg2" cx="80%" cy="80%" r="50%">
            <stop offset="0%" stopColor="#1B5E40" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx="30%" cy="20%" r="250" fill="url(#obg1)" />
        <circle cx="80%" cy="80%" r="200" fill="url(#obg2)" />
      </svg>

      {/* Slayd */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 32px 20px", textAlign: "center", zIndex: 1 }}>
        {SLIDES[cur].isLogo ? (
          <div style={{ marginBottom: 28 }}>
            <MidasLogo size={120} animated />
            <div style={{ marginTop: 20 }}>
              <MidasWordmark size="lg" />
            </div>
          </div>
        ) : (
          <div style={{
            width: 110, height: 110, borderRadius: 30,
            background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(27,94,64,0.2))",
            border: "1.5px solid rgba(212,175,55,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 52, marginBottom: 28,
            boxShadow: "0 0 30px rgba(212,175,55,0.15), 0 8px 32px rgba(0,0,0,0.4)",
          }}>
            {SLIDES[cur].icon}
          </div>
        )}

        <h1 style={{ fontWeight: 900, fontSize: 24, color: "#D4AF37", margin: "0 0 14px", lineHeight: 1.25, textShadow: "0 0 20px rgba(212,175,55,0.4)", letterSpacing: "0.02em" }}>
          {SLIDES[cur][lang]?.title}
        </h1>
        <p style={{ fontSize: 15, color: "#9E9E9E", margin: 0, lineHeight: 1.65, maxWidth: 300 }}>
          {SLIDES[cur][lang]?.sub}
        </p>
      </div>

      <div style={{ padding: "20px 32px 48px", zIndex: 1 }}>
        <StepDots cur={cur} total={SLIDES.length} />

        {last ? (
          <Btn onClick={onDone} full sz="xl" v="gold">
            {lang === "uz" ? "Boshlash →" : "Начать →"}
          </Btn>
        ) : (
          <div style={{ display: "flex", gap: 12 }}>
            <Btn onClick={onDone} v="glass" sz="lg" style={{ flex: 1, opacity: 0.6 }}>
              {lang === "uz" ? "O'tkazib yuborish" : "Пропустить"}
            </Btn>
            <Btn onClick={() => setCur(c => c + 1)} v="gold" sz="lg" style={{ flex: 2 }}>
              {lang === "uz" ? "Keyingi →" : "Далее →"}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ── LEGAL ─────────────────────────────────────────────
export function LegalPage({ onAgree, lang }) {
  const [checked, setChecked] = useState(false);
  const uz = lang !== "ru";

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "32px 20px 0", overflowY: "auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <MidasLogo size={60} />
          <h2 style={{ color: "#D4AF37", fontWeight: 900, fontSize: 20, margin: "12px 0 4px" }}>
            {uz ? "Foydalanish shartlari" : "Условия использования"}
          </h2>
        </div>

        {[
          { icon: "🔐", t: uz ? "Shaxsiy ma'lumotlar" : "Персональные данные", b: uz ? "Telegram ID, ism va kontakt ma'lumotlaringiz xavfsiz saqlanadi. Uchinchi shaxslarga berilmaydi." : "Ваши данные Telegram, имя и контактная информация хранятся безопасно и не передаются третьим лицам." },
          { icon: "🤝", t: uz ? "Hamkorlik shartlari" : "Условия сотрудничества", b: uz ? "Platformadagi barcha bitimlar o'zaro kelishuv asosida amalga oshiriladi. MIDAS vositachi sifatida xizmat qiladi." : "Все сделки на платформе осуществляются на взаимной договорённости. MIDAS выступает посредником." },
          { icon: "🛡", t: uz ? "Xavfsizlik" : "Безопасность", b: uz ? "Soxta profil, spam va firibgarlik uchun hisob bloklanadi. Admin tekshiruvi o'tkaziladi." : "За фейковый профиль, спам и мошенничество аккаунт блокируется. Проводится проверка администратором." },
          { icon: "💰", t: uz ? "To'lovlar" : "Платежи", b: uz ? "Premium obuna orqali qo'shimcha imkoniyatlardan foydalanasiz. To'lovlar qaytarilmaydi." : "Через Premium подписку вы получаете дополнительные возможности. Платежи не возвращаются." },
          { icon: "⚖️", t: uz ? "Mas'uliyat" : "Ответственность", b: uz ? "MIDAS foydalanuvchilar o'rtasidagi bitimlar uchun javobgar emas. O'zaro muomala qoidalari saqlaning." : "MIDAS не несёт ответственности за сделки между пользователями. Соблюдайте правила взаимодействия." },
        ].map((s, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.1)", borderRadius: 16, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ fontWeight: 700, color: "#D4AF37", fontSize: 13, marginBottom: 6 }}>{s.icon} {s.t}</div>
            <div style={{ fontSize: 12, color: "#9E9E9E", lineHeight: 1.6 }}>{s.b}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "20px 20px 48px", borderTop: "1px solid rgba(212,175,55,0.1)" }}>
        <button onClick={() => setChecked(c => !c)} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "none", border: "none", cursor: "pointer", marginBottom: 16, textAlign: "left", width: "100%" }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked ? "#D4AF37" : "rgba(255,255,255,0.2)"}`, background: checked ? "linear-gradient(135deg,#8B6914,#D4AF37)" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
            {checked && <span style={{ color: "#0A0D14", fontSize: 13, fontWeight: 900 }}>✓</span>}
          </div>
          <span style={{ fontSize: 13, color: "#9E9E9E", lineHeight: 1.5 }}>
            {uz ? "Men foydalanish shartlari va maxfiylik siyosatini o'qidim va roziman" : "Я прочитал и принимаю условия использования и политику конфиденциальности"}
          </span>
        </button>
        <Btn onClick={onAgree} disabled={!checked} full sz="xl" v="gold">
          {uz ? "Roziman, davom etish →" : "Согласен, продолжить →"}
        </Btn>
      </div>
    </div>
  );
}

// ── ROL TANLASH ────────────────────────────────────────
function RoleStep({ lang, onSelect }) {
  const uz = lang !== "ru";
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <MidasLogo size={56} />
        <h2 style={{ color: "#D4AF37", fontWeight: 900, fontSize: 20, margin: "14px 0 6px" }}>
          {uz ? "Rolingizni tanlang" : "Выберите роль"}
        </h2>
        <p style={{ color: "#616161", fontSize: 13, margin: 0 }}>
          {uz ? "Bu keyin o'zgartirilishi mumkin" : "Это можно изменить позже"}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ROLES.map(r => (
          <button key={r.v} onClick={() => onSelect(r.v)} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
            borderRadius: 18, border: "1.5px solid rgba(212,175,55,0.15)",
            background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
            cursor: "pointer", textAlign: "left", width: "100%",
            transition: "all 0.2s",
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(27,94,64,0.15))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
              {r.icon}
            </div>
            <div>
              <div style={{ fontWeight: 800, color: "#D4AF37", fontSize: 15 }}>{L(r, lang)}</div>
              <div style={{ fontSize: 12, color: "#616161", marginTop: 2 }}>{r[`desc_${lang}`] || r.desc_uz}</div>
            </div>
            <span style={{ marginLeft: "auto", color: "#D4AF37", fontSize: 20, opacity: 0.5 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── TADBIRKOR: QADAM 1 — SOHA ──────────────────────────
function TadbirkorSector({ lang, value, onChange, onNext }) {
  const uz = lang !== "ru";
  return (
    <div>
      <h3 style={{ color: "#D4AF37", fontWeight: 900, fontSize: 18, margin: "0 0 6px" }}>
        {uz ? "Biznesingiz sohasi" : "Сфера бизнеса"}
      </h3>
      <p style={{ color: "#616161", fontSize: 13, margin: "0 0 20px", lineHeight: 1.5 }}>
        {uz ? "AI algoritm shu asosida eng mos reklamachilarni topadi" : "AI алгоритм подберёт рекламщиков именно для вашей сферы"}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {SECTORS.map(s => (
          <button key={s.v} onClick={() => { onChange(s.v); onNext(); }}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
              borderRadius: 14, border: `1.5px solid ${value === s.v ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.1)"}`,
              background: value === s.v
                ? "linear-gradient(135deg,rgba(139,105,20,0.35),rgba(212,175,55,0.15))"
                : "rgba(255,255,255,0.03)",
              cursor: "pointer", textAlign: "left",
            }}>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: value === s.v ? "#D4AF37" : "#9E9E9E", lineHeight: 1.3 }}>
              {L(s, lang)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── TADBIRKOR: QADAM 2 — HUDUD ─────────────────────────
function TadbirkorRegion({ lang, value, onChange, onNext, onBack }) {
  const uz = lang !== "ru";
  return (
    <div>
      <button onClick={onBack} style={{ color: "#D4AF37", background: "none", border: "none", cursor: "pointer", fontSize: 22, marginBottom: 16 }}>←</button>
      <h3 style={{ color: "#D4AF37", fontWeight: 900, fontSize: 18, margin: "0 0 6px" }}>
        {uz ? "Faoliyat hududi" : "Регион деятельности"}
      </h3>
      <p style={{ color: "#616161", fontSize: 13, margin: "0 0 20px", lineHeight: 1.5 }}>
        {uz ? "Sizning biznesingiz qaysi hududda faoliyat yuritadi?" : "В каком регионе ведёт деятельность ваш бизнес?"}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {REGIONS.map(r => (
          <button key={r.v} onClick={() => { onChange(r.v); onNext(); }}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
              borderRadius: 14, border: `1.5px solid ${value === r.v ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.1)"}`,
              background: value === r.v
                ? "linear-gradient(135deg,rgba(139,105,20,0.35),rgba(212,175,55,0.15))"
                : "rgba(255,255,255,0.03)",
              cursor: "pointer", textAlign: "left",
            }}>
            <span style={{ fontSize: 20 }}>{r.icon}</span>
            <span style={{ fontWeight: 600, color: value === r.v ? "#D4AF37" : "#9E9E9E", fontSize: 14 }}>
              {L(r, lang)}
            </span>
            {value === r.v && <span style={{ marginLeft: "auto", color: "#D4AF37" }}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── TADBIRKOR: QADAM 3 — ASOSIY MA'LUMOT ──────────────
function TadbirkorInfo({ lang, form, setForm, onNext, onBack }) {
  const uz = lang !== "ru";
  const [err, setErr] = useState({});

  const validate = () => {
    const e = {};
    if (!form.full_name?.trim()) e.name = uz ? "Ismingizni kiriting" : "Введите имя";
    if (!form.phone?.trim())     e.phone = uz ? "Telefon raqamini kiriting" : "Введите номер телефона";
    if (!form.company_name?.trim()) e.company = uz ? "Kompaniya nomini kiriting" : "Введите название компании";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div>
      <button onClick={onBack} style={{ color: "#D4AF37", background: "none", border: "none", cursor: "pointer", fontSize: 22, marginBottom: 16 }}>←</button>
      <h3 style={{ color: "#D4AF37", fontWeight: 900, fontSize: 18, margin: "0 0 20px" }}>
        {uz ? "Asosiy ma'lumotlar" : "Основные данные"}
      </h3>

      <Inp label={uz ? "Ism va familiya" : "Имя и фамилия"} value={form.full_name || ""} onChange={v => setForm(f => ({...f, full_name: v}))} err={err.name} required ph={uz ? "Abdullayev Bobur" : "Иванов Иван"} />
      <Inp label={uz ? "Telefon raqami" : "Номер телефона"} value={form.phone || ""} onChange={v => setForm(f => ({...f, phone: v}))} err={err.phone} required ph="+998 90 123 45 67" type="tel" />
      <Inp label={uz ? "Kompaniya nomi" : "Название компании"} value={form.company_name || ""} onChange={v => setForm(f => ({...f, company_name: v}))} err={err.company} required ph={uz ? "Masa: Abdullayev Group" : "Напр: Иванов Групп"} />
      <MoneyInp label={uz ? "Oylik reklama byudjeti (taxminiy)" : "Ежемесячный рекламный бюджет (ориентировочно)"} value={form.monthly_budget || ""} onChange={v => setForm(f => ({...f, monthly_budget: v}))} />
      <Inp label="Website / Telegram kanal" value={form.website || ""} onChange={v => setForm(f => ({...f, website: v}))} ph="https://" />
      <Inp label={uz ? "Bio / Kompaniya haqida" : "Bio / О компании"} value={form.bio || ""} onChange={v => setForm(f => ({...f, bio: v}))} rows={3} ph={uz ? "Kompaniyangiz haqida qisqacha..." : "Кратко о вашей компании..."} />

      <Btn onClick={() => validate() && onNext()} full sz="xl" v="gold" style={{ marginTop: 8 }}>
        {uz ? "Ro'yxatdan o'tish →" : "Зарегистрироваться →"}
      </Btn>
    </div>
  );
}

// ── REKLAMACHI: QADAM 1 — PLATFORMA ───────────────────
function ReklamachiPlatform({ lang, form, setForm, onNext, onBack }) {
  const uz = lang !== "ru";
  return (
    <div>
      <button onClick={onBack} style={{ color: "#D4AF37", background: "none", border: "none", cursor: "pointer", fontSize: 22, marginBottom: 16 }}>←</button>
      <h3 style={{ color: "#D4AF37", fontWeight: 900, fontSize: 18, margin: "0 0 6px" }}>
        {uz ? "Qaysi platformada ishlaysiz?" : "На каких платформах работаете?"}
      </h3>
      <p style={{ color: "#616161", fontSize: 12, margin: "0 0 16px" }}>
        {uz ? "Bir yoki bir nechta tanlang" : "Выберите одну или несколько"}
      </p>

      <div style={{ fontSize: 11, color: "#616161", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Online</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {PLATFORMS_ONLINE.map(p => {
          const sel = (form.platforms || []).includes(p.v);
          return (
            <button key={p.v} onClick={() => {
              const cur = form.platforms || [];
              setForm(f => ({ ...f, platform: p.v, platforms: sel ? cur.filter(x => x !== p.v) : [...cur, p.v] }));
            }} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "11px 12px",
              borderRadius: 14, border: `1.5px solid ${sel ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.1)"}`,
              background: sel ? "linear-gradient(135deg,rgba(139,105,20,0.35),rgba(212,175,55,0.15))" : "rgba(255,255,255,0.03)",
              cursor: "pointer",
            }}>
              <span style={{ fontSize: 20 }}>{p.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: sel ? "#D4AF37" : "#9E9E9E" }}>{L(p, lang)}</span>
              {sel && <span style={{ marginLeft: "auto", color: "#D4AF37", fontSize: 12 }}>✓</span>}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: 11, color: "#616161", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Offline</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {PLATFORMS_OFFLINE.map(p => {
          const sel = (form.platforms || []).includes(p.v);
          return (
            <button key={p.v} onClick={() => {
              const cur = form.platforms || [];
              setForm(f => ({ ...f, platform: p.v, platforms: sel ? cur.filter(x => x !== p.v) : [...cur, p.v] }));
            }} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "11px 12px",
              borderRadius: 14, border: `1.5px solid ${sel ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.1)"}`,
              background: sel ? "linear-gradient(135deg,rgba(139,105,20,0.35),rgba(212,175,55,0.15))" : "rgba(255,255,255,0.03)",
              cursor: "pointer",
            }}>
              <span style={{ fontSize: 20 }}>{p.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: sel ? "#D4AF37" : "#9E9E9E" }}>{L(p, lang)}</span>
            </button>
          );
        })}
      </div>

      <Btn onClick={() => (form.platforms?.length) && onNext()} disabled={!form.platforms?.length} full sz="xl" v="gold" style={{ marginTop: 20 }}>
        {uz ? "Keyingi →" : "Далее →"}
      </Btn>
      {!form.platforms?.length && <div style={{ color: "#616161", fontSize: 11, textAlign: "center", marginTop: 6 }}>{uz ? "Kamida 1 ta platformani tanlang" : "Выберите хотя бы 1 платформу"}</div>}
    </div>
  );
}

// ── REKLAMACHI: QADAM 2 — PROFIL MA'LUMOTI ────────────
function ReklamachiProfile({ lang, form, setForm, onNext, onBack }) {
  const uz = lang !== "ru";
  const [err, setErr] = useState({});

  const validate = () => {
    const e = {};
    if (!form.full_name?.trim()) e.name = uz ? "Ismingizni kiriting" : "Введите имя";
    if (!form.phone?.trim())     e.phone = uz ? "Telefon raqamini kiriting" : "Введите номер";
    if (!form.profile_link?.trim()) e.link = uz ? "Profil havolasini kiriting" : "Введите ссылку на профиль";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div>
      <button onClick={onBack} style={{ color: "#D4AF37", background: "none", border: "none", cursor: "pointer", fontSize: 22, marginBottom: 16 }}>←</button>
      <h3 style={{ color: "#D4AF37", fontWeight: 900, fontSize: 18, margin: "0 0 20px" }}>
        {uz ? "Profil ma'lumotlari" : "Данные профиля"}
      </h3>

      <Inp label={uz ? "Ism va familiya" : "Имя и фамилия"} value={form.full_name || ""} onChange={v => setForm(f => ({...f, full_name: v}))} err={err.name} required ph={uz ? "Abdullayev Bobur" : "Иванов Иван"} />
      <Inp label={uz ? "Telefon" : "Телефон"} value={form.phone || ""} onChange={v => setForm(f => ({...f, phone: v}))} err={err.phone} required ph="+998 90 123 45 67" type="tel" />
      <Inp label={uz ? "Asosiy profil havolasi *" : "Ссылка на основной профиль *"} value={form.profile_link || ""} onChange={v => setForm(f => ({...f, profile_link: v}))} err={err.link} required ph="https://instagram.com/username" />
      <Inp label={uz ? "Followers soni (taxminiy)" : "Количество подписчиков (примерно)"} value={form.followers || ""} onChange={v => setForm(f => ({...f, followers: v}))} ph="50000" type="number" note={uz ? "Asosiy platformangizdagi obunachi soni" : "Кол-во подписчиков на основной платформе"} />
      <Inp label={uz ? "Bio / O'zingiz haqida" : "Bio / О себе"} value={form.bio || ""} onChange={v => setForm(f => ({...f, bio: v}))} rows={3} ph={uz ? "O'zingiz haqida qisqacha..." : "Кратко о себе..."} />

      <Btn onClick={() => validate() && onNext()} full sz="xl" v="gold" style={{ marginTop: 8 }}>
        {uz ? "Keyingi →" : "Далее →"}
      </Btn>
    </div>
  );
}

// ── REKLAMACHI: QADAM 3 — NARX ────────────────────────
function ReklamachiPrice({ lang, form, setForm, onNext, onBack }) {
  const uz = lang !== "ru";

  return (
    <div>
      <button onClick={onBack} style={{ color: "#D4AF37", background: "none", border: "none", cursor: "pointer", fontSize: 22, marginBottom: 16 }}>←</button>
      <h3 style={{ color: "#D4AF37", fontWeight: 900, fontSize: 18, margin: "0 0 6px" }}>
        {uz ? "Narx va shartlar" : "Цены и условия"}
      </h3>
      <p style={{ color: "#616161", fontSize: 12, margin: "0 0 20px" }}>
        {uz ? "Bu ma'lumotlar keyinchalik o'zgartirilishi mumkin" : "Эти данные можно изменить позже"}
      </p>

      <MoneyInp label={uz ? "1 ta post narxi" : "Цена за 1 пост"} value={form.price_post || ""} onChange={v => setForm(f => ({...f, price_post: v}))} required />
      <MoneyInp label={uz ? "Story narxi" : "Цена за сторис"} value={form.price_story || ""} onChange={v => setForm(f => ({...f, price_story: v}))} />
      <MoneyInp label={uz ? "Video narxi" : "Цена за видео"} value={form.price_video || ""} onChange={v => setForm(f => ({...f, price_video: v}))} />
      <Inp label={uz ? "Engagement rate (%)" : "Вовлечённость (%)"} value={form.engagement || ""} onChange={v => setForm(f => ({...f, engagement: v}))} ph="4.5" type="number" suffix="%" note={uz ? "O'rtacha like+komment/post foizi" : "Ср. лайки+коменты/пост в %"} />

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 8, fontWeight: 600 }}>
          {uz ? "Qaysi turlarda ishlaysiz?" : "Форматы размещения"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(uz
            ? ["Post", "Story", "Reel/Video", "Live", "Bio link", "Pinned post"]
            : ["Пост", "Сторис", "Reel/Видео", "Эфир", "Ссылка в bio", "Закреплённый пост"]
          ).map(t => {
            const sel = (form.content_types || []).includes(t);
            return (
              <button key={t} onClick={() => {
                const cur = form.content_types || [];
                setForm(f => ({ ...f, content_types: sel ? cur.filter(x => x !== t) : [...cur, t] }));
              }} style={{
                padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: `1.5px solid ${sel ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)"}`,
                background: sel ? "linear-gradient(135deg,rgba(139,105,20,0.3),rgba(212,175,55,0.15))" : "rgba(255,255,255,0.03)",
                color: sel ? "#D4AF37" : "#9E9E9E", cursor: "pointer", fontFamily: "inherit",
              }}>{t}</button>
            );
          })}
        </div>
      </div>

      <Btn onClick={() => form.price_post && onNext()} disabled={!form.price_post} full sz="xl" v="gold" style={{ marginTop: 8 }}>
        {uz ? "Keyingi →" : "Далее →"}
      </Btn>
    </div>
  );
}

// ── REKLAMACHI: QADAM 4 — AUDITORIYA ──────────────────
function ReklamachiAudience({ lang, form, setForm, onSubmit, onBack, loading }) {
  const uz = lang !== "ru";

  return (
    <div>
      <button onClick={onBack} style={{ color: "#D4AF37", background: "none", border: "none", cursor: "pointer", fontSize: 22, marginBottom: 16 }}>←</button>
      <h3 style={{ color: "#D4AF37", fontWeight: 900, fontSize: 18, margin: "0 0 6px" }}>
        {uz ? "Auditoriyangiz" : "Ваша аудитория"}
      </h3>
      <p style={{ color: "#616161", fontSize: 12, margin: "0 0 20px" }}>
        {uz ? "Bu ma'lumotlar asosida mos tadbirkorlar taklif qilinadi" : "На основе этих данных подбираются подходящие предприниматели"}
      </p>

      <TagCloud
        options={[{ v:"male", l_uz:"Erkaklar", l_ru:"Мужчины" }, { v:"female", l_uz:"Ayollar", l_ru:"Женщины" }, { v:"all", l_uz:"Aralash", l_ru:"Смешанная" }]}
        selected={form.audience_gender || []} onChange={v => setForm(f => ({...f, audience_gender: v}))}
        label={uz ? "Asosiy auditoriya jinsi" : "Пол основной аудитории"} getLabel={o => L(o, lang)}
      />

      <TagCloud
        options={[{v:"13-17"},{v:"18-24"},{v:"25-34"},{v:"35-44"},{v:"45+"  }]}
        selected={form.audience_ages || []} onChange={v => setForm(f => ({...f, audience_ages: v}))}
        label={uz ? "Asosiy yosh guruhi" : "Возрастная группа"} max={3} getLabel={o => o.v}
      />

      <TagCloud
        options={REGIONS} selected={form.audience_regions || []}
        onChange={v => setForm(f => ({...f, audience_regions: v}))}
        label={uz ? "Auditoriya joylashuvi" : "География аудитории"} max={5} getLabel={o => L(o, lang)}
      />

      <Btn onClick={onSubmit} disabled={loading} full sz="xl" v="gold" style={{ marginTop: 8 }}>
        {loading ? (uz ? "Saqlanmoqda..." : "Сохранение...") : (uz ? "✓ Yakunlash" : "✓ Завершить")}
      </Btn>
    </div>
  );
}

// ── AGENTLIK / DIZAYNER / MEDIA BUYER UMUMIY FORMA ────
function GenericRegForm({ role, lang, form, setForm, onSubmit, onBack, loading }) {
  const uz = lang !== "ru";
  const [err, setErr] = useState({});

  const cfg = {
    agentlik:    { icon: "🏆", fields: ["team_size", "portfolio_count", "min_budget"] },
    dizayner:    { icon: "🎨", fields: ["design_tools", "content_types_d", "portfolio_url"] },
    media_buyer: { icon: "📊", fields: ["managed_budget", "platforms_spec", "roi_avg"] },
  };
  const c = cfg[role] || cfg.agentlik;

  const validate = () => {
    const e = {};
    if (!form.full_name?.trim()) e.name = uz ? "Ism kiriting" : "Введите имя";
    if (!form.phone?.trim())     e.phone = uz ? "Telefon kiriting" : "Введите телефон";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div>
      <button onClick={onBack} style={{ color: "#D4AF37", background: "none", border: "none", cursor: "pointer", fontSize: 22, marginBottom: 16 }}>←</button>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 40 }}>{c.icon}</div>
        <h3 style={{ color: "#D4AF37", fontWeight: 900, fontSize: 18, margin: "8px 0 4px" }}>
          {L(ROLES.find(r => r.v === role), lang)}
        </h3>
      </div>

      <Inp label={uz ? "Ism va familiya *" : "Имя и фамилия *"} value={form.full_name || ""} onChange={v => setForm(f => ({...f, full_name: v}))} err={err.name} required />
      <Inp label={uz ? "Telefon *" : "Телефон *"} value={form.phone || ""} onChange={v => setForm(f => ({...f, phone: v}))} err={err.phone} required type="tel" />
      <Inp label={uz ? "Kompaniya / Brend nomi" : "Компания / Бренд"} value={form.company_name || ""} onChange={v => setForm(f => ({...f, company_name: v}))} />
      <Inp label="Website / Telegram / Instagram" value={form.profile_link || ""} onChange={v => setForm(f => ({...f, profile_link: v}))} ph="https://" />

      {role === "agentlik" && <>
        <Inp label={uz ? "Jamoada nechta kishi?" : "Размер команды"} value={form.team_size || ""} onChange={v => setForm(f => ({...f, team_size: v}))} type="number" ph="5" />
        <MoneyInp label={uz ? "Minimal loyiha byudjeti" : "Минимальный бюджет проекта"} value={form.min_budget || ""} onChange={v => setForm(f => ({...f, min_budget: v}))} />
      </>}

      {role === "dizayner" && <>
        <Inp label={uz ? "Qaysi dasturlardan foydalanasiz?" : "Используемые программы"} value={form.design_tools || ""} onChange={v => setForm(f => ({...f, design_tools: v}))} ph="Figma, Photoshop, Premiere..." />
        <Inp label={uz ? "Portfolio havolasi" : "Ссылка на портфолио"} value={form.portfolio_url || ""} onChange={v => setForm(f => ({...f, portfolio_url: v}))} ph="https://behance.net/..." />
      </>}

      {role === "media_buyer" && <>
        <MoneyInp label={uz ? "Boshqarilgan oylik byudjet (o'rtacha)" : "Управляемый бюджет в мес."} value={form.managed_budget || ""} onChange={v => setForm(f => ({...f, managed_budget: v}))} />
        <Inp label={uz ? "O'rtacha ROI (%)" : "Средний ROI (%)"} value={form.roi_avg || ""} onChange={v => setForm(f => ({...f, roi_avg: v}))} type="number" ph="150" suffix="%" />
      </>}

      <Inp label={uz ? "Bio / O'zingiz haqida" : "Bio / О себе"} value={form.bio || ""} onChange={v => setForm(f => ({...f, bio: v}))} rows={3} />

      <div style={{ marginBottom: 20 }}>
        <TagCloud
          options={REGIONS} selected={form.regions || []}
          onChange={v => setForm(f => ({...f, regions: v}))} max={5}
          label={uz ? "Faoliyat hududi" : "Регион деятельности"} getLabel={o => L(o, lang)}
        />
      </div>

      <Btn onClick={() => validate() && onSubmit()} disabled={loading} full sz="xl" v="gold">
        {loading ? (uz ? "Saqlanmoqda..." : "Сохранение...") : (uz ? "✓ Ro'yxatdan o'tish" : "✓ Зарегистрироваться")}
      </Btn>
    </div>
  );
}

// ── ASOSIY RO'YXATDAN O'TISH KOMPONENTI ───────────────
export function RegistrationPage({ tgUser, lang, onDone }) {
  const [step, setStep]   = useState("role");
  const [role, setRole]   = useState("");
  const [form, setForm]   = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError]  = useState("");
  const uz = lang !== "ru";

  // Ro'yxatdan o'tish qadam soni
  const stepNum = () => {
    if (step === "role") return 0;
    if (role === "tadbirkor") return ["role","t_sector","t_region","t_info"].indexOf(step);
    if (role === "reklamachi") return ["role","r_platform","r_profile","r_price","r_audience"].indexOf(step);
    return 1;
  };
  const totalSteps = role === "tadbirkor" ? 4 : role === "reklamachi" ? 5 : 2;

  const submit = async () => {
    setLoading(true); setError("");
    try {
      const payload = {
        ...form,
        telegram_id:   tgUser.id,
        full_name:     form.full_name || tgUser.first_name,
        username:      tgUser.username || "",
        role,
        lang,
        platforms:     form.platforms || [],
        price_post:    parseMoney(form.price_post || "0"),
        price_story:   parseMoney(form.price_story || "0"),
        price_video:   parseMoney(form.price_video || "0"),
        monthly_budget: parseMoney(form.monthly_budget || "0"),
        min_budget:    parseMoney(form.min_budget || "0"),
        managed_budget: parseMoney(form.managed_budget || "0"),
        followers:     parseInt(form.followers || "0") || 0,
        engagement:    parseFloat(form.engagement || "0") || 0,
      };
      await http("/api/users", "POST", payload);
      onDone();
    } catch (e) {
      setError(e.message || (uz ? "Xato yuz berdi" : "Произошла ошибка"));
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #0F1A10 0%, #0D1117 45%, #0A0D14 100%)",
      padding: "0 0 48px",
    }}>
      {/* Top bar */}
      <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", gap: 12 }}>
        <MidasLogo size={32} />
        <MidasWordmark size="sm" />
        {role && <div style={{ marginLeft: "auto", fontSize: 12, color: "#616161" }}>
          {stepNum()}/{totalSteps}
        </div>}
      </div>

      {/* Progress */}
      {role && <div style={{ padding: "12px 20px 0" }}>
        <StepDots cur={stepNum() - 1} total={totalSteps - 1} />
      </div>}

      <div style={{ padding: "16px 20px" }}>
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#EF4444", fontSize: 13 }}>
            ⚠ {error}
          </div>
        )}

        {step === "role" && <RoleStep lang={lang} onSelect={r => { setRole(r); setStep(r === "tadbirkor" ? "t_sector" : r === "reklamachi" ? "r_platform" : "generic"); }} />}

        {role === "tadbirkor" && <>
          {step === "t_sector" && <TadbirkorSector lang={lang} value={form.sector} onChange={v => setForm(f => ({...f, sector: v}))} onNext={() => setStep("t_region")} />}
          {step === "t_region" && <TadbirkorRegion lang={lang} value={form.region} onChange={v => setForm(f => ({...f, region: v}))} onNext={() => setStep("t_info")} onBack={() => setStep("t_sector")} />}
          {step === "t_info"   && <TadbirkorInfo   lang={lang} form={form} setForm={setForm} onNext={submit} onBack={() => setStep("t_region")} />}
        </>}

        {role === "reklamachi" && <>
          {step === "r_platform" && <ReklamachiPlatform lang={lang} form={form} setForm={setForm} onNext={() => setStep("r_profile")} onBack={() => setStep("role")} />}
          {step === "r_profile"  && <ReklamachiProfile  lang={lang} form={form} setForm={setForm} onNext={() => setStep("r_price")} onBack={() => setStep("r_platform")} />}
          {step === "r_price"    && <ReklamachiPrice     lang={lang} form={form} setForm={setForm} onNext={() => setStep("r_audience")} onBack={() => setStep("r_profile")} />}
          {step === "r_audience" && <ReklamachiAudience  lang={lang} form={form} setForm={setForm} onSubmit={submit} onBack={() => setStep("r_price")} loading={loading} />}
        </>}

        {step === "generic" && (
          <GenericRegForm role={role} lang={lang} form={form} setForm={setForm} onSubmit={submit} onBack={() => setStep("role")} loading={loading} />
        )}
      </div>
    </div>
  );
}
