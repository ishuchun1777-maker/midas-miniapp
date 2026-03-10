// ═══════════════════════════════════════════════════════
// MIDAS v7 — Part 4: AI (Tadbirkor) · Tender · Analytics (Reklamachi) · Profil
// Yangi: Sana validatsiyasi, summa formatlash, ishonch skori,
//        profil oynalari tushuntirmasi, til oxirida, referral
// ═══════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from "react";
import {
  Card, Btn, Inp, MoneyInp, DateInp, TagCloud, Modal, InfoModal,
  Badge, ScoreBadge, TrustBadge, MidasLogo, fmtNum, formatMoney,
  parseMoney, validateDate, dateToISO, L, http, StatCard, Divider
} from "./App_v5_part1";
import {
  SECTORS, PLATFORMS_ALL, AGE_OPTIONS, LOCATIONS,
  CAMPAIGN_GOALS, FOLLOWER_RANGES, REVIEW_TAGS, PREMIUM_PLANS
} from "./constants_v5";

// ── AI MASLAHATCHI — TADBIRKORLAR UCHUN ───────────────
export function AIAdvisorPage({ user, lang, theme }) {
  const [advice,  setAdvice]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [asked,   setAsked]   = useState(false);

  const T = lang === "uz" ? {
    title: "AI Maslahatchi", sub: "Sohangiz bo'yicha real faktlarga asoslangan professional maslahatlar",
    btn: "Maslahat olish ✨", loading: "Tahlil qilinmoqda...", refresh: "Yangilash 🔄",
    premium: "⭐ Premium: Raqobatchilar tahlili + Kengaytirilgan strategiya",
    upgrade: "Yuksaltirish",
  } : {
    title: "AI Консультант", sub: "Профессиональные советы на основе реальных данных вашей сферы",
    btn: "Получить совет ✨", loading: "Анализируется...", refresh: "Обновить 🔄",
    premium: "⭐ Premium: Анализ конкурентов + Расширенная стратегия",
    upgrade: "Улучшить",
  };

  const getAdvice = async () => {
    setLoading(true);
    try {
      const r = await http(`/api/ai/advice/${user.telegram_id}`, "POST", {});
      setAdvice(r); setAsked(true);
    } catch {
      setAdvice({ fallback: true });
    }
    setLoading(false);
  };

  const sStyle = sec => {
    if (sec.type === "warning")  return { bg: theme.dangerL,    border: theme.danger,  titleColor: theme.danger  };
    if (sec.highlight)           return { bg: theme.accentLight, border: theme.accent,  titleColor: theme.accent  };
    if (sec.tag === "hot")       return { bg: theme.goldL,       border: theme.gold,    titleColor: theme.gold    };
    return                              { bg: theme.card2,       border: theme.border,  titleColor: theme.sub     };
  };

  return (
    <div style={{ padding: 16, paddingBottom: 80 }}>
      <div style={{ background: theme.heroGrad, borderRadius: 22, padding: "28px 20px", marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>🤖</div>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>{T.title}</h2>
        <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 13, margin: "0 0 22px", lineHeight: 1.5 }}>{T.sub}</p>
        <button onClick={getAdvice} disabled={loading} style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.45)", borderRadius: 14, padding: "13px 28px", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", backdropFilter: "blur(8px)" }}>
          {loading ? `⏳ ${T.loading}` : asked ? T.refresh : T.btn}
        </button>
      </div>

      <div style={{ background: theme.goldL, border: `1px solid ${theme.gold}`, borderRadius: 18, padding: "14px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 700, color: theme.gold, fontSize: 14 }}>{T.premium}</div>
          <div style={{ fontSize: 11, color: theme.sub, marginTop: 3 }}>
            {lang === "uz" ? "Hozir 79 900 so'm/oy" : "Сейчас 79 900 сум/мес"}
          </div>
        </div>
        <Btn onClick={() => {}} theme={theme} v="gold" sz="sm">{T.upgrade}</Btn>
      </div>

      {advice && !advice.fallback && advice.sections?.map((sec, i) => {
        const s = sStyle(sec);
        return (
          <div key={i} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 18, padding: 16, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>{sec.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: s.titleColor }}>{sec.title}</span>
              {sec.tag && <Badge bg={theme.goldL} color={theme.gold}>🔥 {sec.tag}</Badge>}
            </div>
            <div style={{ fontSize: 13, color: theme.text, lineHeight: 1.75, whiteSpace: "pre-line" }}>{sec.content}</div>
          </div>
        );
      })}

      {advice?.fallback && (
        <Card theme={theme}>
          <div style={{ textAlign: "center", padding: "20px 0", color: theme.sub, fontSize: 13 }}>
            {lang === "uz" ? "Server bilan bog'lanishda xatolik. Qaytadan urinib ko'ring." : "Ошибка соединения. Попробуйте снова."}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── TENDER PAGE ────────────────────────────────────────
export function TenderPage({ user, lang, theme }) {
  const [view,      setView]      = useState("list");
  const [tenders,   setTenders]   = useState([]);
  const [myTenders, setMyTenders] = useState([]);
  const [tab,       setTab]       = useState("all");
  const [detail,    setDetail]    = useState(null);
  const [proposals, setProposals] = useState([]);
  const [form,      setForm]      = useState({ platforms: [], tender_type: "open" });
  const [propForm,  setPropForm]  = useState({ cover_letter: "", price: "", delivery_days: "", plan: "" });
  const [propModal, setPropModal] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [errs,      setErrs]      = useState({});

  const T = lang === "uz" ? {
    title: "Tender Bozori", create: "Tender e'lon qilish",
    myT: "Mening tenderlarim", allT: "Barcha tenderlar",
    tTitle: "Sarlavha *", tDesc: "Tavsif *", sector: "Soha *",
    platforms: "Platformalar", bMin: "Minimal byudjet", bMax: "Maksimal byudjet *",
    deadline: "Taklif qabul qilish muddati *", cStart: "Kampaniya boshlanishi",
    cDur: "Kampaniya muddati (kun)", reqs: "Talablar",
    tType: "Tender turi", tOpen: "Ochiq", tClosed: "Yopiq",
    submit: "Taklif yuborish", cover: "Taklif xati *",
    price: "Narx *", days: "Bajarish muddati (kun) *", plan: "Ish rejasi",
    props: "Takliflar", propCount: "ta taklif", selectW: "G'olibni tanlash",
    noT: "Tenderlar yo'q", views: "ko'rishlar",
    status: { open: "🟢 Ochiq", closed: "🔴 Yopiq", awarded: "🏆 Bitdi" },
    details: "Batafsil →", back: "← Orqaga", save: "Saqlash", saving: "Saqlanmoqda...",
    cancel: "Bekor qilish", fillReq: "Majburiy maydonni to'ldiring",
  } : {
    title: "Тендерная площадка", create: "Объявить тендер",
    myT: "Мои тендеры", allT: "Все тендеры",
    tTitle: "Заголовок *", tDesc: "Описание *", sector: "Сфера *",
    platforms: "Платформы", bMin: "Минимальный бюджет", bMax: "Максимальный бюджет *",
    deadline: "Срок приёма предложений *", cStart: "Начало кампании",
    cDur: "Длительность (дней)", reqs: "Требования",
    tType: "Тип тендера", tOpen: "Открытый", tClosed: "Закрытый",
    submit: "Отправить предложение", cover: "Сопроводительное письмо *",
    price: "Цена *", days: "Срок выполнения (дней) *", plan: "План работы",
    props: "Предложения", propCount: "предложений", selectW: "Выбрать победителя",
    noT: "Тендеров нет", views: "просм.",
    status: { open: "🟢 Открыт", closed: "🔴 Закрыт", awarded: "🏆 Завершён" },
    details: "Подробнее →", back: "← Назад", save: "Сохранить", saving: "Сохранение...",
    cancel: "Отмена", fillReq: "Заполните обязательные поля",
  };

  const loadAll = useCallback(async () => {
    http("/api/tenders").then(r => setTenders(Array.isArray(r) ? r : [])).catch(() => {});
    if (user.role === "tadbirkor")
      http(`/api/tenders?tg_id=${user.telegram_id}&my=1`).then(r => setMyTenders(Array.isArray(r) ? r : [])).catch(() => {});
  }, [user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const loadDetail = async (tid) => {
    const d = await http(`/api/tenders/${tid}`);
    setDetail(d);
    const p = await http(`/api/tenders/${tid}/proposals`).catch(() => []);
    setProposals(Array.isArray(p) ? p : []);
  };

  const createTender = async () => {
    const e = {};
    if (!form.title?.trim())       e.title    = T.fillReq;
    if (!form.description?.trim()) e.desc     = T.fillReq;
    if (!form.sector)              e.sector   = T.fillReq;
    if (!form.budget_max)          e.bMax     = T.fillReq;
    if (!form.deadline)            e.deadline = T.fillReq;
    if (form.deadline && !validateDate(form.deadline)) e.deadline = lang === "uz" ? "Noto'g'ri sana formati" : "Неверный формат даты";
    if (form.campaign_start && !validateDate(form.campaign_start)) e.cStart = lang === "uz" ? "Noto'g'ri sana formati" : "Неверный формат даты";
    setErrs(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await http("/api/tenders", "POST", {
        ...form,
        owner_id:          user.telegram_id,
        budget_min:        parseMoney(form.budget_min || "0"),
        budget_max:        parseMoney(form.budget_max || "0"),
        deadline:          dateToISO(form.deadline),
        campaign_start:    form.campaign_start ? dateToISO(form.campaign_start) : null,
        campaign_duration: Number(form.campaign_duration) || 30,
        platforms:         form.platforms || [],
        target_ages: [], target_location: [], interests: []
      });
      await loadAll(); setView("list"); setTab("my");
    } catch (ex) { alert(ex.message); }
    setSaving(false);
  };

  const submitProp = async () => {
    const e = {};
    if (!propForm.cover_letter?.trim()) e.cover = T.fillReq;
    if (!propForm.price)               e.price  = T.fillReq;
    if (!propForm.delivery_days)       e.days   = T.fillReq;
    setErrs(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await http(`/api/tenders/${detail.id}/proposals`, "POST", {
        ...propForm,
        bidder_id:     user.telegram_id,
        price:         parseMoney(propForm.price),
        delivery_days: Number(propForm.delivery_days)
      });
      setPropModal(false); loadDetail(detail.id);
      alert(lang === "uz" ? "Taklif yuborildi ✓" : "Предложение отправлено ✓");
    } catch (ex) { alert(ex.message); }
    setSaving(false);
  };

  const stBadge = {
    open:    { bg: theme.successL, c: theme.success },
    closed:  { bg: theme.dangerL,  c: theme.danger  },
    awarded: { bg: theme.goldL,    c: theme.gold     },
  };

  // Tender yaratish formasi
  if (view === "create") return (
    <div style={{ padding: 16, paddingBottom: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button onClick={() => setView("list")} style={{ color: theme.accent, background: "none", border: "none", cursor: "pointer", fontSize: 22 }}>←</button>
        <h2 style={{ color: theme.text, fontSize: 18, fontWeight: 800, margin: 0 }}>📋 {T.create}</h2>
      </div>

      <Inp label={T.tTitle} value={form.title || ""} onChange={v => setForm(f => ({ ...f, title: v }))} err={errs.title} theme={theme} />
      <Inp label={T.tDesc} value={form.description || ""} onChange={v => setForm(f => ({ ...f, description: v }))} rows={4} err={errs.desc} theme={theme} />

      <div style={{ fontSize: 12, color: theme.sub, marginBottom: 6, fontWeight: 600 }}>{T.sector} {errs.sector && <span style={{ color: theme.danger }}>⚠ {errs.sector}</span>}</div>
      <select value={form.sector || ""} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
        style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${errs.sector ? theme.danger : theme.border}`, background: theme.inputBg, color: theme.text, fontSize: 13, outline: "none", fontFamily: "inherit", marginBottom: 14 }}>
        <option value="">— {T.sector} —</option>
        {SECTORS.map(s => <option key={s.v} value={s.v}>{s.icon} {L(s, lang)}</option>)}
      </select>

      <TagCloud options={PLATFORMS_ALL} selected={form.platforms || []} onChange={v => setForm(f => ({ ...f, platforms: v }))} label={T.platforms} theme={theme} getLabel={o => L(o, lang)} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <MoneyInp label={T.bMin} value={form.budget_min || ""} onChange={v => setForm(f => ({ ...f, budget_min: v }))} theme={theme} />
        <MoneyInp label={T.bMax} value={form.budget_max || ""} onChange={v => setForm(f => ({ ...f, budget_max: v }))} err={errs.bMax} theme={theme} />
      </div>

      <DateInp label={T.deadline} value={form.deadline || ""} onChange={v => setForm(f => ({ ...f, deadline: v }))} err={errs.deadline} theme={theme} />
      <DateInp label={T.cStart} value={form.campaign_start || ""} onChange={v => setForm(f => ({ ...f, campaign_start: v }))} err={errs.cStart} theme={theme} />
      <Inp label={T.cDur} value={form.campaign_duration || ""} onChange={v => setForm(f => ({ ...f, campaign_duration: v }))} type="number" ph="30" theme={theme} />
      <Inp label={T.reqs} value={form.requirements || ""} onChange={v => setForm(f => ({ ...f, requirements: v }))} rows={3} theme={theme} />

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: theme.sub, marginBottom: 8, fontWeight: 600 }}>{T.tType}</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[["open", T.tOpen], ["closed", T.tClosed]].map(([v, l]) => (
            <button key={v} onClick={() => setForm(f => ({ ...f, tender_type: v }))}
              style={{ flex: 1, padding: 12, borderRadius: 12, fontSize: 13, fontWeight: 600, border: `1.5px solid ${(form.tender_type || "open") === v ? theme.accent : theme.border}`, background: (form.tender_type || "open") === v ? theme.accentLight : theme.card2, color: (form.tender_type || "open") === v ? theme.accent : theme.text, cursor: "pointer" }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 68, left: 0, right: 0, padding: "12px 16px", background: theme.bg, borderTop: `1px solid ${theme.border}` }}>
        <Btn onClick={createTender} disabled={saving} theme={theme} full sz="lg">{saving ? T.saving : T.create}</Btn>
      </div>
    </div>
  );

  // Tender batafsil
  if (view === "detail" && detail) return (
    <div style={{ padding: 16, paddingBottom: 80 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button onClick={() => { setView("list"); setDetail(null); }} style={{ color: theme.accent, background: "none", border: "none", cursor: "pointer", fontSize: 22 }}>←</button>
        <h2 style={{ color: theme.text, fontSize: 16, fontWeight: 800, margin: 0, flex: 1 }}>{detail.title}</h2>
        <Badge bg={stBadge[detail.status]?.bg || theme.card2} color={stBadge[detail.status]?.c || theme.hint}>{T.status[detail.status] || detail.status}</Badge>
      </div>
      <Card theme={theme}>
        <p style={{ fontSize: 13, color: theme.text, lineHeight: 1.7, marginBottom: 14 }}>{detail.description}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {detail.sector && <Badge bg={theme.card2} color={theme.sub}>{L(SECTORS.find(s => s.v === detail.sector) || {}, lang)}</Badge>}
          {detail.budget_max > 0 && <Badge bg={theme.goldL} color={theme.gold}>💰 {fmtNum(detail.budget_max)} {lang === "uz" ? "so'm" : "сум"}</Badge>}
          {detail.deadline && <Badge bg={theme.card2} color={theme.sub}>📅 {detail.deadline}</Badge>}
          <Badge bg={theme.card2} color={theme.sub}>👁 {detail.views || 0} {T.views}</Badge>
          <Badge bg={theme.card2} color={theme.sub}>📋 {detail.proposal_count || 0} {T.propCount}</Badge>
        </div>
        {detail.requirements && (
          <div style={{ fontSize: 12, color: theme.sub, background: theme.card2, padding: "10px 12px", borderRadius: 10, marginBottom: 10 }}>
            <strong>{T.reqs}:</strong> {detail.requirements}
          </div>
        )}
        <div style={{ fontSize: 12, color: theme.hint }}>
          👤 {detail.owner_name} · ⭐ {detail.owner_rating?.toFixed?.(1) || "5.0"} · 🛡 {Math.round(detail.owner_trust || 50)}
        </div>
      </Card>

      {proposals.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ color: theme.text, fontSize: 15, fontWeight: 700, marginBottom: 12 }}>📋 {T.props} ({proposals.length})</h3>
          {proposals.map(p => (
            <Card key={p.id} theme={theme} style={{ border: `1px solid ${p.status === "accepted" ? theme.accent : theme.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, color: theme.text, fontSize: 14 }}>{p.full_name}</div>
                  <div style={{ fontSize: 11, color: theme.hint, marginTop: 2 }}>⭐ {p.rating?.toFixed?.(1) || "5.0"} · 🛡 {Math.round(p.trust_score || 50)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, color: theme.accent, fontSize: 16 }}>{fmtNum(p.price)} {lang === "uz" ? "so'm" : "сум"}</div>
                  <div style={{ fontSize: 11, color: theme.hint }}>{p.delivery_days} {lang === "uz" ? "kun" : "дней"}</div>
                </div>
              </div>
              {p.cover_letter && (
                <p style={{ fontSize: 12, color: theme.text, lineHeight: 1.6, margin: "0 0 10px", fontStyle: "italic", background: theme.card2, padding: "8px 12px", borderRadius: 10 }}>"{p.cover_letter}"</p>
              )}
              {p.status === "accepted" && <Badge bg={theme.accentLight} color={theme.accent}>🏆 {lang === "uz" ? "G'olib" : "Победитель"}</Badge>}
              {detail.owner_id === user.telegram_id && detail.status === "open" && p.status === "pending" && (
                <Btn onClick={async () => { await http(`/api/proposals/${p.id}/accept`, "PUT"); loadDetail(detail.id); loadAll(); }} theme={theme} sz="sm" style={{ marginTop: 10 }}>{T.selectW}</Btn>
              )}
            </Card>
          ))}
        </div>
      )}

      {user.role === "reklamachi" && detail.status === "open" && detail.owner_id !== user.telegram_id && (
        <div style={{ position: "fixed", bottom: 68, left: 0, right: 0, padding: "12px 16px", background: theme.bg, borderTop: `1px solid ${theme.border}` }}>
          <Btn onClick={() => setPropModal(true)} theme={theme} full sz="lg">{T.submit}</Btn>
        </div>
      )}

      {propModal && (
        <Modal title={T.submit} onClose={() => setPropModal(false)} theme={theme}>
          <Inp label={T.cover} value={propForm.cover_letter} onChange={v => setPropForm(f => ({ ...f, cover_letter: v }))} rows={4} err={errs.cover} theme={theme} />
          <MoneyInp label={T.price} value={propForm.price} onChange={v => setPropForm(f => ({ ...f, price: v }))} err={errs.price} theme={theme} />
          <Inp label={T.days} value={propForm.delivery_days} onChange={v => setPropForm(f => ({ ...f, delivery_days: v }))} type="number" ph="14" err={errs.days} theme={theme} />
          <Inp label={T.plan} value={propForm.plan} onChange={v => setPropForm(f => ({ ...f, plan: v }))} rows={3} theme={theme} />
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <Btn onClick={() => setPropModal(false)} theme={theme} v="secondary" full>{T.cancel}</Btn>
            <Btn onClick={submitProp} disabled={saving} theme={theme} full>{saving ? T.saving : T.submit}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );

  // Tender ro'yxati
  const list = tab === "my" ? myTenders : tenders;
  return (
    <div style={{ padding: 16, paddingBottom: 80 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ color: theme.text, fontSize: 20, fontWeight: 800, margin: 0 }}>📋 {T.title}</h2>
        {user.role === "tadbirkor" && <Btn onClick={() => { setForm({ platforms: [], tender_type: "open" }); setErrs({}); setView("create"); }} theme={theme} sz="sm">+ {T.create}</Btn>}
      </div>
      {user.role === "tadbirkor" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[["all", T.allT], ["my", T.myT]].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)} style={{ flex: 1, padding: 10, borderRadius: 12, fontSize: 13, fontWeight: 600, border: `1.5px solid ${tab === v ? theme.accent : theme.border}`, background: tab === v ? theme.accentLight : theme.card, color: tab === v ? theme.accent : theme.text, cursor: "pointer" }}>{l}</button>
          ))}
        </div>
      )}
      {list.length === 0 && <div style={{ textAlign: "center", padding: "52px 0", color: theme.hint }}><div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>{T.noT}</div>}
      {list.map(t => (
        <Card key={t.id} theme={theme}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: theme.text, fontSize: 15, marginBottom: 3 }}>{t.title}</div>
              <div style={{ fontSize: 11, color: theme.hint }}>👤 {t.owner_name}</div>
            </div>
            <Badge bg={stBadge[t.status]?.bg || theme.card2} color={stBadge[t.status]?.c || theme.hint} style={{ marginLeft: 8 }}>{T.status[t.status] || t.status}</Badge>
          </div>
          <p style={{ fontSize: 12, color: theme.sub, lineHeight: 1.5, margin: "0 0 10px" }}>{t.description?.slice(0, 80)}{t.description?.length > 80 ? "..." : ""}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
            {t.budget_max > 0 && <Badge bg={theme.goldL} color={theme.gold}>💰 {fmtNum(t.budget_max)}</Badge>}
            {t.deadline && <Badge bg={theme.card2} color={theme.sub}>📅 {t.deadline}</Badge>}
            <Badge bg={theme.card2} color={theme.sub}>📋 {t.proposal_count || 0} {T.propCount}</Badge>
          </div>
          <Btn onClick={() => { loadDetail(t.id); setView("detail"); }} theme={theme} v="ghost" sz="sm">{T.details}</Btn>
        </Card>
      ))}
    </div>
  );
}

// ── ANALYTICS — REKLAMACHILAR UCHUN ───────────────────
export function AnalyticsPage({ user, lang, theme }) {
  const [data,      setData]      = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [selCamp,   setSelCamp]   = useState(null);
  const [results,   setResults]   = useState([]);
  const [summary,   setSummary]   = useState(null);
  const [addM,      setAddM]      = useState(false);
  const [form,      setForm]      = useState({});
  const [saving,    setSaving]    = useState(false);

  const T = lang === "uz" ? {
    title: "Analitika", spend: "Jami sarflandi", reach: "Umumiy qamrov",
    clicks: "Jami kliklar", active: "Faol kampaniyalar",
    earned: "Jami daromad", winRate: "G'alaba %", props: "Yuborilgan takliflar",
    camps: "Kampaniyalar", results: "Natijalar", addRes: "+ Natija qo'shish",
    date: "Sana", rReach: "Qamrov", impr: "Ko'rishlar", rClicks: "Kliklar",
    roi: "ROI (%)", conv: "Konversiya (%)", noC: "Kampaniyalar yo'q", noCamp: "Kampaniyalar yo'q",
  } : {
    title: "Аналитика", spend: "Всего потрачено", reach: "Общий охват",
    clicks: "Всего кликов", active: "Активные кампании",
    earned: "Всего заработано", winRate: "% побед", props: "Отправлено предложений",
    camps: "Кампании", results: "Результаты", addRes: "+ Добавить результат",
    date: "Дата", rReach: "Охват", impr: "Показы", rClicks: "Клики",
    roi: "ROI (%)", conv: "Конверсия (%)", noC: "Кампаний нет", noCamp: "Кампаний нет",
  };

  useEffect(() => {
    http(`/api/analytics/${user.telegram_id}`).then(setData).catch(() => {});
    http(`/api/campaigns/${user.telegram_id}`).then(r => setCampaigns(Array.isArray(r) ? r : [])).catch(() => {});
  }, [user]);

  const openCamp = async (camp) => {
    setSelCamp(camp);
    http(`/api/campaigns/${camp.id}/results`).then(r => setResults(Array.isArray(r) ? r : [])).catch(() => {});
    http(`/api/campaigns/${camp.id}/summary`).then(setSummary).catch(() => {});
  };

  const addResult = async () => {
    if (!form.result_date || !validateDate(form.result_date)) {
      alert(lang === "uz" ? "Sanani to'g'ri kiriting: KK.OO.YYYY" : "Введите дату правильно: ДД.ММ.ГГГГ"); return;
    }
    setSaving(true);
    try {
      await http(`/api/campaigns/${selCamp.id}/results`, "POST", {
        ...form, result_date: dateToISO(form.result_date),
        reach: Number(form.reach) || 0, impressions: Number(form.impressions) || 0,
        clicks: Number(form.clicks) || 0, conversions: Number(form.conversions) || 0,
        roi: Number(form.roi) || 0,
      });
      setAddM(false); openCamp(selCamp);
    } catch (ex) { alert(ex.message); }
    setSaving(false);
  };

  if (selCamp) return (
    <div style={{ padding: 16, paddingBottom: 80 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button onClick={() => { setSelCamp(null); setSummary(null); }} style={{ color: theme.accent, background: "none", border: "none", cursor: "pointer", fontSize: 22 }}>←</button>
        <h2 style={{ color: theme.text, fontSize: 16, fontWeight: 800, margin: 0, flex: 1 }}>{selCamp.campaign_name || selCamp.title}</h2>
      </div>
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            ["👁", fmtNum(summary.total_reach || 0),       T.reach],
            ["🖱", fmtNum(summary.total_clicks || 0),      T.clicks],
            ["📈", `${summary.avg_roi || 0}%`,             "ROI"],
            ["🎯", `${summary.avg_conv || 0}%`,            T.conv],
          ].map(([icon, val, label]) => (
            <div key={label} style={{ background: theme.card, borderRadius: 16, padding: "14px 10px", textAlign: "center", border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: theme.accent }}>{val}</div>
              <div style={{ fontSize: 11, color: theme.hint, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: theme.text, fontSize: 15 }}>{T.results}</div>
        <Btn onClick={() => { setForm({}); setAddM(true); }} theme={theme} sz="sm">{T.addRes}</Btn>
      </div>
      {results.map((r, i) => (
        <Card key={i} theme={theme} style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: theme.text, fontSize: 13 }}>📅 {r.result_date?.slice(0, 10)}</span>
            {r.roi > 0 && <Badge bg={theme.successL} color={theme.success}>ROI {r.roi}%</Badge>}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {r.reach > 0     && <Badge bg={theme.card2} color={theme.sub}>👁 {fmtNum(r.reach)}</Badge>}
            {r.clicks > 0    && <Badge bg={theme.card2} color={theme.sub}>🖱 {fmtNum(r.clicks)}</Badge>}
            {r.conversions > 0 && <Badge bg={theme.accentLight} color={theme.accent}>🎯 {r.conversions}</Badge>}
          </div>
        </Card>
      ))}
      {results.length === 0 && <div style={{ textAlign: "center", padding: "32px 0", color: theme.hint }}>{T.noC}</div>}

      {addM && (
        <Modal title={T.addRes} onClose={() => setAddM(false)} theme={theme}>
          <DateInp label={T.date} value={form.result_date || ""} onChange={v => setForm(f => ({ ...f, result_date: v }))} theme={theme} />
          <Inp label={T.rReach} value={form.reach || ""} onChange={v => setForm(f => ({ ...f, reach: v }))} type="number" ph="10000" theme={theme} />
          <Inp label={T.impr} value={form.impressions || ""} onChange={v => setForm(f => ({ ...f, impressions: v }))} type="number" ph="50000" theme={theme} />
          <Inp label={T.rClicks} value={form.clicks || ""} onChange={v => setForm(f => ({ ...f, clicks: v }))} type="number" ph="500" theme={theme} />
          <Inp label={T.roi} value={form.roi || ""} onChange={v => setForm(f => ({ ...f, roi: v }))} type="number" ph="35" theme={theme} />
          <Btn onClick={addResult} disabled={saving} theme={theme} full sz="lg">
            {saving ? (lang === "uz" ? "Saqlanmoqda..." : "Сохранение...") : (lang === "uz" ? "Saqlash" : "Сохранить")}
          </Btn>
        </Modal>
      )}
    </div>
  );

  return (
    <div style={{ padding: 16, paddingBottom: 80 }}>
      <h2 style={{ color: theme.text, fontSize: 20, fontWeight: 800, marginBottom: 16 }}>📊 {T.title}</h2>
      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {user.role === "reklamachi" ? [
            ["💰", data.total_earned > 0 ? `${fmtNum(data.total_earned)} ${lang === "uz" ? "so'm" : "сум"}` : "—", T.earned],
            ["📈", data.win_rate > 0 ? `${data.win_rate}%` : "—",       T.winRate],
            ["📩", fmtNum(data.total_proposals || 0),                    T.props],
            ["⚡", fmtNum(data.active_campaigns || 0),                   T.active],
          ] : [
            ["💸", data.total_spend > 0 ? `${fmtNum(data.total_spend)} ${lang === "uz" ? "so'm" : "сум"}` : "—", T.spend],
            ["👁", fmtNum(data.total_reach || 0),                        T.reach],
            ["🖱", fmtNum(data.total_clicks || 0),                       T.clicks],
            ["⚡", fmtNum(data.active_campaigns || 0),                   T.active],
          ].map(([icon, val, label]) => (
            <div key={label} style={{ background: theme.card, borderRadius: 16, padding: "14px 10px", textAlign: "center", border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: theme.accent }}>{val}</div>
              <div style={{ fontSize: 11, color: theme.hint, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: theme.text, fontSize: 15 }}>🚀 {T.camps}</div>
      </div>
      {campaigns.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: theme.hint }}><div style={{ fontSize: 40, marginBottom: 10 }}>📊</div>{T.noCamp}</div>}
      {campaigns.map(c => (
        <button key={c.id} onClick={() => openCamp(c)}
          style={{ width: "100%", background: theme.card, borderRadius: 18, padding: "14px 16px", border: `1px solid ${theme.border}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, boxSizing: "border-box", textAlign: "left" }}>
          <div>
            <div style={{ fontWeight: 700, color: theme.text, fontSize: 14 }}>{c.campaign_name || c.title}</div>
            <div style={{ fontSize: 11, color: theme.hint, marginTop: 3 }}>{c.start_date?.slice(0, 10)} — {c.end_date?.slice(0, 10)}</div>
          </div>
          <span style={{ color: theme.accent, fontSize: 22 }}>›</span>
        </button>
      ))}
    </div>
  );
}

// ── PROFILE PAGE ───────────────────────────────────────
export function ProfilePage({ user, lang, theme, onLangChange }) {
  const [data,    setData]    = useState(null);
  const [stats,   setStats]   = useState(null);
  const [editM,   setEditM]   = useState(false);
  const [refM,    setRefM]    = useState(false);
  const [notifM,  setNotifM]  = useState(false);
  const [name,    setName]    = useState("");
  const [bio,     setBio]     = useState("");
  const [saving,  setSaving]  = useState(false);
  const [refInfo, setRefInfo] = useState(null);
  const [notifSettings, setNotifSettings] = useState({ offers: true, messages: true, tenders: true, broadcasts: true });

  const T = lang === "uz" ? {
    title: "Profil", edit: "Tahrirlash", save: "Saqlash",
    saving: "Saqlanmoqda...", cancel: "Bekor qilish",
    name: "Ism", bio: "Bio / Tavsif",
    deals: "Bitimlar", campaigns: "Kampaniyalar",
    portfolio: "Portfel", rating: "Reyting", trust: "Ishonch skori",
    premium: "⭐ Premium", upgrade: "Premium olish",
    verified: "✅ Tasdiqlangan", notVerified: "⏳ Tasdiqlanmoqda",
    referral: "Referral dasturi", refCode: "Mening kodim",
    refStats: "Taklif qilganlar", refBonus: "Bonus kunlar",
    notifTitle: "Bildirishnoma sozlamalari",
    notifOffers: "Takliflar", notifMsgs: "Xabarlar",
    notifTenders: "Tenderlar", notifBc: "MIDAS xabarlari",
    settings: "Sozlamalar", lang: "Til",
    // Profil oynalari tushuntirishlari
    dealsInfo: "Muvaffaqiyatli yakunlangan hamkorliklar soni. Har bir bitim ishonch skoringizni oshiradi.",
    campaignsInfo: "Siz ishtirok etgan reklama kampaniyalari soni.",
    portfolioInfo: "Siz yuklagan ish namunalari soni. Ko'p portfolio — ko'proq ishonch.",
    ratingInfo: "Hamkorlaringiz tomonidan qoldirilgan o'rtacha baho (1-5 yulduz).",
    trustInfo: "Platforma ishonch skori (0-100). Har bir bitim, o'z vaqtida ishlash va ijobiy sharhlar ballingizni oshiradi.",
  } : {
    title: "Профиль", edit: "Редактировать", save: "Сохранить",
    saving: "Сохранение...", cancel: "Отмена",
    name: "Имя", bio: "Bio / Описание",
    deals: "Сделки", campaigns: "Кампании",
    portfolio: "Портфолио", rating: "Рейтинг", trust: "Индекс доверия",
    premium: "⭐ Premium", upgrade: "Получить Premium",
    verified: "✅ Верифицирован", notVerified: "⏳ На проверке",
    referral: "Реферальная программа", refCode: "Мой код",
    refStats: "Приглашённых", refBonus: "Бонусных дней",
    notifTitle: "Настройки уведомлений",
    notifOffers: "Предложения", notifMsgs: "Сообщения",
    notifTenders: "Тендеры", notifBc: "Сообщения MIDAS",
    settings: "Настройки", lang: "Язык",
    dealsInfo: "Количество успешно завершённых сотрудничеств. Каждая сделка повышает ваш индекс доверия.",
    campaignsInfo: "Количество рекламных кампаний, в которых вы участвовали.",
    portfolioInfo: "Количество загруженных работ. Больше портфолио — больше доверия.",
    ratingInfo: "Средняя оценка от партнёров (1-5 звёзд).",
    trustInfo: "Индекс доверия платформы (0-100). Растёт с каждой сделкой, пунктуальностью и позитивными отзывами.",
  };

  useEffect(() => {
    http(`/api/users/${user.telegram_id}`).then(r => {
      setData(r); setName(r.full_name || ""); setBio(r.bio || "");
    }).catch(() => {});
    http(`/api/users/${user.telegram_id}/stats`).then(setStats).catch(() => {});
    http(`/api/referral/${user.telegram_id}`).then(setRefInfo).catch(() => {});
  }, [user]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await http(`/api/users/${user.telegram_id}`, "PUT", { full_name: name, bio });
      setEditM(false);
      http(`/api/users/${user.telegram_id}`).then(r => setData(r)).catch(() => {});
    } catch (ex) { alert(ex.message); }
    setSaving(false);
  };

  if (!data) return <div style={{ padding: 48, textAlign: "center", color: theme.hint }}>⏳</div>;

  const trustScore = Math.round(data.trust_score || 50);
  const trustColor = trustScore >= 80 ? theme.success : trustScore >= 60 ? theme.accent : trustScore >= 40 ? theme.gold : theme.hint;

  return (
    <div style={{ padding: 16, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: theme.heroGrad, borderRadius: 22, padding: "28px 20px", marginBottom: 16, textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(255,255,255,0.18)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
          {user.role === "tadbirkor" ? "🏢" : "📢"}
        </div>
        <div style={{ fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 6 }}>{data.full_name}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {data.is_premium === 1 && <Badge bg="rgba(255,255,255,0.2)" color="#fff">⭐ Premium</Badge>}
          <Badge bg="rgba(255,255,255,0.15)" color="rgba(255,255,255,0.9)">
            {data.is_verified ? T.verified : T.notVerified}
          </Badge>
          <Badge bg="rgba(255,255,255,0.15)" color="rgba(255,255,255,0.9)">⭐ {data.rating?.toFixed?.(1) || "5.0"}</Badge>
        </div>
        {/* Ishonch skori progress */}
        <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>🛡 {T.trust}</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{trustScore}/100</span>
          </div>
          <div style={{ height: 8, background: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${trustScore}%`, background: "rgba(255,255,255,0.85)", borderRadius: 4, transition: "width 0.8s ease" }} />
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 6, textAlign: "right" }}>
            {trustScore >= 80 ? (lang === "uz" ? "🏆 Ishonchli hamkor" : "🏆 Надёжный партнёр")
              : trustScore >= 60 ? (lang === "uz" ? "✅ Yaxshi obro'" : "✅ Хорошая репутация")
              : (lang === "uz" ? "⏳ Obro' to'planmoqda" : "⏳ Репутация формируется")}
          </div>
        </div>
      </div>

      {/* Stats — bosishda tushuntirma chiqadi */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          <StatCard icon="🤝" value={stats.deals || 0} label={T.deals} theme={theme}
            infoDesc={T.dealsInfo} />
          <StatCard icon="🚀" value={stats.campaigns || 0} label={T.campaigns} theme={theme}
            infoDesc={T.campaignsInfo} />
          <StatCard icon="💼" value={stats.portfolio || 0} label={T.portfolio} theme={theme}
            infoDesc={T.portfolioInfo} />
        </div>
      )}

      {/* Bio */}
      {data.bio && (
        <Card theme={theme}>
          <div style={{ fontSize: 12, color: theme.sub, marginBottom: 6, fontWeight: 600 }}>ℹ️ Bio</div>
          <p style={{ fontSize: 13, color: theme.text, margin: 0, lineHeight: 1.6 }}>{data.bio}</p>
        </Card>
      )}

      {/* Premium promo */}
      {data.is_premium !== 1 && (
        <div style={{ background: theme.premGrad, borderRadius: 20, padding: "20px", marginBottom: 12, textAlign: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: "#fff", marginBottom: 6 }}>{T.premium}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.82)", marginBottom: 14 }}>
            {lang === "uz" ? "Top ko'rinish · AI maslahat · Cheksiz takliflar" : "Top видимость · AI советы · Безлимит предложений"}
          </div>
          <button style={{ background: "rgba(255,255,255,0.9)", border: "none", borderRadius: 12, padding: "11px 24px", color: "#c9a84c", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>{T.upgrade}</button>
        </div>
      )}

      <Btn onClick={() => setEditM(true)} theme={theme} v="secondary" full style={{ marginBottom: 10 }}>✏️ {T.edit}</Btn>

      {/* Referral */}
      <button onClick={() => setRefM(true)} style={{ width: "100%", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: 10, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>🎁</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 700, color: theme.text, fontSize: 14 }}>{T.referral}</div>
            {refInfo && <div style={{ fontSize: 11, color: theme.sub, marginTop: 2 }}>{refInfo.referral_count || 0} {T.refStats} · {refInfo.bonus_days || 0} {T.refBonus}</div>}
          </div>
        </div>
        <span style={{ color: theme.accent, fontSize: 22 }}>›</span>
      </button>

      {/* Bildirishnoma sozlamalari */}
      <button onClick={() => setNotifM(true)} style={{ width: "100%", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: 10, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>🔔</span>
          <div style={{ fontWeight: 700, color: theme.text, fontSize: 14 }}>{T.notifTitle}</div>
        </div>
        <span style={{ color: theme.accent, fontSize: 22 }}>›</span>
      </button>

      {/* Til sozlamasi — oxirida */}
      <Card theme={theme} style={{ marginTop: 8 }}>
        <div style={{ fontSize: 12, color: theme.sub, marginBottom: 10, fontWeight: 600 }}>🌐 {T.lang}</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[["uz", "🇺🇿 O'zbek"], ["ru", "🇷🇺 Русский"]].map(([l, lbl]) => (
            <button key={l} onClick={() => {
              http(`/api/users/${user.telegram_id}/lang?lang=${l}`, "PUT").catch(() => {});
              onLangChange(l);
            }} style={{ flex: 1, padding: 10, borderRadius: 12, fontSize: 13, fontWeight: 600, border: `1.5px solid ${lang === l ? theme.accent : theme.border}`, background: lang === l ? theme.accentLight : theme.card2, color: lang === l ? theme.accent : theme.text, cursor: "pointer" }}>{lbl}</button>
          ))}
        </div>
      </Card>

      {/* Edit modal */}
      {editM && (
        <Modal title={`✏️ ${T.edit}`} onClose={() => setEditM(false)} theme={theme}>
          <Inp label={T.name} value={name} onChange={setName} theme={theme} />
          <Inp label={T.bio} value={bio} onChange={setBio} rows={4} ph={lang === "uz" ? "O'zingiz haqida yozing..." : "Напишите о себе..."} theme={theme} />
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <Btn onClick={() => setEditM(false)} theme={theme} v="secondary" full>{T.cancel}</Btn>
            <Btn onClick={saveProfile} disabled={saving} theme={theme} full>{saving ? T.saving : T.save}</Btn>
          </div>
        </Modal>
      )}

      {/* Referral modal */}
      {refM && refInfo && (
        <Modal title={`🎁 ${T.referral}`} onClose={() => setRefM(false)} theme={theme}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: theme.sub, marginBottom: 12, lineHeight: 1.6 }}>
              {lang === "uz"
                ? "Do'stingizni taklif qiling. Ular muvaffaqiyatli shartnoma tuzgandan keyin siz bonus kun olasiz:"
                : "Приглашайте друзей. После их первой успешной сделки вы получаете бонусные дни:"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[["1 kishi", "10 kun", "1 чел.", "10 дней"], ["3 kishi", "50 kun", "3 чел.", "50 дней"], ["5 kishi", "90 kun", "5 чел.", "90 дней"], ["7 kishi", "120 kun", "7 чел.", "120 дней"]].map((r, i) => (
                <div key={i} style={{ background: theme.card2, borderRadius: 14, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: theme.accent }}>{lang === "uz" ? r[1] : r[3]}</div>
                  <div style={{ fontSize: 11, color: theme.sub }}>{lang === "uz" ? r[0] : r[2]}</div>
                </div>
              ))}
            </div>
            <div style={{ background: theme.goldL, border: `1px solid ${theme.gold}`, borderRadius: 12, padding: "8px 12px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: theme.gold, fontWeight: 700 }}>
                +15 {lang === "uz" ? "kishi = 1 yillik Premium 🏆" : "чел. = 1 год Premium 🏆"}
              </div>
            </div>
            <div style={{ background: theme.card, borderRadius: 16, padding: "16px", border: `2px solid ${theme.accent}` }}>
              <div style={{ fontSize: 11, color: theme.sub, marginBottom: 6 }}>{T.refCode}</div>
              <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 800, color: theme.accent, letterSpacing: 2 }}>
                {refInfo.referral_code || `MIDAS-${user.telegram_id}`}
              </div>
              <button onClick={() => {
                navigator.clipboard?.writeText(refInfo.referral_code || `MIDAS-${user.telegram_id}`);
                alert(lang === "uz" ? "Kod nusxalandi ✓" : "Код скопирован ✓");
              }} style={{ marginTop: 10, background: theme.accentLight, border: `1px solid ${theme.accent}`, borderRadius: 10, padding: "8px 20px", color: theme.accent, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                📋 {lang === "uz" ? "Nusxalash" : "Копировать"}
              </button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: theme.card2, borderRadius: 14, padding: "12px", textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 22, color: theme.accent }}>{refInfo.referral_count || 0}</div>
              <div style={{ fontSize: 11, color: theme.sub }}>{T.refStats}</div>
            </div>
            <div style={{ background: theme.goldL, borderRadius: 14, padding: "12px", textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 22, color: theme.gold }}>{refInfo.bonus_days || 0}</div>
              <div style={{ fontSize: 11, color: theme.sub }}>{T.refBonus}</div>
            </div>
          </div>
        </Modal>
      )}

      {/* Bildirishnoma sozlamalari modal */}
      {notifM && (
        <Modal title={`🔔 ${T.notifTitle}`} onClose={() => setNotifM(false)} theme={theme}>
          {[
            ["offers",     T.notifOffers,  "📩"],
            ["messages",   T.notifMsgs,    "💬"],
            ["tenders",    T.notifTenders, "📋"],
            ["broadcasts", T.notifBc,      "📢"],
          ].map(([key, label, icon]) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ fontSize: 14, color: theme.text, fontWeight: 600 }}>{label}</span>
              </div>
              <button onClick={() => {
                setNotifSettings(s => {
                  const next = { ...s, [key]: !s[key] };
                  http(`/api/users/${user.telegram_id}`, "PUT", { notif_settings: next }).catch(() => {});
                  return next;
                });
              }} style={{
                width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
                background: notifSettings[key] ? theme.accent : theme.border,
                position: "relative", transition: "background 0.2s"
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 10, background: "#fff",
                  position: "absolute", top: 3,
                  left: notifSettings[key] ? 24 : 4,
                  transition: "left 0.2s"
                }} />
              </button>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}
