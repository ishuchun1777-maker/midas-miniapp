// ═══════════════════════════════════════════════════════
// MIDAS v5 — Part 1: Theme · Helpers · UI Atoms · Logo
// ═══════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from "react";
import {
  SECTORS, PLATFORMS_ONLINE, PLATFORMS_OFFLINE, PLATFORMS_ALL,
  AGE_OPTIONS, FOLLOWER_RANGES, LOCATIONS, SECTOR_INTERESTS,
  PHONE_REGEX, CAMPAIGN_GOALS, REVIEW_TAGS, PREMIUM_PLANS
} from "./constants_v5";
import { LEGAL } from "./legal";

export const API      = process.env.REACT_APP_API_URL || "https://midas-backend.onrender.com";
export const ADMIN_IDS= (process.env.REACT_APP_ADMIN_IDS||"").split(",").map(Number).filter(Boolean);
export const tg       = window.Telegram?.WebApp;

// ── THEME ──────────────────────────────────────────────
export const buildTheme = () => {
  const tp = tg?.themeParams || {};
  const dk = (tg?.colorScheme||"light") === "dark";
  return {
    dk,
    bg:          tp.bg_color           || (dk?"#0d0f1a":"#f0f2f8"),
    card:        tp.secondary_bg_color || (dk?"#161927":"#ffffff"),
    card2:       dk?"#1e2236":"#f6f8ff",
    text:        tp.text_color         || (dk?"#e8ecf4":"#0f1523"),
    sub:         dk?"#9aa5bc":"#64748b",
    hint:        tp.hint_color         || (dk?"#636e82":"#94a3b8"),
    accent:      "#2d6a4f",
    accentB:     "#52b788",
    accentLight: dk?"#1a3d2e":"#d8f3dc",
    border:      dk?"#262d42":"#e2e8f0",
    inputBg:     dk?"#111525":"#f1f5fd",
    danger:      "#e05252",
    dangerL:     dk?"#3d1515":"#fde8e8",
    gold:        "#c9a84c",
    goldL:       dk?"#3a2800":"#fef3c7",
    success:     "#38a169",
    successL:    dk?"#1a3a27":"#d1fae5",
    purple:      "#7c5cbf",
    purpleL:     dk?"#2a1f4a":"#ede9fe",
    blue:        "#3b82f6",
    blueL:       dk?"#1a2a4a":"#dbeafe",
    heroGrad:    "linear-gradient(135deg,#1a4a2e 0%,#2d6a4f 50%,#52b788 100%)",
    premGrad:    "linear-gradient(135deg,#c9a84c,#f0c070)",
  };
};

// ── API ────────────────────────────────────────────────
export const http = async (path, method="GET", body=null) => {
  const opts = { method, headers:{"Content-Type":"application/json"} };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(API+path, opts);
  if (!r.ok) { const e=await r.json().catch(()=>{}); throw new Error(e?.error||`HTTP ${r.status}`); }
  return r.json();
};

export const fmtNum = n => {
  if (!n && n!==0) return "—";
  return Number(n).toLocaleString("ru-RU");
};

export const L = (obj, lang) => obj?.[`l_${lang}`] || obj?.l_uz || "";

// ── LOGO ───────────────────────────────────────────────
export const MidasLogo = ({ size=44, theme, white=false }) => {
  const c1 = white ? "rgba(255,255,255,0.9)" : "#c9a84c";
  const c2 = white ? "rgba(255,255,255,0.5)" : "#2d6a4f";
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="mG1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={white?"rgba(255,255,255,0.95)":"#c9a84c"}/>
          <stop offset="100%" stopColor={white?"rgba(255,255,255,0.7)":"#f0c070"}/>
        </linearGradient>
        <linearGradient id="mG2" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={c2} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={c2} stopOpacity="0.08"/>
        </linearGradient>
        <filter id="mShadow">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.2"/>
        </filter>
      </defs>
      {/* Outer hex fill */}
      <polygon points="60,5 112,32.5 112,87.5 60,115 8,87.5 8,32.5"
        fill="url(#mG2)" filter="url(#mShadow)"/>
      {/* Outer hex border */}
      <polygon points="60,5 112,32.5 112,87.5 60,115 8,87.5 8,32.5"
        fill="none" stroke="url(#mG1)" strokeWidth="2.5"/>
      {/* Inner hex border */}
      <polygon points="60,20 97,41 97,79 60,100 23,79 23,41"
        fill="none" stroke="url(#mG1)" strokeWidth="1.5" opacity="0.55"/>
      {/* M letterform */}
      <path d="M35,38 L35,82 M35,38 L60,66 L85,38 M85,38 L85,82"
        stroke="url(#mG1)" strokeWidth="9"
        strokeLinecap="round" strokeLinejoin="round"/>
      {/* Crown dots */}
      <circle cx="60"  cy="5"   r="3.5" fill="url(#mG1)"/>
      <circle cx="112" cy="32.5" r="2.5" fill="url(#mG1)" opacity="0.7"/>
      <circle cx="8"   cy="32.5" r="2.5" fill="url(#mG1)" opacity="0.7"/>
    </svg>
  );
};

// ── UI ATOMS ───────────────────────────────────────────
export const Card = ({ children, theme, style={} }) => (
  <div style={{
    background:theme.card, borderRadius:20, padding:16, marginBottom:12,
    border:`1px solid ${theme.border}`,
    boxShadow:"0 2px 16px rgba(0,0,0,0.06)", ...style
  }}>{children}</div>
);

export const Btn = ({ children, onClick, disabled, theme, v="primary", full=false, sz="md", style={} }) => {
  const variants = {
    primary:   { bg:theme.accent,    color:"#fff",       border:"none" },
    secondary: { bg:theme.card2,     color:theme.text,   border:`1px solid ${theme.border}` },
    ghost:     { bg:"transparent",   color:theme.accent, border:`1.5px solid ${theme.accent}` },
    danger:    { bg:theme.danger,    color:"#fff",       border:"none" },
    gold:      { bg:theme.premGrad,  color:"#fff",       border:"none" },
    dark:      { bg:theme.card2,     color:theme.sub,    border:`1px solid ${theme.border}` },
  };
  const s   = variants[v] || variants.primary;
  const pad = sz==="sm"?"8px 15px" : sz==="lg"?"15px 24px" : sz==="xl"?"18px 28px" : "12px 20px";
  const fs  = sz==="sm"?12 : sz==="lg"?15 : sz==="xl"?16 : 14;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background:s.bg, color:s.color, border:s.border,
      borderRadius:12, padding:pad, fontWeight:600, fontSize:fs,
      cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.5:1,
      width:full?"100%":"auto", fontFamily:"inherit",
      transition:"opacity 0.15s", letterSpacing:"0.01em", ...style
    }}>{children}</button>
  );
};

export const Inp = ({ label, value, onChange, ph, type="text", err, note, theme, rows, suffix }) => (
  <div style={{marginBottom:14}}>
    {label && <div style={{fontSize:12,color:theme.sub,marginBottom:5,fontWeight:600}}>{label}</div>}
    <div style={{position:"relative"}}>
      {rows
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} rows={rows}
            style={{width:"100%",padding:"12px 14px",borderRadius:12,border:`1.5px solid ${err?theme.danger:theme.border}`,background:theme.inputBg,color:theme.text,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",resize:"vertical",lineHeight:1.6}}/>
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={ph}
            style={{width:"100%",padding:"12px 14px",paddingRight:suffix?"44px":"14px",borderRadius:12,border:`1.5px solid ${err?theme.danger:theme.border}`,background:theme.inputBg,color:theme.text,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
      }
      {suffix && <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:theme.sub,fontSize:12,fontWeight:600}}>{suffix}</span>}
    </div>
    {err  && <div style={{color:theme.danger,fontSize:11,marginTop:4,fontWeight:500}}>⚠ {err}</div>}
    {note && <div style={{color:theme.hint,fontSize:11,marginTop:4}}>🔒 {note}</div>}
  </div>
);

export const TagCloud = ({ options, selected, onChange, max, label, theme, getLabel }) => {
  const toggle = v => {
    if (selected.includes(v)) onChange(selected.filter(x=>x!==v));
    else if (!max || selected.length < max) onChange([...selected, v]);
  };
  return (
    <div style={{marginBottom:14}}>
      {label && <div style={{fontSize:12,color:theme.sub,marginBottom:7,fontWeight:600}}>{label}</div>}
      <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
        {options.map(o => {
          const lbl = getLabel ? getLabel(o) : (o.l||o.v);
          const sel = selected.includes(o.v);
          return (
            <button key={o.v} onClick={()=>toggle(o.v)} style={{
              padding:"7px 13px", borderRadius:20, fontSize:12, fontWeight:600,
              border:`1.5px solid ${sel?theme.accent:theme.border}`,
              background:sel?theme.accent:theme.card2,
              color:sel?"#fff":theme.sub,
              cursor:"pointer", fontFamily:"inherit", transition:"all 0.12s"
            }}>{lbl}</button>
          );
        })}
      </div>
      {max && selected.length>=max &&
        <div style={{color:theme.gold,fontSize:11,marginTop:5,fontWeight:500}}>Max {max} ta</div>}
    </div>
  );
};

export const Modal = ({ title, children, onClose, theme }) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"flex-end",zIndex:200}}
    onClick={onClose}>
    <div style={{background:theme.card,borderRadius:"24px 24px 0 0",width:"100%",maxHeight:"93vh",overflowY:"auto",padding:"16px 20px 40px"}}
      onClick={e=>e.stopPropagation()}>
      <div style={{width:40,height:4,borderRadius:2,background:theme.border,margin:"0 auto 14px"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:17,color:theme.text}}>{title}</div>
        <button onClick={onClose} style={{color:theme.hint,fontSize:28,background:"none",border:"none",cursor:"pointer",lineHeight:1}}>×</button>
      </div>
      {children}
    </div>
  </div>
);

export const StepDots = ({ cur, total, theme }) => (
  <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:28}}>
    {Array.from({length:total}).map((_,i)=>(
      <div key={i} style={{width:i===cur?24:8,height:8,borderRadius:4,
        background:i===cur?theme.accent:i<cur?theme.accentB:theme.border,
        transition:"all 0.3s"}}/>
    ))}
  </div>
);

export const Badge = ({ children, bg, color, style={} }) => (
  <span style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:10,
    background:bg,color,display:"inline-flex",alignItems:"center",gap:3,...style}}>
    {children}
  </span>
);

export const ScoreBadge = ({ score, theme }) => {
  const [bg,col] = score>=80?[theme.successL,theme.success]
    :score>=60?[theme.accentLight,theme.accent]
    :score>=40?[theme.goldL,theme.gold]
    :[theme.card2,theme.hint];
  return <Badge bg={bg} color={col}>{score}% mos</Badge>;
};

export const SectionTitle = ({ icon, title, theme, right }) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:20}}>{icon}</span>
      <span style={{fontWeight:700,fontSize:17,color:theme.text}}>{title}</span>
    </div>
    {right}
  </div>
);

export const StatCard = ({ icon, value, label, theme, color }) => (
  <div style={{background:theme.card,borderRadius:16,padding:"14px 10px",textAlign:"center",border:`1px solid ${theme.border}`}}>
    <div style={{fontSize:22,marginBottom:4}}>{icon}</div>
    <div style={{fontWeight:800,fontSize:20,color:color||theme.accent}}>{value}</div>
    <div style={{fontSize:11,color:theme.hint,marginTop:2,lineHeight:1.3}}>{label}</div>
  </div>
);

export const Divider = ({ theme }) => (
  <div style={{height:1,background:theme.border,margin:"12px 0"}}/>
);
