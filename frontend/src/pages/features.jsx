// ═══════════════════════════════════════════════════════
// MIDAS V8 — AI MASLAHAT · ANALYTICS · KAFOLAT · PREMIUM
// ═══════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { Card, Btn, Inp, MoneyInp, Modal, Badge, PageWrap, PageTitle, Empty, Spinner, ProgressBar, Divider } from "../core";
import { http, fmtNum, parseMoney, L } from "../core";
import { SECTORS, PLATFORMS_ALL, AD_GOALS, PREMIUM_PLANS } from "../constants";

// ── AI MASLAHAT (Tadbirkor uchun) ──────────────────────
export function AIAdvisorPage({ user, lang }) {
  const uz = lang !== "ru";
  const [advice, setAdvice] = useState(null);
  const [loading, setLoad]  = useState(false);
  const [topic,   setTopic] = useState(null);
  const [chatQ,   setChatQ] = useState("");
  const [chatH,   setChatH] = useState([]);
  const [chatL,   setChatL] = useState(false);

  const TOPICS = [
    { v: "budget",    icon: "💰", l_uz: "Reklama byudjetini qanday taqsimlash?",     l_ru: "Как распределить рекламный бюджет?" },
    { v: "platform",  icon: "📱", l_uz: "Qaysi platforma samarali?",                  l_ru: "Какая платформа эффективна?" },
    { v: "audience",  icon: "👥", l_uz: "Mening maqsadli auditoriyam kim?",            l_ru: "Кто моя целевая аудитория?" },
    { v: "content",   icon: "🎬", l_uz: "Qanday kontent ishlaydi?",                   l_ru: "Какой контент работает?" },
    { v: "timing",    icon: "⏰", l_uz: "Qachon reklama qilish kerak?",               l_ru: "Когда лучше запускать рекламу?" },
    { v: "competitor",icon: "🔍", l_uz: "Raqobatchilardan qanday ustun chiqish?",     l_ru: "Как выделиться среди конкурентов?" },
    { v: "roi",       icon: "📊", l_uz: "ROI ni qanday oshirish mumkin?",             l_ru: "Как повысить ROI?" },
    { v: "crisis",    icon: "🚨", l_uz: "Reputatsiya inqirozida nima qilish kerak?",  l_ru: "Что делать при репутационном кризисе?" },
  ];

  const loadAdvice = async (topicV) => {
    setLoad(true); setTopic(topicV);
    try {
      const r = await http(`/api/ai-advisor/${user.telegram_id}?topic=${topicV}&lang=${lang}`);
      setAdvice(r);
    } catch {}
    setLoad(false);
  };

  const askChat = async () => {
    if (!chatQ.trim()) return;
    const q = chatQ; setChatQ(""); setChatL(true);
    setChatH(h => [...h, { role: "user", text: q }]);
    try {
      const r = await http(`/api/ai-advisor/${user.telegram_id}/chat`, "POST", { question: q, lang, sector: user.sector });
      setChatH(h => [...h, { role: "ai", text: r?.answer || (uz ? "Javob topilmadi" : "Ответ не найден") }]);
    } catch {
      setChatH(h => [...h, { role: "ai", text: uz ? "Xato yuz berdi. Qaytadan urinib ko'ring." : "Произошла ошибка. Попробуйте снова." }]);
    }
    setChatL(false);
  };

  const sectorObj = SECTORS.find(s => s.v === user.sector);

  return (
    <PageWrap>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, rgba(27,94,64,0.3), rgba(212,175,55,0.1))", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 24, padding: "20px 16px", marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>🤖</div>
        <div style={{ fontWeight: 900, fontSize: 20, color: "#D4AF37", marginBottom: 6 }}>
          {uz ? "MIDAS AI Maslahat" : "MIDAS AI Консультант"}
        </div>
        <div style={{ fontSize: 13, color: "#9E9E9E", lineHeight: 1.6 }}>
          {uz
            ? `${sectorObj ? L(sectorObj, lang) + " sohasidagi" : ""} biznesingiz uchun shaxsiy reklama strategiyasi`
            : `Персональная рекламная стратегия для вашего бизнеса${sectorObj ? " в сфере " + L(sectorObj, lang) : ""}`}
        </div>
      </div>

      <PageTitle icon="💡" title={uz ? "Maslahat mavzulari" : "Темы консультаций"} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {TOPICS.map(t => (
          <button key={t.v} onClick={() => loadAdvice(t.v)}
            style={{ background: topic === t.v ? "linear-gradient(135deg,rgba(139,105,20,0.3),rgba(212,175,55,0.15))" : "rgba(255,255,255,0.03)", border: `1.5px solid ${topic === t.v ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.1)"}`, borderRadius: 18, padding: "14px 10px", textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{t.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: topic === t.v ? "#D4AF37" : "#9E9E9E", lineHeight: 1.4 }}>
              {L(t, lang)}
            </div>
          </button>
        ))}
      </div>

      {loading && <Spinner />}

      {advice && !loading && (
        <Card glow>
          <div style={{ fontWeight: 800, color: "#D4AF37", fontSize: 15, marginBottom: 14 }}>
            {TOPICS.find(t => t.v === topic)?.icon} {L(TOPICS.find(t => t.v === topic) || {}, lang)}
          </div>

          {advice.summary && (
            <div style={{ background: "rgba(27,94,64,0.2)", border: "1px solid rgba(45,134,83,0.3)", borderRadius: 14, padding: "12px 14px", marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#4CAF50", fontWeight: 700, marginBottom: 6 }}>📌 {uz ? "Xulosa" : "Вывод"}</div>
              <p style={{ fontSize: 13, color: "#E8E8E8", margin: 0, lineHeight: 1.7 }}>{advice.summary}</p>
            </div>
          )}

          {advice.sections?.map((s, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700, color: "#D4AF37", fontSize: 13, marginBottom: 8 }}>
                {s.icon} {s.title}
              </div>
              {s.items?.map((item, j) => (
                <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8, padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 10 }}>
                  <span style={{ color: "#D4AF37", fontSize: 13, flexShrink: 0, marginTop: 1 }}>•</span>
                  <span style={{ fontSize: 12, color: "#9E9E9E", lineHeight: 1.6, flex: 1 }}>{item}</span>
                </div>
              ))}
            </div>
          ))}

          {advice.action && (
            <div style={{ background: "linear-gradient(135deg,rgba(139,105,20,0.2),rgba(212,175,55,0.1))", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 14, padding: "12px 14px", marginTop: 14 }}>
              <div style={{ fontSize: 11, color: "#D4AF37", fontWeight: 700, marginBottom: 6 }}>🎯 {uz ? "Keyingi qadam" : "Следующий шаг"}</div>
              <p style={{ fontSize: 12, color: "#E8E8E8", margin: 0, lineHeight: 1.6 }}>{advice.action}</p>
            </div>
          )}
        </Card>
      )}

      {/* AI Chat */}
      <Divider label={uz ? "AI BILAN SUHBAT" : "ЧАТ С AI"} />

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.1)", borderRadius: 20, padding: "16px", marginBottom: 16 }}>
        {chatH.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px 0", color: "#616161", fontSize: 13 }}>
            {uz ? "Biznesingiz haqida savol bering..." : "Задайте вопрос о вашем бизнесе..."}
          </div>
        )}
        <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 12 }}>
          {chatH.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
              <div style={{
                maxWidth: "82%", padding: "10px 14px", borderRadius: m.role === "user" ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
                background: m.role === "user"
                  ? "linear-gradient(135deg,rgba(139,105,20,0.5),rgba(212,175,55,0.25))"
                  : "rgba(27,94,64,0.25)",
                border: `1px solid ${m.role === "user" ? "rgba(212,175,55,0.3)" : "rgba(45,134,83,0.3)"}`,
                fontSize: 13, color: "#E8E8E8", lineHeight: 1.6,
              }}>
                {m.role === "ai" && <div style={{ fontSize: 10, color: "#4CAF50", marginBottom: 4 }}>🤖 AI</div>}
                {m.text}
              </div>
            </div>
          ))}
          {chatL && <div style={{ display: "flex", gap: 6, padding: 8 }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4AF37", opacity: 0.5 + i * 0.25, animation: "pulse 1s infinite" }} />)}</div>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={chatQ} onChange={e => setChatQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && askChat()}
            placeholder={uz ? "Savol yozing..." : "Напишите вопрос..."}
            style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 14, padding: "10px 14px", color: "#E8E8E8", fontSize: 13, outline: "none", fontFamily: "inherit" }}
          />
          <Btn onClick={askChat} disabled={chatL || !chatQ.trim()} v="gold" sz="sm">➤</Btn>
        </div>
      </div>
    </PageWrap>
  );
}

// ── ANALYTICS (Reklamachi/Agentlik/Media Buyer) ────────
export function AnalyticsPage({ user, lang }) {
  const uz = lang !== "ru";
  const [campaigns, setCampaigns] = useState([]);
  const [loading,   setLoad]      = useState(true);
  const [addM,      setAddM]      = useState(false);
  const [roiM,      setRoiM]      = useState(false);
  const [form,      setForm]      = useState({});
  const [saving,    setSaving]    = useState(false);
  const [roiForm,   setRoiForm]   = useState({});
  const [roiResult, setRoiResult] = useState(null);
  const [marketData, setMarketData] = useState(null);

  useEffect(() => {
    Promise.all([
      http(`/api/campaigns/${user.telegram_id}`).catch(() => []),
      http(`/api/market/insights?sector=${user.sector || ""}`).catch(() => null),
    ]).then(([c, m]) => {
      setCampaigns(Array.isArray(c) ? c : []);
      setMarketData(m);
    }).finally(() => setLoad(false));
  }, [user]);

  const calcROI = () => {
    const inv   = parseMoney(roiForm.investment || "0");
    const rev   = parseMoney(roiForm.revenue    || "0");
    const cost  = parseMoney(roiForm.ad_cost    || "0");
    if (inv <= 0) return;
    const roi   = ((rev - inv) / inv * 100).toFixed(1);
    const roas  = inv > 0 ? (rev / inv).toFixed(2) : 0;
    const net   = rev - inv - cost;
    setRoiResult({ roi, roas, net, break_even: inv > 0 ? (inv / (rev / inv)).toFixed(0) : 0 });
  };

  const saveCampaign = async () => {
    if (!form.name?.trim() || !form.platform) return;
    setSaving(true);
    try {
      await http("/api/campaigns", "POST", {
        ...form, user_id: user.telegram_id,
        budget: parseMoney(form.budget || "0"),
        spent:  parseMoney(form.spent  || "0"),
        revenue: parseMoney(form.revenue || "0"),
      });
      const r = await http(`/api/campaigns/${user.telegram_id}`);
      setCampaigns(Array.isArray(r) ? r : []);
      setAddM(false); setForm({});
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  const totals = campaigns.reduce((acc, c) => ({
    reach:   acc.reach   + (c.reach || 0),
    clicks:  acc.clicks  + (c.clicks || 0),
    spent:   acc.spent   + (c.spent  || 0),
    revenue: acc.revenue + (c.revenue || 0),
  }), { reach: 0, clicks: 0, spent: 0, revenue: 0 });

  const totalROI = totals.spent > 0
    ? ((totals.revenue - totals.spent) / totals.spent * 100).toFixed(1) : 0;

  return (
    <PageWrap>
      <PageTitle
        icon="📊"
        title={uz ? "Analytics" : "Аналитика"}
        sub={uz ? "Kampaniyalar, ROI, bozor trendlari" : "Кампании, ROI, рыночные тренды"}
        right={<Btn onClick={() => { setForm({}); setAddM(true); }} v="gold" sz="sm">+ {uz ? "Kampaniya" : "Кампания"}</Btn>}
      />

      {/* Umumiy natija */}
      {campaigns.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { icon: "👁", val: fmtNum(totals.reach),   label: "Reach",   color: "#3B82F6" },
            { icon: "🖱", val: fmtNum(totals.clicks),  label: "Clicks",  color: "#8B5CF6" },
            { icon: "💸", val: `${fmtNum(totals.spent)} so'm`, label: uz ? "Xarajat" : "Расход", color: "#EF4444" },
            { icon: "📈", val: `${totalROI}%`,          label: "ROI",     color: totalROI > 0 ? "#22C55E" : "#EF4444" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.1)", borderRadius: 16, padding: "14px 12px" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontWeight: 900, fontSize: 18, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "#616161" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ROI Kalkulyator tugmasi */}
      <button onClick={() => { setRoiResult(null); setRoiM(true); }} style={{ width: "100%", padding: "14px 16px", borderRadius: 18, background: "linear-gradient(135deg,rgba(27,94,64,0.25),rgba(45,134,83,0.12))", border: "1.5px solid rgba(45,134,83,0.3)", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 16, fontFamily: "inherit" }}>
        <span style={{ fontSize: 28 }}>📊</span>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 700, color: "#4CAF50", fontSize: 14 }}>ROI Kalkulyator</div>
          <div style={{ fontSize: 11, color: "#616161" }}>{uz ? "Reklama samaradorligini hisoblang" : "Рассчитайте эффективность рекламы"}</div>
        </div>
        <span style={{ marginLeft: "auto", color: "#4CAF50", fontSize: 20 }}>›</span>
      </button>

      {loading && <Spinner />}

      {!loading && campaigns.length === 0 && (
        <Empty icon="📊" text={uz ? "Kampaniyalar yo'q" : "Кампаний нет"} sub={uz ? "Birinchi kampaniyani qo'shing" : "Добавьте первую кампанию"} />
      )}

      {campaigns.map(c => (
        <Card key={c.id}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 800, color: "#D4AF37", fontSize: 15 }}>{c.name}</div>
              <Badge v="grey">{PLATFORMS_ALL.find(p => p.v === c.platform)?.icon} {L(PLATFORMS_ALL.find(p => p.v === c.platform) || {}, lang)}</Badge>
            </div>
            <Badge v={c.status === "active" ? "success" : c.status === "completed" ? "gold" : "grey"}>
              {c.status}
            </Badge>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {c.reach   > 0 && <div style={{ textAlign: "center" }}><div style={{ fontWeight: 700, color: "#3B82F6", fontSize: 14 }}>{fmtNum(c.reach)}</div><div style={{ fontSize: 9, color: "#616161" }}>REACH</div></div>}
            {c.clicks  > 0 && <div style={{ textAlign: "center" }}><div style={{ fontWeight: 700, color: "#8B5CF6", fontSize: 14 }}>{fmtNum(c.clicks)}</div><div style={{ fontSize: 9, color: "#616161" }}>CLICKS</div></div>}
            {c.revenue > 0 && c.spent > 0 && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, color: c.revenue > c.spent ? "#22C55E" : "#EF4444", fontSize: 14 }}>
                  {((c.revenue - c.spent) / c.spent * 100).toFixed(0)}%
                </div>
                <div style={{ fontSize: 9, color: "#616161" }}>ROI</div>
              </div>
            )}
            {c.spent > 0 && <div style={{ textAlign: "center" }}><div style={{ fontWeight: 700, color: "#EF4444", fontSize: 14 }}>{fmtNum(c.spent)}</div><div style={{ fontSize: 9, color: "#616161" }}>SARFLANGAN</div></div>}
          </div>
          {c.start_date && <div style={{ fontSize: 11, color: "#616161", marginTop: 8 }}>📅 {c.start_date?.slice(0,10)} — {c.end_date?.slice(0,10) || "..."}</div>}
        </Card>
      ))}

      {/* Bozor analitikasi */}
      {marketData && (
        <>
          <Divider label={uz ? "BOZOR ANALITIKASI" : "АНАЛИЗ РЫНКА"} />
          <Card>
            <div style={{ fontWeight: 700, color: "#D4AF37", fontSize: 14, marginBottom: 12 }}>📈 {uz ? "Bozor trendlari" : "Рыночные тренды"}</div>
            {marketData.top_sectors?.map((s, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "#9E9E9E" }}>{s.name}</span>
                  <span style={{ color: "#D4AF37", fontWeight: 700 }}>{s.percentage}%</span>
                </div>
                <ProgressBar value={s.percentage} max={100} color="#D4AF37" />
              </div>
            ))}
          </Card>
        </>
      )}

      {/* ROI KALKULYATOR MODAL */}
      {roiM && (
        <Modal title="📊 ROI Kalkulyator" onClose={() => setRoiM(false)}>
          <MoneyInp label={uz ? "Reklama investitsiyasi *" : "Рекламные инвестиции *"} value={roiForm.investment || ""} onChange={v => setRoiForm(f => ({...f, investment: v}))} required />
          <MoneyInp label={uz ? "Kelgan daromad" : "Полученный доход"} value={roiForm.revenue || ""} onChange={v => setRoiForm(f => ({...f, revenue: v}))} />
          <MoneyInp label={uz ? "Boshqa xarajatlar" : "Прочие расходы"} value={roiForm.ad_cost || ""} onChange={v => setRoiForm(f => ({...f, ad_cost: v}))} />

          <Btn onClick={calcROI} disabled={!roiForm.investment} full sz="lg" v="gold" style={{ marginBottom: 16 }}>
            {uz ? "Hisoblash" : "Рассчитать"}
          </Btn>

          {roiResult && (
            <div style={{ background: "rgba(27,94,64,0.2)", border: "1px solid rgba(45,134,83,0.3)", borderRadius: 16, padding: "16px" }}>
              <div style={{ fontWeight: 700, color: "#4CAF50", fontSize: 14, marginBottom: 12 }}>📈 {uz ? "Natija" : "Результат"}</div>
              {[
                ["ROI", `${roiResult.roi}%`, Number(roiResult.roi) > 0 ? "#22C55E" : "#EF4444"],
                ["ROAS", `${roiResult.roas}x`, "#D4AF37"],
                [uz ? "Sof foyda" : "Чистая прибыль", `${fmtNum(roiResult.net)} so'm`, Number(roiResult.net) > 0 ? "#22C55E" : "#EF4444"],
              ].map(([label, val, color]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ color: "#9E9E9E", fontSize: 13 }}>{label}</span>
                  <span style={{ fontWeight: 900, fontSize: 16, color }}>{val}</span>
                </div>
              ))}
              <div style={{ marginTop: 12, fontSize: 12, color: "#616161", lineHeight: 1.6 }}>
                {Number(roiResult.roi) > 100
                  ? (uz ? "🎉 A'lo natija! Reklama samarali ishlayapti." : "🎉 Отличный результат! Реклама работает эффективно.")
                  : Number(roiResult.roi) > 0
                  ? (uz ? "✅ Ijobiy ROI. Strategiyani takomillashtiring." : "✅ Положительный ROI. Улучшайте стратегию.")
                  : (uz ? "⚠️ Salbiy ROI. Strategiyani qayta ko'rib chiqing." : "⚠️ Отрицательный ROI. Пересмотрите стратегию.")}
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* KAMPANIYA QO'SHISH MODAL */}
      {addM && (
        <Modal title={uz ? "➕ Yangi Kampaniya" : "➕ Новая Кампания"} onClose={() => { setAddM(false); setForm({}); }}>
          <Inp label={uz ? "Kampaniya nomi *" : "Название кампании *"} value={form.name || ""} onChange={v => setForm(f => ({...f, name: v}))} required />

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 8, fontWeight: 600 }}>
              {uz ? "Platforma *" : "Платформа *"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PLATFORMS_ALL.slice(0, 8).map(p => (
                <button key={p.v} onClick={() => setForm(f => ({...f, platform: p.v}))} style={{
                  padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                  border: `1.5px solid ${form.platform === p.v ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.07)"}`,
                  background: form.platform === p.v ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.02)",
                  color: form.platform === p.v ? "#D4AF37" : "#616161", cursor: "pointer", fontFamily: "inherit",
                }}>{p.icon} {L(p, lang)}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Inp label="Reach" value={form.reach || ""} onChange={v => setForm(f => ({...f, reach: v}))} type="number" />
            <Inp label="Clicks" value={form.clicks || ""} onChange={v => setForm(f => ({...f, clicks: v}))} type="number" />
          </div>
          <MoneyInp label={uz ? "Sarflangan byudjet" : "Потраченный бюджет"} value={form.spent || ""} onChange={v => setForm(f => ({...f, spent: v}))} />
          <MoneyInp label={uz ? "Olingan daromad" : "Полученный доход"} value={form.revenue || ""} onChange={v => setForm(f => ({...f, revenue: v}))} />

          <Btn onClick={saveCampaign} disabled={saving || !form.name || !form.platform} full sz="xl" v="gold">
            {saving ? "⏳" : (uz ? "✓ Saqlash" : "✓ Сохранить")}
          </Btn>
        </Modal>
      )}
    </PageWrap>
  );
}

// ── KAFOLAT TIZIMI ─────────────────────────────────────
export function GuaranteePage({ user, lang }) {
  const uz = lang !== "ru";
  const [deals, setDeals] = useState([]);
  const [loading, setLoad] = useState(true);
  const [proofM,  setProofM] = useState(null);
  const [proofForm, setProofForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    http(`/api/guarantee/deals/${user.telegram_id}`)
      .then(r => setDeals(Array.isArray(r) ? r : []))
      .catch(() => {})
      .finally(() => setLoad(false));
  }, [user]);

  const submitProof = async () => {
    if (!proofForm.link?.trim() && !proofForm.notes?.trim()) return;
    setSaving(true);
    try {
      await http(`/api/guarantee/proof`, "POST", {
        deal_id: proofM.id, user_id: user.telegram_id,
        proof_link: proofForm.link, proof_type: proofForm.type,
        notes: proofForm.notes,
      });
      const r = await http(`/api/guarantee/deals/${user.telegram_id}`);
      setDeals(Array.isArray(r) ? r : []);
      setProofM(null); setProofForm({});
      window.Telegram?.WebApp?.showPopup?.({ title: "✅", message: uz ? "Tasdiqlash yuborildi!" : "Подтверждение отправлено!" });
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  return (
    <PageWrap>
      <PageTitle icon="🛡" title={uz ? "Kafolat Tizimi" : "Система Гарантий"} sub={uz ? "Bajarilgan ishlarni tasdiqlang" : "Подтвердите выполненные работы"} />

      {/* Info */}
      <div style={{ background: "linear-gradient(135deg,rgba(27,94,64,0.25),rgba(45,134,83,0.12))", border: "1.5px solid rgba(45,134,83,0.3)", borderRadius: 16, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: "#4CAF50", fontSize: 13, marginBottom: 6 }}>
          ℹ️ {uz ? "Kafolat tizimi nima?" : "Что такое система гарантий?"}
        </div>
        <div style={{ fontSize: 12, color: "#9E9E9E", lineHeight: 1.6 }}>
          {uz
            ? "Reklama joylashtirilganidan so'ng screenshot yoki havola orqali tasdiqlang. Bu ishonch skoringizni +15 ball oshiradi."
            : "После размещения рекламы подтвердите через скриншот или ссылку. Это повысит ваш индекс доверия на +15 баллов."}
        </div>
        <div style={{ fontSize: 11, color: "#4CAF50", marginTop: 6, fontWeight: 700 }}>
          🤖 {uz ? "Katta fayllarni (video, rasm) bot orqali yuboring" : "Большие файлы (видео, фото) отправьте через бота"}
        </div>
      </div>

      {loading && <Spinner />}

      {!loading && deals.length === 0 && (
        <Empty icon="🤝" text={uz ? "Bitimlar yo'q" : "Сделок нет"} sub={uz ? "Qabul qilingan takliflar bu yerda ko'rinadi" : "Принятые предложения отобразятся здесь"} />
      )}

      {deals.map(d => (
        <Card key={d.id}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: 800, color: "#E8E8E8", fontSize: 14 }}>{d.partner_name}</div>
              <div style={{ fontSize: 11, color: "#616161", marginTop: 2 }}>{d.created_at?.slice(0,10)}</div>
            </div>
            <Badge v={d.proof_status === "verified" ? "success" : d.proof_status === "pending" ? "gold" : "grey"}>
              {d.proof_status === "verified" ? "✅" : d.proof_status === "pending" ? "⏳" : "📝"}
              {" "}{d.proof_status || (uz ? "Tasdiqlanmagan" : "Не подтверждено")}
            </Badge>
          </div>

          {d.proof_status === "verified" && (
            <div style={{ background: "rgba(34,197,94,0.1)", borderRadius: 10, padding: "8px 12px", marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#22C55E", fontWeight: 700 }}>✅ {uz ? "Tasdiqlangan! +15 trust" : "Подтверждено! +15 к доверию"}</div>
            </div>
          )}

          {d.proof_status !== "verified" && (
            <Btn onClick={() => { setProofM(d); setProofForm({}); }} v="gold" sz="sm" full>
              📸 {uz ? "Tasdiqlash yuborish" : "Отправить подтверждение"}
            </Btn>
          )}
        </Card>
      ))}

      {/* TASDIQLASH MODAL */}
      {proofM && (
        <Modal title={uz ? "📸 Tasdiqlash" : "📸 Подтверждение"} onClose={() => setProofM(null)}>
          <div style={{ fontWeight: 700, color: "#D4AF37", marginBottom: 16 }}>{proofM.partner_name}</div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 8, fontWeight: 600 }}>{uz ? "Tasdiqlash turi" : "Тип подтверждения"}</div>
            {[["link", uz ? "🔗 Post havolasi" : "🔗 Ссылка на пост"], ["screenshot", uz ? "📸 Screenshot (bot)" : "📸 Скриншот (через бота)"], ["stats", uz ? "📊 Statistika" : "📊 Статистика"]].map(([v, l]) => (
              <button key={v} onClick={() => setProofForm(f => ({...f, type: v}))}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, width: "100%", marginBottom: 8,
                  border: `1.5px solid ${proofForm.type === v ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.07)"}`,
                  background: proofForm.type === v ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.02)",
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                <span style={{ fontWeight: 600, color: proofForm.type === v ? "#D4AF37" : "#9E9E9E", fontSize: 13 }}>{l}</span>
              </button>
            ))}
          </div>

          <Inp label={uz ? "Havola (link)" : "Ссылка"} value={proofForm.link || ""} onChange={v => setProofForm(f => ({...f, link: v}))} ph="https://" />
          <Inp label={uz ? "Izoh" : "Комментарий"} value={proofForm.notes || ""} onChange={v => setProofForm(f => ({...f, notes: v}))} rows={3} ph={uz ? "Natijalar, reach, ta'sirchanlik..." : "Результаты, охват, эффективность..."} />

          {proofForm.type === "screenshot" && (
            <div style={{ background: "rgba(27,94,64,0.15)", border: "1px solid rgba(45,134,83,0.3)", borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#4CAF50", fontWeight: 700, marginBottom: 4 }}>
                🤖 {uz ? "Screenshot yuborish:" : "Отправить скриншот:"}
              </div>
              <div style={{ fontSize: 11, color: "#9E9E9E", marginBottom: 8 }}>
                {uz ? "Screenshotni MIDAS Bot ga yuboring, u avtomatik biriktiriladi." : "Отправьте скриншот в MIDAS Bot, он автоматически привяжется."}
              </div>
              <button onClick={() => window.open("https://t.me/midas_bot", "_blank")}
                style={{ background: "rgba(27,94,64,0.4)", border: "1px solid rgba(45,134,83,0.5)", borderRadius: 10, padding: "7px 14px", color: "#4CAF50", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                🤖 {uz ? "Botni ochish" : "Открыть бота"}
              </button>
            </div>
          )}

          <Btn onClick={submitProof} disabled={saving || (!proofForm.link && !proofForm.notes)} full sz="xl" v="gold">
            {saving ? "⏳" : (uz ? "✓ Yuborish" : "✓ Отправить")}
          </Btn>
        </Modal>
      )}
    </PageWrap>
  );
}

// ── PREMIUM SAHIFASI ───────────────────────────────────
export function PremiumPage({ user, lang, onBack }) {
  const uz = lang !== "ru";
  const [sel, setSel] = useState("pro");

  const plan = PREMIUM_PLANS.find(p => p.id === sel) || PREMIUM_PLANS[1];

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at top, #1A1200 0%, #0D1117 45%, #0A0D14 100%)", padding: "0 0 80px" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ color: "#D4AF37", background: "rgba(212,175,55,0.08)", border: "none", cursor: "pointer", fontSize: 20, width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
        <h2 style={{ fontWeight: 900, fontSize: 18, color: "#D4AF37", margin: 0 }}>⭐ Premium</h2>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #1A1200, #3D2B00, #8B6914)", borderRadius: 24, padding: "24px 20px", marginBottom: 20, textAlign: "center", border: "1px solid rgba(212,175,55,0.3)" }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>⭐</div>
          <div style={{ fontWeight: 900, fontSize: 22, color: "#D4AF37" }}>MIDAS Premium</div>
          <div style={{ fontSize: 13, color: "rgba(245,230,163,0.7)", marginTop: 6 }}>
            {uz ? "Platformaning to'liq imkoniyatlaridan foydalaning" : "Используйте полный потенциал платформы"}
          </div>
        </div>

        {/* Reja tanlash */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {PREMIUM_PLANS.map(p => (
            <button key={p.id} onClick={() => setSel(p.id)} style={{
              flex: 1, padding: "12px 8px", borderRadius: 16, textAlign: "center",
              border: `2px solid ${sel === p.id ? "rgba(212,175,55,0.6)" : "rgba(255,255,255,0.07)"}`,
              background: sel === p.id ? "linear-gradient(135deg,rgba(139,105,20,0.35),rgba(212,175,55,0.15))" : "rgba(255,255,255,0.02)",
              cursor: "pointer", position: "relative",
            }}>
              {p.popular && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#D4AF37", color: "#0A0D14", fontSize: 9, fontWeight: 900, padding: "2px 8px", borderRadius: 6 }}>POPULAR</div>}
              <div style={{ fontSize: 22, marginBottom: 4 }}>{p.icon}</div>
              <div style={{ fontWeight: 800, color: sel === p.id ? "#D4AF37" : "#9E9E9E", fontSize: 13 }}>{L(p, lang)}</div>
              <div style={{ fontWeight: 900, color: sel === p.id ? "#D4AF37" : "#9E9E9E", fontSize: 16, marginTop: 4 }}>
                {fmtNum(p.price_uz)}
              </div>
              <div style={{ fontSize: 9, color: "#616161" }}>{uz ? "so'm/oy" : "сум/мес"}</div>
            </button>
          ))}
        </div>

        {/* Imkoniyatlar */}
        <Card glow={sel === "pro"}>
          <div style={{ fontWeight: 700, color: "#D4AF37", fontSize: 14, marginBottom: 12 }}>
            ✨ {uz ? "Imkoniyatlar" : "Возможности"}
          </div>
          {(plan[`features_${lang}`] || plan.features_uz).map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ color: "#D4AF37", fontSize: 14 }}>✓</span>
              <span style={{ fontSize: 13, color: "#E8E8E8" }}>{f}</span>
            </div>
          ))}
        </Card>

        {/* To'lov (mock) */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 20, padding: "16px", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: "#9E9E9E", fontSize: 13, marginBottom: 12 }}>
            💳 {uz ? "To'lov usuli" : "Способ оплаты"}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[["click", "Click"], ["payme", "Payme"], ["uzcard", "UzCard"]].map(([v, l]) => (
              <div key={v} style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 6px", textAlign: "center", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontWeight: 700, color: "#E8E8E8", fontSize: 12 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#616161", marginTop: 10, textAlign: "center" }}>
            🔒 {uz ? "To'lov tizimi tez orada qo'shiladi" : "Платёжная система добавится скоро"}
          </div>
        </div>

        <Btn onClick={() => window.open("https://t.me/midas_bot", "_blank")} full sz="xl" v="gold">
          🤖 {uz ? "Bot orqali to'lash →" : "Оплатить через бота →"}
        </Btn>

        <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#616161" }}>
          {uz ? "To'lov muammosi bo'lsa admin bilan bog'laning" : "При проблемах с оплатой свяжитесь с администратором"}
        </div>
      </div>
    </div>
  );
}
