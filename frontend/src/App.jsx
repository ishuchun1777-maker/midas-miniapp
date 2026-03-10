// ═══════════════════════════════════════════════════════
// MIDAS V8 — APP.JSX (Asosiy)
// 5 rol, gold/emerald tema, barcha sahifalar
// ═══════════════════════════════════════════════════════
import { useState, useEffect, useRef } from "react";
import { buildTheme } from "./theme";
import { MidasLogo, MidasWordmark } from "./logo";
import { http, Badge, Spinner } from "./core";
import { ROLES } from "./constants";

import { OnboardingPage, LegalPage, RegistrationPage } from "./pages/auth";
import { MatchPage, PortfolioPage } from "./pages/match";
import { TenderPage } from "./pages/tender";
import { NotifOffersPage, ChatsPage } from "./pages/chat";
import { AIAdvisorPage, AnalyticsPage, GuaranteePage, PremiumPage } from "./pages/features";
import { ProfilePage } from "./pages/profile";

const tg = window.Telegram?.WebApp;
const ADMIN_IDS_ENV = (process.env.REACT_APP_ADMIN_IDS || "").split(",").map(Number).filter(Boolean);

// ── BOTTOM NAV ─────────────────────────────────────────
function BottomNav({ tab, setTab, role, unread, lang, isAdmin }) {
  const uz = lang !== "ru";

  // Har bir rol uchun navigatsiya
  const navs = {
    tadbirkor: [
      { v: "match",    icon: "🎯", l_uz: "Match"    },
      { v: "tender",   icon: "📋", l_uz: "Tender"   },
      { v: "notifs",   icon: "🔔", l_uz: "Xabarlar", badge: unread },
      { v: "chats",    icon: "💬", l_uz: "Chat"     },
      { v: "profile",  icon: "👤", l_uz: "Profil"   },
    ],
    reklamachi: [
      { v: "match",    icon: "🎯", l_uz: "Match"    },
      { v: "tender",   icon: "📋", l_uz: "Tender"   },
      { v: "notifs",   icon: "🔔", l_uz: "Xabarlar", badge: unread },
      { v: "portfolio",icon: "💼", l_uz: "Portfolio" },
      { v: "profile",  icon: "👤", l_uz: "Profil"   },
    ],
    agentlik: [
      { v: "match",     icon: "🎯", l_uz: "Match"     },
      { v: "tender",    icon: "📋", l_uz: "Tender"    },
      { v: "notifs",    icon: "🔔", l_uz: "Xabarlar",  badge: unread },
      { v: "analytics", icon: "📊", l_uz: "Analytics" },
      { v: "profile",   icon: "👤", l_uz: "Profil"    },
    ],
    dizayner: [
      { v: "match",     icon: "🎯", l_uz: "Match"     },
      { v: "portfolio", icon: "💼", l_uz: "Portfolio" },
      { v: "notifs",    icon: "🔔", l_uz: "Xabarlar",  badge: unread },
      { v: "chats",     icon: "💬", l_uz: "Chat"      },
      { v: "profile",   icon: "👤", l_uz: "Profil"    },
    ],
    media_buyer: [
      { v: "match",     icon: "🎯", l_uz: "Match"     },
      { v: "tender",    icon: "📋", l_uz: "Tender"    },
      { v: "analytics", icon: "📊", l_uz: "Analytics" },
      { v: "notifs",    icon: "🔔", l_uz: "Xabarlar",  badge: unread },
      { v: "profile",   icon: "👤", l_uz: "Profil"    },
    ],
  };

  const items = navs[role] || navs.reklamachi;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(13,17,23,0.95)",
      backdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(212,175,55,0.15)",
      display: "flex",
      paddingBottom: "env(safe-area-inset-bottom, 8px)",
    }}>
      {items.map(item => {
        const active = tab === item.v;
        return (
          <button key={item.v} onClick={() => setTab(item.v)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "10px 4px", background: "transparent",
            border: "none", cursor: "pointer", position: "relative", gap: 3,
            transition: "all 0.15s",
          }}>
            {/* Active indicator */}
            {active && (
              <div style={{
                position: "absolute", top: 0, left: "25%", right: "25%",
                height: 2, background: "linear-gradient(90deg,#8B6914,#D4AF37,#F5E6A3)",
                borderRadius: "0 0 2px 2px",
                boxShadow: "0 0 8px rgba(212,175,55,0.5)",
              }} />
            )}

            {/* Badge */}
            {item.badge > 0 && (
              <div style={{
                position: "absolute", top: 6, right: "20%",
                width: 16, height: 16, borderRadius: "50%",
                background: "#EF4444", color: "#fff",
                fontSize: 9, fontWeight: 900,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 6px rgba(239,68,68,0.4)",
              }}>{item.badge > 9 ? "9+" : item.badge}</div>
            )}

            <span style={{ fontSize: 20, lineHeight: 1, filter: active ? "none" : "grayscale(0.5) opacity(0.5)" }}>
              {item.icon}
            </span>
            <span style={{
              fontSize: 9, fontWeight: active ? 700 : 500, lineHeight: 1,
              color: active ? "#D4AF37" : "#616161",
              letterSpacing: "0.02em",
            }}>
              {item.l_uz}
            </span>
          </button>
        );
      })}

      {isAdmin && (
        <button onClick={() => setTab("admin")} style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "10px 10px", background: "transparent", border: "none", cursor: "pointer",
        }}>
          <span style={{ fontSize: 20, filter: tab === "admin" ? "none" : "grayscale(0.6) opacity(0.5)" }}>👑</span>
          <span style={{ fontSize: 9, color: tab === "admin" ? "#D4AF37" : "#616161" }}>Admin</span>
        </button>
      )}
    </div>
  );
}

// ── SPLASH ─────────────────────────────────────────────
function SplashScreen({ retry }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at center, #0F1A10 0%, #0D1117 40%, #0A0D14 100%)",
    }}>
      <MidasLogo size={100} animated />
      <div style={{ marginTop: 20, marginBottom: 30 }}>
        <MidasWordmark size="lg" />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#D4AF37", opacity: 0.3 + i * 0.3,
            animation: `pulse ${0.8 + i * 0.2}s ease-in-out infinite alternate`,
          }} />
        ))}
      </div>
      <style>{`@keyframes pulse { to { opacity: 1; transform: scale(1.2); } }`}</style>
      {retry && (
        <button onClick={retry} style={{ color: "#D4AF37", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 12, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          🔄 Qayta ulanish
        </button>
      )}
    </div>
  );
}

// ── TOPBAR ─────────────────────────────────────────────
function TopBar({ user, tab, lang, setTab, isAdmin }) {
  const uz = lang !== "ru";
  const role = ROLES.find(r => r.v === user.role);

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(13,17,23,0.95)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(212,175,55,0.1)",
      padding: "10px 16px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <MidasLogo size={32} />
        <div>
          <div style={{
            fontFamily: "Georgia, serif", fontWeight: 900, fontSize: 16,
            letterSpacing: "0.3em", color: "#D4AF37",
            textShadow: "0 0 15px rgba(212,175,55,0.3)",
          }}>MIDAS</div>
          <div style={{ fontSize: 9, color: "#616161", letterSpacing: "0.08em" }}>
            {role?.icon} {uz ? (role?.l_uz || "") : (role?.l_ru || "")}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {user.is_premium === 1 && (
          <div style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 8, background: "linear-gradient(135deg,rgba(139,105,20,0.4),rgba(212,175,55,0.2))", color: "#F5E6A3", border: "1px solid rgba(212,175,55,0.4)" }}>⭐ Premium</div>
        )}
        <button onClick={() => setTab("profile")} style={{
          fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 10,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.12)",
          color: "#9E9E9E", cursor: "pointer", fontFamily: "inherit",
        }}>
          {user.full_name?.split(" ")[0] || "👤"}
        </button>
      </div>
    </div>
  );
}

// ── ASOSIY APP ─────────────────────────────────────────
export default function App() {
  const [screen,  setScreen]  = useState("splash"); // splash | onboard | legal | register | main
  const [user,    setUser]    = useState(null);
  const [tab,     setTab]     = useState("match");
  const [lang,    setLang]    = useState("uz");
  const [unread,  setUnread]  = useState(0);
  const [page,    setPage]    = useState(null); // premium | guarantee | ai_chat
  const [retry,   setRetry]   = useState(0);
  const pollRef = useRef(null);

  // Telegram WebApp init
  const tgUser = tg?.initDataUnsafe?.user || { id: 0, first_name: "Test", username: "test" };
  const isAdmin = ADMIN_IDS_ENV.includes(tgUser.id);

  useEffect(() => {
    tg?.ready?.();
    tg?.expand?.();
    tg?.setHeaderColor?.("#0D1117");
    tg?.setBackgroundColor?.("#0D1117");
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await http(`/api/users/${tgUser.id}`);
        if (u?.telegram_id) {
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
  }, [retry]);

  // Unread polling
  useEffect(() => {
    if (screen !== "main" || !user) return;
    const poll = async () => {
      try {
        const r = await http(`/api/notifications/unread-count/${user.telegram_id}`);
        setUnread(r?.count || 0);
      } catch {}
    };
    poll();
    pollRef.current = setInterval(poll, 15000);
    return () => clearInterval(pollRef.current);
  }, [screen, user]);

  const onRegDone = async () => {
    try {
      const u = await http(`/api/users/${tgUser.id}`);
      if (u?.telegram_id) { setUser(u); setLang(u.lang || "uz"); setScreen("main"); }
    } catch {}
  };

  // ── Sahifalar ──────────────────────────────────────
  if (screen === "splash") return <SplashScreen retry={retry > 0 ? () => setRetry(r => r + 1) : null} />;
  if (screen === "onboard") return <OnboardingPage lang={lang} onDone={() => setScreen("legal")} />;
  if (screen === "legal")   return <LegalPage lang={lang} onAgree={() => setScreen("register")} />;
  if (screen === "register") return (
    <RegistrationPage tgUser={tgUser} lang={lang} onDone={onRegDone} />
  );
  if (screen !== "main" || !user) return <SplashScreen retry={() => setRetry(r => r + 1)} />;

  // Premium sahifa
  if (page === "premium") return (
    <PremiumPage user={user} lang={lang} onBack={() => setPage(null)} />
  );

  // Guarantee sahifasi
  if (page === "guarantee") return (
    <GuaranteePage user={user} lang={lang} />
  );

  // ── Sahifa renderi ─────────────────────────────────
  const renderPage = () => {
    switch (tab) {
      case "match":
        return <MatchPage user={user} lang={lang} />;
      case "tender":
        return <TenderPage user={user} lang={lang} />;
      case "notifs":
        return <NotifOffersPage user={user} lang={lang} />;
      case "chats":
        return <ChatsPage user={user} lang={lang} />;
      case "portfolio":
        return <PortfolioPage user={user} lang={lang} />;
      case "analytics":
        return user.role === "tadbirkor"
          ? <AIAdvisorPage user={user} lang={lang} />
          : <AnalyticsPage user={user} lang={lang} />;
      case "profile":
        return (
          <ProfilePage
            user={user} lang={lang}
            onLangChange={l => { setLang(l); setUser(u => u ? {...u, lang: l} : u); }}
            onUserUpdate={u => setUser(u)}
            setPage={setPage}
          />
        );
      case "admin":
        return isAdmin ? <AdminPanel user={user} lang={lang} /> : null;
      default:
        return <MatchPage user={user} lang={lang} />;
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #0F1A10 0%, #0D1117 40%, #0A0D14 100%)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      <TopBar user={user} tab={tab} lang={lang} setTab={setTab} isAdmin={isAdmin} />

      <div style={{ paddingBottom: 80 }}>
        {renderPage()}
      </div>

      <BottomNav
        tab={tab} setTab={setTab}
        role={user.role} unread={unread}
        lang={lang} isAdmin={isAdmin}
      />

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        button { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.2); border-radius: 2px; }
        input, textarea { -webkit-appearance: none; }
        input::placeholder, textarea::placeholder { color: #616161; }
        @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
}

// ── ADMIN PANEL ────────────────────────────────────────
function AdminPanel({ user, lang }) {
  const uz = lang !== "ru";
  const [stats, setStats] = useState({});
  const [queue, setQueue] = useState([]);
  const [loading, setLoad] = useState(true);
  const [tab, setTab]     = useState("stats");
  const [bcastText, setBcast] = useState("");
  const [sending, setSend]   = useState(false);

  useEffect(() => {
    Promise.all([
      http(`/api/admin/stats?admin_id=${user.telegram_id}`).catch(() => ({})),
      http(`/api/admin/verify-queue?admin_id=${user.telegram_id}`).catch(() => []),
    ]).then(([s, q]) => {
      setStats(s || {}); setQueue(Array.isArray(q) ? q : []);
    }).finally(() => setLoad(false));
  }, [user]);

  const verify = async (uid, action) => {
    await http(`/api/admin/verify/${uid}?admin_id=${user.telegram_id}&action=${action}`, "PUT").catch(() => {});
    setQueue(q => q.filter(u => u.telegram_id !== uid));
  };

  const broadcast = async () => {
    if (!bcastText.trim()) return;
    setSend(true);
    try {
      await http(`/api/admin/broadcast`, "POST", { admin_id: user.telegram_id, message: bcastText });
      setBcast("");
      window.Telegram?.WebApp?.showPopup?.({ title: "✅", message: "Yuborildi!" });
    } catch (e) { alert(e.message); }
    setSend(false);
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ padding: "16px 16px 80px" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 4 }}>
        {[["stats","📊 Stat"],["verify","✅ Tasdiq"],["broadcast","📢 Xabar"]].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={{ flex: 1, padding: "9px 4px", borderRadius: 10, fontSize: 11, fontWeight: 700, border: "none", background: tab === v ? "linear-gradient(135deg,#8B6914,#D4AF37)" : "transparent", color: tab === v ? "#0A0D14" : "#616161", cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
        ))}
      </div>

      {tab === "stats" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            ["👥", "Foydalanuvchilar", stats.total_users || 0, "#D4AF37"],
            ["🏢", "Tadbirkorlar",     stats.tadbirkorlar || 0, "#4CAF50"],
            ["📢", "Reklamachilar",    stats.reklamachilar || 0, "#3B82F6"],
            ["⭐", "Premium",          stats.premium_users || 0, "#F5E6A3"],
            ["✅", "Tasdiqlangan",     stats.verified_users || 0, "#22C55E"],
            ["📩", "Takliflar",        stats.total_offers || 0, "#8B5CF6"],
            ["📋", "Tenderlar",        stats.total_tenders || 0, "#D4AF37"],
            ["🤝", "Bitimlar",         stats.total_deals || 0, "#4CAF50"],
          ].map(([icon, label, val, color]) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.1)", borderRadius: 16, padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontWeight: 900, fontSize: 20, color }}>{val}</div>
              <div style={{ fontSize: 10, color: "#616161" }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "verify" && (
        <>
          {queue.length === 0 && <div style={{ textAlign: "center", padding: 32, color: "#616161" }}>✅ Navbat bo'sh</div>}
          {queue.map(u => (
            <div key={u.telegram_id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.1)", borderRadius: 16, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ fontWeight: 700, color: "#E8E8E8", marginBottom: 4 }}>{u.full_name}</div>
              <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 10 }}>ID: {u.telegram_id} · {u.role} · {u.phone}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => verify(u.telegram_id, "verify")} style={{ flex: 1, padding: "10px", borderRadius: 12, background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)", color: "#22C55E", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>✅ Tasdiqlash</button>
                <button onClick={() => verify(u.telegram_id, "reject")} style={{ flex: 1, padding: "10px", borderRadius: 12, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>❌ Rad</button>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === "broadcast" && (
        <>
          <textarea value={bcastText} onChange={e => setBcast(e.target.value)} placeholder="Barcha foydalanuvchilarga xabar..." rows={6}
            style={{ width: "100%", padding: "14px 16px", boxSizing: "border-box", borderRadius: 16, border: "1.5px solid rgba(212,175,55,0.2)", background: "rgba(255,255,255,0.04)", color: "#E8E8E8", fontSize: 13, outline: "none", fontFamily: "inherit", resize: "none", marginBottom: 12 }} />
          <button onClick={broadcast} disabled={sending || !bcastText.trim()}
            style={{ width: "100%", padding: "14px", borderRadius: 16, background: "linear-gradient(135deg,#8B6914,#D4AF37)", border: "none", color: "#0A0D14", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "inherit", opacity: (!sending && bcastText.trim()) ? 1 : 0.5 }}>
            {sending ? "⏳ Yuborilmoqda..." : "📢 Yuborish"}
          </button>
        </>
      )}
    </div>
  );
}
