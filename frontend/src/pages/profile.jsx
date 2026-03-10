// ═══════════════════════════════════════════════════════
// MIDAS V8 — PROFIL SAHIFASI
// To'liq ma'lumotlar, tahrirlash, referral (alohida), ishonch
// ═══════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { Card, Btn, Inp, MoneyInp, TagCloud, Modal, Badge, TrustBadge, PageWrap, PageTitle, StatCard, ProgressBar, Empty, Spinner, Divider } from "../core";
import { http, fmtNum, parseMoney, fmtMoney, L } from "../core";
import { MidasLogo } from "../logo";
import { SECTORS, REGIONS, PLATFORMS_ALL, ROLES, FOLLOWER_RANGES, AD_GOALS } from "../constants";
import { PREMIUM_PLANS } from "../constants";

// ── REFERRAL ALOHIDA SAHIFA ────────────────────────────
export function ReferralPage({ user, lang, onBack }) {
  const uz = lang !== "ru";
  const [data, setData]  = useState(null);
  const [loading, setL]  = useState(true);

  useEffect(() => {
    http(`/api/referral/${user.telegram_id}`)
      .then(r => setData(r))
      .catch(() => {})
      .finally(() => setL(false));
  }, [user]);

  const code     = data?.referral_code || `MIDAS-${user.telegram_id}`;
  const count    = data?.referral_count || 0;
  const bonus    = data?.bonus_days || 0;
  const list     = data?.referrals || [];
  const link     = `https://t.me/midas_bot?start=${code}`;

  const copyCode = () => {
    navigator.clipboard?.writeText(link);
    window.Telegram?.WebApp?.showPopup?.({ title: "✅", message: uz ? "Havola nusxalandi!" : "Ссылка скопирована!" });
  };

  const shareLink = () => {
    window.Telegram?.WebApp?.openTelegramLink?.(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(uz ? "MIDAS platformasiga qo'shiling!" : "Присоединяйтесь к MIDAS!")}`);
  };

  const TIERS = [
    { n: 1,  d: 10,   icon: "🥉", c: "#C0C0C0" },
    { n: 3,  d: 50,   icon: "🥈", c: "#C0C0C0" },
    { n: 5,  d: 90,   icon: "🥇", c: "#D4AF37" },
    { n: 7,  d: 120,  icon: "💎", c: "#4CAF50" },
    { n: 15, d: 365,  icon: "👑", c: "#D4AF37" },
  ];

  const nextTier = TIERS.find(t => t.n > count);
  const curTier  = [...TIERS].reverse().find(t => t.n <= count);

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at top, #1A1200 0%, #0D1117 40%, #0A0D14 100%)", padding: "0 0 80px" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
        <button onClick={onBack} style={{ color: "#D4AF37", background: "rgba(212,175,55,0.08)", border: "none", cursor: "pointer", fontSize: 20, width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
        <h2 style={{ fontWeight: 900, fontSize: 18, color: "#D4AF37", margin: 0 }}>🎁 {uz ? "Referral dasturi" : "Реферальная программа"}</h2>
      </div>

      <div style={{ padding: "20px 16px" }}>
        {loading && <Spinner />}

        {!loading && <>
          {/* Hero karta */}
          <div style={{ background: "linear-gradient(135deg, #1A1200, #3D2B00, #8B6914)", borderRadius: 24, padding: "24px 20px", marginBottom: 20, textAlign: "center", border: "1px solid rgba(212,175,55,0.3)", boxShadow: "0 0 30px rgba(212,175,55,0.15)" }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>🎁</div>
            <div style={{ fontWeight: 900, fontSize: 22, color: "#D4AF37", marginBottom: 4 }}>
              {uz ? "Do'st taklif qiling — Premium yutib oling!" : "Приглашайте друзей — выигрывайте Premium!"}
            </div>
            <div style={{ fontSize: 13, color: "rgba(245,230,163,0.7)", lineHeight: 1.6 }}>
              {uz ? "Har bir taklif qilingan foydalanuvchi uchun Premium kunlar yig'ing" : "Зарабатывайте Premium-дни за каждого приглашённого пользователя"}
            </div>
          </div>

          {/* Referral kod */}
          <div style={{ background: "rgba(212,175,55,0.06)", border: "1.5px solid rgba(212,175,55,0.25)", borderRadius: 20, padding: "16px 20px", marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 8, fontWeight: 600 }}>
              {uz ? "Sizning referral kodingiz:" : "Ваш реферальный код:"}
            </div>
            <div style={{ fontWeight: 900, fontSize: 22, color: "#D4AF37", letterSpacing: "0.1em", marginBottom: 12, textShadow: "0 0 15px rgba(212,175,55,0.3)" }}>
              {code}
            </div>
            <div style={{ fontSize: 11, color: "#616161", marginBottom: 12, wordBreak: "break-all" }}>{link}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={copyCode} v="ghost" sz="sm" style={{ flex: 1 }}>📋 {uz ? "Nusxalash" : "Копировать"}</Btn>
              <Btn onClick={shareLink} v="gold" sz="sm" style={{ flex: 1 }}>📤 {uz ? "Ulashish" : "Поделиться"}</Btn>
            </div>
          </div>

          {/* Statistika */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 16, padding: "14px 8px", textAlign: "center" }}>
              <div style={{ fontWeight: 900, fontSize: 24, color: "#D4AF37" }}>{count}</div>
              <div style={{ fontSize: 10, color: "#616161", lineHeight: 1.3 }}>{uz ? "Taklif qilganlar" : "Приглашено"}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 16, padding: "14px 8px", textAlign: "center" }}>
              <div style={{ fontWeight: 900, fontSize: 24, color: "#22C55E" }}>{bonus}</div>
              <div style={{ fontSize: 10, color: "#616161", lineHeight: 1.3 }}>{uz ? "Bonus kunlar" : "Бонус дней"}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 16, padding: "14px 8px", textAlign: "center" }}>
              <div style={{ fontWeight: 900, fontSize: 24, color: "#8B5CF6" }}>{curTier?.icon || "🌱"}</div>
              <div style={{ fontSize: 10, color: "#616161", lineHeight: 1.3 }}>{uz ? "Darajangiz" : "Ваш уровень"}</div>
            </div>
          </div>

          {/* Keyingi daraja progressi */}
          {nextTier && (
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
                <span style={{ color: "#9E9E9E" }}>{uz ? "Keyingi daraja:" : "Следующий уровень:"}</span>
                <span style={{ color: nextTier.c, fontWeight: 700 }}>{nextTier.icon} {nextTier.d} {uz ? "kun" : "дней"}</span>
              </div>
              <ProgressBar value={count} max={nextTier.n} color={nextTier.c} label={`${count} / ${nextTier.n}`} />
              <div style={{ fontSize: 11, color: "#616161", marginTop: 6 }}>
                {uz ? `Yana ${nextTier.n - count} kishi taklif qiling` : `Пригласите ещё ${nextTier.n - count} человек`}
              </div>
            </div>
          )}

          {/* Bonus jadval */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: "#D4AF37", fontSize: 14, marginBottom: 12 }}>
              🏆 {uz ? "Bonus jadval" : "Таблица бонусов"}
            </div>
            {TIERS.map(t => {
              const done = count >= t.n;
              return (
                <div key={t.n} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 14, marginBottom: 8,
                  background: done ? "linear-gradient(135deg,rgba(139,105,20,0.2),rgba(212,175,55,0.1))" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${done ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.06)"}`,
                }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{t.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: done ? "#D4AF37" : "#9E9E9E", fontSize: 13 }}>
                      {t.n} {uz ? "kishi" : "человек"} → {t.d === 365 ? (uz ? "1 yil" : "1 год") : `${t.d} ${uz ? "kun" : "дней"}`} Premium
                    </div>
                    <div style={{ fontSize: 11, color: "#616161" }}>
                      {uz ? `${t.d} kunlik Premium — bepul!` : `${t.d} дней Premium — бесплатно!`}
                    </div>
                  </div>
                  {done && <span style={{ color: "#D4AF37", fontSize: 18 }}>✓</span>}
                </div>
              );
            })}
          </div>

          {/* Taklif qilinganlar ro'yxati */}
          {list.length > 0 && (
            <>
              <Divider label={uz ? "TAKLIF QILINGANLAR" : "ПРИГЛАШЁННЫЕ"} />
              {list.map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 12, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(212,175,55,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                    {ROLES.find(r => r.v === u.role)?.icon || "👤"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#E8E8E8", fontSize: 13 }}>{u.full_name || "Foydalanuvchi"}</div>
                    <div style={{ fontSize: 10, color: "#616161" }}>{u.created_at?.slice(0,10)}</div>
                  </div>
                  <Badge v={u.is_verified ? "success" : "grey"}>
                    {u.is_verified ? "✅" : "⏳"}
                  </Badge>
                </div>
              ))}
            </>
          )}
        </>}
      </div>
    </div>
  );
}

// ── PROFIL TAHRIRLASH (to'liq) ─────────────────────────
export function EditProfilePage({ user, lang, onBack, onSaved }) {
  const uz = lang !== "ru";
  const [form, setForm] = useState({ ...user });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [section, setSection] = useState("basic"); // basic | ad | audience | social

  const validate = () => {
    const e = {};
    if (!form.full_name?.trim()) e.name = uz ? "Ism kiriting" : "Введите имя";
    if (!form.phone?.trim())     e.phone = uz ? "Telefon kiriting" : "Введите телефон";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        price_post:    parseMoney(form.price_post_fmt || String(form.price_post || 0)),
        price_story:   parseMoney(form.price_story_fmt || String(form.price_story || 0)),
        price_video:   parseMoney(form.price_video_fmt || String(form.price_video || 0)),
        monthly_budget: parseMoney(form.monthly_budget_fmt || String(form.monthly_budget || 0)),
        min_budget:    parseMoney(form.min_budget_fmt || String(form.min_budget || 0)),
      };
      await http(`/api/users/${user.telegram_id}`, "PUT", payload);
      onSaved(payload);
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  const SECTIONS = [
    { v: "basic",    l_uz: "Asosiy",    icon: "👤" },
    { v: "ad",       l_uz: "Reklama",   icon: "📢" },
    { v: "audience", l_uz: "Auditoriya",icon: "👥" },
    { v: "social",   l_uz: "Ijtimoiy",  icon: "🔗" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", padding: "0 0 100px" }}>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(212,175,55,0.1)", position: "sticky", top: 0, background: "#0D1117", zIndex: 10 }}>
        <button onClick={onBack} style={{ color: "#D4AF37", background: "rgba(212,175,55,0.08)", border: "none", cursor: "pointer", fontSize: 20, width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
        <h2 style={{ fontWeight: 900, fontSize: 18, color: "#D4AF37", margin: 0 }}>✏️ {uz ? "Profilni tahrirlash" : "Редактировать профиль"}</h2>
        <Btn onClick={save} disabled={saving} v="gold" sz="sm" style={{ marginLeft: "auto" }}>
          {saving ? "⏳" : (uz ? "Saqlash" : "Сохранить")}
        </Btn>
      </div>

      {/* Section tablar */}
      <div style={{ display: "flex", gap: 6, padding: "12px 16px 0", overflowX: "auto" }}>
        {SECTIONS.map(s => (
          <button key={s.v} onClick={() => setSection(s.v)} style={{
            flexShrink: 0, padding: "8px 14px", borderRadius: 12, fontSize: 12, fontWeight: 700, border: "none",
            background: section === s.v ? "linear-gradient(135deg,#8B6914,#D4AF37)" : "rgba(255,255,255,0.04)",
            color: section === s.v ? "#0A0D14" : "#616161", cursor: "pointer", fontFamily: "inherit",
          }}>{s.icon} {s.l_uz}</button>
        ))}
      </div>

      <div style={{ padding: "16px" }}>
        {/* ASOSIY MA'LUMOTLAR */}
        {section === "basic" && <>
          <Inp label={uz ? "Ism va familiya *" : "Имя и фамилия *"} value={form.full_name || ""} onChange={v => setForm(f => ({...f, full_name: v}))} err={errors.name} required />
          <Inp label={uz ? "Telefon *" : "Телефон *"} value={form.phone || ""} onChange={v => setForm(f => ({...f, phone: v}))} err={errors.phone} required type="tel" />
          <Inp label={uz ? "Kompaniya / Kanal nomi" : "Компания / Канал"} value={form.company_name || ""} onChange={v => setForm(f => ({...f, company_name: v}))} />
          <Inp label={uz ? "Bio" : "Bio"} value={form.bio || ""} onChange={v => setForm(f => ({...f, bio: v}))} rows={4} />
          <Inp label={uz ? "Manzil" : "Адрес"} value={form.address || ""} onChange={v => setForm(f => ({...f, address: v}))} />

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 8, fontWeight: 600 }}>{uz ? "Soha" : "Сфера"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {SECTORS.slice(0,12).map(s => (
                <button key={s.v} onClick={() => setForm(f => ({...f, sector: s.v}))} style={{
                  padding: "8px 4px", borderRadius: 10, fontSize: 11, fontWeight: 600, textAlign: "center",
                  border: `1.5px solid ${form.sector === s.v ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.1)"}`,
                  background: form.sector === s.v ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.02)",
                  color: form.sector === s.v ? "#D4AF37" : "#616161", cursor: "pointer", fontFamily: "inherit",
                }}>{s.icon} {L(s, lang).slice(0,8)}</button>
              ))}
            </div>
          </div>

          <TagCloud
            options={REGIONS} selected={form.regions || []}
            onChange={v => setForm(f => ({...f, regions: v}))} max={5}
            label={uz ? "Faoliyat hududlari" : "Регионы деятельности"} getLabel={o => L(o, lang)}
          />
        </>}

        {/* REKLAMA MA'LUMOTLARI */}
        {section === "ad" && <>
          {(user.role === "reklamachi" || user.role === "dizayner" || user.role === "media_buyer") && <>
            <Inp label={uz ? "Profil havolasi" : "Ссылка на профиль"} value={form.profile_link || ""} onChange={v => setForm(f => ({...f, profile_link: v}))} ph="https://" />
            <Inp label={uz ? "Followers soni" : "Количество подписчиков"} value={form.followers || ""} onChange={v => setForm(f => ({...f, followers: v}))} type="number" />
            <Inp label={uz ? "Engagement rate (%)" : "Вовлечённость (%)"} value={form.engagement || ""} onChange={v => setForm(f => ({...f, engagement: v}))} type="number" suffix="%" />
            <MoneyInp label={uz ? "Post narxi" : "Цена за пост"} value={fmtMoney(String(form.price_post || ""))} onChange={v => setForm(f => ({...f, price_post_fmt: v, price_post: parseMoney(v)}))} />
            <MoneyInp label={uz ? "Story narxi" : "Цена за сторис"} value={fmtMoney(String(form.price_story || ""))} onChange={v => setForm(f => ({...f, price_story_fmt: v, price_story: parseMoney(v)}))} />
            <MoneyInp label={uz ? "Video narxi" : "Цена за видео"} value={fmtMoney(String(form.price_video || ""))} onChange={v => setForm(f => ({...f, price_video_fmt: v, price_video: parseMoney(v)}))} />
          </>}

          {user.role === "tadbirkor" && <>
            <MoneyInp label={uz ? "Oylik reklama byudjeti" : "Ежемесячный рекламный бюджет"} value={fmtMoney(String(form.monthly_budget || ""))} onChange={v => setForm(f => ({...f, monthly_budget_fmt: v, monthly_budget: parseMoney(v)}))} />
            <Inp label="Website" value={form.website || ""} onChange={v => setForm(f => ({...f, website: v}))} ph="https://" />
          </>}

          {user.role === "agentlik" && <>
            <Inp label={uz ? "Jamoa hajmi" : "Размер команды"} value={form.team_size || ""} onChange={v => setForm(f => ({...f, team_size: v}))} type="number" />
            <MoneyInp label={uz ? "Minimal loyiha byudjeti" : "Мин. бюджет проекта"} value={fmtMoney(String(form.min_budget || ""))} onChange={v => setForm(f => ({...f, min_budget_fmt: v, min_budget: parseMoney(v)}))} />
          </>}

          {user.role === "media_buyer" && <>
            <Inp label={uz ? "O'rtacha ROI (%)" : "Средний ROI (%)"} value={form.roi_avg || ""} onChange={v => setForm(f => ({...f, roi_avg: v}))} type="number" suffix="%" />
          </>}

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 8, fontWeight: 600 }}>
              {uz ? "Platformalar" : "Платформы"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PLATFORMS_ALL.map(p => {
                const sel = (form.platforms || []).includes(p.v);
                return (
                  <button key={p.v} onClick={() => {
                    const cur = form.platforms || [];
                    setForm(f => ({...f, platforms: sel ? cur.filter(x => x !== p.v) : [...cur, p.v]}));
                  }} style={{
                    padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    border: `1.5px solid ${sel ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.07)"}`,
                    background: sel ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.02)",
                    color: sel ? "#D4AF37" : "#616161", cursor: "pointer", fontFamily: "inherit",
                  }}>{p.icon} {L(p, lang)}</button>
                );
              })}
            </div>
          </div>
        </>}

        {/* AUDITORIYA */}
        {section === "audience" && <>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 8, fontWeight: 600 }}>
              {uz ? "Asosiy auditoriya jinsi" : "Пол основной аудитории"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[["all", uz ? "Barcha" : "Все"], ["male", uz ? "Erkaklar" : "Мужчины"], ["female", uz ? "Ayollar" : "Женщины"]].map(([v, l]) => (
                <button key={v} onClick={() => setForm(f => ({...f, audience_gender: v}))}
                  style={{ flex: 1, padding: "10px 6px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                    border: `1.5px solid ${form.audience_gender === v ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.07)"}`,
                    background: form.audience_gender === v ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.02)",
                    color: form.audience_gender === v ? "#D4AF37" : "#616161", cursor: "pointer", fontFamily: "inherit" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <TagCloud
            options={[{v:"13-17"},{v:"18-24"},{v:"25-34"},{v:"35-44"},{v:"45+"}]}
            selected={form.audience_ages || []} onChange={v => setForm(f => ({...f, audience_ages: v}))}
            label={uz ? "Asosiy yosh guruhi" : "Основная возрастная группа"} max={3} getLabel={o => o.v}
          />

          <TagCloud
            options={REGIONS} selected={form.audience_regions || []}
            onChange={v => setForm(f => ({...f, audience_regions: v}))} max={5}
            label={uz ? "Auditoriya joylashuvi" : "Расположение аудитории"} getLabel={o => L(o, lang)}
          />
        </>}

        {/* IJTIMOIY HAVOLA */}
        {section === "social" && <>
          <Inp label="Instagram" value={form.instagram || ""} onChange={v => setForm(f => ({...f, instagram: v}))} ph="https://instagram.com/..." />
          <Inp label="Telegram" value={form.telegram_channel || ""} onChange={v => setForm(f => ({...f, telegram_channel: v}))} ph="https://t.me/..." />
          <Inp label="TikTok" value={form.tiktok || ""} onChange={v => setForm(f => ({...f, tiktok: v}))} ph="https://tiktok.com/@..." />
          <Inp label="YouTube" value={form.youtube || ""} onChange={v => setForm(f => ({...f, youtube: v}))} ph="https://youtube.com/@..." />
          <Inp label="Website" value={form.website || ""} onChange={v => setForm(f => ({...f, website: v}))} ph="https://" />
        </>}

        <Btn onClick={save} disabled={saving} full sz="xl" v="gold" style={{ marginTop: 16 }}>
          {saving ? (uz ? "Saqlanmoqda..." : "Сохранение...") : (uz ? "✓ Saqlash" : "✓ Сохранить")}
        </Btn>
      </div>
    </div>
  );
}

// ── ASOSIY PROFIL SAHIFASI ─────────────────────────────
export function ProfilePage({ user, lang, onLangChange, onUserUpdate, setPage }) {
  const uz = lang !== "ru";
  const [stats,    setStats]    = useState({});
  const [screen,   setScreen]   = useState("main"); // main | edit | referral | trust | premium | notif
  const [notifSet, setNotifSet] = useState({ offers: true, match: true, messages: true, deals: true });
  const [savingN,  setSavingN]  = useState(false);

  useEffect(() => {
    http(`/api/users/${user.telegram_id}/stats`).then(r => setStats(r || {})).catch(() => {});
    http(`/api/users/${user.telegram_id}/notif-settings`).then(r => { if (r) setNotifSet(r); }).catch(() => {});
  }, [user]);

  const trust      = Math.round(user.trust_score || 50);
  const trustColor = trust >= 80 ? "#22C55E" : trust >= 60 ? "#D4AF37" : trust >= 40 ? "#9E9E9E" : "#EF4444";
  const trustLabel = trust >= 80 ? (uz ? "Yuqori" : "Высокий") : trust >= 60 ? (uz ? "Yaxshi" : "Хороший") : trust >= 40 ? (uz ? "O'rta" : "Средний") : (uz ? "Past" : "Низкий");

  const saveNotif = async (key, val) => {
    const updated = { ...notifSet, [key]: val };
    setNotifSet(updated);
    setSavingN(true);
    await http(`/api/users/${user.telegram_id}/notif-settings`, "PUT", updated).catch(() => {});
    setSavingN(false);
  };

  if (screen === "edit")    return <EditProfilePage user={user} lang={lang} onBack={() => setScreen("main")} onSaved={u => { onUserUpdate?.(u); setScreen("main"); }} />;
  if (screen === "referral") return <ReferralPage user={user} lang={lang} onBack={() => setScreen("main")} />;

  return (
    <PageWrap>
      {/* Profil karta */}
      <div style={{ background: "linear-gradient(135deg, rgba(27,94,64,0.25), rgba(212,175,55,0.08))", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 24, padding: "20px 16px", marginBottom: 16, position: "relative" }}>
        {/* Tahrirlash */}
        <button onClick={() => setScreen("edit")} style={{ position: "absolute", top: 14, right: 14, color: "#D4AF37", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          ✏️ {uz ? "Tahrirlash" : "Изменить"}
        </button>

        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: "linear-gradient(135deg,rgba(212,175,55,0.2),rgba(27,94,64,0.2))", border: "2px solid rgba(212,175,55,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>
            {ROLES.find(r => r.v === user.role)?.icon || "👤"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 18, color: "#E8E8E8", marginBottom: 4 }}>{user.full_name}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Badge v="gold">{ROLES.find(r => r.v === user.role)?.icon} {L(ROLES.find(r => r.v === user.role) || {}, lang)}</Badge>
              {user.is_premium === 1 && <Badge v="premium">⭐ Premium</Badge>}
              {user.is_verified === 1 && <Badge v="success">✅</Badge>}
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && <p style={{ fontSize: 13, color: "#9E9E9E", margin: "0 0 12px", lineHeight: 1.6 }}>{user.bio}</p>}

        {/* Ma'lumotlar */}
        <div style={{ fontSize: 12, color: "#9E9E9E", lineHeight: 2 }}>
          {user.phone        && <div>📞 {user.phone}</div>}
          {user.company_name && <div>🏢 {user.company_name}</div>}
          {user.address      && <div>📍 {user.address}</div>}
          {user.sector       && <div>🏭 {L(SECTORS.find(s => s.v === user.sector) || {}, lang)}</div>}
          {user.region       && <div>🗺 {L(REGIONS.find(r => r.v === user.region) || {}, lang)}</div>}
          {user.website      && <div>🌐 <a href={user.website} target="_blank" rel="noreferrer" style={{ color: "#D4AF37", textDecoration: "none" }}>{user.website}</a></div>}
          {user.profile_link && <div>🔗 <a href={user.profile_link} target="_blank" rel="noreferrer" style={{ color: "#D4AF37", textDecoration: "none" }}>{user.profile_link.slice(0,40)}</a></div>}
          {user.followers > 0 && <div>👥 {fmtNum(user.followers)} {uz ? "obunachi" : "подписчиков"}{user.engagement > 0 ? ` · ER ${user.engagement}%` : ""}</div>}
          {user.price_post > 0 && <div>💰 {fmtNum(user.price_post)} {uz ? "so'm/post" : "сум/пост"}</div>}
          {user.monthly_budget > 0 && <div>💵 {uz ? "Byudjet" : "Бюджет"}: {fmtNum(user.monthly_budget)} {uz ? "so'm/oy" : "сум/мес"}</div>}
          {user.team_size > 0 && <div>👨‍👩‍👧‍👦 {uz ? "Jamoa" : "Команда"}: {user.team_size} {uz ? "kishi" : "чел."}</div>}
        </div>
      </div>

      {/* Statistika */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        <StatCard icon="⭐" value={`${parseFloat(user.rating || 5).toFixed(1)}`} label={uz ? "Reyting" : "Рейтинг"} infoText={uz ? "Hamkorlar tomonidan berilgan o'rtacha baho. 5 ta bitimdan keyin yangilanadi." : "Средняя оценка от партнёров. Обновляется после 5 сделок."} />
        <StatCard icon="🤝" value={stats.deals || 0} label={uz ? "Bitimlar" : "Сделки"} infoText={uz ? "Muvaffaqiyatli yakunlangan hamkorliklar soni." : "Количество успешно завершённых партнёрств."} />
        <StatCard icon="💼" value={stats.portfolio || 0} label={uz ? "Portfolio" : "Портфолио"} infoText={uz ? "Qo'shilgan portfolio ishlari soni." : "Количество добавленных работ в портфолио."} />
      </div>

      {/* Ishonch skori */}
      <Card onClick={() => setScreen("trust")} glow={trust >= 70}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontWeight: 700, color: "#E8E8E8", fontSize: 14 }}>🛡 {uz ? "Ishonch skori" : "Индекс доверия"}</div>
          <div style={{ fontWeight: 900, fontSize: 22, color: trustColor }}>{trust}/100</div>
        </div>
        <ProgressBar value={trust} max={100} color={trustColor} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11 }}>
          <span style={{ color: trustColor, fontWeight: 700 }}>{trustLabel}</span>
          <span style={{ color: "#616161" }}>{uz ? "Ko'proq →" : "Подробнее →"}</span>
        </div>
      </Card>

      {/* Amallar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <button onClick={() => setScreen("referral")} style={{ background: "linear-gradient(135deg,rgba(139,105,20,0.25),rgba(212,175,55,0.12))", border: "1.5px solid rgba(212,175,55,0.25)", borderRadius: 18, padding: "16px 12px", textAlign: "center", cursor: "pointer" }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🎁</div>
          <div style={{ fontWeight: 700, color: "#D4AF37", fontSize: 13 }}>{uz ? "Referral dasturi" : "Рефералы"}</div>
          <div style={{ fontSize: 10, color: "#9E9E9E", marginTop: 2 }}>{uz ? "Do'st taklif qiling" : "Приглашайте друзей"}</div>
        </button>
        <button onClick={() => setPage("premium")} style={{ background: "linear-gradient(135deg,rgba(27,94,64,0.25),rgba(45,134,83,0.12))", border: "1.5px solid rgba(45,134,83,0.25)", borderRadius: 18, padding: "16px 12px", textAlign: "center", cursor: "pointer" }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>⭐</div>
          <div style={{ fontWeight: 700, color: "#4CAF50", fontSize: 13 }}>Premium</div>
          <div style={{ fontSize: 10, color: "#9E9E9E", marginTop: 2 }}>{uz ? "Ko'proq imkoniyat" : "Больше возможностей"}</div>
        </button>
      </div>

      {/* Bildirishnomalar sozlamalari */}
      <Card>
        <div style={{ fontWeight: 700, color: "#D4AF37", fontSize: 14, marginBottom: 14 }}>
          🔔 {uz ? "Bildirishnomalar" : "Уведомления"}
          {savingN && <span style={{ fontSize: 10, color: "#616161", marginLeft: 8 }}>⏳</span>}
        </div>
        {[
          ["offers",   uz ? "Yangi takliflar"   : "Новые предложения",   "📩"],
          ["match",    uz ? "Yangi matchlar"     : "Новые совпадения",    "🎯"],
          ["messages", uz ? "Xabarlar"           : "Сообщения",           "💬"],
          ["deals",    uz ? "Bitim yangiliklari" : "Обновления сделок",   "🤝"],
        ].map(([key, label, icon]) => (
          <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ fontSize: 13, color: "#9E9E9E" }}>{icon} {label}</span>
            <button onClick={() => saveNotif(key, !notifSet[key])} style={{
              width: 44, height: 24, borderRadius: 12, position: "relative", cursor: "pointer", border: "none",
              background: notifSet[key] ? "linear-gradient(135deg,#2D8653,#4CAF50)" : "rgba(255,255,255,0.1)",
              transition: "all 0.2s", flexShrink: 0,
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: "50%", background: "#fff",
                position: "absolute", top: 3, left: notifSet[key] ? 23 : 3,
                transition: "left 0.2s",
              }} />
            </button>
          </div>
        ))}
      </Card>

      {/* Til */}
      <Card>
        <div style={{ fontWeight: 700, color: "#D4AF37", fontSize: 14, marginBottom: 12 }}>🌐 {uz ? "Til" : "Язык"}</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[["uz", "🇺🇿 O'zbek"], ["ru", "🇷🇺 Русский"]].map(([v, l]) => (
            <button key={v} onClick={() => onLangChange?.(v)} style={{
              flex: 1, padding: "12px", borderRadius: 14, fontWeight: 700, fontSize: 13, border: `1.5px solid ${lang === v ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)"}`,
              background: lang === v ? "linear-gradient(135deg,rgba(139,105,20,0.3),rgba(212,175,55,0.15))" : "rgba(255,255,255,0.03)",
              color: lang === v ? "#D4AF37" : "#616161", cursor: "pointer", fontFamily: "inherit",
            }}>{l}</button>
          ))}
        </div>
      </Card>

      {/* Premium bo'lmasa promo */}
      {!user.is_premium && (
        <div onClick={() => setPage("premium")} style={{ background: "linear-gradient(135deg, #1A1200, #3D2B00, #5A3F00)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 20, padding: "18px 16px", cursor: "pointer", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 36 }}>⭐</span>
            <div>
              <div style={{ fontWeight: 900, color: "#D4AF37", fontSize: 15, marginBottom: 3 }}>Premium ga o'ting</div>
              <div style={{ fontSize: 12, color: "rgba(212,175,55,0.7)" }}>{uz ? "Ko'proq match, cheksiz takliflar, analytics" : "Больше матчей, безлимит предложений, аналитика"}</div>
            </div>
            <span style={{ marginLeft: "auto", color: "#D4AF37", fontSize: 20 }}>›</span>
          </div>
        </div>
      )}

      {/* Chiqish */}
      <button style={{ width: "100%", padding: "14px", borderRadius: 16, background: "transparent", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}>
        🚪 {uz ? "Chiqish" : "Выйти"}
      </button>
    </PageWrap>
  );
}
