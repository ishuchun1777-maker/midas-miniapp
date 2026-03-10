// ═══════════════════════════════════════════════════════
// MIDAS v7 — Part 3: Match · Bildirishnomalar · Chatlar
// Yangi: Soha bo'yicha aqlli filterlar, tadbirkor uchun chat,
//        rasm yuborish, bot orqali media haqida yo'riqnoma
// ═══════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Card, Btn, Inp, MoneyInp, TagCloud, Modal, Badge, ScoreBadge,
  TrustBadge, MidasLogo, fmtNum, formatMoney, parseMoney, L, http
} from "./App_v5_part1";
import {
  SECTORS, PLATFORMS_ONLINE, PLATFORMS_OFFLINE, PLATFORMS_ALL,
  AGE_OPTIONS, FOLLOWER_RANGES, LOCATIONS, SECTOR_INTERESTS,
  CAMPAIGN_GOALS, REVIEW_TAGS
} from "./constants_v5";

const tg = window.Telegram?.WebApp;

// Soha bo'yicha qaysi filterlar muhim ekanligi
const SECTOR_FILTER_IMPORTANCE = {
  construction:  { location: 3, age: 1, gender: 1 },
  realestate:    { location: 3, age: 3, gender: 1 },
  materials:     { location: 3, age: 1, gender: 1 },
  manufacturing: { location: 3, age: 1, gender: 1 },
  education:     { location: 2, age: 3, gender: 1 },
  finance:       { location: 2, age: 3, gender: 1 },
  auto:          { location: 2, age: 2, gender: 3 },
  restaurant:    { location: 3, age: 2, gender: 1 },
  retail:        { location: 2, age: 2, gender: 3 },
  household:     { location: 2, age: 2, gender: 3 },
  beverages:     { location: 2, age: 3, gender: 1 },
  medical:       { location: 3, age: 3, gender: 1 },
  internet:      { location: 1, age: 3, gender: 1 },
  travel:        { location: 1, age: 3, gender: 1 },
  recreation:    { location: 3, age: 3, gender: 2 },
};

// Muhimlik darajasi: 3=juda muhim, 2=o'rtacha, 1=kam muhim
const IMPORTANCE_LABELS = {
  uz: { 3: "🔴 Juda muhim", 2: "🟡 Foydali", 1: "🟢 Ixtiyoriy" },
  ru: { 3: "🔴 Очень важно", 2: "🟡 Полезно", 1: "🟢 По желанию" },
};

// Taklif shablonlari
const OFFER_TEMPLATES = {
  uz: [
    { icon: "📦", title: "Mahsulot reklama", text: "Assalomu alaykum! Mahsulotimizni reklama qilishni so'ramoqchiman. Hamkorlik qilish imkoni bormi?" },
    { icon: "✨", title: "Brend tanishtiruv", text: "Salom! Brendimizni auditoriyangizga tanitmoqchimiz. Tavsiyangizni eshitishdan xursand bo'lamiz." },
    { icon: "🎯", title: "Aksiya e'lon", text: "Assalomu alaykum! Maxsus aksiyamizni e'lon qilish uchun hamkorlik qilmoqchiman. Narxlaringiz qanday?" },
    { icon: "🤝", title: "Uzoq muddatli", text: "Salom! Uzoq muddatli hamkorlik asosida ishlashni taklif qilaman. Muhokama qilsak?" },
  ],
  ru: [
    { icon: "📦", title: "Реклама продукта", text: "Здравствуйте! Хочу заказать рекламу нашего продукта. Есть ли возможность сотрудничества?" },
    { icon: "✨", title: "Презентация бренда", text: "Привет! Хотим представить наш бренд вашей аудитории. Будем рады обсудить условия." },
    { icon: "🎯", title: "Акция/скидка", text: "Здравствуйте! Хочу анонсировать нашу специальную акцию. Какова стоимость размещения?" },
    { icon: "🤝", title: "Долгосрочное", text: "Привет! Предлагаю долгосрочное сотрудничество на постоянной основе. Обсудим?" },
  ],
};

// ── MATCH PAGE ─────────────────────────────────────────
export function MatchPage({ user, lang, theme }) {
  const [matches,  setMatches]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [selPf,    setSelPf]    = useState(null);
  const [detailM,  setDetailM]  = useState(null);
  const [offerT,   setOfferT]   = useState(null);
  const [offerMsg, setOfferMsg] = useState("");
  const [freeUsed, setFreeUsed] = useState(false);
  const [clientM,  setClientM]  = useState(false);
  const [templM,   setTemplM]   = useState(false);
  const [saved,    setSaved]    = useState(null); // saqlangan filter

  // Soha bo'yicha muhim filterlar
  const userSector = user.sector || "";
  const imp = SECTOR_FILTER_IMPORTANCE[userSector] || { location: 2, age: 2, gender: 2 };
  const impLbl = IMPORTANCE_LABELS[lang] || IMPORTANCE_LABELS.uz;

  const [cd, setCd] = useState({
    ages: [], gender: "all", location: [],
    interests: [], follower_range: [],
    budget: "", goal: "", goalCustom: ""
  });

  const T = lang === "uz" ? {
    where: "Qayerda reklama qilmoqchisiz?",
    whereDesc: "Platformani tanlang — faqat o'sha platformada ishlaydigan hamkorlar ko'rsatiladi",
    who: "👥 Mijozlaringiz kim?", whoDesc: "Bu ma'lumotlar match algoritmini aniqlashtiradi",
    ages: "Mijozlar yoshi", gender: "Mijozlar jinsi", locLbl: "Mijozlar hududi",
    interests: "Qiziqishlar (maksimal 5)", fRange: "Obunachi soni talabi",
    budget: "Reklama uchun ajratiladigan mablag'", goals: "Reklamadan maqsad",
    goalPh: "Maqsadingizni yozing...", apply: "Qo'llash ✓",
    best: "Mos hamkorlar", all: "Barcha tadbirkorlar", noM: "Mos hamkorlar topilmadi",
    send: "Taklif yuborish", free: "🎁 Bepul sinov (1×)", details: "Batafsil →",
    offerPh: "Taklif xabarini yozing...", sent: "✅ Taklif yuborildi!",
    gAll: "Barcha", gM: "Erkaklar", gF: "Ayollar",
    fol: "obunachi", post: "so'm/post", back: "← Orqaga",
    templates: "📋 Shablon", views: "ko'rishlar",
    saveFilter: "Filterni saqlash", savedFilter: "✓ Saqlangan",
    impNote: "Sizning soha uchun",
  } : {
    where: "Где хотите рекламироваться?",
    whereDesc: "Выберите платформу — будут показаны только партнёры, работающие на ней",
    who: "👥 Кто ваши клиенты?", whoDesc: "Эти данные уточняют алгоритм подбора",
    ages: "Возраст клиентов", gender: "Пол клиентов", locLbl: "Регион клиентов",
    interests: "Интересы (максимум 5)", fRange: "Требования к подписчикам",
    budget: "Бюджет на рекламу", goals: "Цель рекламы",
    goalPh: "Напишите свою цель...", apply: "Применить ✓",
    best: "Подходящие партнёры", all: "Все предприниматели", noM: "Подходящих партнёров не найдено",
    send: "Отправить предложение", free: "🎁 Бесплатно (1×)", details: "Подробнее →",
    offerPh: "Напишите сообщение...", sent: "✅ Предложение отправлено!",
    gAll: "Все", gM: "Мужчины", gF: "Женщины",
    fol: "подп.", post: "сум/пост", back: "← Назад",
    templates: "📋 Шаблон", views: "просмотров",
    saveFilter: "Сохранить фильтр", savedFilter: "✓ Сохранено",
    impNote: "Для вашей сферы",
  };

  const load = useCallback(async (pf) => {
    if (!pf) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ platform_filter: pf === "__all" ? "" : pf });
      if (cd.ages.length)           params.append("ages", cd.ages.join(","));
      if (cd.gender !== "all")      params.append("gender", cd.gender);
      if (cd.location.length)       params.append("location", cd.location.join(","));
      if (cd.budget)                params.append("budget", parseMoney(cd.budget).toString());
      if (cd.follower_range.length) params.append("follower_range", cd.follower_range.join(","));
      const r = await http(`/api/match/${user.telegram_id}?${params}`);
      setMatches(Array.isArray(r) ? r : []);
    } catch {}
    setLoading(false);
  }, [user, cd]);

  useEffect(() => {
    if (user.role === "reklamachi") {
      load("__all");
      http(`/api/reklamachi-profiles/${user.telegram_id}`)
        .then(r => setFreeUsed(!!r.free_offer_used)).catch(() => {});
    }
  }, [user]);

  const sendOffer = async (isFree = false) => {
    if (!offerMsg.trim()) return;
    try {
      await http("/api/offers", "POST", {
        from_id: user.telegram_id,
        to_id:   offerT.uid || offerT.user_id,
        message: offerMsg,
        is_free: isFree ? 1 : 0
      });
      setOfferT(null); setOfferMsg("");
      if (isFree) setFreeUsed(true);
      alert(T.sent);
    } catch (ex) { alert(ex.message); }
  };

  // Tadbirkor: platforma tanlash
  if (user.role === "tadbirkor" && !selPf) return (
    <div style={{ padding: 16, paddingBottom: 80 }}>
      <h2 style={{ color: theme.text, fontSize: 20, fontWeight: 800, marginBottom: 4 }}>🎯 {T.where}</h2>
      <p style={{ color: theme.sub, fontSize: 12, margin: "0 0 16px" }}>{T.whereDesc}</p>

      {/* Mijoz filtri tugmasi */}
      <button onClick={() => setClientM(true)} style={{
        width: "100%", background: theme.accentLight,
        border: `1.5px solid ${theme.accent}`, borderRadius: 18,
        padding: "14px 16px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
        cursor: "pointer", marginBottom: 20
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 28 }}>👥</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 700, color: theme.accent, fontSize: 14 }}>{T.who}</div>
            <div style={{ fontSize: 11, color: theme.sub, marginTop: 2 }}>{T.whoDesc}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {(cd.ages.length > 0 || cd.gender !== "all" || cd.location.length > 0) && (
            <div style={{ fontSize: 10, color: theme.accent, fontWeight: 700, marginBottom: 2 }}>
              ✓ {lang === "uz" ? "Sozlangan" : "Настроено"}
            </div>
          )}
          <span style={{ color: theme.accent, fontSize: 22 }}>›</span>
        </div>
      </button>

      <div style={{ fontSize: 11, color: theme.hint, marginBottom: 8, textTransform: "uppercase", letterSpacing: 2, fontWeight: 600 }}>Online</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {PLATFORMS_ONLINE.map(p => (
          <button key={p.v} onClick={() => { setSelPf(p.v); load(p.v); }}
            style={{ background: theme.card, border: `1.5px solid ${theme.border}`, borderRadius: 18, padding: "18px 10px", textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 30, marginBottom: 6 }}>{p.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: theme.text }}>{L(p, lang)}</div>
          </button>
        ))}
      </div>

      <div style={{ fontSize: 11, color: theme.hint, marginBottom: 8, textTransform: "uppercase", letterSpacing: 2, fontWeight: 600 }}>Offline</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {PLATFORMS_OFFLINE.map(p => (
          <button key={p.v} onClick={() => { setSelPf(p.v); load(p.v); }}
            style={{ background: theme.card, border: `1.5px solid ${theme.border}`, borderRadius: 18, padding: "18px 10px", textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 30, marginBottom: 6 }}>{p.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: theme.text }}>{L(p, lang)}</div>
          </button>
        ))}
      </div>

      {/* Mijoz modal — soha bo'yicha muhimlik ko'rsatiladi */}
      {clientM && (
        <Modal title={T.who} onClose={() => setClientM(false)} theme={theme}>
          {/* Soha bo'yicha muhimlik note */}
          {userSector && (
            <div style={{ background: theme.accentLight, border: `1px solid ${theme.accent}`, borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: theme.accent, fontWeight: 700, marginBottom: 6 }}>
                💡 {T.impNote} ({L(SECTORS.find(s => s.v === userSector) || {}, lang) || userSector}):
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 11, color: theme.sub }}>📍 {lang === "uz" ? "Hudud" : "Регион"}: <strong style={{ color: theme.accent }}>{impLbl[imp.location]}</strong></div>
                <div style={{ fontSize: 11, color: theme.sub }}>🎂 {lang === "uz" ? "Yosh" : "Возраст"}: <strong style={{ color: theme.accent }}>{impLbl[imp.age]}</strong></div>
                <div style={{ fontSize: 11, color: theme.sub }}>👤 {lang === "uz" ? "Jins" : "Пол"}: <strong style={{ color: theme.accent }}>{impLbl[imp.gender]}</strong></div>
              </div>
            </div>
          )}

          {/* Yosh — soha muhimligiga qarab border rangi */}
          <div style={{ marginBottom: 14, border: imp.age === 3 ? `1.5px solid ${theme.accent}` : "none", borderRadius: imp.age === 3 ? 14 : 0, padding: imp.age === 3 ? "10px 12px" : 0 }}>
            {imp.age === 3 && <div style={{ fontSize: 10, color: theme.accent, fontWeight: 700, marginBottom: 6 }}>🔴 {lang === "uz" ? "Bu soha uchun juda muhim!" : "Очень важно для вашей сферы!"}</div>}
            <TagCloud options={AGE_OPTIONS} selected={cd.ages} onChange={v => setCd(d => ({ ...d, ages: v }))} label={T.ages} theme={theme} getLabel={o => L(o, lang)} />
          </div>

          {/* Jins */}
          <div style={{ marginBottom: 14, border: imp.gender === 3 ? `1.5px solid ${theme.accent}` : "none", borderRadius: imp.gender === 3 ? 14 : 0, padding: imp.gender === 3 ? "10px 12px" : 0 }}>
            {imp.gender === 3 && <div style={{ fontSize: 10, color: theme.accent, fontWeight: 700, marginBottom: 6 }}>🔴 {lang === "uz" ? "Bu soha uchun juda muhim!" : "Очень важно для вашей сферы!"}</div>}
            <div style={{ fontSize: 12, color: theme.sub, marginBottom: 8, fontWeight: 600 }}>{T.gender}</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[["all", T.gAll], ["male", T.gM], ["female", T.gF]].map(([v, l]) => (
                <button key={v} onClick={() => setCd(d => ({ ...d, gender: v }))}
                  style={{ flex: 1, padding: 10, borderRadius: 12, fontSize: 12, fontWeight: 600, border: `1.5px solid ${cd.gender === v ? theme.accent : theme.border}`, background: cd.gender === v ? theme.accentLight : theme.card2, color: cd.gender === v ? theme.accent : theme.text, cursor: "pointer" }}>{l}</button>
              ))}
            </div>
          </div>

          {/* Hudud */}
          <div style={{ marginBottom: 0, border: imp.location === 3 ? `1.5px solid ${theme.accent}` : "none", borderRadius: imp.location === 3 ? 14 : 0, padding: imp.location === 3 ? "10px 12px" : 0 }}>
            {imp.location === 3 && <div style={{ fontSize: 10, color: theme.accent, fontWeight: 700, marginBottom: 6 }}>🔴 {lang === "uz" ? "Bu soha uchun juda muhim!" : "Очень важно для вашей сферы!"}</div>}
            <TagCloud options={LOCATIONS} selected={cd.location} onChange={v => setCd(d => ({ ...d, location: v }))} label={T.locLbl} theme={theme} getLabel={o => L(o, lang)} />
          </div>

          <TagCloud
            options={(SECTOR_INTERESTS[userSector] || SECTOR_INTERESTS.default || []).map(i => ({ v: i, l: i }))}
            selected={cd.interests} onChange={v => setCd(d => ({ ...d, interests: v }))}
            max={5} label={T.interests} theme={theme} getLabel={o => o.l}
          />
          <TagCloud options={FOLLOWER_RANGES} selected={cd.follower_range} onChange={v => setCd(d => ({ ...d, follower_range: v }))} label={T.fRange} theme={theme} getLabel={o => L(o, lang)} />

          {/* Byudjet */}
          <MoneyInp label={T.budget} value={cd.budget} onChange={v => setCd(d => ({ ...d, budget: v }))} theme={theme} />

          {/* Maqsad */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: theme.sub, marginBottom: 8, fontWeight: 600 }}>{T.goals}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CAMPAIGN_GOALS.map(g => (
                <button key={g.v} onClick={() => setCd(d => ({ ...d, goal: d.goal === g.v ? "" : g.v }))}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${cd.goal === g.v ? theme.accent : theme.border}`, background: cd.goal === g.v ? theme.accentLight : theme.card2, cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 20 }}>{g.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: cd.goal === g.v ? theme.accent : theme.text }}>{L(g, lang)}</span>
                </button>
              ))}
              {cd.goal === "other" && <Inp ph={T.goalPh} value={cd.goalCustom} onChange={v => setCd(d => ({ ...d, goalCustom: v }))} theme={theme} />}
            </div>
          </div>

          <Btn onClick={() => setClientM(false)} theme={theme} full sz="lg">{T.apply}</Btn>
        </Modal>
      )}
    </div>
  );

  // Match ro'yxati
  return (
    <div style={{ padding: 16, paddingBottom: 80 }}>
      {user.role === "tadbirkor" && selPf && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <button onClick={() => { setSelPf(null); setMatches([]); }} style={{ color: theme.accent, background: "none", border: "none", cursor: "pointer", fontSize: 22 }}>←</button>
          <span style={{ fontSize: 22 }}>{PLATFORMS_ALL.find(p => p.v === selPf)?.icon}</span>
          <span style={{ fontWeight: 700, color: theme.text, fontSize: 16 }}>{L(PLATFORMS_ALL.find(p => p.v === selPf) || {}, lang)}</span>
        </div>
      )}

      {user.role === "reklamachi" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Btn onClick={() => load("__all")} theme={theme} v={selPf !== "__all_exp" ? "primary" : "secondary"} sz="sm">{T.best}</Btn>
          <Btn onClick={() => { setSelPf("__all_exp"); load("__all_exp"); }} theme={theme} v={selPf === "__all_exp" ? "primary" : "secondary"} sz="sm">{T.all}</Btn>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "56px 0", color: theme.hint }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          {lang === "uz" ? "Yuklanmoqda..." : "Загрузка..."}
        </div>
      )}
      {!loading && matches.length === 0 && (
        <div style={{ textAlign: "center", padding: "56px 16px" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🔍</div>
          <div style={{ fontWeight: 600, fontSize: 15, color: theme.text, marginBottom: 6 }}>{T.noM}</div>
        </div>
      )}

      {matches.map((m, i) => (
        <Card key={i} theme={theme}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 5 }}>
                <span style={{ fontWeight: 800, color: theme.text, fontSize: 16 }}>{m.full_name}</span>
                {m.is_premium === 1 && <Badge bg={theme.goldL} color={theme.gold}>⭐ Premium</Badge>}
                {m.verified === 1 && <Badge bg={theme.accentLight} color={theme.accent}>✅</Badge>}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <TrustBadge score={Math.round(m.trust_score || 50)} theme={theme} />
                {m.profile_views > 0 && <Badge bg={theme.card2} color={theme.sub}>👁 {m.profile_views} {T.views}</Badge>}
              </div>
            </div>
            <ScoreBadge score={m.match_score} theme={theme} />
          </div>

          <div style={{ fontSize: 12, color: theme.sub, lineHeight: 1.9, marginBottom: 12 }}>
            {m.platform && <div>{PLATFORMS_ALL.find(p => p.v === m.platform)?.icon} {L(PLATFORMS_ALL.find(p => p.v === m.platform) || {}, lang)}</div>}
            {m.followers > 0 && <div>👥 {fmtNum(m.followers)} {T.fol}{m.engagement > 0 ? ` · ER ${m.engagement}%` : ""}</div>}
            {m.price_post > 0 && <div>💰 {fmtNum(m.price_post)} {T.post}</div>}
            {m.address && <div>📍 {m.address}</div>}
            {m.sector && <div>🏢 {L(SECTORS.find(s => s.v === m.sector) || {}, lang)}</div>}
            {m.max_budget > 0 && <div>💵 {lang === "uz" ? "Byudjet" : "Бюджет"}: {fmtNum(m.max_budget)} {lang === "uz" ? "so'm" : "сум"}</div>}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn onClick={() => setDetailM(m)} theme={theme} v="ghost" sz="sm">{T.details}</Btn>
            <Btn onClick={() => { setOfferT(m); setTemplM(true); }} theme={theme} sz="sm">{T.send}</Btn>
            {user.role === "reklamachi" && !freeUsed && (
              <Btn onClick={() => { setOfferT({ ...m, _free: true }); setTemplM(true); }} theme={theme} v="gold" sz="sm">{T.free}</Btn>
            )}
          </div>
        </Card>
      ))}

      {/* Detail modal */}
      {detailM && (
        <Modal title={detailM.full_name} onClose={() => setDetailM(null)} theme={theme}>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 16 }}>
            {detailM.is_premium === 1 && <Badge bg={theme.goldL} color={theme.gold}>⭐ Premium</Badge>}
            {detailM.verified === 1 && <Badge bg={theme.accentLight} color={theme.accent}>✅ {lang === "uz" ? "Tasdiqlangan" : "Верифицирован"}</Badge>}
            <TrustBadge score={Math.round(detailM.trust_score || 50)} theme={theme} />
            <ScoreBadge score={detailM.match_score} theme={theme} />
          </div>
          {[
            [lang === "uz" ? "Platforma" : "Платформа", L(PLATFORMS_ALL.find(p => p.v === detailM.platform) || {}, lang)],
            [lang === "uz" ? "Profil" : "Профиль", detailM.profile_link],
            [lang === "uz" ? "Obunachi" : "Подписчиков", detailM.followers > 0 ? fmtNum(detailM.followers) : null],
            ["Engagement", detailM.engagement > 0 ? `${detailM.engagement}%` : null],
            [lang === "uz" ? "Post narxi" : "Цена поста", detailM.price_post > 0 ? `${fmtNum(detailM.price_post)} ${lang === "uz" ? "so'm" : "сум"}` : null],
            [lang === "uz" ? "Manzil" : "Адрес", detailM.address],
            [lang === "uz" ? "Rating" : "Рейтинг", `⭐ ${detailM.rating?.toFixed?.(1) || "5.0"}`],
            [lang === "uz" ? "Ko'rishlar" : "Просмотров", detailM.profile_views > 0 ? `👁 ${detailM.profile_views}` : null],
          ].filter(([, v]) => v).map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
              <span style={{ color: theme.sub, fontSize: 13 }}>{k}</span>
              <span style={{ color: theme.text, fontWeight: 600, fontSize: 13, maxWidth: "60%", textAlign: "right", wordBreak: "break-all" }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <Btn onClick={() => { setOfferT(detailM); setDetailM(null); setTemplM(true); }} theme={theme} full sz="lg">{T.send}</Btn>
          </div>
        </Modal>
      )}

      {/* Taklif shablon tanlash */}
      {offerT && templM && (
        <Modal title={`📋 ${T.templates}`} onClose={() => { setOfferT(null); setTemplM(false); }} theme={theme}>
          <div style={{ marginBottom: 12, fontSize: 13, color: theme.sub }}>
            {lang === "uz" ? "Taklif turini tanlang yoki o'zingiz yozing:" : "Выберите шаблон или напишите сами:"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {(OFFER_TEMPLATES[lang] || OFFER_TEMPLATES.uz).map((t, i) => (
              <button key={i} onClick={() => { setOfferMsg(t.text); setTemplM(false); }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: theme.card2, border: `1px solid ${theme.border}`, cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 24 }}>{t.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: theme.text, fontSize: 13 }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: theme.hint, marginTop: 2 }}>{t.text.slice(0, 50)}...</div>
                </div>
              </button>
            ))}
            <button onClick={() => { setOfferMsg(""); setTemplM(false); }}
              style={{ padding: "12px 14px", borderRadius: 14, background: theme.card, border: `1.5px dashed ${theme.border}`, cursor: "pointer", color: theme.sub, fontSize: 13, fontWeight: 600 }}>
              ✏️ {lang === "uz" ? "O'zim yozaman" : "Написать самому"}
            </button>
          </div>
        </Modal>
      )}

      {/* Taklif yozish */}
      {offerT && !templM && (
        <Modal title={`📩 ${T.send}`} onClose={() => setOfferT(null)} theme={theme}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: 12, background: theme.card2, borderRadius: 14 }}>
            <div style={{ fontSize: 28, width: 48, height: 48, background: theme.accentLight, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>👤</div>
            <div>
              <div style={{ fontWeight: 700, color: theme.text, fontSize: 15 }}>{offerT.full_name}</div>
              {offerT._free && <Badge bg={theme.accentLight} color={theme.accent}>🎁 {lang === "uz" ? "Bepul sinov" : "Бесплатный"}</Badge>}
            </div>
          </div>
          <Inp ph={T.offerPh} value={offerMsg} onChange={setOfferMsg} rows={5} theme={theme} />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={() => setTemplM(true)} theme={theme} v="secondary" sz="sm">{T.templates}</Btn>
            <Btn onClick={() => sendOffer(!!offerT._free)} theme={theme} full sz="lg">{T.send}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── NOTIFICATIONS + OFFERS ─────────────────────────────
export function NotifOffersPage({ user, lang, theme }) {
  const [tab,    setTab]    = useState("notifs");
  const [notifs, setNotifs] = useState([]);
  const [offers, setOffers] = useState([]);
  const [rateM,  setRateM]  = useState(null);
  const [stars,  setStars]  = useState(5);
  const [rTxt,   setRTxt]   = useState("");
  const [rTags,  setRTags]  = useState([]);

  const T = lang === "uz" ? {
    notifs: "Bildirishnomalar", offers: "Takliflar",
    noN: "Bildirishnomalar yo'q", noO: "Takliflar yo'q",
    accept: "✓ Qabul qilish", reject: "✗ Rad etish", rate: "⭐ Baholash",
    rTitle: "Hamkorni baholang", rNote: "Sharh (ixtiyoriy)",
    tags: "Teglar", save: "Saqlash",
    pending: "Kutilmoqda", accepted: "✅ Qabul qilindi", rejected: "❌ Rad etildi",
    sent: "→ Yuborildi", received: "← Keldi", free: "Bepul",
  } : {
    notifs: "Уведомления", offers: "Предложения",
    noN: "Уведомлений нет", noO: "Предложений нет",
    accept: "✓ Принять", reject: "✗ Отклонить", rate: "⭐ Оценить",
    rTitle: "Оцените партнёра", rNote: "Отзыв (необязательно)",
    tags: "Теги", save: "Сохранить",
    pending: "В ожидании", accepted: "✅ Принято", rejected: "❌ Отклонено",
    sent: "→ Отправлено", received: "← Получено", free: "Бесплатно",
  };

  const load = useCallback(async () => {
    http(`/api/notifications/${user.telegram_id}`).then(r => setNotifs(Array.isArray(r) ? r : [])).catch(() => {});
    http(`/api/offers/${user.telegram_id}`).then(r => setOffers(Array.isArray(r) ? r : [])).catch(() => {});
    http(`/api/notifications/${user.telegram_id}/read`, "PUT").catch(() => {});
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const stMap = {
    pending:  { bg: theme.goldL,    c: theme.gold    },
    accepted: { bg: theme.successL, c: theme.success },
    rejected: { bg: theme.dangerL,  c: theme.danger  },
  };
  const nIcons = { info: "ℹ️", success: "✅", warning: "⚠️", offer: "📩", message: "💬", broadcast: "📢", tender: "📋" };

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ display: "flex", background: theme.card, borderBottom: `1px solid ${theme.border}`, position: "sticky", top: 0, zIndex: 10 }}>
        {[["notifs", `🔔 ${T.notifs}`], ["offers", `📩 ${T.offers}`]].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={{ flex: 1, padding: "14px", fontWeight: 700, fontSize: 13, color: tab === v ? theme.accent : theme.hint, background: "none", border: "none", cursor: "pointer", borderBottom: `2.5px solid ${tab === v ? theme.accent : "transparent"}`, transition: "all 0.2s" }}>{l}</button>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {tab === "notifs" && <>
          {notifs.length === 0 && (
            <div style={{ textAlign: "center", padding: "56px 0", color: theme.hint }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🔔</div>{T.noN}
            </div>
          )}
          {notifs.map(n => (
            <Card key={n.id} theme={theme} style={{ borderLeft: `3px solid ${n.is_read ? theme.border : theme.accent}`, padding: "12px 14px" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 26, flexShrink: 0 }}>{nIcons[n.type] || "🔔"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: theme.text, marginBottom: 3 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: theme.sub, lineHeight: 1.5 }}>{n.body}</div>
                  <div style={{ fontSize: 10, color: theme.hint, marginTop: 6 }}>{n.created_at?.slice(0, 16)}</div>
                </div>
                {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: 4, background: theme.accent, flexShrink: 0, marginTop: 4 }} />}
              </div>
            </Card>
          ))}
        </>}

        {tab === "offers" && <>
          {offers.length === 0 && (
            <div style={{ textAlign: "center", padding: "56px 0", color: theme.hint }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>📩</div>{T.noO}
            </div>
          )}
          {offers.map(o => (
            <Card key={o.id} theme={theme}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, color: theme.text, fontSize: 14 }}>
                    {o.from_id === user.telegram_id ? `${T.sent} ${o.to_name}` : `${T.received} ${o.from_name}`}
                  </div>
                  <div style={{ fontSize: 11, color: theme.sub, marginTop: 2 }}>{o.created_at?.slice(0, 10)}</div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {o.is_free === 1 && <Badge bg={theme.accentLight} color={theme.accent}>{T.free}</Badge>}
                  <Badge bg={stMap[o.status]?.bg || theme.card2} color={stMap[o.status]?.c || theme.hint}>
                    {T[o.status] || o.status}
                  </Badge>
                </div>
              </div>
              {o.message && (
                <div style={{ fontSize: 13, color: theme.text, fontStyle: "italic", padding: "10px 12px", background: theme.card2, borderRadius: 10, marginBottom: 10, lineHeight: 1.6 }}>
                  "{o.message}"
                </div>
              )}
              {o.to_id === user.telegram_id && o.status === "pending" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={async () => { await http(`/api/offers/${o.id}/status?status=accepted`, "PUT"); load(); }} theme={theme} sz="sm">{T.accept}</Btn>
                  <Btn onClick={async () => { await http(`/api/offers/${o.id}/status?status=rejected`, "PUT"); load(); }} theme={theme} v="danger" sz="sm">{T.reject}</Btn>
                </div>
              )}
              {o.status === "accepted" && !o.rated && o.from_id === user.telegram_id && (
                <Btn onClick={() => { setRateM(o); setStars(5); setRTxt(""); setRTags([]); }} theme={theme} v="ghost" sz="sm">{T.rate}</Btn>
              )}
            </Card>
          ))}
        </>}
      </div>

      {rateM && (
        <Modal title={T.rTitle} onClose={() => setRateM(null)} theme={theme}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: theme.text, fontSize: 16, marginBottom: 14 }}>{rateM.to_name}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setStars(n)} style={{ fontSize: 42, background: "none", border: "none", cursor: "pointer" }}>
                  <span style={{ color: n <= stars ? "#f59e0b" : theme.border }}>{n <= stars ? "★" : "☆"}</span>
                </button>
              ))}
            </div>
          </div>
          <Inp label={T.rNote} value={rTxt} onChange={setRTxt} rows={3} ph="..." theme={theme} />
          <TagCloud
            options={(REVIEW_TAGS[lang] || REVIEW_TAGS.uz).map(t => ({ v: t, l: t }))}
            selected={rTags} onChange={setRTags} max={3} label={T.tags} theme={theme} getLabel={o => o.l}
          />
          <Btn onClick={async () => {
            await http(`/api/offers/${rateM.id}/rate`, "POST", { rating: stars, text: rTxt, tags: rTags, rater_id: user.telegram_id });
            setRateM(null); load();
          }} theme={theme} full sz="lg">{T.save}</Btn>
        </Modal>
      )}
    </div>
  );
}

// ── CHATS PAGE — IKKI ROL UCHUN ────────────────────────
export function ChatsPage({ user, lang, theme }) {
  const [chats,   setChats]   = useState([]);
  const [bcs,     setBcs]     = useState([]);
  const [open,    setOpen]    = useState(null);
  const [msgs,    setMsgs]    = useState([]);
  const [txt,     setTxt]     = useState("");
  const [midas,   setMidas]   = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const [sending, setSending] = useState(false);
  const endRef  = useRef();
  const fileRef = useRef();

  const T = lang === "uz" ? {
    title: "Xabarlar", midas: "MIDAS Xabarlari",
    noC: "Hali xabarlar yo'q", noM: "Xabarlar yo'q",
    type: "Xabar yozing...", send: "Yuborish",
    botHint: "Audio, video va katta fayllar uchun:",
    botBtn: "🤖 Botga o'tish",
    botDesc: "MiniApp faqat matn va rasm qabul qiladi. Audio, video yoki katta hajmdagi fayllarni almashish uchun Telegram botimizga o'ting va «Xabarlar» tugmasini bosing.",
    attach: "Rasm", today: "Bugun", yesterday: "Kecha",
  } : {
    title: "Сообщения", midas: "Сообщения MIDAS",
    noC: "Сообщений пока нет", noM: "Сообщений нет",
    type: "Напишите сообщение...", send: "Отправить",
    botHint: "Для аудио, видео и крупных файлов:",
    botBtn: "🤖 Перейти в бот",
    botDesc: "MiniApp принимает только текст и фото. Для обмена аудио, видео или большими файлами — перейдите в наш Telegram бот и нажмите кнопку «Сообщения».",
    attach: "Фото", today: "Сегодня", yesterday: "Вчера",
  };

  const loadAll = useCallback(async () => {
    http(`/api/chats/${user.telegram_id}`).then(r => setChats(Array.isArray(r) ? r : [])).catch(() => {});
    http(`/api/broadcasts?tg_id=${user.telegram_id}`).then(r => setBcs(Array.isArray(r) ? r : [])).catch(() => {});
  }, [user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Ochiq chatda polling
  useEffect(() => {
    if (!open) return;
    const iv = setInterval(() => {
      http(`/api/chats/${open.id}/messages`).then(r => setMsgs(Array.isArray(r) ? r : [])).catch(() => {});
    }, 3000);
    return () => clearInterval(iv);
  }, [open]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const openChat = async (chat) => {
    setOpen(chat);
    const r = await http(`/api/chats/${chat.id}/messages`).catch(() => []);
    setMsgs(Array.isArray(r) ? r : []);
    http(`/api/chats/${chat.id}/read?tg_id=${user.telegram_id}`, "PUT").catch(() => {});
  };

  const sendMsg = async () => {
    if ((!txt.trim() && !imgFile) || !open || sending) return;
    setSending(true);
    const t2 = txt; setTxt("");

    if (imgFile) {
      // Rasm base64 ga o'girish
      const reader = new FileReader();
      reader.onload = async (e) => {
        await http("/api/messages", "POST", {
          chat_id: open.id,
          sender_id: user.telegram_id,
          receiver_id: open.partner_id,
          message_text: t2 || "",
          image_base64: e.target.result,
        }).catch(() => {});
        setImgFile(null);
        const r = await http(`/api/chats/${open.id}/messages`).catch(() => []);
        setMsgs(Array.isArray(r) ? r : []);
        setSending(false);
      };
      reader.readAsDataURL(imgFile);
    } else {
      await http("/api/messages", "POST", {
        chat_id: open.id,
        sender_id: user.telegram_id,
        receiver_id: open.partner_id,
        message_text: t2,
      }).catch(() => {});
      const r = await http(`/api/chats/${open.id}/messages`).catch(() => []);
      setMsgs(Array.isArray(r) ? r : []);
      setSending(false);
    }
  };

  // Ochiq chat ko'rinishi
  if (open) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: theme.bg }}>
      {/* Header */}
      <div style={{ background: theme.card, borderBottom: `1px solid ${theme.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={() => { setOpen(null); loadAll(); }} style={{ color: theme.accent, fontSize: 24, background: "none", border: "none", cursor: "pointer" }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: theme.text, fontSize: 16 }}>{open.partner_name}</div>
          <div style={{ fontSize: 11, color: theme.hint }}>{lang === "uz" ? "Onlayn emas" : "Не в сети"}</div>
        </div>
        <button onClick={() => tg?.openTelegramLink?.(`https://t.me/midas_bot?start=chat_${open.partner_id}`)}
          style={{ background: theme.accentLight, border: `1px solid ${theme.accent}`, borderRadius: 10, padding: "6px 10px", color: theme.accent, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
          🤖 Bot
        </button>
      </div>

      {/* Bot media yo'riqnomasi */}
      <div style={{ background: theme.goldL, borderBottom: `1px solid ${theme.gold}`, padding: "8px 16px" }}>
        <div style={{ fontSize: 11, color: theme.gold, lineHeight: 1.5 }}>
          ℹ️ {T.botHint}
        </div>
        <div style={{ fontSize: 11, color: theme.sub, marginTop: 2, lineHeight: 1.4 }}>
          {T.botDesc}
        </div>
      </div>

      {/* Xabarlar */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {msgs.map((m, i) => {
          const isMine = m.sender_id === user.telegram_id;
          return (
            <div key={i} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "78%", padding: "10px 14px",
                borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: isMine ? theme.accent : theme.card,
                color: isMine ? "#fff" : theme.text,
                fontSize: 13, lineHeight: 1.55,
                boxShadow: "0 1px 6px rgba(0,0,0,0.07)"
              }}>
                {m.image_url && (
                  <img src={m.image_url} alt="" style={{ maxWidth: "100%", borderRadius: 10, marginBottom: m.message_text ? 8 : 0, display: "block" }} />
                )}
                {m.message_text && <div>{m.message_text}</div>}
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: "right" }}>{m.created_at?.slice(11, 16)}</div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Rasm preview */}
      {imgFile && (
        <div style={{ padding: "8px 12px", background: theme.card2, borderTop: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <img src={URL.createObjectURL(imgFile)} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
          <span style={{ fontSize: 12, color: theme.sub, flex: 1 }}>{imgFile.name}</span>
          <button onClick={() => setImgFile(null)} style={{ color: theme.danger, background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>×</button>
        </div>
      )}

      {/* Input */}
      <div style={{ background: theme.card, borderTop: `1px solid ${theme.border}`, padding: "10px 12px", display: "flex", gap: 8, flexShrink: 0 }}>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => setImgFile(e.target.files[0] || null)} />
        <button onClick={() => fileRef.current?.click()}
          style={{ background: theme.card2, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "0 12px", color: theme.sub, fontSize: 18, cursor: "pointer", flexShrink: 0, height: 44 }}>
          🖼
        </button>
        <input
          value={txt} onChange={e => setTxt(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMsg()}
          placeholder={T.type}
          style={{ flex: 1, padding: "11px 16px", borderRadius: 24, border: `1.5px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: 13, outline: "none", fontFamily: "inherit" }}
        />
        <button onClick={sendMsg} disabled={sending}
          style={{ background: theme.accent, color: "#fff", borderRadius: 24, border: "none", padding: "11px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: sending ? 0.6 : 1 }}>
          {sending ? "⏳" : T.send}
        </button>
      </div>
    </div>
  );

  // MIDAS broadcast ko'rinishi
  if (midas) return (
    <div style={{ padding: 16, background: theme.bg, minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button onClick={() => setMidas(false)} style={{ color: theme.accent, background: "none", border: "none", cursor: "pointer", fontSize: 22 }}>←</button>
        <MidasLogo size={28} theme={theme} />
        <span style={{ fontWeight: 700, color: theme.text, fontSize: 16 }}>MIDAS</span>
      </div>
      {bcs.length === 0 && <div style={{ textAlign: "center", padding: "48px 0", color: theme.hint }}><div style={{ fontSize: 40, marginBottom: 12 }}>📢</div>{T.noM}</div>}
      {bcs.map((b, i) => (
        <Card key={i} theme={theme}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: theme.hint, marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>📢 MIDAS Admin</span>
            <span>{b.created_at?.slice(0, 16)}</span>
          </div>
          <p style={{ fontSize: 13, color: theme.text, margin: 0, lineHeight: 1.7 }}>{b.message_text}</p>
        </Card>
      ))}
    </div>
  );

  // Chat ro'yxati
  return (
    <div style={{ padding: 16, paddingBottom: 80 }}>
      <h2 style={{ fontWeight: 800, fontSize: 20, color: theme.text, marginBottom: 16 }}>💬 {T.title}</h2>

      {/* MIDAS tugmasi */}
      <button onClick={() => setMidas(true)} style={{ width: "100%", background: theme.heroGrad, borderRadius: 20, padding: "18px", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <MidasLogo size={36} theme={theme} white />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>{T.midas}</div>
            {bcs[0] && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{bcs[0].message_text?.slice(0, 40)}...</div>}
          </div>
        </div>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 24 }}>›</span>
      </button>

      {chats.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: theme.hint }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>💬</div>
          <div style={{ fontSize: 14, marginBottom: 8 }}>{T.noC}</div>
          <div style={{ fontSize: 12, color: theme.hint, lineHeight: 1.5 }}>
            {lang === "uz"
              ? "Taklif qabul qilingandan so'ng chat avtomatik ochiladi"
              : "Чат откроется автоматически после принятия предложения"}
          </div>
        </div>
      )}

      {chats.map(chat => (
        <button key={chat.id} onClick={() => openChat(chat)}
          style={{ width: "100%", background: theme.card, borderRadius: 18, padding: "14px 16px", border: `1px solid ${theme.border}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: theme.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
              {chat.partner_role === "tadbirkor" ? "🏢" : "📢"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: theme.text, fontSize: 14, marginBottom: 3 }}>{chat.partner_name}</div>
              {chat.last_message && (
                <div style={{ fontSize: 12, color: theme.hint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {chat.last_message}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0, marginLeft: 8 }}>
            {chat.last_time && <div style={{ fontSize: 10, color: theme.hint }}>{chat.last_time?.slice(11, 16)}</div>}
            {chat.unread > 0 && (
              <div style={{ background: theme.accent, color: "#fff", fontSize: 11, borderRadius: 12, minWidth: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, padding: "0 6px" }}>{chat.unread}</div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
