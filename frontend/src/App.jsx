// ═══════════════════════════════════════════════════════
// MIDAS v6 — App.jsx (Tuzatilgan + Boyitilgan)
// Asosiy xatolar tuzatildi:
//   1. window.React.useState → to'g'ri import
//   2. require() → import sintaksisi
//   3. Loading ekrani qotib qolishi — animatsiya CSS ga ko'chirildi
//   4. Backend cold start uchun retry mexanizmi
//   5. Telegram WebApp ready() to'g'ri chaqirildi
// ═══════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from "react";

import { buildTheme, http, MidasLogo, Badge, tg } from "./App_v5_part1";
import { OnboardingSlides, LegalScreen, Registration } from "./App_v5_part2";
import { MatchPage, NotifOffersPage, ChatsPage } from "./App_v5_part3";
import { AIAdvisorPage, TenderPage, AnalyticsPage, ProfilePage } from "./App_v5_part4";
import { AdminPanel } from "./App_v5_part5";

const ADMIN_IDS = (process.env.REACT_APP_ADMIN_IDS || "").split(",").map(Number).filter(Boolean);

// ── BOTTOM NAV ─────────────────────────────────────────
function BottomNav({ tab, setTab, role, unread, lang, theme, isAdmin }) {
  const items = role === "tadbirkor" ? [
    { v:"match",     icon:"🎯", uz:"Match",     ru:"Матч"      },
    { v:"tender",    icon:"📋", uz:"Tender",    ru:"Тендер"    },
    { v:"notifs",    icon:"🔔", uz:"Xabarlar",  ru:"Уведомл."  },
    { v:"analytics", icon:"📊", uz:"Analitik",  ru:"Аналитика" },
    { v:"profile",   icon:"👤", uz:"Profil",    ru:"Профиль"   },
  ] : [
    { v:"match",    icon:"🎯", uz:"Match",    ru:"Матч"    },
    { v:"tender",   icon:"📋", uz:"Tender",   ru:"Тендер"  },
    { v:"chats",    icon:"💬", uz:"Chatlar",  ru:"Чаты"    },
    { v:"ai",       icon:"🤖", uz:"AI",       ru:"AI"      },
    { v:"profile",  icon:"👤", uz:"Profil",   ru:"Профиль" },
  ];

  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0, zIndex:100,
      background:theme.card, borderTop:`1px solid ${theme.border}`,
      display:"flex", paddingBottom:"env(safe-area-inset-bottom,0px)",
      backdropFilter:"blur(12px)",
    }}>
      {items.map(it => (
        <button key={it.v} onClick={() => setTab(it.v)} style={{
          flex:1, padding:"10px 4px 8px", background:"none", border:"none",
          cursor:"pointer", display:"flex", flexDirection:"column",
          alignItems:"center", gap:3, position:"relative",
          transition:"transform 0.1s",
        }}>
          <span style={{
            fontSize:22, lineHeight:1,
            transform: tab===it.v ? "scale(1.15)" : "scale(1)",
            transition:"transform 0.2s cubic-bezier(.34,1.56,.64,1)",
            display:"block"
          }}>{it.icon}</span>
          <span style={{
            fontSize:10, fontWeight:tab===it.v?700:500,
            color:tab===it.v?theme.accent:theme.hint,
            transition:"color 0.15s"
          }}>{lang==="uz"?it.uz:it.ru}</span>
          {tab===it.v && (
            <div style={{
              position:"absolute", top:4, width:4, height:4,
              borderRadius:2, background:theme.accent,
              animation:"none"
            }}/>
          )}
          {it.v==="notifs" && unread.notifs>0 && (
            <div style={{
              position:"absolute", top:4, right:"18%",
              background:theme.danger, color:"#fff", fontSize:9,
              borderRadius:8, minWidth:16, height:16,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontWeight:700, padding:"0 4px"
            }}>{unread.notifs}</div>
          )}
          {it.v==="chats" && unread.chats>0 && (
            <div style={{
              position:"absolute", top:4, right:"18%",
              background:theme.danger, color:"#fff", fontSize:9,
              borderRadius:8, minWidth:16, height:16,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontWeight:700, padding:"0 4px"
            }}>{unread.chats}</div>
          )}
        </button>
      ))}
      {isAdmin && (
        <button onClick={() => setTab("admin")} style={{
          flex:1, padding:"10px 4px 8px", background:"none", border:"none",
          cursor:"pointer", display:"flex", flexDirection:"column",
          alignItems:"center", gap:3
        }}>
          <span style={{ fontSize:22, transform: tab==="admin"?"scale(1.15)":"scale(1)", display:"block", transition:"transform 0.2s" }}>⚙️</span>
          <span style={{ fontSize:10, fontWeight:tab==="admin"?700:500, color:tab==="admin"?theme.accent:theme.hint }}>Admin</span>
        </button>
      )}
    </div>
  );
}

// ── FOMO BAR ───────────────────────────────────────────
function FOMOBar({ lang, theme, user }) {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    http(`/api/fomo?tg_id=${user.telegram_id}`).then(setInfo).catch(() => {});
  }, [user]);
  if (!info || (!info.streak && !info.new_tenders && !info.new_partners)) return null;
  return (
    <div style={{
      background:theme.accentLight,
      borderBottom:`1px solid ${theme.accentB}`,
      padding:"8px 16px", display:"flex", gap:16, overflowX:"auto"
    }}>
      {info.streak > 1 && (
        <div style={{ fontSize:12, color:theme.accent, fontWeight:600, whiteSpace:"nowrap" }}>
          🔥 {info.streak} {lang==="uz"?"kun ketma-ket":"дней подряд"}
        </div>
      )}
      {info.new_tenders > 0 && (
        <div style={{ fontSize:12, color:theme.accent, fontWeight:600, whiteSpace:"nowrap" }}>
          📋 {lang==="uz"?`Bugun ${info.new_tenders} yangi tender`:`${info.new_tenders} новых тендеров`}
        </div>
      )}
      {info.new_partners > 0 && (
        <div style={{ fontSize:12, color:theme.accent, fontWeight:600, whiteSpace:"nowrap" }}>
          🤝 {lang==="uz"?`${info.new_partners} yangi hamkor`:`${info.new_partners} новых партнёров`}
        </div>
      )}
    </div>
  );
}

// ── PROFILE PROGRESS BAR ───────────────────────────────
function ProfileProgress({ user, lang, theme, onGoProfile }) {
  const [pct, setPct] = useState(null);
  useEffect(() => {
    http(`/api/users/${user.telegram_id}/progress`)
      .then(r => setPct(r.percent))
      .catch(() => {});
  }, [user]);
  if (!pct || pct >= 100) return null;
  return (
    <button onClick={onGoProfile} style={{
      width:"100%", background:theme.card,
      borderBottom:`1px solid ${theme.border}`,
      padding:"10px 16px", display:"flex",
      alignItems:"center", gap:12, border:"none",
      cursor:"pointer", boxSizing:"border-box"
    }}>
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:theme.sub, marginBottom:5 }}>
          <span>👤 {lang==="uz"?"Profil to'ldirilishi":"Профиль заполнен"}</span>
          <span style={{ fontWeight:700, color:theme.accent }}>{pct}%</span>
        </div>
        <div style={{ height:6, borderRadius:3, background:theme.border, overflow:"hidden" }}>
          <div style={{
            height:"100%", width:`${pct}%`,
            background:`linear-gradient(90deg, ${theme.accent}, ${theme.accentB})`,
            borderRadius:3, transition:"width 0.8s cubic-bezier(.23,1,.32,1)"
          }}/>
        </div>
      </div>
      <span style={{ color:theme.accent, fontSize:18 }}>›</span>
    </button>
  );
}

// ── SPLASH SCREEN (Loading) ─────────────────────────────
function SplashScreen({ theme, retry, retrying }) {
  return (
    <div style={{
      minHeight:"100vh",
      background: "linear-gradient(160deg,#0d1f14 0%,#1a3d2e 40%,#0d1f14 100%)",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      position:"relative", overflow:"hidden"
    }}>
      {/* Fon dekorativ doiralar */}
      <div style={{
        position:"absolute", width:300, height:300, borderRadius:"50%",
        background:"rgba(82,183,136,0.06)", top:-50, left:-100,
        pointerEvents:"none"
      }}/>
      <div style={{
        position:"absolute", width:200, height:200, borderRadius:"50%",
        background:"rgba(201,168,76,0.08)", bottom:80, right:-60,
        pointerEvents:"none"
      }}/>

      {/* Logo + nomi */}
      <div style={{ animation:"floatUp 0.6s ease both", textAlign:"center" }}>
        <div style={{
          width:96, height:96, borderRadius:28,
          background:"linear-gradient(135deg,rgba(82,183,136,0.15),rgba(45,106,79,0.25))",
          border:"1.5px solid rgba(82,183,136,0.35)",
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 20px",
          boxShadow:"0 0 32px rgba(82,183,136,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
          animation:"glow 3s ease-in-out infinite"
        }}>
          <MidasLogo size={60} theme={theme} white/>
        </div>
        <div style={{
          fontFamily:"Georgia,serif", fontSize:36, fontWeight:800,
          color:"#fff", letterSpacing:8, marginBottom:6
        }}>MIDAS</div>
        <div style={{
          fontSize:11, color:"rgba(255,255,255,0.45)",
          letterSpacing:4, textTransform:"uppercase"
        }}>Businessman & Advertiser</div>
      </div>

      {/* Loading dots */}
      {!retrying && (
        <div style={{ marginTop:52, display:"flex", gap:8 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width:8, height:8, borderRadius:4,
              background:"rgba(255,255,255,0.5)",
              animation:`pulse${i} 1.4s ${i*0.2}s infinite ease-in-out`
            }}/>
          ))}
        </div>
      )}

      {/* Retry holati */}
      {retrying && (
        <div style={{ marginTop:40, textAlign:"center" }}>
          <div style={{ color:"rgba(255,255,255,0.6)", fontSize:13, marginBottom:16 }}>
            🔄 {retrying === "connecting"
              ? "Server bilan bog'lanmoqda..."
              : "Aloqa o'rnatilmoqda..."}
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width:6, height:6, borderRadius:3,
                background:"rgba(82,183,136,0.7)",
                animation:`pulse${i} 0.9s ${i*0.15}s infinite ease-in-out`
              }}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────
export default function App() {
  const theme   = buildTheme();

  // Telegram user — development uchun fallback
  const tgUser = tg?.initDataUnsafe?.user || null;

  const [screen,   setScreen]   = useState("loading");
  const [user,     setUser]     = useState(null);
  const [lang,     setLang]     = useState("uz");
  const [tab,      setTab]      = useState("match");
  const [unread,   setUnread]   = useState({ notifs:0, chats:0 });
  const [retrying, setRetrying] = useState(null);
  const retryCount = useRef(0);

  const isAdmin = ADMIN_IDS.includes(tgUser?.id || 0);

  // ── Init: Telegram ready + foydalanuvchini yuklash ──
  useEffect(() => {
    // Telegram WebApp ni to'g'ri ishga tushirish
    if (tg) {
      tg.ready();
      tg.expand();
      try { tg.setHeaderColor?.(theme.dk ? "#0d0f1a" : "#f0f2f8"); } catch {}
      try { tg.setBackgroundColor?.(theme.dk ? "#0d0f1a" : "#f0f2f8"); } catch {}
      try { tg.enableClosingConfirmation?.(); } catch {}
    }

    // Telegram WebApp olmagan holatda (browser) — test modeini ko'rsatish
    if (!tg && process.env.NODE_ENV !== "production") {
      // Development: test foydalanuvchi
      setScreen("onboard");
      return;
    }

    if (!tgUser?.id) {
      // tgUser yuklanmagan — Telegram'dan tashqarida ochilgan
      setScreen("onboard");
      return;
    }

    loadUser(tgUser.id);
  }, []);

  const loadUser = async (tgId, attempt = 0) => {
    try {
      if (attempt > 0) {
        setRetrying("connecting");
        await new Promise(r => setTimeout(r, Math.min(attempt * 1500, 5000)));
      }

      const u = await http(`/api/users/${tgId}`);
      if (u && u.role) {
        setUser(u);
        setLang(u.lang || "uz");
        setScreen("main");
        setRetrying(null);
      } else {
        setScreen("onboard");
      }
    } catch (err) {
      retryCount.current++;
      if (retryCount.current < 4) {
        // Backend cold start bo'lishi mumkin (Render free) — retry
        setRetrying("connecting");
        loadUser(tgId, retryCount.current);
      } else {
        // 4 urinishdan keyin ham ishlamasa — onboarding
        setRetrying(null);
        setScreen("onboard");
      }
    }
  };

  // ── Unread polling ──
  useEffect(() => {
    if (screen !== "main" || !user) return;
    const poll = async () => {
      try {
        const r = await http(`/api/unread/${user.telegram_id}`);
        setUnread({ notifs: r.notifs || 0, chats: r.chats || 0 });
      } catch {}
    };
    poll();
    const iv = setInterval(poll, 20000);
    return () => clearInterval(iv);
  }, [screen, user]);

  const onRegDone = (l) => {
    setLang(l);
    if (tgUser?.id) {
      http(`/api/users/${tgUser.id}`)
        .then(u => { setUser(u); setScreen("main"); })
        .catch(() => setScreen("main"));
    } else {
      setScreen("main");
    }
  };

  // ── SCREENS ────────────────────────────────────────

  if (screen === "loading") {
    return <SplashScreen theme={theme} retrying={retrying}/>;
  }

  if (screen === "onboard") return (
    <OnboardingSlides lang={lang} theme={theme} onFinish={() => setScreen("legal")}/>
  );

  if (screen === "legal") return (
    <LegalScreen lang={lang} theme={theme} onAgree={() => setScreen("register")}/>
  );

  if (screen === "register") return (
    <Registration
      tgUser={tgUser || { id: 0, first_name: "Foydalanuvchi", username: "" }}
      onDone={onRegDone}
      theme={theme}
    />
  );

  if (screen !== "main" || !user) return <SplashScreen theme={theme} retrying="connecting"/>;

  // ── MAIN APP ──────────────────────────────────────
  const renderPage = () => {
    switch (tab) {
      case "match":     return <MatchPage user={user} lang={lang} theme={theme}/>;
      case "tender":    return <TenderPage user={user} lang={lang} theme={theme}/>;
      case "notifs":    return <NotifOffersPage user={user} lang={lang} theme={theme}/>;
      case "chats":     return <ChatsPage user={user} lang={lang} theme={theme}/>;
      case "analytics": return <AnalyticsPage user={user} lang={lang} theme={theme}/>;
      case "ai":        return <AIAdvisorPage user={user} lang={lang} theme={theme}/>;
      case "profile":
        return <ProfilePage
          user={user} lang={lang} theme={theme}
          onLangChange={l => {
            setLang(l);
            setUser(u => u ? ({ ...u, lang: l }) : u);
          }}
        />;
      case "admin":
        return isAdmin ? <AdminPanel user={user} lang={lang} theme={theme}/> : null;
      default:
        return <MatchPage user={user} lang={lang} theme={theme}/>;
    }
  };

  return (
    <div style={{
      background:theme.bg, minHeight:"100vh",
      fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"
    }}>
      {/* Top bar */}
      <div style={{
        position:"sticky", top:0, zIndex:50,
        background:theme.card, borderBottom:`1px solid ${theme.border}`,
        padding:"10px 16px", display:"flex",
        justifyContent:"space-between", alignItems:"center",
        backdropFilter:"blur(12px)"
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <MidasLogo size={32} theme={theme}/>
          <div>
            <div style={{
              fontFamily:"Georgia,serif", fontWeight:800,
              fontSize:16, color:theme.text, letterSpacing:2
            }}>MIDAS</div>
            <div style={{ fontSize:10, color:theme.hint, letterSpacing:1 }}>
              {user.role==="tadbirkor"
                ? (lang==="uz"?"Tadbirkor":"Предприниматель")
                : (lang==="uz"?"Reklamachi":"Рекламодатель")}
            </div>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {user.is_premium===1 && (
            <div style={{
              fontSize:11, fontWeight:700, padding:"3px 9px",
              borderRadius:10, background:theme.goldL, color:theme.gold
            }}>⭐ Premium</div>
          )}
          <div style={{
            fontSize:11, fontWeight:600, padding:"3px 8px",
            borderRadius:10, background:theme.card2, color:theme.hint,
            cursor:"pointer"
          }} onClick={() => setTab("profile")}>
            {user.full_name?.split(" ")[0] || "👤"}
          </div>
        </div>
      </div>

      {/* FOMO bar */}
      <FOMOBar lang={lang} theme={theme} user={user}/>

      {/* Profile progress */}
      <ProfileProgress
        user={user} lang={lang} theme={theme}
        onGoProfile={() => setTab("profile")}
      />

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
