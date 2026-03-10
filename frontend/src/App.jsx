// ═══════════════════════════════════════════════════════
// MIDAS v5 — Part 6 (MAIN): App entry — barcha qismlar
// ═══════════════════════════════════════════════════════
import { useState, useEffect } from "react";

// Part imports
import { buildTheme, http, MidasLogo, Badge, tg } from "./App_v5_part1";
import { OnboardingSlides, LegalScreen, Registration } from "./App_v5_part2";
import { MatchPage, NotifOffersPage, ChatsPage } from "./App_v5_part3";
import { AIAdvisorPage, TenderPage, AnalyticsPage, ProfilePage } from "./App_v5_part4";
import { AdminPanel } from "./App_v5_part5";

const ADMIN_IDS = (process.env.REACT_APP_ADMIN_IDS || "").split(",").map(Number).filter(Boolean);

// ── BOTTOM NAV ─────────────────────────────────────────
function BottomNav({ tab, setTab, role, unread, lang, theme, isAdmin }) {
  const items = role === "tadbirkor" ? [
    { v:"match",    icon:"🎯", uz:"Match",    ru:"Матч"       },
    { v:"tender",   icon:"📋", uz:"Tender",   ru:"Тендер"     },
    { v:"notifs",   icon:"🔔", uz:"Xabarlar", ru:"Уведомл."   },
    { v:"analytics",icon:"📊", uz:"Analitik", ru:"Аналитика"  },
    { v:"profile",  icon:"👤", uz:"Profil",   ru:"Профиль"    },
  ] : [
    { v:"match",    icon:"🎯", uz:"Match",    ru:"Матч"       },
    { v:"tender",   icon:"📋", uz:"Tender",   ru:"Тендер"     },
    { v:"chats",    icon:"💬", uz:"Chatlar",  ru:"Чаты"       },
    { v:"ai",       icon:"🤖", uz:"AI",       ru:"AI"         },
    { v:"profile",  icon:"👤", uz:"Profil",   ru:"Профиль"    },
  ];

  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0, zIndex:100,
      background:theme.card, borderTop:`1px solid ${theme.border}`,
      display:"flex", paddingBottom:"env(safe-area-inset-bottom,0px)"
    }}>
      {items.map(it => (
        <button key={it.v} onClick={() => setTab(it.v)} style={{
          flex:1, padding:"10px 4px 8px", background:"none", border:"none",
          cursor:"pointer", display:"flex", flexDirection:"column",
          alignItems:"center", gap:3, position:"relative"
        }}>
          <span style={{ fontSize:22, lineHeight:1 }}>{it.icon}</span>
          <span style={{
            fontSize:10, fontWeight:tab===it.v?700:500,
            color:tab===it.v?theme.accent:theme.hint,
            transition:"color 0.15s"
          }}>{lang==="uz"?it.uz:it.ru}</span>
          {/* Active dot */}
          {tab===it.v && (
            <div style={{ position:"absolute", top:6, width:4, height:4, borderRadius:2, background:theme.accent }}/>
          )}
          {/* Unread badge */}
          {it.v==="notifs" && unread.notifs>0 && (
            <div style={{ position:"absolute", top:4, right:"18%", background:theme.danger, color:"#fff", fontSize:9, borderRadius:8, minWidth:16, height:16, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, padding:"0 4px" }}>{unread.notifs}</div>
          )}
          {it.v==="chats" && unread.chats>0 && (
            <div style={{ position:"absolute", top:4, right:"18%", background:theme.danger, color:"#fff", fontSize:9, borderRadius:8, minWidth:16, height:16, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, padding:"0 4px" }}>{unread.chats}</div>
          )}
        </button>
      ))}
      {isAdmin && (
        <button onClick={() => setTab("admin")} style={{ flex:1, padding:"10px 4px 8px", background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
          <span style={{ fontSize:22 }}>⚙️</span>
          <span style={{ fontSize:10, fontWeight:tab==="admin"?700:500, color:tab==="admin"?theme.accent:theme.hint }}>Admin</span>
        </button>
      )}
    </div>
  );
}

// ── STREAK / FOMO HEADER ───────────────────────────────
function FOMOBar({ lang, theme, user }) {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    http(`/api/fomo?tg_id=${user.telegram_id}`).then(setInfo).catch(() => {});
  }, [user]);
  if (!info) return null;
  return (
    <div style={{ background: theme.accentLight, borderBottom: `1px solid ${theme.accentB}`, padding: "8px 16px", display: "flex", gap: 16, overflowX: "auto" }}>
      {info.streak > 1 && (
        <div style={{ fontSize: 12, color: theme.accent, fontWeight: 600, whiteSpace: "nowrap" }}>
          🔥 {info.streak} {lang==="uz"?"kun ketma-ket":"дней подряд"}
        </div>
      )}
      {info.new_tenders > 0 && (
        <div style={{ fontSize: 12, color: theme.accent, fontWeight: 600, whiteSpace: "nowrap" }}>
          📋 {lang==="uz"?`Bugun ${info.new_tenders} yangi tender`:`Сегодня ${info.new_tenders} новых тендеров`}
        </div>
      )}
      {info.new_partners > 0 && (
        <div style={{ fontSize: 12, color: theme.accent, fontWeight: 600, whiteSpace: "nowrap" }}>
          🤝 {lang==="uz"?`${info.new_partners} yangi hamkor qo'shildi`:`${info.new_partners} новых партнёров`}
        </div>
      )}
    </div>
  );
}

// ── PROFILE PROGRESS BAR ───────────────────────────────
function ProfileProgress({ user, lang, theme, onGoProfile }) {
  const [pct, setPct] = useState(null);
  useEffect(() => {
    http(`/api/users/${user.telegram_id}/progress`).then(r => setPct(r.percent)).catch(() => {});
  }, [user]);
  if (!pct || pct >= 100) return null;
  return (
    <button onClick={onGoProfile} style={{ width:"100%", background:theme.card, borderBottom:`1px solid ${theme.border}`, padding:"10px 16px", display:"flex", alignItems:"center", gap:12, border:"none", cursor:"pointer", boxSizing:"border-box" }}>
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:theme.sub, marginBottom:5 }}>
          <span>👤 {lang==="uz"?"Profil to'ldirilishi":"Профиль заполнен"}</span>
          <span style={{ fontWeight:700, color:theme.accent }}>{pct}%</span>
        </div>
        <div style={{ height:6, borderRadius:3, background:theme.border, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:theme.accent, borderRadius:3, transition:"width 0.5s" }}/>
        </div>
      </div>
      <span style={{ color:theme.accent, fontSize:18 }}>›</span>
    </button>
  );
}

// ── MAIN APP ───────────────────────────────────────────
export default function App() {
  const theme   = buildTheme();

  // Telegram user
  const tgUser = tg?.initDataUnsafe?.user || { id:12345, first_name:"Test", username:"testuser" };

  const [screen,  setScreen]  = useState("loading"); // loading|onboard|legal|register|main
  const [user,    setUser]    = useState(null);
  const [lang,    setLang]    = useState("uz");
  const [tab,     setTab]     = useState("match");
  const [unread,  setUnread]  = useState({ notifs:0, chats:0 });
  const isAdmin = ADMIN_IDS.includes(tgUser?.id);

  // Init
  useEffect(() => {
    tg?.ready?.();
    tg?.expand?.();
    tg?.setHeaderColor?.(theme.dk ? "#0d0f1a" : "#f0f2f8");

    const init = async () => {
      try {
        const u = await http(`/api/users/${tgUser.id}`);
        if (u && u.role) {
          setUser(u);
          setLang(u.lang || "uz");
          setScreen("main");
        } else {
          setScreen("onboard");
        }
      } catch {
        setScreen("onboard");
      }
    };
    init();
  }, []);

  // Unread polling
  useEffect(() => {
    if (screen !== "main" || !user) return;
    const poll = async () => {
      try {
        const r = await http(`/api/unread/${user.telegram_id}`);
        setUnread({ notifs: r.notifs || 0, chats: r.chats || 0 });
      } catch {}
    };
    poll();
    const iv = setInterval(poll, 15000);
    return () => clearInterval(iv);
  }, [screen, user]);

  const onRegDone = (l) => {
    setLang(l);
    http(`/api/users/${tgUser.id}`).then(u => { setUser(u); setScreen("main"); }).catch(() => setScreen("main"));
  };

  // ── SCREENS ────────────────────────────────────────
  if (screen === "loading") return (
    <div style={{ minHeight:"100vh", background:theme.heroGrad, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
      <MidasLogo size={80} theme={theme} white/>
      <div style={{ fontFamily:"Georgia,serif", fontSize:28, fontWeight:800, color:"#fff", letterSpacing:5, marginTop:16 }}>MIDAS</div>
      <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", letterSpacing:3, textTransform:"uppercase", marginTop:6 }}>Businessman & Advertiser</div>
      <div style={{ marginTop:40, display:"flex", gap:6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:8, height:8, borderRadius:4, background:"rgba(255,255,255,0.5)", animation:`pulse${i} 1.2s ${i*0.2}s infinite` }}/>
        ))}
      </div>
    </div>
  );

  if (screen === "onboard") return (
    <OnboardingSlides lang={lang} theme={theme} onFinish={() => setScreen("legal")}/>
  );

  if (screen === "legal") return (
    <LegalScreen lang={lang} theme={theme} onAgree={() => setScreen("register")}/>
  );

  if (screen === "register") return (
    <Registration tgUser={tgUser} onDone={onRegDone} theme={theme}/>
  );

  if (screen !== "main" || !user) return null;

  // ── MAIN APP ──────────────────────────────────────
  const renderPage = () => {
    switch (tab) {
      case "match":
        return <MatchPage user={user} lang={lang} theme={theme}/>;
      case "tender":
        return <TenderPage user={user} lang={lang} theme={theme}/>;
      case "notifs":
        return <NotifOffersPage user={user} lang={lang} theme={theme}/>;
      case "chats":
        return <ChatsPage user={user} lang={lang} theme={theme}/>;
      case "analytics":
        return <AnalyticsPage user={user} lang={lang} theme={theme}/>;
      case "ai":
        return <AIAdvisorPage user={user} lang={lang} theme={theme}/>;
      case "profile":
        return <ProfilePage user={user} lang={lang} theme={theme} onLangChange={l => { setLang(l); setUser(u => u ? ({ ...u, lang: l }) : u); }}/>;
      case "admin":
        return isAdmin ? <AdminPanel user={user} lang={lang} theme={theme}/> : null;
      default:
        return <MatchPage user={user} lang={lang} theme={theme}/>;
    }
  };

  return (
    <div style={{ background:theme.bg, minHeight:"100vh", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
      {/* Top bar */}
      <div style={{ position:"sticky", top:0, zIndex:50, background:theme.card, borderBottom:`1px solid ${theme.border}`, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <MidasLogo size={32} theme={theme}/>
          <div>
            <div style={{ fontFamily:"Georgia,serif", fontWeight:800, fontSize:16, color:theme.text, letterSpacing:2 }}>MIDAS</div>
            <div style={{ fontSize:10, color:theme.hint, letterSpacing:1 }}>
              {user.role==="tadbirkor" ? (lang==="uz"?"Tadbirkor":"Предприниматель") : (lang==="uz"?"Reklamachi":"Рекламодатель")}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {user.is_premium===1 && (
            <div style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:10, background:theme.goldL, color:theme.gold }}>⭐ Premium</div>
          )}
          {!user.is_verified && (
            <div style={{ fontSize:10, fontWeight:600, padding:"3px 8px", borderRadius:10, background:theme.goldL, color:theme.gold }}>⏳</div>
          )}
        </div>
      </div>

      {/* FOMO bar */}
      <FOMOBar lang={lang} theme={theme} user={user}/>

      {/* Profile progress */}
      <ProfileProgress user={user} lang={lang} theme={theme} onGoProfile={() => setTab("profile")}/>

      {/* Page content */}
      <div style={{ paddingBottom:72 }}>
        {renderPage()}
      </div>

      {/* Bottom nav */}
      <BottomNav
        tab={tab} setTab={setTab}
        role={user.role} unread={unread}
        lang={lang} theme={theme}
        isAdmin={isAdmin}
      />
    </div>
  );
}
