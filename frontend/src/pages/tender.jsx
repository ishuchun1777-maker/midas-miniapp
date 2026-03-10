// ═══════════════════════════════════════════════════════
// MIDAS V8 — TENDER BOZORI
// Tadbirkor brief e'lon qiladi, reklamachilar taklif yuboradi
// ═══════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { Card, Btn, Inp, MoneyInp, DateInp, TagCloud, Modal, Badge, PageWrap, PageTitle, Empty, Spinner, Divider, ProgressBar } from "../core";
import { http, fmtNum, parseMoney, isValidDate, dateToISO, L } from "../core";
import { SECTORS, PLATFORMS_ALL, AD_GOALS, REGIONS } from "../constants";

export function TenderPage({ user, lang }) {
  const uz = lang !== "ru";
  const [tab,      setTab]      = useState("list");
  const [tenders,  setTenders]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [detail,   setDetail]   = useState(null);
  const [proposals, setProposals] = useState([]);
  const [propLoad, setPropLoad] = useState(false);
  const [propM,    setPropM]    = useState(null);
  const [propForm, setPropForm] = useState({});
  const [createM,  setCreateM]  = useState(false);
  const [form,     setForm]     = useState({});
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const [filterTab, setFilterTab] = useState("all"); // all | mine | active

  const loadTenders = async () => {
    setLoading(true);
    try {
      const r = await http(`/api/tenders?user_id=${user.telegram_id}&role=${user.role}`);
      setTenders(Array.isArray(r) ? r : []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadTenders(); }, [user]);

  const openDetail = async (t) => {
    setDetail(t);
    if (user.role === "tadbirkor" && t.owner_id === user.telegram_id) {
      setPropLoad(true);
      const r = await http(`/api/tenders/${t.id}/proposals`).catch(() => []);
      setProposals(Array.isArray(r) ? r : []);
      setPropLoad(false);
    }
  };

  const validateCreate = () => {
    const e = {};
    if (!form.title?.trim())          e.title    = uz ? "Sarlavha kiriting"          : "Введите заголовок";
    if (!form.sector)                  e.sector   = uz ? "Sohani tanlang"             : "Выберите сферу";
    if (!form.budget_min && !form.budget_max) e.budget = uz ? "Byudjetni kiriting"   : "Введите бюджет";
    if (form.budget_min && form.budget_max && parseMoney(form.budget_min) > parseMoney(form.budget_max))
                                       e.budget   = uz ? "Min > Max bo'lmasin"       : "Min > Max недопустимо";
    if (!form.deadline)                e.deadline = uz ? "Muddatni kiriting"          : "Укажите срок";
    if (form.deadline && !isValidDate(form.deadline)) e.deadline = uz ? "Noto'g'ri sana" : "Неверная дата";
    if (!form.description?.trim())     e.desc     = uz ? "Tavsifni kiriting"          : "Введите описание";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const createTender = async () => {
    if (!validateCreate()) return;
    setSaving(true);
    try {
      await http("/api/tenders", "POST", {
        ...form,
        owner_id:   user.telegram_id,
        budget_min: parseMoney(form.budget_min || "0"),
        budget_max: parseMoney(form.budget_max || "0"),
        deadline:   dateToISO(form.deadline),
        platforms:  form.platforms || [],
        regions:    form.regions   || [],
      });
      setCreateM(false); setForm({});
      await loadTenders();
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  const sendProposal = async () => {
    if (!propForm.price || !propForm.message?.trim()) return;
    setSaving(true);
    try {
      await http(`/api/tenders/${detail.id}/proposals`, "POST", {
        user_id:  user.telegram_id,
        price:    parseMoney(propForm.price),
        timeline: propForm.timeline,
        message:  propForm.message,
      });
      setPropM(false); setPropForm({});
      tg?.showPopup?.({ title: "✅", message: uz ? "Taklifingiz yuborildi!" : "Предложение отправлено!" });
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  const acceptProposal = async (propId) => {
    await http(`/api/tenders/${detail.id}/proposals/${propId}/accept`, "POST", { admin_id: user.telegram_id }).catch(() => {});
    const r = await http(`/api/tenders/${detail.id}/proposals`).catch(() => []);
    setProposals(Array.isArray(r) ? r : []);
  };

  const closeTender = async (id) => {
    await http(`/api/tenders/${id}/close`, "POST", { user_id: user.telegram_id }).catch(() => {});
    await loadTenders();
    setDetail(null);
  };

  const filtered = tenders.filter(t => {
    if (filterTab === "mine")   return t.owner_id === user.telegram_id;
    if (filterTab === "active") return t.status === "active";
    return true;
  });

  const tg = window.Telegram?.WebApp;

  return (
    <PageWrap>
      <PageTitle
        icon="📋"
        title={uz ? "Tender Bozori" : "Тендерный Рынок"}
        sub={uz ? "Loyihalar e'lon qiling va eng yaxshi hamkorni tanlang" : "Публикуйте проекты и выбирайте лучших партнёров"}
        right={user.role === "tadbirkor" && (
          <Btn onClick={() => { setForm({}); setErrors({}); setCreateM(true); }} v="gold" sz="sm">
            + {uz ? "E'lon" : "Добавить"}
          </Btn>
        )}
      />

      {/* Filter tablar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 4 }}>
        {[
          ["all",    uz ? "Hammasi" : "Все"],
          ["active", uz ? "Faol"    : "Активные"],
          ["mine",   uz ? "Mening"  : "Мои"],
        ].map(([v, l]) => (
          <button key={v} onClick={() => setFilterTab(v)} style={{
            flex: 1, padding: "9px 4px", borderRadius: 10, fontSize: 12, fontWeight: 700, border: "none",
            background: filterTab === v ? "linear-gradient(135deg,#8B6914,#D4AF37)" : "transparent",
            color: filterTab === v ? "#0A0D14" : "#616161", cursor: "pointer", fontFamily: "inherit",
          }}>{l}</button>
        ))}
      </div>

      {loading && <Spinner />}

      {!loading && filtered.length === 0 && (
        <Empty icon="📋" text={uz ? "Tenderlar topilmadi" : "Тендеров не найдено"}
          sub={uz ? "Yangi tender e'lon qiling" : "Объявите новый тендер"} />
      )}

      {filtered.map(t => (
        <Card key={t.id} glow={t.status === "active"}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: "#D4AF37", fontSize: 15, marginBottom: 6 }}>{t.title}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Badge v={t.status === "active" ? "success" : t.status === "closed" ? "danger" : "grey"}>
                  {t.status === "active" ? "🟢" : t.status === "closed" ? "🔴" : "🟡"} {t.status}
                </Badge>
                {t.sector && <Badge v="grey">🏢 {L(SECTORS.find(s => s.v === t.sector) || {}, lang)}</Badge>}
                {t.is_open !== false && <Badge v="gold">🔓 {uz ? "Ochiq" : "Открытый"}</Badge>}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {t.proposal_count > 0 && (
                <div style={{ fontWeight: 900, color: "#D4AF37", fontSize: 18 }}>{t.proposal_count}</div>
              )}
              {t.proposal_count > 0 && <div style={{ fontSize: 9, color: "#616161" }}>TAKLIF</div>}
            </div>
          </div>

          <div style={{ fontSize: 12, color: "#9E9E9E", lineHeight: 2, marginBottom: 12 }}>
            {(t.budget_min > 0 || t.budget_max > 0) && (
              <div>💰 {t.budget_min > 0 && t.budget_max > 0
                ? `${fmtNum(t.budget_min)} — ${fmtNum(t.budget_max)} ${uz ? "so'm" : "сум"}`
                : `${fmtNum(t.budget_min || t.budget_max)} ${uz ? "so'm" : "сум"}`}</div>
            )}
            {t.deadline && <div>📅 {uz ? "Muddat" : "Срок"}: {t.deadline?.slice(0,10)}</div>}
            {t.description && <div style={{ fontSize: 11, color: "#616161", marginTop: 4, lineHeight: 1.5 }}>{t.description.slice(0, 90)}{t.description.length > 90 ? "..." : ""}</div>}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={() => openDetail(t)} v="ghost" sz="sm">{uz ? "Batafsil →" : "Подробнее →"}</Btn>
            {user.role !== "tadbirkor" && t.status === "active" && (
              <Btn onClick={() => { setDetail(t); setPropM(true); }} v="gold" sz="sm">
                {uz ? "Taklif yuborish" : "Отправить предложение"}
              </Btn>
            )}
            {t.owner_id === user.telegram_id && t.status === "active" && (
              <Btn onClick={() => closeTender(t.id)} v="dark" sz="sm">
                {uz ? "Yopish" : "Закрыть"}
              </Btn>
            )}
          </div>
        </Card>
      ))}

      {/* BATAFSIL MODAL */}
      {detail && !propM && (
        <Modal title={detail.title} onClose={() => { setDetail(null); setProposals([]); }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            <Badge v={detail.status === "active" ? "success" : "danger"}>
              {detail.status === "active" ? "🟢 Faol" : "🔴 Yopilgan"}
            </Badge>
            {detail.sector && <Badge v="grey">🏢 {L(SECTORS.find(s => s.v === detail.sector) || {}, lang)}</Badge>}
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "14px 16px", marginBottom: 16, fontSize: 13, color: "#9E9E9E", lineHeight: 1.7 }}>
            {detail.description}
          </div>

          {[
            ["💰", uz ? "Byudjet" : "Бюджет",
              detail.budget_min > 0 && detail.budget_max > 0
                ? `${fmtNum(detail.budget_min)} — ${fmtNum(detail.budget_max)} so'm`
                : detail.budget_min > 0 || detail.budget_max > 0
                ? `${fmtNum(detail.budget_min || detail.budget_max)} so'm`
                : null],
            ["📅", uz ? "Muddat" : "Срок", detail.deadline?.slice(0,10)],
            ["🎯", uz ? "Maqsad" : "Цель", L(AD_GOALS.find(g => g.v === detail.goal) || {}, lang)],
            ["📍", uz ? "Hudud" : "Регион", detail.regions?.join(", ")],
            ["📢", uz ? "Platformalar" : "Платформы", detail.platforms?.map(p => L(PLATFORMS_ALL.find(x => x.v === p) || {}, lang)).join(", ")],
            ["📩", uz ? "Takliflar" : "Предложений", detail.proposal_count > 0 ? `${detail.proposal_count} ta` : null],
          ].filter(([,,v]) => v).map(([icon, key, val]) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid rgba(212,175,55,0.07)" }}>
              <span style={{ color: "#616161", fontSize: 13 }}>{icon} {key}</span>
              <span style={{ color: "#E8E8E8", fontWeight: 600, fontSize: 13 }}>{val}</span>
            </div>
          ))}

          {/* Tadbirkor uchun — kelgan takliflar */}
          {detail.owner_id === user.telegram_id && (
            <div style={{ marginTop: 20 }}>
              <Divider label={uz ? "TAKLIFLAR" : "ПРЕДЛОЖЕНИЯ"} />
              {propLoad && <Spinner />}
              {!propLoad && proposals.length === 0 && (
                <Empty icon="📭" text={uz ? "Hali taklif yo'q" : "Предложений пока нет"} />
              )}
              {proposals.map(p => (
                <div key={p.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.1)", borderRadius: 14, padding: "12px 14px", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, color: "#E8E8E8" }}>{p.full_name}</span>
                    <span style={{ fontWeight: 900, color: "#D4AF37" }}>{fmtNum(p.price)} {uz ? "so'm" : "сум"}</span>
                  </div>
                  {p.timeline && <div style={{ fontSize: 11, color: "#616161", marginBottom: 6 }}>📅 {p.timeline}</div>}
                  <p style={{ fontSize: 12, color: "#9E9E9E", margin: "0 0 10px", lineHeight: 1.6 }}>{p.message}</p>
                  {p.status !== "accepted" ? (
                    <Btn onClick={() => acceptProposal(p.id)} v="emerald" sz="sm" full>
                      ✓ {uz ? "Qabul qilish" : "Принять"}
                    </Btn>
                  ) : (
                    <Badge v="success">✅ {uz ? "Qabul qilingan" : "Принято"}</Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reklamachi uchun — taklif yuborish */}
          {user.role !== "tadbirkor" && detail.status === "active" && (
            <Btn onClick={() => setPropM(true)} full sz="lg" v="gold" style={{ marginTop: 16 }}>
              📩 {uz ? "Taklif yuborish" : "Отправить предложение"}
            </Btn>
          )}
        </Modal>
      )}

      {/* TAKLIF YUBORISH MODAL */}
      {propM && detail && (
        <Modal title={uz ? "📩 Taklif yuborish" : "📩 Отправить предложение"} onClose={() => setPropM(false)}>
          <div style={{ background: "rgba(212,175,55,0.06)", borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: "#D4AF37", fontSize: 13 }}>{detail.title}</div>
            {(detail.budget_min > 0 || detail.budget_max > 0) && (
              <div style={{ fontSize: 11, color: "#616161", marginTop: 3 }}>
                💰 {fmtNum(detail.budget_min || 0)} — {fmtNum(detail.budget_max || 0)} {uz ? "so'm" : "сум"}
              </div>
            )}
          </div>

          <MoneyInp
            label={uz ? "Sizning narxingiz *" : "Ваша цена *"}
            value={propForm.price || ""} onChange={v => setPropForm(f => ({...f, price: v}))} required
          />
          <Inp
            label={uz ? "Bajarish muddati" : "Срок выполнения"}
            value={propForm.timeline || ""} onChange={v => setPropForm(f => ({...f, timeline: v}))}
            ph={uz ? "Masa: 5 ish kuni" : "Напр: 5 рабочих дней"}
          />
          <Inp
            label={uz ? "Taklif matni *" : "Текст предложения *"}
            value={propForm.message || ""} onChange={v => setPropForm(f => ({...f, message: v}))}
            rows={5} required ph={uz ? "O'zingizni tanishtiring, tajribangizni va rejangizni yozing..." : "Представьтесь, опишите опыт и план..."}
          />

          <Btn onClick={sendProposal} disabled={saving || !propForm.price || !propForm.message?.trim()} full sz="xl" v="gold">
            {saving ? "⏳" : (uz ? "Yuborish →" : "Отправить →")}
          </Btn>
        </Modal>
      )}

      {/* YANGI TENDER YARATISH */}
      {createM && (
        <Modal title={uz ? "📋 Yangi Tender" : "📋 Новый Тендер"} onClose={() => { setCreateM(false); setForm({}); setErrors({}); }}>
          <Inp
            label={uz ? "Sarlavha *" : "Заголовок *"}
            value={form.title || ""} onChange={v => setForm(f => ({...f, title: v}))}
            err={errors.title} required ph={uz ? "Masa: Instagram reklamasi 1 oy" : "Напр: Реклама в Instagram 1 месяц"}
          />

          {/* Soha */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 8, fontWeight: 600 }}>
              {uz ? "Soha *" : "Сфера *"} <span style={{ color: "#D4AF37" }}>*</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {SECTORS.slice(0,12).map(s => (
                <button key={s.v} onClick={() => setForm(f => ({...f, sector: s.v}))} style={{
                  padding: "8px 6px", borderRadius: 10, fontSize: 11, fontWeight: 600, textAlign: "center",
                  border: `1.5px solid ${form.sector === s.v ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.1)"}`,
                  background: form.sector === s.v ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.02)",
                  color: form.sector === s.v ? "#D4AF37" : "#616161", cursor: "pointer", fontFamily: "inherit",
                }}>{s.icon} {L(s, lang).slice(0,10)}</button>
              ))}
            </div>
            {errors.sector && <div style={{ color: "#EF4444", fontSize: 11, marginTop: 4 }}>⚠ {errors.sector}</div>}
          </div>

          <Inp
            label={uz ? "Tavsif *" : "Описание *"}
            value={form.description || ""} onChange={v => setForm(f => ({...f, description: v}))}
            rows={4} required err={errors.desc}
            ph={uz ? "Nima kerak? Qanday natija kutiladi? Qanday talablar bor?" : "Что нужно? Какой результат ожидается? Требования?"}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <MoneyInp label={uz ? "Min byudjet" : "Мин. бюджет"} value={form.budget_min || ""} onChange={v => setForm(f => ({...f, budget_min: v}))} />
            <MoneyInp label={uz ? "Max byudjet *" : "Макс. бюджет *"} value={form.budget_max || ""} onChange={v => setForm(f => ({...f, budget_max: v}))} required />
          </div>
          {errors.budget && <div style={{ color: "#EF4444", fontSize: 11, marginBottom: 8 }}>⚠ {errors.budget}</div>}

          <DateInp label={uz ? "Muddat (oxirgi sana) *" : "Срок (дедлайн) *"} value={form.deadline || ""} onChange={v => setForm(f => ({...f, deadline: v}))} required err={errors.deadline} />

          <TagCloud
            options={PLATFORMS_ALL} selected={form.platforms || []}
            onChange={v => setForm(f => ({...f, platforms: v}))} max={5}
            label={uz ? "Platformalar (ixtiyoriy)" : "Платформы (необязательно)"}
            getLabel={o => `${o.icon} ${L(o, lang)}`}
          />

          <TagCloud
            options={REGIONS} selected={form.regions || []}
            onChange={v => setForm(f => ({...f, regions: v}))} max={5}
            label={uz ? "Hudud (ixtiyoriy)" : "Регион (необязательно)"}
            getLabel={o => L(o, lang)}
          />

          {/* Tender turi */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 8, fontWeight: 600 }}>
              {uz ? "Tender turi" : "Тип тендера"}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                [true,  "🔓", uz ? "Ochiq" : "Открытый",   uz ? "Barcha ko'ra oladi" : "Видят все"],
                [false, "🔒", uz ? "Yopiq" : "Закрытый",   uz ? "Faqat taklif qilinganlar" : "Только приглашённые"],
              ].map(([v, icon, title, sub]) => (
                <button key={String(v)} onClick={() => setForm(f => ({...f, is_open: v}))} style={{
                  flex: 1, padding: "12px 10px", borderRadius: 14, textAlign: "center",
                  border: `1.5px solid ${form.is_open === v ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)"}`,
                  background: form.is_open === v ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.02)",
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontWeight: 700, color: form.is_open === v ? "#D4AF37" : "#9E9E9E", fontSize: 12 }}>{title}</div>
                  <div style={{ fontSize: 10, color: "#616161" }}>{sub}</div>
                </button>
              ))}
            </div>
          </div>

          <Btn onClick={createTender} disabled={saving} full sz="xl" v="gold">
            {saving ? (uz ? "Saqlanmoqda..." : "Сохранение...") : (uz ? "📋 E'lon qilish" : "📋 Опубликовать")}
          </Btn>
        </Modal>
      )}
    </PageWrap>
  );
}
