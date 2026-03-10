// ═══════════════════════════════════════════════════════
// MIDAS V8 — LOGO (rasmga mos SVG)
// Crown + Emerald bars + Gold arrow + Circle
// ═══════════════════════════════════════════════════════

export function MidasLogo({ size = 48, white = false, animated = false }) {
  const g = white
    ? { c1: "rgba(255,255,255,0.95)", c2: "rgba(255,255,255,0.7)", em: "rgba(255,255,255,0.3)" }
    : { c1: "#D4AF37", c2: "#F5E6A3", em: "#1B5E40" };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={animated ? { filter: `drop-shadow(0 0 8px rgba(212,175,55,0.5))` } : {}}
    >
      <defs>
        <linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor={white ? "rgba(255,255,255,0.6)" : "#8B6914"} />
          <stop offset="40%"  stopColor={g.c1} />
          <stop offset="70%"  stopColor={g.c2} />
          <stop offset="100%" stopColor={white ? "rgba(255,255,255,0.8)" : "#D4AF37"} />
        </linearGradient>
        <linearGradient id="emeraldG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={white ? "rgba(255,255,255,0.4)" : "#2D8653"} />
          <stop offset="50%"  stopColor={white ? "rgba(255,255,255,0.2)" : "#1B5E40"} />
          <stop offset="100%" stopColor={white ? "rgba(255,255,255,0.1)" : "#0D3320"} />
        </linearGradient>
        <linearGradient id="shimG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="transparent" />
          <stop offset="50%"  stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={white ? "rgba(255,255,255,0.05)" : "rgba(27,94,64,0.2)"} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <circle cx="100" cy="105" r="75" fill="url(#bgGrad)" />

      {/* ── Tashqi doira (arc) ── */}
      <path
        d="M 42 100 A 58 58 0 1 1 158 100"
        stroke="url(#goldG)" strokeWidth="5" fill="none"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      {/* ── Emerald banerlar (bar chart) ── */}
      {/* Bar 1 */}
      <rect x="76" y="72" width="14" height="70" rx="2" fill="url(#emeraldG)" />
      <rect x="76" y="72" width="14" height="70" rx="2" fill="url(#shimG)" />
      {/* Bar 2 */}
      <rect x="93" y="58" width="14" height="84" rx="2" fill="url(#emeraldG)" />
      <rect x="93" y="58" width="14" height="84" rx="2" fill="url(#shimG)" />
      {/* Bar 3 */}
      <rect x="110" y="68" width="14" height="74" rx="2" fill="url(#emeraldG)" />
      <rect x="110" y="68" width="14" height="74" rx="2" fill="url(#shimG)" />

      {/* ── Gold bar chiziqlar (ustki qoplag'ich) ── */}
      <line x1="76" y1="72" x2="76" y2="142" stroke="url(#goldG)" strokeWidth="1.5" opacity="0.6"/>
      <line x1="90" y1="72" x2="90" y2="142" stroke="url(#goldG)" strokeWidth="1.5" opacity="0.6"/>
      <line x1="93" y1="58" x2="93" y2="142" stroke="url(#goldG)" strokeWidth="1.5" opacity="0.6"/>
      <line x1="107" y1="58" x2="107" y2="142" stroke="url(#goldG)" strokeWidth="1.5" opacity="0.6"/>
      <line x1="110" y1="68" x2="110" y2="142" stroke="url(#goldG)" strokeWidth="1.5" opacity="0.6"/>
      <line x1="124" y1="68" x2="124" y2="142" stroke="url(#goldG)" strokeWidth="1.5" opacity="0.6"/>

      {/* ── O'rtadagi ustun (diqqat markazi) ── */}
      <rect x="94" y="48" width="12" height="94" rx="2" fill="url(#goldG)" opacity="0.85" />

      {/* ── Yuqoriga o'sish o'qi (arrow) ── */}
      <polyline
        points="62,130 90,100 115,110 145,68"
        stroke="url(#goldG)" strokeWidth="4.5"
        fill="none" strokeLinecap="round" strokeLinejoin="round"
        filter="url(#glow)"
      />
      {/* Arrow head */}
      <polygon
        points="145,68 132,72 137,82"
        fill="url(#goldG)"
        filter="url(#glow)"
      />

      {/* ── Toj (crown) ── */}
      {/* Toj tayanchi */}
      <rect x="85" y="38" width="30" height="6" rx="2" fill="url(#goldG)" />
      {/* Toj tishlar */}
      <polygon points="87,38 90,24 93,38" fill="url(#goldG)" />
      <polygon points="98,38 100,18 102,38" fill="url(#goldG)" />
      <polygon points="107,38 110,24 113,38" fill="url(#goldG)" />
      {/* Toj tepasidagi doirachalar */}
      <circle cx="90" cy="23" r="3.5" fill="url(#goldG)" filter="url(#glow)" />
      <circle cx="100" cy="17" r="4"   fill="url(#goldG)" filter="url(#glow)" />
      <circle cx="110" cy="23" r="3.5" fill="url(#goldG)" filter="url(#glow)" />

      {/* ── Sozlash belgilari (target/signal) ── */}
      <circle cx="60" cy="112" r="7"  stroke="url(#goldG)" strokeWidth="1.5" fill="none" opacity="0.6"/>
      <circle cx="60" cy="112" r="3"  fill="url(#goldG)" opacity="0.8"/>

      {/* ── Pastki chiziq ── */}
      <line x1="70" y1="148" x2="130" y2="148" stroke="url(#goldG)" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  );
}

// ── KICHIK LOGO (BottomNav uchun) ──
export function MidasLogoMini({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="mG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B6914" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#F5E6A3" />
        </linearGradient>
      </defs>
      <rect x="16" y="22" width="6" height="24" rx="1" fill="#1B5E40" />
      <rect x="24" y="16" width="6" height="30" rx="1" fill="#2D8653" />
      <rect x="32" y="20" width="6" height="26" rx="1" fill="#1B5E40" />
      <rect x="25" y="14" width="4" height="32" rx="1" fill="url(#mG)" opacity="0.9" />
      <polyline points="14,40 26,30 35,34 46,20" stroke="url(#mG)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <polygon points="46,20 40,22 42,28" fill="url(#mG)" />
      <polygon points="25,14 26.5,8 28,14" fill="url(#mG)" />
      <circle cx="28" cy="7" r="2" fill="url(#mG)" />
    </svg>
  );
}

// ── MATNLI LOGO ──
export function MidasWordmark({ size = "md", white = false }) {
  const color = white ? "#FFFFFF" : "#D4AF37";
  const subColor = white ? "rgba(255,255,255,0.6)" : "rgba(212,175,55,0.6)";
  const sizes = { sm: { title: 16, sub: 8 }, md: { title: 22, sub: 10 }, lg: { title: 32, sub: 12 } };
  const fs = sizes[size] || sizes.md;

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontWeight: 900,
        fontSize: fs.title,
        letterSpacing: "0.35em",
        color,
        textShadow: white ? "none" : `0 0 20px rgba(212,175,55,0.4)`,
        lineHeight: 1,
      }}>
        MIDAS
      </div>
      <div style={{
        fontSize: fs.sub,
        letterSpacing: "0.25em",
        color: subColor,
        textTransform: "uppercase",
        marginTop: 3,
        fontWeight: 500,
      }}>
        Businessman · Advertiser
      </div>
    </div>
  );
}
