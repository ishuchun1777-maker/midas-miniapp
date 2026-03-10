// ═══════════════════════════════════════════════════════
// MIDAS v7 — Part 2: Onboarding · Legal · Registration
// Tuzatildi: useState import, http import, window.React yo'q
// Qo'shildi: Referral kodi qabul qilish
// ═══════════════════════════════════════════════════════
import { useState } from "react";
import {
  MidasLogo, Btn, Inp, TagCloud, Modal, StepDots, Badge, http
} from "./App_v5_part1";
import {
  SECTORS, PLATFORMS_ONLINE, PLATFORMS_OFFLINE,
  AGE_OPTIONS, LOCATIONS, PHONE_REGEX
} from "./constants_v5";
import { LEGAL } from "./legal";

// ── ONBOARDING SLIDES ──────────────────────────────────
export function OnboardingSlides({ lang, theme, onFinish }) {
  const [slide, setSlide] = useState(0);

  const slides = {
    uz: [
      { icon: "🎯", title: "MIDAS nima?", text: "Tadbirkorlar va reklamachilarni bog'lovchi aqlli platforma. To'g'ri hamkorni topish endi oson!" },
      { icon: "🏢", title: "Tadbirkorlar uchun", text: "Sohangizni kiriting. MIDAS sizga eng mos reklamachilarni foiz ko'rsatkichi bilan taqdim etadi." },
      { icon: "📢", title: "Reklamachilar uchun", text: "Instagram, YouTube, TikTok, Billboard — platformangizni ro'yxatdan o'tkazing. Mijozlar o'zlari topsin!" },
      { icon: "📋", title: "Tender bozori", text: "Tadbirkor brief e'lon qiladi, reklamachilar taklif yuboradi. Eng yaxshi narx va reja g'olib!" },
      { icon: "🤖", title: "AI Maslahatchi", text: "Sohangiz va platformangiz bo'yicha aniq faktlarga asoslanib professional maslahatlar olasiz." },
    ],
    ru: [
      { icon: "🎯", title: "Что такое MIDAS?", text: "Умная платформа для предпринимателей и рекламодателей. Найти нужного партнёра теперь просто!" },
      { icon: "🏢", title: "Для предпринимателей", text: "Укажите сферу. MIDAS подберёт наиболее подходящих рекламодателей с процентом совпадения." },
      { icon: "📢", title: "Для рекламодателей", text: "Instagram, YouTube, TikTok, Billboard — зарегистрируйте платформу. Пусть клиенты находят вас сами!" },
      { icon: "📋", title: "Тендерная площадка", text: "Предприниматель публикует бриф, рекламодатели — предложения. Лучшая цена и план побеждают!" },
      { icon: "🤖", title: "AI Консультант", text: "Профессиональные советы на основе реальных данных вашей сферы и платформы." },
    ]
  };

  const sl  = slides[lang] || slides.uz;
  const cur = sl[slide];

  return (
    <div style={{ minHeight: "100vh", background: theme.heroGrad, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <MidasLogo size={72} theme={theme} white />
      <div style={{ fontFamily: "Georgia,serif", fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: 4, marginTop: 12, marginBottom: 4 }}>MIDAS</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 40 }}>Businessman & Advertiser</div>

      <div style={{ textAlign: "center", maxWidth: 340, width: "100%" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{cur.icon}</div>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 12px" }}>{cur.title}</h2>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 1.7, margin: "0 0 32px" }}>{cur.text}</p>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          {sl.map((_, i) => (
            <div key={i} style={{
              width: i === slide ? 24 : 8, height: 8, borderRadius: 4,
              background: i === slide ? "rgba(255,255,255,0.95)" : i < slide ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)",
              transition: "all 0.3s"
            }} />
          ))}
        </div>

        {slide < sl.length - 1
          ? <button onClick={() => setSlide(s => s + 1)} style={{ width: "100%", padding: 15, borderRadius: 14, background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.4)", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
              {lang === "uz" ? "Davom etish →" : "Продолжить →"}
            </button>
          : <button onClick={onFinish} style={{ width: "100%", padding: 15, borderRadius: 14, background: "rgba(255,255,255,0.95)", border: "none", color: theme.accent, fontWeight: 800, fontSize: 16, cursor: "pointer" }}>
              {lang === "uz" ? "Boshlash 🚀" : "Начать 🚀"}
            </button>
        }
      </div>
    </div>
  );
}

// ── LEGAL SCREEN ───────────────────────────────────────
export function LegalScreen({ lang, theme, onAgree }) {
  const [agreed, setAgreed] = useState(false);
  const [modal,  setModal]  = useState(null);
  const lg = LEGAL[lang] || LEGAL.uz;

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, padding: "32px 20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      {modal && (
        <Modal title={modal === "oferta" ? lg.oferta_title : lg.privacy_title} onClose={() => setModal(null)} theme={theme}>
          <pre style={{ fontSize: 11, color: theme.sub, whiteSpace: "pre-wrap", lineHeight: 1.8, fontFamily: "inherit" }}>
            {modal === "oferta" ? lg.oferta : lg.privacy}
          </pre>
        </Modal>
      )}

      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <MidasLogo size={60} theme={theme} />
        <h2 style={{ color: theme.text, fontSize: 20, fontWeight: 800, marginTop: 14, marginBottom: 6 }}>
          {lang === "uz" ? "Shartlar bilan tanishing" : "Ознакомьтесь с условиями"}
        </h2>
        <p style={{ color: theme.sub, fontSize: 13, margin: 0 }}>
          {lang === "uz" ? "Davom etish uchun shartlarni o'qing" : "Прочитайте условия для продолжения"}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {[["oferta", lg.read_oferta, "📄"], ["privacy", lg.read_privacy, "🔒"]].map(([k, txt, ico]) => (
          <button key={k} onClick={() => setModal(k)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, borderRadius: 16, background: theme.card, border: `1px solid ${theme.border}`, cursor: "pointer" }}>
            <span style={{ fontWeight: 600, color: theme.text, fontSize: 13 }}>{ico} {txt}</span>
            <span style={{ color: theme.accent, fontWeight: 700, fontSize: 20 }}>›</span>
          </button>
        ))}
      </div>

      <button onClick={() => setAgreed(a => !a)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, background: agreed ? theme.accentLight : theme.card, border: `1.5px solid ${agreed ? theme.accent : theme.border}`, cursor: "pointer", marginBottom: 24 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: agreed ? theme.accent : theme.inputBg, border: `2px solid ${agreed ? theme.accent : theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
          {agreed && <span style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>✓</span>}
        </div>
        <span style={{ fontSize: 13, color: theme.text, lineHeight: 1.5, textAlign: "left" }}>{lg.agree_text}</span>
      </button>

      <Btn onClick={onAgree} disabled={!agreed} theme={theme} v="primary" full sz="lg">
        {lang === "uz" ? "Roziman, davom etish →" : "Согласен, продолжить →"}
      </Btn>
    </div>
  );
}

// ── REGISTRATION ───────────────────────────────────────
export function Registration({ tgUser, onDone, theme, referralCode }) {
  const [step,      setStep]      = useState(0);
  const [lang,      setLang]      = useState("uz");
  const [role,      setRole]      = useState("");
  const [name,      setName]      = useState(tgUser?.first_name || "");
  const [phone,     setPhone]     = useState("");
  const [refCode,   setRefCode]   = useState(referralCode || "");
  const [errs,      setErrs]      = useState({});
  // Tadbirkor
  const [sector,    setSector]    = useState("");
  const [subSecs,   setSubSecs]   = useState([]);
  const [expSec,    setExpSec]    = useState(null);
  const [locs,      setLocs]      = useState([]);
  // Reklamachi
  const [platform,  setPlatform]  = useState("");
  const [link,      setLink]      = useState("");
  const [followers, setFollowers] = useState("");
  const [er,        setEr]        = useState("");
  const [pPost,     setPPost]     = useState("");
  const [pStory,    setPStory]    = useState("");
  const [pVideo,    setPVideo]    = useState("");
  const [pDesc,     setPDesc]     = useState("");
  const [address,   setAddress]   = useState("");
  const [coords,    setCoords]    = useState("");
  const [saving,    setSaving]    = useState(false);

  const isOnline  = PLATFORMS_ONLINE.map(p => p.v).includes(platform);
  const isOffline = PLATFORMS_OFFLINE.map(p => p.v).includes(platform);

  const T = {
    uz: {
      name: "To'liq ismingiz *", phone: "Telefon raqam *", phonePh: "+998901234567",
      phoneNote: "Faqat adminga ko'rinadi", phoneErr: "Format: +998XXXXXXXXX",
      fill: "Barcha * maydonlarni to'ldiring", sector: "Soha tanlang *",
      sub: "Soha turi (bir nechta)", region: "Hudud",
      save: "Saqlash", saving: "Saqlanmoqda...",
      back: "← Orqaga", next: "Davom etish →",
      verifyNote: "Ma'lumotlaringiz admin tomonidan tekshiriladi.",
      platform: "Platforma tanlang *", link: "Profil havolasi *",
      fol: "Obunachi soni *", er: "Faollik darajasi (%)",
      pPost: "Post narxi (so'm) *", pStory: "Story narxi (so'm)",
      pVideo: "Video narxi (so'm)", pDesc: "Narx haqida qo'shimcha",
      addr: "Aniq manzil *", coords: "Koordinata (ixtiyoriy)",
      refCode: "Referral kodi (ixtiyoriy)", refNote: "Do'stingiz referral kodini kiriting",
      refInvalid: "Noto'g'ri referral kodi",
    },
    ru: {
      name: "Полное имя *", phone: "Номер телефона *", phonePh: "+998901234567",
      phoneNote: "Виден только администратору", phoneErr: "Формат: +998XXXXXXXXX",
      fill: "Заполните все поля *", sector: "Выберите сферу *",
      sub: "Вид деятельности (несколько)", region: "Регион",
      save: "Сохранить", saving: "Сохранение...",
      back: "← Назад", next: "Продолжить →",
      verifyNote: "Ваши данные проверит администратор.",
      platform: "Выберите платформу *", link: "Ссылка на профиль *",
      fol: "Кол-во подписчиков *", er: "Активность (%)",
      pPost: "Цена поста (сум) *", pStory: "Цена story (сум)",
      pVideo: "Цена видео (сум)", pDesc: "Доп. о цене",
      addr: "Точный адрес *", coords: "Координаты (необязательно)",
      refCode: "Реферальный код (необязательно)", refNote: "Введите код друга",
      refInvalid: "Неверный реферальный код",
    }
  }[lang];

  const valid = (fields) => {
    const e = {};
    if (fields.includes("name")  && !name.trim())  e.name  = T.fill;
    if (fields.includes("phone")) {
      if (!phone.trim()) e.phone = T.fill;
      else if (!PHONE_REGEX.test(phone.replace(/[\s-]/g, ""))) e.phone = T.phoneErr;
    }
    if (fields.includes("sector")   && !sector)                e.sector   = T.fill;
    if (fields.includes("platform") && !platform)              e.platform = T.fill;
    if (fields.includes("link")     && isOnline && !link)      e.link     = T.fill;
    if (fields.includes("fol")      && isOnline && !followers) e.fol      = T.fill;
    if (fields.includes("price")    && !pPost)                 e.price    = T.fill;
    if (fields.includes("addr")     && isOffline && !address)  e.addr     = T.fill;
    setErrs(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    setSaving(true);
    try {
      await http("/api/users/register", "POST", {
        telegram_id: tgUser.id, username: tgUser.username,
        full_name: name, role,
        phone: phone.replace(/[\s-]/g, ""), lang,
        referral_code: refCode || null,
      });
      if (role === "tadbirkor") {
        await http(`/api/business-targets/${tgUser.id}`, "POST", {
          sector, sub_sectors: subSecs, location: locs,
          preferred_platforms: [], ages: [], target_gender: "all",
          interests: [], min_followers: 0, max_budget: 0, campaign_goal: ""
        });
      } else {
        const followersNum = parseInt(followers.replace(/\s/g, ""), 10) || 0;
        const pPostNum     = parseInt(pPost.replace(/\s/g, ""), 10) || 0;
        const pStoryNum    = parseInt(pStory.replace(/\s/g, ""), 10) || 0;
        const pVideoNum    = parseInt(pVideo.replace(/\s/g, ""), 10) || 0;
        await http(`/api/reklamachi-profiles/${tgUser.id}`, "POST", {
          platform, profile_link: link,
          followers: followersNum, engagement: Number(er) || 0,
          price_post: pPostNum, price_story: pStoryNum,
          price_video: pVideoNum, price_description: pDesc,
          address, coordinates: coords,
          audience_ages: [], audience_gender: "all",
          audience_location: "all", interests: []
        });
      }
      onDone(lang);
    } catch (ex) { alert(ex.message); }
    setSaving(false);
  };

  const S = { padding: "20px 20px 60px", minHeight: "100vh", background: theme.bg, boxSizing: "border-box" };

  // ── Step 0: Til ──
  if (step === 0) return (
    <div style={{ ...S, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 340, textAlign: "center" }}>
        <MidasLogo size={88} theme={theme} />
        <div style={{ fontFamily: "Georgia,serif", fontSize: 32, fontWeight: 800, color: theme.text, letterSpacing: 5, marginTop: 12, marginBottom: 4 }}>MIDAS</div>
        <div style={{ fontSize: 11, color: theme.sub, letterSpacing: 3, textTransform: "uppercase", marginBottom: 40 }}>Businessman & Advertiser</div>
        <p style={{ color: theme.hint, fontSize: 14, marginBottom: 20 }}>Tilni tanlang / Выберите язык</p>
        <div style={{ display: "flex", gap: 14 }}>
          {[["uz", "🇺🇿", "O'zbek"], ["ru", "🇷🇺", "Русский"]].map(([l, fl, nm]) => (
            <button key={l} onClick={() => { setLang(l); setStep(1); }} style={{ flex: 1, padding: "18px 10px", borderRadius: 18, background: theme.card, border: `2px solid ${theme.border}`, cursor: "pointer", fontWeight: 700, fontSize: 16, color: theme.text }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>{fl}</div>{nm}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Step 1: Rol ──
  if (step === 1) return (
    <div style={{ ...S, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <MidasLogo size={56} theme={theme} />
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 800, color: theme.text, marginTop: 12, letterSpacing: 2 }}>MIDAS</h2>
        <p style={{ color: theme.sub, fontSize: 13, marginTop: 4 }}>{lang === "uz" ? "Rolingizni tanlang" : "Выберите роль"}</p>
      </div>
      {[
        { r: "tadbirkor", icon: "🏢", title: lang === "uz" ? "Tadbirkor" : "Предприниматель", desc: lang === "uz" ? "Reklama buyurtma qilaman" : "Заказываю рекламу" },
        { r: "reklamachi", icon: "📢", title: lang === "uz" ? "Reklamachi" : "Рекламодатель", desc: lang === "uz" ? "Reklama joylashtirishni taklif qilaman" : "Предлагаю рекламные услуги" },
      ].map(rr => (
        <button key={rr.r} onClick={() => { setRole(rr.r); setStep(2); }} style={{ background: theme.card, border: `2px solid ${theme.border}`, borderRadius: 20, padding: "20px", textAlign: "left", cursor: "pointer", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 36, width: 56, height: 56, background: theme.accentLight, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{rr.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: theme.text }}>{rr.title}</div>
              <div style={{ fontSize: 12, color: theme.sub, marginTop: 3 }}>{rr.desc}</div>
            </div>
            <div style={{ marginLeft: "auto", color: theme.accent, fontSize: 26 }}>›</div>
          </div>
        </button>
      ))}
      <button onClick={() => setStep(0)} style={{ marginTop: 16, color: theme.hint, fontSize: 13, background: "none", border: "none", cursor: "pointer", textAlign: "center" }}>{T.back}</button>
    </div>
  );

  // ── Step 2: Asosiy ma'lumot ──
  if (step === 2) return (
    <div style={S}>
      <StepDots cur={0} total={2} theme={theme} />
      <h2 style={{ color: theme.text, fontSize: 20, fontWeight: 800, marginBottom: 18 }}>👤 {lang === "uz" ? "Asosiy ma'lumot" : "Основные данные"}</h2>
      <Inp label={T.name} value={name} onChange={setName} err={errs.name} theme={theme} />
      <Inp label={T.phone} value={phone} onChange={v => { setPhone(v); setErrs(e => ({ ...e, phone: "" })); }} ph={T.phonePh} err={errs.phone} note={T.phoneNote} theme={theme} />
      <Inp label={T.refCode} value={refCode} onChange={setRefCode} ph="MIDAS-XXXXXX" note={T.refNote} theme={theme} />
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <Btn onClick={() => setStep(1)} theme={theme} v="secondary" full>{T.back}</Btn>
        <Btn onClick={() => { if (valid(["name", "phone"])) setStep(3); }} theme={theme} full>{T.next}</Btn>
      </div>
    </div>
  );

  // ── Step 3: Tadbirkor — Soha ──
  if (step === 3 && role === "tadbirkor") return (
    <div style={S}>
      <StepDots cur={1} total={2} theme={theme} />
      <h2 style={{ color: theme.text, fontSize: 20, fontWeight: 800, marginBottom: 4 }}>🏢 {lang === "uz" ? "Biznes ma'lumotlari" : "Данные бизнеса"}</h2>
      <p style={{ color: theme.sub, fontSize: 12, marginBottom: 16 }}>{lang === "uz" ? "Faqat soha va hudud — qolganlar match da" : "Только сфера и регион — остальное в матче"}</p>

      <div style={{ fontSize: 12, color: theme.sub, marginBottom: 8, fontWeight: 600 }}>{T.sector}</div>
      {errs.sector && <div style={{ color: theme.danger, fontSize: 11, marginBottom: 8 }}>⚠ {errs.sector}</div>}
      <div style={{ maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {SECTORS.map(s => (
          <div key={s.v}>
            <button onClick={() => { setSector(s.v); setSubSecs([]); setExpSec(expSec === s.v ? null : s.v); setErrs(e => ({ ...e, sector: "" })); }}
              style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${sector === s.v ? theme.accent : theme.border}`, background: sector === s.v ? theme.accentLight : theme.card, color: sector === s.v ? theme.accent : theme.text, fontWeight: 600, fontSize: 13, cursor: "pointer", boxSizing: "border-box" }}>
              <span>{s.icon} {s[`l_${lang}`] || s.l_uz}</span>
              <span style={{ fontSize: 10, opacity: 0.7 }}>{expSec === s.v ? "▲" : "▼"}</span>
            </button>
            {expSec === s.v && s.sub?.length > 0 && (
              <div style={{ marginLeft: 14, marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {s.sub.map(sub => (
                  <button key={sub.v} onClick={() => setSubSecs(p => p.includes(sub.v) ? p.filter(x => x !== sub.v) : [...p, sub.v])}
                    style={{ padding: "6px 12px", borderRadius: 16, fontSize: 12, fontWeight: 600, border: `1.5px solid ${subSecs.includes(sub.v) ? theme.accent : theme.border}`, background: subSecs.includes(sub.v) ? theme.accent : theme.card2, color: subSecs.includes(sub.v) ? "#fff" : theme.sub, cursor: "pointer" }}>
                    {sub[`l_${lang}`] || sub.l_uz}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <TagCloud options={LOCATIONS} selected={locs} onChange={setLocs} label={T.region} theme={theme} getLabel={o => o[`l_${lang}`] || o.l_uz} />

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <Btn onClick={() => setStep(2)} theme={theme} v="secondary" full>{T.back}</Btn>
        <Btn onClick={() => { if (valid(["sector"])) submit(); }} disabled={saving} theme={theme} full>{saving ? T.saving : T.save}</Btn>
      </div>
    </div>
  );

  // ── Step 3: Reklamachi — Platforma ──
  if (role === "reklamachi") return (
    <div style={S}>
      <StepDots cur={1} total={2} theme={theme} />
      <h2 style={{ color: theme.text, fontSize: 20, fontWeight: 800, marginBottom: 16 }}>📢 {lang === "uz" ? "Reklama platformasi" : "Рекламная платформа"}</h2>

      <div style={{ fontSize: 12, color: theme.sub, marginBottom: 8, fontWeight: 600 }}>{T.platform}</div>
      {errs.platform && <div style={{ color: theme.danger, fontSize: 11, marginBottom: 8 }}>⚠ {errs.platform}</div>}

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: theme.hint, marginBottom: 8, textTransform: "uppercase", letterSpacing: 2, fontWeight: 600 }}>Online</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {PLATFORMS_ONLINE.map(p => (
            <button key={p.v} onClick={() => { setPlatform(p.v); setErrs(e => ({ ...e, platform: "" })); }}
              style={{ padding: "14px 10px", borderRadius: 14, fontSize: 12, fontWeight: 700, border: `1.5px solid ${platform === p.v ? theme.accent : theme.border}`, background: platform === p.v ? theme.accentLight : theme.card, color: platform === p.v ? theme.accent : theme.text, cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{p.icon}</div>
              {p[`l_${lang}`] || p.l_uz}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: theme.hint, marginBottom: 8, textTransform: "uppercase", letterSpacing: 2, fontWeight: 600 }}>Offline</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {PLATFORMS_OFFLINE.map(p => (
            <button key={p.v} onClick={() => { setPlatform(p.v); setErrs(e => ({ ...e, platform: "" })); }}
              style={{ padding: "14px 10px", borderRadius: 14, fontSize: 12, fontWeight: 700, border: `1.5px solid ${platform === p.v ? theme.accent : theme.border}`, background: platform === p.v ? theme.accentLight : theme.card, color: platform === p.v ? theme.accent : theme.text, cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{p.icon}</div>
              {p[`l_${lang}`] || p.l_uz}
            </button>
          ))}
        </div>
      </div>

      {platform && (
        <div style={{ marginTop: 16 }}>
          {isOnline && (
            <div style={{ background: theme.accentLight, border: `1px solid ${theme.accent}`, borderRadius: 12, padding: "10px 14px", marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: theme.accent, margin: 0 }}>ℹ️ {T.verifyNote}</p>
            </div>
          )}
          {isOnline && <>
            <Inp label={T.link} value={link} onChange={v => { setLink(v); setErrs(e => ({ ...e, link: "" })); }} ph="https://instagram.com/username" err={errs.link} theme={theme} />
            <Inp label={T.fol} value={followers} onChange={v => { setFollowers(v); setErrs(e => ({ ...e, fol: "" })); }} type="number" ph="50000" err={errs.fol} theme={theme} />
            <Inp label={T.er} value={er} onChange={setEr} type="number" ph="3.5" suffix="%" theme={theme} />
          </>}
          {isOffline && <>
            <Inp label={T.addr} value={address} onChange={v => { setAddress(v); setErrs(e => ({ ...e, addr: "" })); }} err={errs.addr} theme={theme} />
            <Inp label={T.coords} value={coords} onChange={setCoords} ph="41.2995, 69.2401" theme={theme} />
          </>}
          <Inp label={T.pPost} value={pPost} onChange={v => { setPPost(v); setErrs(e => ({ ...e, price: "" })); }} type="number" ph="150000" err={errs.price} theme={theme} />
          {isOnline && <>
            <Inp label={T.pStory} value={pStory} onChange={setPStory} type="number" ph="80000" theme={theme} />
            <Inp label={T.pVideo} value={pVideo} onChange={setPVideo} type="number" ph="300000" theme={theme} />
          </>}
          <Inp label={T.pDesc} value={pDesc} onChange={setPDesc} theme={theme} />
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <Btn onClick={() => setStep(2)} theme={theme} v="secondary" full>{T.back}</Btn>
        <Btn onClick={() => { if (valid(["platform", "link", "fol", "price", "addr"])) submit(); }} disabled={saving || !platform} theme={theme} full>{saving ? T.saving : T.save}</Btn>
      </div>
    </div>
  );

  return null;
}
