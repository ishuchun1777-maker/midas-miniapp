// ═══════════════════════════════════════════════════════
// MIDAS V8 — CORE: API · Formatlash · UI Atomlari
// ═══════════════════════════════════════════════════════
import { useState, useRef } from "react";
import { buildTheme } from "./theme";

export const API  = process.env.REACT_APP_API_URL || "https://midas-backend.onrender.com";
export const ADMIN_IDS = (process.env.REACT_APP_ADMIN_IDS || "").split(",").map(Number).filter(Boolean);
export const tg   = window.Telegram?.WebApp;

// ── API ────────────────────────────────────────────────
export const http = async (path, method = "GET", body = null) => {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(API + path, opts);
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e?.error || `HTTP ${r.status}`);
  }
  return r.json();
};

// ── FORMATLASH ─────────────────────────────────────────
export const fmtNum   = n => n != null ? Number(n).toLocaleString("ru-RU") : "—";
export const fmtMoney = v => (v || "").toString().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
export const parseMoney = v => parseInt((v || "").toString().replace(/\s/g, ""), 10) || 0;

export const fmtDate = v => {
  const d = (v || "").replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0,2)}.${d.slice(2)}`;
  return `${d.slice(0,2)}.${d.slice(2,4)}.${d.slice(4)}`;
};

export const isValidDate = v => {
  const m = (v || "").match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return false;
  const [, d, mo, y] = m.map(Number);
  if (mo < 1 || mo > 12) return false;
  const max = new Date(y, mo, 0).getDate();
  return d >= 1 && d <= max && y >= 2024 && y <= 2030;
};

export const dateToISO = v => {
  const m = (v || "").match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : v;
};

export const L = (obj, lang) => obj?.[`l_${lang}`] || obj?.l_uz || "";

// ── UI ATOMLARI ────────────────────────────────────────

// Shisha effektli karta
export const Card = ({ children, style = {}, onClick, glow }) => {
  const th = buildTheme();
  return (
    <div
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`,
        backdropFilter: "blur(12px)",
        border: `1px solid ${glow ? "rgba(212,175,55,0.35)" : "rgba(212,175,55,0.12)"}`,
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        boxShadow: glow
          ? `0 0 20px rgba(212,175,55,0.15), 0 4px 20px rgba(0,0,0,0.4)`
          : `0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s",
        ...style
      }}
    >
      {children}
    </div>
  );
};

// Asosiy tugma — gold gradient
export const Btn = ({ children, onClick, disabled, v = "gold", full, sz = "md", style = {} }) => {
  const variants = {
    gold: {
      background: `linear-gradient(135deg, #8B6914 0%, #D4AF37 50%, #F5E6A3 100%)`,
      color: "#0A0D14",
      border: "none",
      boxShadow: `0 0 15px rgba(212,175,55,0.3), 0 4px 15px rgba(0,0,0,0.3)`,
    },
    emerald: {
      background: `linear-gradient(135deg, #0D3320 0%, #1B5E40 50%, #2D8653 100%)`,
      color: "#D4AF37",
      border: "1px solid rgba(212,175,55,0.3)",
      boxShadow: `0 0 15px rgba(27,94,64,0.3), 0 4px 15px rgba(0,0,0,0.3)`,
    },
    ghost: {
      background: "rgba(212,175,55,0.08)",
      color: "#D4AF37",
      border: "1px solid rgba(212,175,55,0.35)",
      boxShadow: "none",
    },
    danger: {
      background: `linear-gradient(135deg, #7F1D1D, #EF4444)`,
      color: "#fff",
      border: "none",
      boxShadow: `0 0 12px rgba(239,68,68,0.25)`,
    },
    glass: {
      background: "rgba(255,255,255,0.06)",
      color: "#E8E8E8",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "none",
    },
    dark: {
      background: "rgba(0,0,0,0.3)",
      color: "#9E9E9E",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "none",
    },
  };
  const s = variants[v] || variants.gold;
  const pad = { sm: "8px 16px", md: "12px 20px", lg: "15px 26px", xl: "18px 32px" }[sz];
  const fs  = { sm: 12, md: 14, lg: 15, xl: 16 }[sz];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...s, padding: pad, fontSize: fs,
        fontWeight: 700, fontFamily: "inherit",
        borderRadius: 14, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        width: full ? "100%" : "auto",
        letterSpacing: "0.02em",
        transition: "all 0.2s",
        ...style
      }}
    >
      {children}
    </button>
  );
};

// Gold input
export const Inp = ({ label, value, onChange, ph, type = "text", err, note, rows, suffix, required }) => {
  const th = buildTheme();
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 6, fontWeight: 600, letterSpacing: "0.03em" }}>
          {label} {required && <span style={{ color: "#D4AF37" }}>*</span>}
        </div>
      )}
      <div style={{ position: "relative" }}>
        {rows
          ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={ph} rows={rows}
              style={{ width: "100%", padding: "13px 16px", boxSizing: "border-box", borderRadius: 14, border: `1.5px solid ${err ? "#EF4444" : "rgba(212,175,55,0.2)"}`, background: "rgba(255,255,255,0.04)", color: "#E8E8E8", fontSize: 13, outline: "none", fontFamily: "inherit", resize: "vertical", lineHeight: 1.6, backdropFilter: "blur(4px)" }} />
          : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={ph}
              style={{ width: "100%", padding: "13px 16px", paddingRight: suffix ? "50px" : "16px", boxSizing: "border-box", borderRadius: 14, border: `1.5px solid ${err ? "#EF4444" : "rgba(212,175,55,0.2)"}`, background: "rgba(255,255,255,0.04)", color: "#E8E8E8", fontSize: 13, outline: "none", fontFamily: "inherit", backdropFilter: "blur(4px)" }} />
        }
        {suffix && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#D4AF37", fontSize: 12, fontWeight: 700 }}>{suffix}</span>}
      </div>
      {err && <div style={{ color: "#EF4444", fontSize: 11, marginTop: 4, fontWeight: 500 }}>⚠ {err}</div>}
      {note && <div style={{ color: "#616161", fontSize: 11, marginTop: 4 }}>{note}</div>}
    </div>
  );
};

// Summa input
export const MoneyInp = ({ label, value, onChange, err, note, required }) => {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 6, fontWeight: 600 }}>
          {label} {required && <span style={{ color: "#D4AF37" }}>*</span>}
        </div>
      )}
      <div style={{ position: "relative" }}>
        <input
          type="text" inputMode="numeric"
          value={value}
          onChange={e => onChange(fmtMoney(e.target.value))}
          placeholder="0"
          style={{ width: "100%", padding: "13px 60px 13px 16px", boxSizing: "border-box", borderRadius: 14, border: `1.5px solid ${err ? "#EF4444" : "rgba(212,175,55,0.2)"}`, background: "rgba(255,255,255,0.04)", color: "#E8E8E8", fontSize: 13, outline: "none", fontFamily: "inherit" }}
        />
        <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#D4AF37", fontSize: 11, fontWeight: 700 }}>so'm</span>
      </div>
      {value && parseMoney(value) > 0 && (
        <div style={{ color: "#D4AF37", fontSize: 11, marginTop: 4, fontWeight: 600 }}>
          💰 {fmtNum(parseMoney(value))} so'm
        </div>
      )}
      {err && <div style={{ color: "#EF4444", fontSize: 11, marginTop: 4 }}>⚠ {err}</div>}
      {note && <div style={{ color: "#616161", fontSize: 11, marginTop: 4 }}>{note}</div>}
    </div>
  );
};

// Sana input
export const DateInp = ({ label, value, onChange, err, required }) => {
  const valid = value?.length === 10 ? isValidDate(value) : true;
  const showErr = value?.length === 10 && !valid;
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 6, fontWeight: 600 }}>
          {label} {required && <span style={{ color: "#D4AF37" }}>*</span>}
        </div>
      )}
      <div style={{ position: "relative" }}>
        <input
          type="text" inputMode="numeric" maxLength={10}
          value={value}
          onChange={e => onChange(fmtDate(e.target.value))}
          placeholder="KK.OO.YYYY"
          style={{ width: "100%", padding: "13px 44px 13px 16px", boxSizing: "border-box", borderRadius: 14, border: `1.5px solid ${(err || showErr) ? "#EF4444" : "rgba(212,175,55,0.2)"}`, background: "rgba(255,255,255,0.04)", color: "#E8E8E8", fontSize: 13, outline: "none", fontFamily: "inherit" }}
        />
        <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>📅</span>
      </div>
      {showErr && <div style={{ color: "#EF4444", fontSize: 11, marginTop: 4 }}>⚠ Noto'g'ri sana. Masalan: 31.12.2025</div>}
      {err && !showErr && <div style={{ color: "#EF4444", fontSize: 11, marginTop: 4 }}>⚠ {err}</div>}
      {!err && !showErr && <div style={{ color: "#616161", fontSize: 11, marginTop: 4 }}>Kun.Oy.Yil formatida</div>}
    </div>
  );
};

// Tag bulut
export const TagCloud = ({ options, selected, onChange, max, label, getLabel, required }) => {
  const toggle = v => {
    if (selected.includes(v)) onChange(selected.filter(x => x !== v));
    else if (!max || selected.length < max) onChange([...selected, v]);
  };
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 8, fontWeight: 600 }}>
          {label} {required && <span style={{ color: "#D4AF37" }}>*</span>}
          {max && <span style={{ color: "#616161", fontSize: 10, marginLeft: 4 }}>(max {max})</span>}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map(o => {
          const lbl = getLabel ? getLabel(o) : (o.l || o.v || o);
          const sel = selected.includes(o.v !== undefined ? o.v : o);
          const val = o.v !== undefined ? o.v : o;
          return (
            <button
              key={val}
              onClick={() => toggle(val)}
              style={{
                padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: `1.5px solid ${sel ? "rgba(212,175,55,0.6)" : "rgba(255,255,255,0.08)"}`,
                background: sel
                  ? "linear-gradient(135deg, rgba(139,105,20,0.4), rgba(212,175,55,0.2))"
                  : "rgba(255,255,255,0.04)",
                color: sel ? "#D4AF37" : "#9E9E9E",
                cursor: max && selected.length >= max && !sel ? "not-allowed" : "pointer",
                opacity: max && selected.length >= max && !sel ? 0.5 : 1,
                transition: "all 0.15s",
                fontFamily: "inherit",
              }}
            >
              {lbl}
            </button>
          );
        })}
      </div>
      {max && selected.length >= max && (
        <div style={{ color: "#D4AF37", fontSize: 11, marginTop: 5, fontWeight: 500 }}>Maksimal {max} ta tanlanadi</div>
      )}
    </div>
  );
};

// Modal
export const Modal = ({ title, children, onClose }) => (
  <div
    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "flex-end", zIndex: 300, backdropFilter: "blur(6px)" }}
    onClick={onClose}
  >
    <div
      style={{ background: "linear-gradient(180deg, #161924 0%, #0D1117 100%)", borderRadius: "24px 24px 0 0", width: "100%", maxHeight: "92vh", overflowY: "auto", padding: "16px 20px 48px", border: "1px solid rgba(212,175,55,0.15)", borderBottom: "none" }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ width: 48, height: 4, borderRadius: 2, background: "rgba(212,175,55,0.3)", margin: "0 auto 16px" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 17, color: "#D4AF37" }}>{title}</div>
        <button onClick={onClose} style={{ color: "#616161", fontSize: 28, background: "none", border: "none", cursor: "pointer", lineHeight: 1, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: "rgba(255,255,255,0.04)" }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

// Badge
export const Badge = ({ children, v = "gold", style = {} }) => {
  const variants = {
    gold:    { bg: "rgba(212,175,55,0.15)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.3)" },
    emerald: { bg: "rgba(27,94,64,0.25)",   color: "#4CAF50", border: "1px solid rgba(45,134,83,0.4)" },
    grey:    { bg: "rgba(255,255,255,0.07)", color: "#9E9E9E", border: "1px solid rgba(255,255,255,0.1)" },
    danger:  { bg: "rgba(239,68,68,0.15)",  color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" },
    success: { bg: "rgba(34,197,94,0.15)",  color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" },
    premium: { bg: "linear-gradient(135deg, rgba(139,105,20,0.5), rgba(212,175,55,0.3))", color: "#F5E6A3", border: "1px solid rgba(212,175,55,0.5)" },
    silver:  { bg: "rgba(192,192,192,0.12)", color: "#C0C0C0", border: "1px solid rgba(192,192,192,0.25)" },
  };
  const s = variants[v] || variants.gold;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 10,
      background: s.bg, color: s.color, border: s.border,
      display: "inline-flex", alignItems: "center", gap: 3,
      letterSpacing: "0.02em", ...style
    }}>
      {children}
    </span>
  );
};

// Yuklash ekrani
export const Spinner = ({ size = 36 }) => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 32 }}>
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `3px solid rgba(212,175,55,0.15)`,
      borderTop: `3px solid #D4AF37`,
      animation: "spin 0.8s linear infinite"
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Bo'sh holat
export const Empty = ({ icon, text, sub }) => (
  <div style={{ textAlign: "center", padding: "48px 20px", color: "#616161" }}>
    <div style={{ fontSize: 52, marginBottom: 12, opacity: 0.6 }}>{icon}</div>
    <div style={{ fontWeight: 700, fontSize: 16, color: "#9E9E9E", marginBottom: 6 }}>{text}</div>
    {sub && <div style={{ fontSize: 13, color: "#616161", lineHeight: 1.6 }}>{sub}</div>}
  </div>
);

// Qadam ko'rsatkichlari
export const StepDots = ({ cur, total }) => (
  <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{
        height: 4, borderRadius: 2,
        width: i === cur ? 28 : 8,
        background: i === cur
          ? "linear-gradient(90deg, #8B6914, #D4AF37)"
          : i < cur ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.1)",
        transition: "all 0.3s",
        boxShadow: i === cur ? "0 0 8px rgba(212,175,55,0.4)" : "none",
      }} />
    ))}
  </div>
);

// Ishonch skori badge
export const TrustBadge = ({ score }) => {
  const [bg, color, icon] = score >= 80
    ? ["rgba(34,197,94,0.15)",   "#22C55E", "🛡"]
    : score >= 60
    ? ["rgba(212,175,55,0.15)",  "#D4AF37", "🛡"]
    : score >= 40
    ? ["rgba(255,255,255,0.08)", "#9E9E9E", "⚡"]
    : ["rgba(239,68,68,0.1)",    "#EF4444", "⏳"];
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 10, background: bg, color, border: `1px solid ${color}30`, display: "inline-flex", alignItems: "center", gap: 3 }}>
      {icon} {score}
    </span>
  );
};

// Match foiz badge
export const MatchBadge = ({ score }) => {
  const color = score >= 80 ? "#22C55E" : score >= 60 ? "#D4AF37" : "#9E9E9E";
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: 900, color, lineHeight: 1 }}>{score}%</div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>MOS</div>
    </div>
  );
};

// Divider
export const Divider = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
    <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.1)" }} />
    {label && <span style={{ fontSize: 11, color: "#616161", fontWeight: 600, letterSpacing: "0.1em" }}>{label}</span>}
    <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.1)" }} />
  </div>
);

// Gold rang bilan fon (sahifa asosiy wrapper)
export const PageWrap = ({ children, noPad }) => (
  <div style={{
    minHeight: "100vh",
    background: "radial-gradient(ellipse at top, #0F1A10 0%, #0D1117 40%, #0A0D14 100%)",
    padding: noPad ? 0 : "16px 16px 88px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: "relative",
    overflowX: "hidden",
  }}>
    {children}
  </div>
);

// Sahifa sarlavhasi
export const PageTitle = ({ icon, title, sub, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {icon && <span style={{ fontSize: 22 }}>{icon}</span>}
        <h2 style={{ fontWeight: 900, fontSize: 22, color: "#D4AF37", margin: 0, letterSpacing: "0.02em", textShadow: "0 0 20px rgba(212,175,55,0.3)" }}>
          {title}
        </h2>
      </div>
      {sub && <div style={{ fontSize: 12, color: "#616161", marginTop: 4, paddingLeft: icon ? 32 : 0 }}>{sub}</div>}
    </div>
    {right}
  </div>
);

// StatCard — profil statistikasi uchun
export const StatCard = ({ icon, value, label, infoText }) => {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <>
      <div
        onClick={infoText ? () => setShowInfo(true) : undefined}
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(212,175,55,0.12)",
          borderRadius: 16, padding: "14px 10px",
          textAlign: "center", cursor: infoText ? "pointer" : "default",
          position: "relative",
        }}
      >
        {infoText && <div style={{ position: "absolute", top: 6, right: 8, fontSize: 12, color: "#616161" }}>ℹ</div>}
        <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
        <div style={{ fontWeight: 900, fontSize: 20, color: "#D4AF37", textShadow: "0 0 10px rgba(212,175,55,0.3)" }}>{value}</div>
        <div style={{ fontSize: 10, color: "#616161", marginTop: 3, lineHeight: 1.3 }}>{label}</div>
      </div>
      {showInfo && (
        <Modal title={label} onClose={() => setShowInfo(false)}>
          <p style={{ fontSize: 13, color: "#9E9E9E", lineHeight: 1.7 }}>{infoText}</p>
          <Btn onClick={() => setShowInfo(false)} v="ghost" full>Yopish</Btn>
        </Modal>
      )}
    </>
  );
};

// ProgressBar
export const ProgressBar = ({ value, max = 100, color = "#D4AF37", label }) => (
  <div>
    {label && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9E9E9E", marginBottom: 4 }}>
      <span>{label}</span><span style={{ color }}>{value}/{max}</span>
    </div>}
    <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{
        height: "100%",
        width: `${Math.min((value / max) * 100, 100)}%`,
        background: `linear-gradient(90deg, ${color}80, ${color})`,
        borderRadius: 4,
        boxShadow: `0 0 8px ${color}60`,
        transition: "width 0.8s ease",
      }} />
    </div>
  </div>
);
