// ═══════════════════════════════════════════════════════
// MIDAS V8 — TEMA TIZIMI
// Logoga mos: Gold (#D4AF37) + Emerald + Metallik
// ═══════════════════════════════════════════════════════

export const COLORS = {
  // Gold
  gold:         "#D4AF37",
  goldDark:     "#B8960C",
  goldDeep:     "#8B6914",
  goldLight:    "#F5E6A3",
  goldGlow:     "rgba(212,175,55,0.25)",
  goldGlowSoft: "rgba(212,175,55,0.10)",

  // Emerald
  emerald:      "#1B5E40",
  emeraldMid:   "#2D8653",
  emeraldLight: "#4CAF50",
  emeraldPale:  "#A5D6A7",
  emeraldGlow:  "rgba(27,94,64,0.35)",
  emeraldGlowS: "rgba(45,134,83,0.15)",

  // Metallik oq / kulrang
  metalWhite:   "#E8E8E8",
  metalSilver:  "#C0C0C0",
  metalGrey:    "#9E9E9E",
  metalDark:    "#616161",

  // Qora fonlar
  bgDeep:       "#0A0D14",
  bgDark:       "#0D1117",
  bgCard:       "#131924",
  bgCard2:      "#1A2235",
  bgCard3:      "#1E2A40",

  // Qo'shimcha
  danger:       "#EF4444",
  dangerDark:   "#B91C1C",
  dangerGlow:   "rgba(239,68,68,0.15)",
  success:      "#22C55E",
  successGlow:  "rgba(34,197,94,0.15)",
  blue:         "#3B82F6",
  blueGlow:     "rgba(59,130,246,0.15)",
  purple:       "#8B5CF6",
  purpleGlow:   "rgba(139,92,246,0.15)",
};

export const GRADIENTS = {
  gold:         `linear-gradient(135deg, ${COLORS.goldDeep} 0%, ${COLORS.gold} 45%, ${COLORS.goldLight} 100%)`,
  goldReverse:  `linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 55%, ${COLORS.goldDeep} 100%)`,
  goldShimmer:  `linear-gradient(90deg, ${COLORS.goldDark}, ${COLORS.gold}, ${COLORS.goldLight}, ${COLORS.gold}, ${COLORS.goldDark})`,
  emerald:      `linear-gradient(135deg, ${COLORS.emerald} 0%, ${COLORS.emeraldMid} 60%, ${COLORS.emeraldLight} 100%)`,
  hero:         `linear-gradient(145deg, #0A0D14 0%, #0F1A10 40%, #1B3A20 70%, #0A0D14 100%)`,
  cardGold:     `linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.04) 100%)`,
  cardEmerald:  `linear-gradient(135deg, rgba(27,94,64,0.25) 0%, rgba(27,94,64,0.08) 100%)`,
  darkGlass:    `linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)`,
  premium:      `linear-gradient(135deg, #1A1200 0%, #3D2B00 40%, #8B6914 70%, #D4AF37 100%)`,
};

export const SHADOWS = {
  gold:    `0 0 20px rgba(212,175,55,0.3), 0 4px 20px rgba(0,0,0,0.4)`,
  goldSm:  `0 0 10px rgba(212,175,55,0.2), 0 2px 8px rgba(0,0,0,0.3)`,
  emerald: `0 0 20px rgba(45,134,83,0.3), 0 4px 20px rgba(0,0,0,0.4)`,
  card:    `0 4px 24px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.04)`,
  inset:   `inset 0 1px 0 rgba(255,255,255,0.06)`,
};

// Asosiy tema ob'ekt
export const buildTheme = () => ({
  // Asosiy ranglar
  bg:           COLORS.bgDark,
  bgDeep:       COLORS.bgDeep,
  card:         COLORS.bgCard,
  card2:        COLORS.bgCard2,
  card3:        COLORS.bgCard3,
  text:         COLORS.metalWhite,
  textSub:      COLORS.metalSilver,
  hint:         COLORS.metalGrey,
  border:       "rgba(212,175,55,0.15)",
  borderSub:    "rgba(255,255,255,0.06)",

  // Asosiy rang — GOLD
  accent:       COLORS.gold,
  accentDark:   COLORS.goldDark,
  accentDeep:   COLORS.goldDeep,
  accentLight:  COLORS.goldGlowSoft,
  accentGlow:   COLORS.goldGlow,

  // Ikkilamchi — EMERALD
  emerald:      COLORS.emerald,
  emeraldMid:   COLORS.emeraldMid,
  emeraldLight: COLORS.emeraldLight,
  emeraldGlow:  COLORS.emeraldGlowS,

  // Holat ranglari
  danger:       COLORS.danger,
  dangerL:      COLORS.dangerGlow,
  success:      COLORS.success,
  successL:     COLORS.successGlow,
  blue:         COLORS.blue,
  blueL:        COLORS.blueGlow,
  purple:       COLORS.purple,
  purpleL:      COLORS.purpleGlow,

  // Input
  inputBg:      "rgba(255,255,255,0.04)",
  inputBorder:  "rgba(212,175,55,0.2)",

  // Gradientlar
  heroGrad:     GRADIENTS.hero,
  goldGrad:     GRADIENTS.gold,
  emeraldGrad:  GRADIENTS.emerald,
  premGrad:     GRADIENTS.premium,
  cardGoldGrad: GRADIENTS.cardGold,
  glassGrad:    GRADIENTS.darkGlass,

  // Shadow
  shadowGold:   SHADOWS.gold,
  shadowGoldSm: SHADOWS.goldSm,
  shadowCard:   SHADOWS.card,

  // Metalllik
  metal:        COLORS.metalWhite,
  metalSilver:  COLORS.metalSilver,
  gold:         COLORS.gold,
});
