// ═══════════════════════════════════════════════════════
// MIDAS v5 — Part 4: AI Advisor · Tender · Analytics · Profile · Admin
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { Card, Btn, Inp, TagCloud, Modal, Badge, ScoreBadge, MidasLogo, fmtNum, L, http, StatCard, Divider } from "./App_v5_part1";
import { SECTORS, PLATFORMS_ALL, AGE_OPTIONS, LOCATIONS, CAMPAIGN_GOALS, FOLLOWER_RANGES, REVIEW_TAGS, PREMIUM_PLANS } from "./constants_v5";

// ── AI ADVISOR ─────────────────────────────────────────
export function AIAdvisorPage({ user, lang, theme }) {
  const [advice,  setAdvice]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [asked,   setAsked]   = useState(false);

  const T = lang === "uz" ? {
    title:"AI Maslahatchi", sub:"Sohangiz bo'yicha real faktlarga asoslangan professional maslahatlar",
    btn:"Maslahat olish ✨", loading:"Tahlil qilinmoqda...", refresh:"Yangilash 🔄",
    premium:"⭐ Premium: Raqobatchilar tahlili + Kengaytirilgan strategiya",
    upgrade:"Yuksaltirish",
  } : {
    title:"AI Консультант", sub:"Профессиональные советы на основе реальных данных вашей сферы",
    btn:"Получить совет ✨", loading:"Анализируется...", refresh:"Обновить 🔄",
    premium:"⭐ Premium: Анализ конкурентов + Расширенная стратегия",
    upgrade:"Улучшить",
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
    if (sec.type === "warning") return { bg: theme.dangerL,  border: theme.danger,  titleColor: theme.danger  };
    if (sec.highlight)          return { bg: theme.accentLight, border: theme.accent, titleColor: theme.accent };
    if (sec.tag === "hot")      return { bg: theme.goldL,    border: theme.gold,    titleColor: theme.gold    };
    return                             { bg: theme.card2,    border: theme.border,  titleColor: theme.sub     };
  };

  return (
    <div style={{ padding: 16, paddingBottom: 80 }}>
      {/* Hero */}
      <div style={{ background: theme.heroGrad, borderRadius: 22, padding: "28px 20px", marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>🤖</div>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>{T.title}</h2>
        <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 13, margin: "0 0 22px", lineHeight: 1.5 }}>{T.sub}</p>
        <button onClick={getAdvice} disabled={loading} style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.45)", borderRadius: 14, padding: "13px 28px", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", backdropFilter: "blur(8px)" }}>
          {loading ? `⏳ ${T.loading}` : asked ? T.refresh : T.btn}
        </button>
      </div>

      {/* Premium teaser */}
      <div style={{ background: theme.goldL, border: `1px solid ${theme.gold}`, borderRadius: 18, padding: "14px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 700, color: theme.gold, fontSize: 14 }}>{T.premium}</div>
          <div style={{ fontSize: 11, color: theme.sub, marginTop: 3 }}>
            {lang === "uz" ? "Hozir 79 900 so'm/oy" : "Сейчас 79 900 сум/мес"}
          </div>
        </div>
        <Btn onClick={() => {}} theme={theme} v="gold" sz="sm">{T.upgrade}</Btn>
      </div>

      {/* Advice sections */}
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

      {/* Fallback */}
      {advice?.fallback && (
        <Card theme={theme}>
          <div style={{ textAlign: "center", padding: "20px 0", color: theme.sub, fontSize: 13 }}>
            {lang === "uz" ? "Server bilan bog'lanishda xato. Qaytadan urinib ko'ring." : "Ошибка соединения. Попробуйте снова."}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── TENDER PAGE ────────────────────────────────────────
export function TenderPage({ user, lang, theme }) {
  const [view,      setView]     = useState("list");
  const [tenders,   setTenders]  = useState([]);
  const [myTenders, setMyTenders]= useState([]);
  const [tab,       setTab]      = useState("all");
  const [detail,    setDetail]   = useState(null);
  const [proposals, setProposals]= useState([]);
  const [form,      setForm]     = useState({});
  const [propForm,  setPropForm] = useState({ cover_letter:"", price:"", delivery_days:"", plan:"" });
  const [propModal, setPropModal]= useState(false);
  const [saving,    setSaving]   = useState(false);

  const T = lang === "uz" ? {
    title:"Tender Bozori", create:"Tender e'lon qilish", myT:"Mening tenderlarim", allT:"Barcha tenderlar",
    tTitle:"Sarlavha *", tDesc:"Tavsif *", sector:"Soha *", platforms:"Platformalar",
    bMin:"Min byudjet (so'm)", bMax:"Maks byudjet (so'm) *", deadline:"Taklif muddati *",
    cStart:"Kampaniya boshlanishi", cDur:"Kampaniya muddati (kun)", reqs:"Talablar",
    tType:"Tender turi", tOpen:"Ochiq", tClosed:"Yopiq",
    submit:"Taklif yuborish", cover:"Taklif xati *", price:"Narx (so'm) *",
    days:"Bajarish muddati (kun) *", plan:"Reja",
    props:"Takliflar", propCount:"ta taklif", selectW:"G'olibni tanlash",
    noT:"Tenderlar yo'q", views:"ko'rishlar",
    status:{ open:"🟢 Ochiq", closed:"🔴 Yopiq", awarded:"🏆 Bitdi" },
    details:"Batafsil →", back:"← Orqaga", save:"Saqlash", saving:"Saqlanmoqda...",
    cancel:"Bekor qilish",
  } : {
    title:"Тендерная площадка", create:"Объявить тендер", myT:"Мои тендеры", allT:"Все тендеры",
    tTitle:"Заголовок *", tDesc:"Описание *", sector:"Сфера *", platforms:"Платформы",
    bMin:"Мин бюджет (сум)", bMax:"Макс бюджет (сум) *", deadline:"Срок предложений *",
    cStart:"Начало кампании", cDur:"Длительность (дней)", reqs:"Требования",
    tType:"Тип тендера", tOpen:"Открытый", tClosed:"Закрытый",
    submit:"Отправить предложение", cover:"Сопроводительное письмо *", price:"Цена (сум) *",
    days:"Срок выполнения (дней) *", plan:"План работы",
    props:"Предложения", propCount:"предложений", selectW:"Выбрать победителя",
    noT:"Тендеров нет", views:"просм.",
    status:{ open:"🟢 Открыт", closed:"🔴 Закрыт", awarded:"🏆 Завершён" },
    details:"Подробнее →", back:"← Назад", save:"Сохранить", saving:"Сохранение...",
    cancel:"Отмена",
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
    if (!form.title?.trim() || !form.description?.trim() || !form.budget_max || !form.deadline) return;
    setSaving(true);
    try {
      await http("/api/tenders", "POST", {
        ...form, owner_id: user.telegram_id,
        budget_min: Number(form.budget_min) || 0,
        budget_max: Number(form.budget_max) || 0,
        campaign_duration: Number(form.campaign_duration) || 30,
        platforms: form.platforms || [], target_ages: [], target_location: [], interests: []
      });
      await loadAll(); setView("list"); setTab("my");
    } catch (ex) { alert(ex.message); }
    setSaving(false);
  };

  const submitProp = async () => {
    if (!propForm.cover_letter?.trim() || !propForm.price || !propForm.delivery_days) return;
    setSaving(true);
    try {
      await http(`/api/tenders/${detail.id}/proposals`, "POST", { ...propForm, bidder_id: user.telegram_id, price: Number(propForm.price), delivery_days: Number(propForm.delivery_days) });
      setPropModal(false); loadDetail(detail.id);
      alert(lang === "uz" ? "Taklif yuborildi ✓" : "Предложение отправлено ✓");
    } catch (ex) { alert(ex.message); }
    setSaving(false);
  };

  const stBadge = { open: { bg: theme.successL, c: theme.success }, closed: { bg: theme.dangerL, c: theme.danger }, awarded: { bg: theme.goldL, c: theme.gold } };

  // Create form
  if (view === "create") return (
    <div style={{ padding: 16, paddingBottom: 80 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button onClick={() => setView("list")} style={{ color: theme.accent, background: "none", border: "none", cursor: "pointer", fontSize: 22 }}>←</button>
        <h2 style={{ color: theme.text, fontSize: 18, fontWeight: 800, margin: 0 }}>📋 {T.create}</h2>
      </div>
      <div style={{ maxHeight: "75vh", overflowY: "auto", paddingBottom: 80 }}>
        <Inp label={T.tTitle} value={form.title || ""} onChange={v => setForm(f => ({ ...f, title: v }))} theme={theme} />
        <Inp label={T.tDesc} value={form.description || ""} onChange={v => setForm(f => ({ ...f, description: v }))} rows={4} theme={theme} />
        <div style={{ fontSize: 12, color: theme.sub, marginBottom: 6, fontWeight: 600 }}>{T.sector}</div>
        <select value={form.sector || ""} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: 13, outline: "none", fontFamily: "inherit", marginBottom: 14 }}>
          <option value="">— {T.sector} —</option>
          {SECTORS.map(s => <option key={s.v} value={s.v}>{s.icon} {L(s, lang)}</option>)}
        </select>
        <TagCloud options={PLATFORMS_ALL} selected={form.platforms || []} onChange={v => setForm(f => ({ ...f, platforms: v }))} label={T.platforms} theme={theme} getLabel={o => L(o, lang)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Inp label={T.bMin} value={form.budget_min || ""} onChange={v => setForm(f => ({ ...f, budget_min: v }))} type="number" ph="500000" theme={theme} />
          <Inp label={T.bMax} value={form.budget_max || ""} onChange={v => setForm(f => ({ ...f, budget_max: v }))} type="number" ph="2000000" theme={theme} />
        </div>
        <Inp label={T.deadline} value={form.deadline || ""} onChange={v => setForm(f => ({ ...f, deadline: v }))} ph="2025-12-31" theme={theme} />
        <Inp label={T.cStart} value={form.campaign_start || ""} onChange={v => setForm(f => ({ ...f, campaign_start: v }))} ph="2026-01-15" theme={theme} />
        <Inp label={T.cDur} value={form.campaign_duration || ""} onChange={v => setForm(f => ({ ...f, campaign_duration: v }))} type="number" ph="30" theme={theme} />
        <Inp label={T.reqs} value={form.requirements || ""} onChange={v => setForm(f => ({ ...f, requirements: v }))} rows={3} theme={theme} />
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: theme.sub, marginBottom: 8, fontWeight: 600 }}>{T.tType}</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["open", T.tOpen], ["closed", T.tClosed]].map(([v, l]) => (
              <button key={v} onClick={() => setForm(f => ({ ...f, tender_type: v }))} style={{ flex: 1, padding: 12, borderRadius: 12, fontSize: 13, fontWeight: 600, border: `1.5px solid ${(form.tender_type || "open") === v ? theme.accent : theme.border}`, background: (form.tender_type || "open") === v ? theme.accentLight : theme.card2, color: (form.tender_type || "open") === v ? theme.accent : theme.text, cursor: "pointer" }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: "fixed", bottom: 68, left: 0, right: 0, padding: "12px 16px", background: theme.bg, borderTop: `1px solid ${theme.border}` }}>
        <Btn onClick={createTender} disabled={saving} theme={theme} full sz="lg">{saving ? T.saving : T.create}</Btn>
      </div>
    </div>
  );

  // Detail view
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
          <Badge bg={theme.card2} color={theme.sub}>👁 {detail.views} {T.views}</Badge>
          <Badge bg={theme.card2} color={theme.sub}>📋 {detail.proposal_count} {T.propCount}</Badge>
        </div>
        {detail.requirements && <div style={{ fontSize: 12, color: theme.sub, background: theme.card2, padding: "10px 12px", borderRadius: 10 }}><strong>{T.reqs}:</strong> {detail.requirements}</div>}
        <div style={{ marginTop: 10, fontSize: 12, color: theme.hint }}>👤 {detail.owner_name} · ⭐ {detail.owner_rating?.toFixed?.(1)} · 🛡 {Math.round(detail.owner_trust || 50)}</div>
      </Card>

      {proposals.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ color: theme.text, fontSize: 15, fontWeight: 700, marginBottom: 12 }}>📋 {T.props} ({proposals.length})</h3>
          {proposals.map(p => (
            <Card key={p.id} theme={theme} style={{ border: `1px solid ${p.status === "accepted" ? theme.accent : theme.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, color: theme.text, fontSize: 14 }}>{p.full_name}</div>
                  <div style={{ fontSize: 11, color: theme.hint, marginTop: 2 }}>⭐ {p.rating?.toFixed?.(1)} · 🛡 {Math.round(p.trust_score || 50)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, color: theme.accent, fontSize: 16 }}>{fmtNum(p.price)} {lang === "uz" ? "so'm" : "сум"}</div>
                  <div style={{ fontSize: 11, color: theme.hint }}>{p.delivery_days} {lang === "uz" ? "kun" : "дней"}</div>
                </div>
              </div>
              {p.cover_letter && <p style={{ fontSize: 12, color: theme.text, lineHeight: 1.6, margin: "0 0 10px", fontStyle: "italic", background: theme.card2, padding: "8px 12px", borderRadius: 10 }}>"{p.cover_letter}"</p>}
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
          <Inp label={T.cover} value={propForm.cover_letter} onChange={v => setPropForm(f => ({ ...f, cover_letter: v }))} rows={4} theme={theme} />
          <Inp label={T.price} value={propForm.price} onChange={v => setPropForm(f => ({ ...f, price: v }))} type="number" ph="500000" theme={theme} />
          <Inp label={T.days} value={propForm.delivery_days} onChange={v => setPropForm(f => ({ ...f, delivery_days: v }))} type="number" ph="14" theme={theme} />
          <Inp label={T.plan} value={propForm.plan} onChange={v => setPropForm(f => ({ ...f, plan: v }))} rows={3} theme={theme} />
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <Btn onClick={() => setPropModal(false)} theme={theme} v="secondary" full>{T.cancel}</Btn>
            <Btn onClick={submitProp} disabled={saving} theme={theme} full>{saving ? T.saving : T.submit}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );

  // List
  const list = tab === "my" ? myTenders : tenders;
  return (
    <div style={{ padding: 16, paddingBottom: 80 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ color: theme.text, fontSize: 20, fontWeight: 800, margin: 0 }}>📋 {T.title}</h2>
        {user.role === "tadbirkor" && <Btn onClick={() => { setForm({ platforms: [], tender_type: "open" }); setView("create"); }} theme={theme} sz="sm">+ {T.create}</Btn>}
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
            <Badge bg={theme.card2} color={theme.sub}>📋 {t.proposal_count} {T.propCount}</Badge>
          </div>
          <Btn onClick={() => { loadDetail(t.id); setView("detail"); }} theme={theme} v="ghost" sz="sm">{T.details}</Btn>
        </Card>
      ))}
    </div>
  );
}

// ── ANALYTICS PAGE ─────────────────────────────────────
export function AnalyticsPage({ user, lang, theme }) {
  const [data,     setData]     = useState(null);
  const [campaigns,setCampaigns]= useState([]);
  const [selCamp,  setSelCamp]  = useState(null);
  const [results,  setResults]  = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [addM,     setAddM]     = useState(false);
  const [form,     setForm]     = useState({});
  const [saving,   setSaving]   = useState(false);

  const T = lang === "uz" ? {
    title:"Analitika", spend:"Jami sarflandi", reach:"Umumiy qamrov",
    clicks:"Jami kliklar", active:"Faol kampaniyalar",
    earned:"Jami daromad", winRate:"G'alaba %", props:"Yuborilgan takliflar",
    camps:"Kampaniyalar", results:"Natijalar", addRes:"+ Natija qo'shish",
    date:"Sana", rReach:"Qamrov", impr:"Ko'rishlar", rClicks:"Kliklar",
    conv:"Konversiya", spend2:"Xarajat (so'm)", notes:"Izoh", proof:"Tasdiq havolasi",
    cpc:"Bir klik narxi (CPC)", cpm:"1000 ko'rish (CPM)",
    save:"Saqlash", saving:"Saqlanmoqda...", cancel:"Bekor qilish", noRes:"Natijalar yo'q",
    noCamp:"Kampaniyalar yo'q", portfolio:"Portfel", trust:"Ishonch",
  } : {
    title:"Аналитика", spend:"Всего потрачено", reach:"Общий охват",
    clicks:"Общие клики", active:"Активные кампании",
    earned:"Всего заработано", winRate:"Процент побед", props:"Отправлено предложений",
    camps:"Кампании", results:"Результаты", addRes:"+ Добавить результат",
    date:"Дата", rReach:"Охват", impr:"Показы", rClicks:"Клики",
    conv:"Конверсии", spend2:"Расход (сум)", notes:"Заметки", proof:"Ссылка-доказательство",
    cpc:"CPC", cpm:"CPM",
    save:"Сохранить", saving:"Сохранение...", cancel:"Отмена", noRes:"Результатов нет",
    noCamp:"Кампаний нет", portfolio:"Портфолио", trust:"Доверие",
  };

  useEffect(() => {
    http(`/api/analytics/${user.telegram_id}`).then(setData).catch(() => {});
    http(`/api/campaigns/${user.telegram_id}`).then(r => setCampaigns(Array.isArray(r) ? r : [])).catch(() => {});
  }, [user]);

  const loadCamp = async (cid) => {
    setSelCamp(cid);
    const [r, s] = await Promise.all([
      http(`/api/campaigns/${cid}/results`).catch(() => []),
      http(`/api/campaigns/${cid}/summary`).catch(() => ({})),
    ]);
    setResults(Array.isArray(r) ? r : []);
    setSummary(s);
  };

  const addResult = async () => {
    setSaving(true);
    try {
      await http(`/api/campaigns/${selCamp}/results`, "POST", { ...form, reach: Number(form.reach) || 0, impressions: Number(form.impressions) || 0, clicks: Number(form.clicks) || 0, conversions: Number(form.conversions) || 0, spend: Number(form.spend) || 0, date: form.date || new Date().toISOString().slice(0, 10) });
      setAddM(false); loadCamp(selCamp);
    } catch (ex) { alert(ex.message); }
    setSaving(false);
  };

  if (!data) return <div style={{ padding: 48, textAlign: "center", color: theme.hint }}>⏳</div>;

  const isTadb = user.role === "tadbirkor";

  return (
    <div style={{ padding: 16, paddingBottom: 80 }}>
      <h2 style={{ fontWeight: 800, fontSize: 20, color: theme.text, marginBottom: 16 }}>📊 {T.title}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {isTadb ? <>
          <StatCard icon="💰" value={fmtNum(data.total_spend || 0)} label={T.spend} theme={theme} />
          <StatCard icon="👁" value={fmtNum(data.total_reach || 0)} label={T.reach} theme={theme} />
          <StatCard icon="🖱" value={fmtNum(data.total_clicks || 0)} label={T.clicks} theme={theme} />
          <StatCard icon="📣" value={data.active_campaigns || 0} label={T.active} theme={theme} color={theme.accent} />
          <StatCard icon="📋" value={data.tenders_created || 0} label={lang === "uz" ? "Tenderlar" : "Тендеры"} theme={theme} />
          <StatCard icon="🛡" value={Math.round(data.trust_score || 50)} label={T.trust} theme={theme} color={theme.accentB} />
        </> : <>
          <StatCard icon="💰" value={fmtNum(data.total_earned || 0)} label={T.earned} theme={theme} />
          <StatCard icon="👁" value={fmtNum(data.total_reach_delivered || 0)} label={T.reach} theme={theme} />
          <StatCard icon="📋" value={data.proposals_sent || 0} label={T.props} theme={theme} />
          <StatCard icon="🏆" value={`${data.win_rate || 0}%`} label={T.winRate} theme={theme} color={theme.gold} />
          <StatCard icon="💼" value={data.portfolio_count || 0} label={T.portfolio} theme={theme} />
          <StatCard icon="🛡" value={Math.round(data.trust_score || 50)} label={T.trust} theme={theme} color={theme.accentB} />
        </>}
      </div>

      <h3 style={{ color: theme.text, fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🚀 {T.camps}</h3>
      {campaigns.length === 0 && <div style={{ textAlign: "center", padding: "24px 0", color: theme.hint, fontSize: 13 }}>{T.noCamp}</div>}
      {campaigns.map(c => (
        <Card key={c.id} theme={theme} style={{ border: `1px solid ${selCamp === c.id ? theme.accent : theme.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ fontWeight: 600, color: theme.text, fontSize: 14 }}>{c.title || `Kampaniya #${c.id}`}</div>
            <Badge bg={c.status === "active" ? theme.successL : theme.card2} color={c.status === "active" ? theme.success : theme.hint}>{c.status}</Badge>
          </div>
          <div style={{ fontSize: 12, color: theme.sub, marginBottom: 8 }}>{isTadb ? c.reklamachi_name : c.tadbirkor_name}</div>
          <Btn onClick={() => loadCamp(c.id)} theme={theme} v={selCamp === c.id ? "primary" : "ghost"} sz="sm">{T.results}</Btn>
        </Card>
      ))}

      {selCamp && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ color: theme.text, fontSize: 15, fontWeight: 700, margin: 0 }}>📈 {T.results}</h3>
            {user.role === "reklamachi" && <Btn onClick={() => { setForm({ date: new Date().toISOString().slice(0, 10) }); setAddM(true); }} theme={theme} sz="sm">{T.addRes}</Btn>}
          </div>
          {summary && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[["👁", fmtNum(summary.total_reach || 0), T.rReach], ["🖱", fmtNum(summary.total_clicks || 0), T.rClicks], ["⚡", fmtNum(summary.total_conversions || 0), T.conv], ["💰", fmtNum(summary.total_spend || 0), T.spend2], ["💡", summary.cpc ? fmtNum(summary.cpc) : "—", T.cpc], ["📺", summary.cpm ? fmtNum(summary.cpm) : "—", T.cpm]].map(([icon, val, label]) => (
                <div key={label} style={{ background: theme.card2, borderRadius: 12, padding: "10px 8px", textAlign: "center", border: `1px solid ${theme.border}` }}>
                  <div style={{ fontSize: 18 }}>{icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: theme.accent, marginTop: 2 }}>{val}</div>
                  <div style={{ fontSize: 10, color: theme.hint }}>{label}</div>
                </div>
              ))}
            </div>
          )}
          {results.length === 0 && <div style={{ textAlign: "center", padding: "20px 0", color: theme.hint, fontSize: 13 }}>{T.noRes}</div>}
          {results.map(r => (
            <Card key={r.id} theme={theme} style={{ padding: "10px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: theme.text, fontSize: 13 }}>{r.date}</span>
                {r.spend > 0 && <span style={{ fontSize: 12, color: theme.gold }}>💰 {fmtNum(r.spend)}</span>}
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 12, color: theme.sub }}>
                {r.reach > 0 && <span>👁 {fmtNum(r.reach)}</span>}
                {r.clicks > 0 && <span>🖱 {r.clicks}</span>}
                {r.conversions > 0 && <span>⚡ {r.conversions}</span>}
              </div>
              {r.notes && <p style={{ fontSize: 11, color: theme.hint, margin: "6px 0 0", fontStyle: "italic" }}>{r.notes}</p>}
              {r.proof_url && <a href={r.proof_url} style={{ fontSize: 11, color: theme.accent, display: "block", marginTop: 4 }}>🔗 {lang === "uz" ? "Tasdiq" : "Доказательство"}</a>}
            </Card>
          ))}
        </div>
      )}

      {addM && (
        <Modal title={`+ ${T.addRes}`} onClose={() => setAddM(false)} theme={theme}>
          <Inp label={T.date} value={form.date || ""} onChange={v => setForm(f => ({ ...f, date: v }))} ph="2025-12-01" theme={theme} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Inp label={T.rReach} value={form.reach || ""} onChange={v => setForm(f => ({ ...f, reach: v }))} type="number" theme={theme} />
            <Inp label={T.impr} value={form.impressions || ""} onChange={v => setForm(f => ({ ...f, impressions: v }))} type="number" theme={theme} />
            <Inp label={T.rClicks} value={form.clicks || ""} onChange={v => setForm(f => ({ ...f, clicks: v }))} type="number" theme={theme} />
            <Inp label={T.conv} value={form.conversions || ""} onChange={v => setForm(f => ({ ...f, conversions: v }))} type="number" theme={theme} />
          </div>
          <Inp label={T.spend2} value={form.spend || ""} onChange={v => setForm(f => ({ ...f, spend: v }))} type="number" theme={theme} />
          <Inp label={T.proof} value={form.proof_url || ""} onChange={v => setForm(f => ({ ...f, proof_url: v }))} ph="https://..." theme={theme} />
          <Inp label={T.notes} value={form.notes || ""} onChange={v => setForm(f => ({ ...f, notes: v }))} theme={theme} />
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <Btn onClick={() => setAddM(false)} theme={theme} v="secondary" full>{T.cancel}</Btn>
            <Btn onClick={addResult} disabled={saving} theme={theme} full>{saving ? T.saving : T.save}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── PROFILE PAGE ───────────────────────────────────────
export function ProfilePage({ user, lang, theme, onLangChange }) {
  const [data,   setData]   = useState(null);
  const [stats,  setStats]  = useState(null);
  const [editM,  setEditM]  = useState(false);
  const [name,   setName]   = useState("");
  const [bio,    setBio]    = useState("");
  const [saving, setSaving] = useState(false);

  const T = lang === "uz" ? {
    title:"Profil", edit:"Tahrirlash", save:"Saqlash", saving:"Saqlanmoqda...", cancel:"Bekor qilish",
    name:"Ism", bio:"Bio / Tavsif", lang:"Til", deals:"Bitimlar",
    campaigns:"Kampaniyalar", portfolio:"Portfel", rating:"Reyting",
    trust:"Ishonch skori", premium:"⭐ Premium", upgrade:"Premium olish",
    verified:"✅ Tasdiqlangan", notVerified:"⏳ Tasdiqlanmoqda",
    logout:"Chiqish", settings:"Sozlamalar",
  } : {
    title:"Профиль", edit:"Редактировать", save:"Сохранить", saving:"Сохранение...", cancel:"Отмена",
    name:"Имя", bio:"Bio / Описание", lang:"Язык", deals:"Сделки",
    campaigns:"Кампании", portfolio:"Портфолио", rating:"Рейтинг",
    trust:"Индекс доверия", premium:"⭐ Premium", upgrade:"Получить Premium",
    verified:"✅ Верифицирован", notVerified:"⏳ На проверке",
    logout:"Выйти", settings:"Настройки",
  };

  useEffect(() => {
    http(`/api/users/${user.telegram_id}`).then(r => { setData(r); setName(r.full_name || ""); setBio(r.bio || ""); }).catch(() => {});
    http(`/api/users/${user.telegram_id}/stats`).then(setStats).catch(() => {});
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

  return (
    <div style={{ padding: 16, paddingBottom: 80 }}>
      {/* Header card */}
      <div style={{ background: theme.heroGrad, borderRadius: 22, padding: "28px 20px", marginBottom: 16, textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(255,255,255,0.18)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
          {user.role === "tadbirkor" ? "🏢" : "📢"}
        </div>
        <div style={{ fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 6 }}>{data.full_name}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          {data.is_premium === 1 && <Badge bg="rgba(255,255,255,0.2)" color="#fff">⭐ Premium</Badge>}
          <Badge bg="rgba(255,255,255,0.15)" color="rgba(255,255,255,0.9)">
            {user.role === "tadbirkor" ? "🏢" : "📢"} {user.role === "tadbirkor" ? (lang === "uz" ? "Tadbirkor" : "Предприниматель") : (lang === "uz" ? "Reklamachi" : "Рекламодатель")}
          </Badge>
          <Badge bg="rgba(255,255,255,0.15)" color="rgba(255,255,255,0.9)">⭐ {data.rating?.toFixed?.(1) || "5.0"}</Badge>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "6px 14px", display: "inline-block" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>🛡 {T.trust}: </span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{Math.round(data.trust_score || 50)}/100</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          <StatCard icon="🤝" value={stats.deals || 0} label={T.deals} theme={theme} />
          <StatCard icon="🚀" value={stats.campaigns || 0} label={T.campaigns} theme={theme} />
          <StatCard icon="💼" value={stats.portfolio || 0} label={T.portfolio} theme={theme} />
        </div>
      )}

      {/* Bio */}
      {data.bio && (
        <Card theme={theme}>
          <div style={{ fontSize: 12, color: theme.sub, marginBottom: 6, fontWeight: 600 }}>ℹ️ Bio</div>
          <p style={{ fontSize: 13, color: theme.text, margin: 0, lineHeight: 1.6 }}>{data.bio}</p>
        </Card>
      )}

      {/* Lang switcher */}
      <Card theme={theme}>
        <div style={{ fontSize: 12, color: theme.sub, marginBottom: 10, fontWeight: 600 }}>🌐 {T.lang}</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[["uz", "🇺🇿 O'zbek"], ["ru", "🇷🇺 Русский"]].map(([l, lbl]) => (
            <button key={l} onClick={() => { http(`/api/users/${user.telegram_id}/lang?lang=${l}`, "PUT").catch(() => {}); onLangChange(l); }} style={{ flex: 1, padding: 10, borderRadius: 12, fontSize: 13, fontWeight: 600, border: `1.5px solid ${lang === l ? theme.accent : theme.border}`, background: lang === l ? theme.accentLight : theme.card2, color: lang === l ? theme.accent : theme.text, cursor: "pointer" }}>{lbl}</button>
          ))}
        </div>
      </Card>

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

      <Btn onClick={() => setEditM(true)} theme={theme} v="secondary" full>✏️ {T.edit}</Btn>

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
    </div>
  );
}
