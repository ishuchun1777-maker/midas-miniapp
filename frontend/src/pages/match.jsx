// ═══════════════════════════════════════════════════════
// MIDAS V8 — MATCH · PORTFEL SAHIFALAR
// Aqlli sektor filterlari, 2 bo'lim filter, to'liq batafsil
// ═══════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from "react";
import { Card, Btn, Inp, MoneyInp, TagCloud, Modal, Badge, TrustBadge, MatchBadge, PageWrap, PageTitle, Empty, Spinner, Divider, ProgressBar } from "../core";
import { http, fmtNum, parseMoney, L } from "../core";
import { SECTORS, PLATFORMS_ONLINE, PLATFORMS_OFFLINE, PLATFORMS_ALL, AGE_GROUPS, REGIONS, SECTOR_INTERESTS, SECTOR_FILTER_IMPORTANCE, FOLLOWER_RANGES, AD_GOALS } from "../constants";

const tg = window.Telegram?.WebApp;

// ── TAKLIF SHABLONLARI ────────────────────────────────
const OFFER_TEMPLATES = {
  uz: [
    { icon: "📦", t: "Mahsulot reklama", msg: "Assalomu alaykum! Mahsulotimizni reklamalashni so'ramoqchiman. Hamkorlik imkoni bormi?" },
    { icon: "✨", t: "Brend tanishtiruv", msg: "Salom! Brendimizni auditoriyangizga tanitmoqchimiz. Shartlaringiz qanday?" },
    { icon: "🎯", t: "Aksiya e'lon",     msg: "Assalomu alaykum! Maxsus aksiyamizni e'lon qilish uchun hamkorlik qilmoqchiman." },
    { icon: "🤝", t: "Uzoq muddatli",   msg: "Salom! Doimiy hamkorlik asosida ishlashni taklif qilaman. Muhokama qilsak?" },
    { icon: "📊", t: "Case study",       msg: "Salom! O'tgan loyihalaringiz natijalarini ko'rsata olasizmi? Hamkorlik qilmoqchimiz." },
  ],
  ru: [
    { icon: "📦", t: "Реклама продукта", msg: "Здравствуйте! Хочу заказать рекламу нашего продукта. Возможно сотрудничество?" },
    { icon: "✨", t: "Презентация бренда", msg: "Привет! Хотим представить наш бренд вашей аудитории. Каковы ваши условия?" },
    { icon: "🎯", t: "Акция",            msg: "Здравствуйте! Хочу анонсировать нашу специальную акцию. Обсудим?" },
    { icon: "🤝", t: "Долгосрочное",     msg: "Привет! Предлагаю постоянное сотрудничество на регулярной основе." },
    { icon: "📊", t: "Case study",       msg: "Привет! Можете показать результаты прошлых проектов? Рассматриваем сотрудничество." },
  ],
};

// ── MATCH SAHIFASI ─────────────────────────────────────
export function MatchPage({ user, lang }) {
  const uz = lang !== "ru";
  const [matches,  setMatches]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [selPf,    setSelPf]    = useState(null);
  const [detailM,  setDetailM]  = useState(null);
  const [offerT,   setOfferT]   = useState(null);
  const [offerMsg, setOfferMsg] = useState("");
  const [offerStep, setOfferStep] = useState("templ"); // templ | write
  const [freeUsed, setFreeUsed] = useState(false);
  const [clientM,  setClientM]  = useState(false); // Mijozlar filtri
  const [demandM,  setDemandM]  = useState(false); // Talablar filtri
  const [sending,  setSending]  = useState(false);

  const sectorKey = user.sector || "default";
  const imp = SECTOR_FILTER_IMPORTANCE[sectorKey] || SECTOR_FILTER_IMPORTANCE.default;
  const sectorInterests = SECTOR_INTERESTS[sectorKey] || SECTOR_INTERESTS.default;

  const [clientFilter, setClientFilter] = useState({ ages: [], gender: "all", regions: [], interests: [] });
  const [demandFilter, setDemandFilter] = useState({ follower_range: [], budget: "", goal: "" });

  const loadMatches = useCallback(async (platform) => {
    if (!platform) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ platform_filter: platform === "__all" ? "" : platform });
      if (clientFilter.ages.length)     p.append("ages", clientFilter.ages.join(","));
      if (clientFilter.gender !== "all") p.append("gender", clientFilter.gender);
      if (clientFilter.regions.length)  p.append("location", clientFilter.regions.join(","));
      if (clientFilter.interests.length) p.append("interests", clientFilter.interests.join(","));
      if (demandFilter.follower_range.length) p.append("follower_range", demandFilter.follower_range.join(","));
      if (demandFilter.budget)          p.append("budget", parseMoney(demandFilter.budget).toString());
      if (demandFilter.goal)            p.append("goal", demandFilter.goal);
      const r = await http(`/api/match/${user.telegram_id}?${p}`);
      setMatches(Array.isArray(r) ? r : []);
    } catch {}
    setLoading(false);
  }, [user, clientFilter, demandFilter]);

  useEffect(() => {
    if (user.role === "reklamachi") {
      loadMatches("__all");
      http(`/api/reklamachi-profiles/${user.telegram_id}`).then(r => setFreeUsed(!!r?.free_offer_used)).catch(() => {});
    }
  }, [user]);

  const sendOffer = async (isFree = false) => {
    if (!offerMsg.trim() || !offerT) return;
    setSending(true);
    try {
      await http("/api/offers", "POST", {
        from_id: user.telegram_id,
        to_id:   offerT.uid || offerT.user_id,
        message: offerMsg, is_free: isFree ? 1 : 0,
      });
      setOfferT(null); setOfferMsg(""); setOfferStep("templ");
      tg?.showPopup?.({ title: "✅", message: uz ? "Taklif yuborildi!" : "Предложение отправлено!" });
    } catch (e) {
      alert(e.message);
    }
    setSending(false);
  };

  // Tadbirkor: platforma tanlash ekrani
  if (user.role === "tadbirkor" && !selPf) return (
    <PageWrap>
      <PageTitle icon="🎯" title={uz ? "Match" : "Матч"} sub={uz ? "Reklama platformasini va hamkorlik filtrlarini tanlang" : "Выберите платформу и фильтры партнёров"} />

      {/* 2 ta filtr tugmasi */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {/* 1: Mijozlarim kim */}
        <button onClick={() => setClientM(true)} style={{
          flex: 1, background: "linear-gradient(135deg, rgba(27,94,64,0.3), rgba(45,134,83,0.15))",
          border: `1.5px solid ${(clientFilter.ages.length || clientFilter.gender !== "all" || clientFilter.regions.length) ? "rgba(212,175,55,0.5)" : "rgba(27,94,64,0.4)"}`,
          borderRadius: 16, padding: "14px 12px", cursor: "pointer", textAlign: "left",
        }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>👥</div>
          <div style={{ fontWeight: 700, color: "#D4AF37", fontSize: 13 }}>
            {uz ? "1. Mijozlarim kim?" : "1. Мои клиенты?"}
          </div>
          <div style={{ fontSize: 10, color: "#4CAF50", marginTop: 3 }}>
            {(clientFilter.ages.length || clientFilter.gender !== "all" || clientFilter.regions.length)
              ? (uz ? "✓ Sozlangan" : "✓ Настроено")
              : (uz ? "Yosh, jins, hudud..." : "Возраст, пол, регион...")}
          </div>
        </button>

        {/* 2: Reklamachilar talabi */}
        <button onClick={() => setDemandM(true)} style={{
          flex: 1, background: "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(139,105,20,0.08))",
          border: `1.5px solid ${(demandFilter.follower_range.length || demandFilter.budget || demandFilter.goal) ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.2)"}`,
          borderRadius: 16, padding: "14px 12px", cursor: "pointer", textAlign: "left",
        }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>📋</div>
          <div style={{ fontWeight: 700, color: "#D4AF37", fontSize: 13 }}>
            {uz ? "2. Reklamachi talabi" : "2. Требования к рекл."}
          </div>
          <div style={{ fontSize: 10, color: "#9E9E9E", marginTop: 3 }}>
            {(demandFilter.follower_range.length || demandFilter.budget || demandFilter.goal)
              ? (uz ? "✓ Sozlangan" : "✓ Настроено")
              : (uz ? "Obunachilar, byudjet, maqsad..." : "Подписчики, бюджет, цель...")}
          </div>
        </button>
      </div>

      {/* Online platformalar */}
      <div style={{ fontSize: 11, color: "#616161", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Online</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {PLATFORMS_ONLINE.map(p => (
          <button key={p.v} onClick={() => { setSelPf(p.v); loadMatches(p.v); }}
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 18, padding: "18px 10px", textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 30, marginBottom: 6 }}>{p.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#E8E8E8" }}>{L(p, lang)}</div>
          </button>
        ))}
      </div>

      <div style={{ fontSize: 11, color: "#616161", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Offline</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {PLATFORMS_OFFLINE.map(p => (
          <button key={p.v} onClick={() => { setSelPf(p.v); loadMatches(p.v); }}
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 18, padding: "18px 10px", textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 30, marginBottom: 6 }}>{p.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#E8E8E8" }}>{L(p, lang)}</div>
          </button>
        ))}
      </div>

      {/* Mijozlar filtri modal */}
      {clientM && (
        <Modal title={uz ? "👥 Mijozlarim kim?" : "👥 Кто мои клиенты?"} onClose={() => setClientM(false)}>
          {/* Soha bo'yicha muhimlik */}
          {user.sector && (
            <div style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 14, padding: "10px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#D4AF37", fontWeight: 700, marginBottom: 6 }}>
                💡 {L(SECTORS.find(s => s.v === user.sector) || {}, lang)} {uz ? "uchun tavsiya" : "— рекомендации"}:
              </div>
              <div style={{ fontSize: 11, color: "#9E9E9E", display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span>📍 {uz ? "Hudud" : "Регион"}: {imp.location === 3 ? "🔴" : imp.location === 2 ? "🟡" : "🟢"}</span>
                <span>🎂 {uz ? "Yosh" : "Возраст"}: {imp.age === 3 ? "🔴" : imp.age === 2 ? "🟡" : "🟢"}</span>
                <span>👤 {uz ? "Jins" : "Пол"}: {imp.gender === 3 ? "🔴" : imp.gender === 2 ? "🟡" : "🟢"}</span>
              </div>
              <div style={{ fontSize: 10, color: "#616161", marginTop: 4 }}>🔴 Juda muhim · 🟡 Foydali · 🟢 Ixtiyoriy</div>
            </div>
          )}

          <TagCloud
            options={AGE_GROUPS} selected={clientFilter.ages}
            onChange={v => setClientFilter(f => ({...f, ages: v}))}
            label={uz ? "Mijozlar yoshi" : "Возраст клиентов"} max={4} getLabel={o => L(o, lang)}
          />

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 8, fontWeight: 600 }}>
              {uz ? "Mijozlar jinsi" : "Пол клиентов"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[["all", uz ? "Barcha" : "Все"], ["male", uz ? "Erkaklar" : "Мужчины"], ["female", uz ? "Ayollar" : "Женщины"]].map(([v, l]) => (
                <button key={v} onClick={() => setClientFilter(f => ({...f, gender: v}))}
                  style={{ flex: 1, padding: "10px 6px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                    border: `1.5px solid ${clientFilter.gender === v ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)"}`,
                    background: clientFilter.gender === v ? "linear-gradient(135deg,rgba(139,105,20,0.3),rgba(212,175,55,0.15))" : "rgba(255,255,255,0.03)",
                    color: clientFilter.gender === v ? "#D4AF37" : "#9E9E9E", cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
              ))}
            </div>
          </div>

          <TagCloud
            options={REGIONS} selected={clientFilter.regions}
            onChange={v => setClientFilter(f => ({...f, regions: v}))} max={5}
            label={uz ? "Mijozlar hududi" : "Регион клиентов"} getLabel={o => L(o, lang)}
          />

          {/* AI tavsiya etilgan qiziqishlar */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 6, fontWeight: 600 }}>
              {uz ? "Mijozlarning qiziqishlari" : "Интересы клиентов"}
              <span style={{ fontSize: 10, color: "#D4AF37", marginLeft: 6, fontWeight: 500 }}>✨ AI tavsiya</span>
            </div>
            <div style={{ fontSize: 11, color: "#616161", marginBottom: 8 }}>
              {uz ? "AI sizning sohangizdagi odatiy qiziqishlarni ko'rsatyapti" : "AI показывает типичные интересы для вашей сферы"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {sectorInterests.map(t => {
                const sel = clientFilter.interests.includes(t);
                return (
                  <button key={t} onClick={() => setClientFilter(f => ({
                    ...f,
                    interests: sel ? f.interests.filter(x => x !== t) : [...f.interests, t]
                  }))} style={{
                    padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    border: `1.5px solid ${sel ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.06)"}`,
                    background: sel ? "linear-gradient(135deg,rgba(139,105,20,0.3),rgba(212,175,55,0.12))" : "rgba(255,255,255,0.03)",
                    color: sel ? "#D4AF37" : "#9E9E9E", cursor: "pointer", fontFamily: "inherit",
                  }}>{t}</button>
                );
              })}
            </div>
            <div style={{ fontSize: 10, color: "#616161", marginTop: 6 }}>
              {uz ? "* Foydalanuvchi qo'shimcha qiziqishlarni ham qo'shishi mumkin" : "* Можно добавить собственные интересы"}
            </div>
          </div>

          <Btn onClick={() => setClientM(false)} full sz="lg" v="gold">
            {uz ? "Qo'llash ✓" : "Применить ✓"}
          </Btn>
        </Modal>
      )}

      {/* Talablar filtri modal */}
      {demandM && (
        <Modal title={uz ? "📋 Reklamachi talablari" : "📋 Требования к рекламщику"} onClose={() => setDemandM(false)}>
          <TagCloud
            options={FOLLOWER_RANGES} selected={demandFilter.follower_range}
            onChange={v => setDemandFilter(f => ({...f, follower_range: v}))}
            label={uz ? "Obunachilar soni talabi" : "Требование к подписчикам"} getLabel={o => L(o, lang)}
          />
          <MoneyInp
            label={uz ? "Reklama uchun ajratiladigan mablag' (ixtiyoriy)" : "Рекламный бюджет (необязательно)"}
            value={demandFilter.budget} onChange={v => setDemandFilter(f => ({...f, budget: v}))}
          />
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 8, fontWeight: 600 }}>
              {uz ? "Reklama maqsadi (ixtiyoriy)" : "Цель рекламы (необязательно)"}
            </div>
            {AD_GOALS.map(g => (
              <button key={g.v} onClick={() => setDemandFilter(f => ({...f, goal: f.goal === g.v ? "" : g.v}))}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, marginBottom: 8, width: "100%",
                  border: `1.5px solid ${demandFilter.goal === g.v ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.06)"}`,
                  background: demandFilter.goal === g.v ? "linear-gradient(135deg,rgba(139,105,20,0.3),rgba(212,175,55,0.12))" : "rgba(255,255,255,0.03)",
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                <span style={{ fontSize: 18 }}>{g.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: demandFilter.goal === g.v ? "#D4AF37" : "#9E9E9E" }}>{L(g, lang)}</span>
              </button>
            ))}
          </div>
          <Btn onClick={() => setDemandM(false)} full sz="lg" v="gold">
            {uz ? "Qo'llash ✓" : "Применить ✓"}
          </Btn>
        </Modal>
      )}
    </PageWrap>
  );

  // ── MATCH RO'YXATI ─────────────────────────────────
  return (
    <PageWrap>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button onClick={() => { setSelPf(null); setMatches([]); }} style={{ color: "#D4AF37", background: "rgba(212,175,55,0.08)", border: "none", cursor: "pointer", fontSize: 20, width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
        <span style={{ fontSize: 26 }}>{PLATFORMS_ALL.find(p => p.v === selPf)?.icon}</span>
        <span style={{ fontWeight: 800, color: "#D4AF37", fontSize: 16 }}>{L(PLATFORMS_ALL.find(p => p.v === selPf) || {}, lang)}</span>

        {user.role === "reklamachi" && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <Btn onClick={() => loadMatches("__all")} v="ghost" sz="sm">{uz ? "Hamkorlar" : "Партнёры"}</Btn>
          </div>
        )}
      </div>

      {loading && <Spinner />}
      {!loading && matches.length === 0 && (
        <Empty icon="🔍" text={uz ? "Mos hamkorlar topilmadi" : "Подходящих партнёров не найдено"} sub={uz ? "Filter shartlarini o'zgartiring" : "Измените условия фильтра"} />
      )}

      {matches.map((m, i) => (
        <Card key={i} glow={m.match_score >= 85}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 5 }}>
                <span style={{ fontWeight: 800, color: "#E8E8E8", fontSize: 16 }}>{m.full_name}</span>
                {m.is_premium === 1 && <Badge v="premium">⭐ Premium</Badge>}
                {m.verified === 1 && <Badge v="success">✅</Badge>}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <TrustBadge score={Math.round(m.trust_score || 50)} />
                {m.portfolio_count > 0 && <Badge v="grey">💼 {m.portfolio_count}</Badge>}
              </div>
            </div>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(212,175,55,0.08)", border: "1.5px solid rgba(212,175,55,0.2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <MatchBadge score={m.match_score} />
            </div>
          </div>

          <div style={{ fontSize: 12, color: "#9E9E9E", lineHeight: 2, marginBottom: 12 }}>
            {m.platform && <div>{PLATFORMS_ALL.find(p => p.v === m.platform)?.icon} {L(PLATFORMS_ALL.find(p => p.v === m.platform) || {}, lang)}</div>}
            {m.followers > 0 && <div>👥 {fmtNum(m.followers)} {uz ? "obunachi" : "подп."}{m.engagement > 0 ? ` · ER ${m.engagement}%` : ""}</div>}
            {m.price_post > 0 && <div>💰 {fmtNum(m.price_post)} {uz ? "so'm/post" : "сум/пост"}</div>}
            {m.address && <div>📍 {m.address}</div>}
            {m.max_budget > 0 && <div>💵 {uz ? "Byudjet" : "Бюджет"}: {fmtNum(m.max_budget)} {uz ? "so'm" : "сум"}</div>}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn onClick={() => setDetailM(m)} v="ghost" sz="sm">{uz ? "Batafsil →" : "Подробнее →"}</Btn>
            <Btn onClick={() => { setOfferT(m); setOfferStep("templ"); }} sz="sm" v="gold">{uz ? "Taklif" : "Предложить"}</Btn>
            {user.role === "reklamachi" && !freeUsed && (
              <Btn onClick={() => { setOfferT({...m, _free: true}); setOfferStep("templ"); }} v="emerald" sz="sm">🎁 {uz ? "Bepul" : "Бесплатно"}</Btn>
            )}
          </div>
        </Card>
      ))}

      {/* TO'LIQ BATAFSIL MODAL */}
      {detailM && (
        <Modal title={detailM.full_name} onClose={() => setDetailM(null)}>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
            {detailM.is_premium === 1 && <Badge v="premium">⭐ Premium</Badge>}
            {detailM.verified === 1 && <Badge v="success">✅ {uz ? "Tasdiqlangan" : "Верифицирован"}</Badge>}
            <TrustBadge score={Math.round(detailM.trust_score || 50)} />
            <MatchBadge score={detailM.match_score} />
          </div>

          {/* Bio */}
          {detailM.bio && (
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "10px 12px", marginBottom: 12, fontSize: 13, color: "#9E9E9E", lineHeight: 1.6 }}>
              {detailM.bio}
            </div>
          )}

          {/* Ma'lumotlar jadvali */}
          <div style={{ marginBottom: 16 }}>
            {[
              ["📱", uz ? "Platforma" : "Платформа", L(PLATFORMS_ALL.find(p => p.v === detailM.platform) || {}, lang)],
              ["🔗", uz ? "Profil" : "Профиль", detailM.profile_link],
              ["👥", uz ? "Obunachi" : "Подписчиков", detailM.followers > 0 ? fmtNum(detailM.followers) : null],
              ["📊", "Engagement", detailM.engagement > 0 ? `${detailM.engagement}%` : null],
              ["💰", uz ? "Post narxi" : "Цена поста", detailM.price_post > 0 ? `${fmtNum(detailM.price_post)} ${uz?"so'm":"сум"}` : null],
              ["🎬", uz ? "Video narxi" : "Цена видео", detailM.price_video > 0 ? `${fmtNum(detailM.price_video)} ${uz?"so'm":"сум"}` : null],
              ["📍", uz ? "Manzil" : "Адрес", detailM.address],
              ["🏢", uz ? "Soha" : "Сфера", L(SECTORS.find(s => s.v === detailM.sector) || {}, lang)],
              ["⭐", uz ? "Reyting" : "Рейтинг", `${detailM.rating?.toFixed?.(1) || "5.0"} / 5.0`],
              ["💼", uz ? "Portfolio" : "Портфолио", detailM.portfolio_count > 0 ? `${detailM.portfolio_count} ${uz?"ta ish":"работ"}` : null],
              ["🤝", uz ? "Bitimlar" : "Сделки", detailM.deals_count > 0 ? `${detailM.deals_count} ${uz?"ta":"шт."}` : null],
              ["👁", uz ? "Ko'rishlar" : "Просмотров", detailM.profile_views > 0 ? `${detailM.profile_views}` : null],
              ["💵", uz ? "Byudjet" : "Бюджет", detailM.max_budget > 0 ? `${fmtNum(detailM.max_budget)} ${uz?"so'm":"сум"}` : null],
              ["🏆", uz ? "Premium" : "Premium", detailM.is_premium === 1 ? (uz?"Ha":"Да") : null],
              ["📅", uz ? "Ro'yxatdan o'tgan" : "Зарегистрирован", detailM.created_at?.slice(0,10)],
            ].filter(([,, v]) => v).map(([icon, key, val]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid rgba(212,175,55,0.07)" }}>
                <span style={{ color: "#616161", fontSize: 13 }}>{icon} {key}</span>
                <span style={{ color: "#E8E8E8", fontWeight: 600, fontSize: 13, maxWidth: "55%", textAlign: "right", wordBreak: "break-all" }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Reyting progress */}
          <ProgressBar value={parseFloat(detailM.rating || 5)} max={5} color="#D4AF37" label={uz ? "Reyting" : "Рейтинг"} />
          <div style={{ marginTop: 10 }}>
            <ProgressBar value={Math.round(detailM.trust_score || 50)} max={100} color="#4CAF50" label={uz ? "Ishonch skori" : "Индекс доверия"} />
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <Btn onClick={() => { setDetailM(null); setOfferT(detailM); setOfferStep("templ"); }} full sz="lg" v="gold">
              {uz ? "📩 Taklif yuborish" : "📩 Отправить предложение"}
            </Btn>
          </div>
        </Modal>
      )}

      {/* TAKLIF YUBORISH — shablon tanlash */}
      {offerT && offerStep === "templ" && (
        <Modal title={uz ? "📋 Shablon tanlang" : "📋 Выберите шаблон"} onClose={() => setOfferT(null)}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 14, marginBottom: 14 }}>
              <span style={{ fontSize: 28 }}>👤</span>
              <div>
                <div style={{ fontWeight: 700, color: "#E8E8E8", fontSize: 14 }}>{offerT.full_name}</div>
                {offerT._free && <Badge v="emerald">🎁 {uz ? "Bepul sinov" : "Бесплатный"}</Badge>}
              </div>
            </div>

            {(OFFER_TEMPLATES[lang] || OFFER_TEMPLATES.uz).map((t, i) => (
              <button key={i} onClick={() => { setOfferMsg(t.msg); setOfferStep("write"); }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderRadius: 14, width: "100%", border: "1px solid rgba(212,175,55,0.12)", background: "rgba(255,255,255,0.03)", cursor: "pointer", textAlign: "left", marginBottom: 8, fontFamily: "inherit" }}>
                <span style={{ fontSize: 24 }}>{t.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: "#D4AF37", fontSize: 13 }}>{t.t}</div>
                  <div style={{ fontSize: 11, color: "#616161", marginTop: 2 }}>{t.msg.slice(0, 50)}...</div>
                </div>
              </button>
            ))}
            <button onClick={() => { setOfferMsg(""); setOfferStep("write"); }}
              style={{ width: "100%", padding: "13px", borderRadius: 14, border: "1.5px dashed rgba(255,255,255,0.1)", background: "transparent", color: "#616161", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              ✏️ {uz ? "O'zim yozaman" : "Написать самому"}
            </button>
          </div>
        </Modal>
      )}

      {/* TAKLIF YUBORISH — yozish */}
      {offerT && offerStep === "write" && (
        <Modal title={uz ? "📩 Taklif yuborish" : "📩 Отправить предложение"} onClose={() => setOfferT(null)}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 14 }}>
            <span style={{ fontSize: 28 }}>👤</span>
            <div>
              <div style={{ fontWeight: 700, color: "#E8E8E8" }}>{offerT.full_name}</div>
              {offerT._free && <Badge v="emerald">🎁 {uz ? "Bepul sinov" : "Бесплатный"}</Badge>}
            </div>
          </div>
          <Inp value={offerMsg} onChange={setOfferMsg} rows={5} ph={uz ? "Taklif matnini yozing..." : "Напишите текст предложения..."} />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={() => setOfferStep("templ")} v="glass" sz="sm">📋</Btn>
            <Btn onClick={() => sendOffer(!!offerT._free)} disabled={sending || !offerMsg.trim()} full sz="lg" v="gold">
              {sending ? "⏳" : (uz ? "Yuborish →" : "Отправить →")}
            </Btn>
          </div>
        </Modal>
      )}
    </PageWrap>
  );
}

// ── PORTFEL SAHIFASI (Reklamachi uchun) ───────────────
export function PortfolioPage({ user, lang }) {
  const uz = lang !== "ru";
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addM, setAddM] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    http(`/api/portfolio/${user.telegram_id}`)
      .then(r => setCases(Array.isArray(r) ? r : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const saveCase = async () => {
    if (!form.title?.trim() || !form.platform) return;
    setSaving(true);
    try {
      if (editItem?.id) {
        await http(`/api/portfolio/${editItem.id}`, "PUT", { ...form, user_id: user.telegram_id });
      } else {
        await http("/api/portfolio", "POST", { ...form, user_id: user.telegram_id });
      }
      const r = await http(`/api/portfolio/${user.telegram_id}`);
      setCases(Array.isArray(r) ? r : []);
      setAddM(false); setEditItem(null); setForm({});
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  const deleteCase = async (id) => {
    if (!window.confirm(uz ? "O'chirishni tasdiqlaysizmi?" : "Подтвердите удаление?")) return;
    await http(`/api/portfolio/${id}`, "DELETE").catch(() => {});
    setCases(c => c.filter(x => x.id !== id));
  };

  return (
    <PageWrap>
      <PageTitle
        icon="💼"
        title={uz ? "Portfel" : "Портфолио"}
        sub={uz ? "O'tgan ishlaringizni ko'rsating" : "Покажите свои прошлые работы"}
        right={<Btn onClick={() => { setForm({}); setEditItem(null); setAddM(true); }} v="gold" sz="sm">+ {uz ? "Qo'shish" : "Добавить"}</Btn>}
      />

      {loading && <Spinner />}

      {!loading && cases.length === 0 && (
        <Empty
          icon="💼"
          text={uz ? "Portfel bo'sh" : "Портфолио пусто"}
          sub={uz ? "Birinchi case study ni qo'shing — bu trust scoringizni oshiradi!" : "Добавьте первый кейс — это повысит ваш индекс доверия!"}
        />
      )}

      {cases.map(c => (
        <Card key={c.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: "#D4AF37", fontSize: 15, marginBottom: 4 }}>{c.title}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {c.platform && <Badge v="grey">{PLATFORMS_ALL.find(p => p.v === c.platform)?.icon} {L(PLATFORMS_ALL.find(p => p.v === c.platform) || {}, lang)}</Badge>}
                {c.sector && <Badge v="grey">🏢 {L(SECTORS.find(s => s.v === c.sector) || {}, lang)}</Badge>}
              </div>
            </div>
          </div>

          {c.description && (
            <p style={{ fontSize: 13, color: "#9E9E9E", lineHeight: 1.6, margin: "0 0 12px" }}>{c.description}</p>
          )}

          {/* Natijalar */}
          {(c.reach || c.clicks || c.sales || c.roi) && (
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              {c.reach > 0  && <div style={{ background: "rgba(27,94,64,0.2)", border: "1px solid rgba(45,134,83,0.3)", borderRadius: 10, padding: "6px 12px", textAlign: "center" }}><div style={{ fontWeight: 800, color: "#4CAF50", fontSize: 14 }}>{fmtNum(c.reach)}</div><div style={{ fontSize: 9, color: "#616161" }}>REACH</div></div>}
              {c.clicks > 0 && <div style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "6px 12px", textAlign: "center" }}><div style={{ fontWeight: 800, color: "#3B82F6", fontSize: 14 }}>{fmtNum(c.clicks)}</div><div style={{ fontSize: 9, color: "#616161" }}>CLICKS</div></div>}
              {c.roi > 0    && <div style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 10, padding: "6px 12px", textAlign: "center" }}><div style={{ fontWeight: 800, color: "#D4AF37", fontSize: 14 }}>{c.roi}%</div><div style={{ fontSize: 9, color: "#616161" }}>ROI</div></div>}
              {c.sales > 0  && <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "6px 12px", textAlign: "center" }}><div style={{ fontWeight: 800, color: "#22C55E", fontSize: 14 }}>{fmtNum(c.sales)}</div><div style={{ fontSize: 9, color: "#616161" }}>SOTUVLAR</div></div>}
            </div>
          )}

          {/* Mijoz */}
          {c.client_name && (
            <div style={{ fontSize: 11, color: "#616161", marginBottom: 10 }}>
              👤 {uz ? "Mijoz" : "Клиент"}: <span style={{ color: "#9E9E9E" }}>{c.client_name}</span>
            </div>
          )}

          {/* Havola */}
          {c.link && (
            <div style={{ fontSize: 11, marginBottom: 10 }}>
              <span style={{ color: "#616161" }}>🔗 </span>
              <a href={c.link} target="_blank" rel="noreferrer" style={{ color: "#D4AF37", textDecoration: "none", fontSize: 11 }}>
                {c.link.slice(0, 40)}{c.link.length > 40 ? "..." : ""}
              </a>
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={() => { setForm(c); setEditItem(c); setAddM(true); }} v="ghost" sz="sm">✏️</Btn>
            <Btn onClick={() => deleteCase(c.id)} v="danger" sz="sm">🗑</Btn>
          </div>
        </Card>
      ))}

      {/* QO'SHISH / TAHRIRLASH MODAL */}
      {addM && (
        <Modal title={editItem ? (uz ? "✏️ Tahrirlash" : "✏️ Редактировать") : (uz ? "➕ Yangi ish" : "➕ Новая работа")} onClose={() => { setAddM(false); setEditItem(null); setForm({}); }}>
          <Inp label={uz ? "Sarlavha *" : "Заголовок *"} value={form.title || ""} onChange={v => setForm(f => ({...f, title: v}))} required ph={uz ? "Masa: Restoran uchun Instagram reklama" : "Напр: Реклама ресторана в Instagram"} />

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 8, fontWeight: 600 }}>
              {uz ? "Platforma *" : "Платформа *"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PLATFORMS_ALL.map(p => (
                <button key={p.v} onClick={() => setForm(f => ({...f, platform: p.v}))}
                  style={{ padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    border: `1.5px solid ${form.platform === p.v ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.07)"}`,
                    background: form.platform === p.v ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.02)",
                    color: form.platform === p.v ? "#D4AF37" : "#616161", cursor: "pointer", fontFamily: "inherit" }}>
                  {p.icon} {L(p, lang)}
                </button>
              ))}
            </div>
          </div>

          <Inp label={uz ? "Mijoz nomi (ixtiyoriy)" : "Имя клиента (необязательно)"} value={form.client_name || ""} onChange={v => setForm(f => ({...f, client_name: v}))} ph={uz ? "Anonim yoki kompaniya nomi" : "Аноним или название компании"} />
          <Inp label={uz ? "Tavsif (case study)" : "Описание (кейс)"} value={form.description || ""} onChange={v => setForm(f => ({...f, description: v}))} rows={4} ph={uz ? "Qanday muammo hal qilindi, qanday natija olindi..." : "Какую проблему решили, каких результатов достигли..."} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Inp label="Reach" value={form.reach || ""} onChange={v => setForm(f => ({...f, reach: v}))} type="number" ph="50000" />
            <Inp label="Clicks" value={form.clicks || ""} onChange={v => setForm(f => ({...f, clicks: v}))} type="number" ph="1200" />
            <Inp label="ROI (%)" value={form.roi || ""} onChange={v => setForm(f => ({...f, roi: v}))} type="number" ph="180" />
            <Inp label={uz ? "Sotuvlar" : "Продажи"} value={form.sales || ""} onChange={v => setForm(f => ({...f, sales: v}))} type="number" ph="320" />
          </div>

          <Inp label={uz ? "Post/kampaniya havolasi" : "Ссылка на пост/кампанию"} value={form.link || ""} onChange={v => setForm(f => ({...f, link: v}))} ph="https://" />

          <Btn onClick={saveCase} disabled={saving || !form.title || !form.platform} full sz="lg" v="gold">
            {saving ? (uz ? "Saqlanmoqda..." : "Сохранение...") : (uz ? "✓ Saqlash" : "✓ Сохранить")}
          </Btn>
        </Modal>
      )}
    </PageWrap>
  );
}
