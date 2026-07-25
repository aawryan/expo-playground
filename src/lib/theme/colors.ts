/**
 * Design tokens lifted directly from the app icon (slate/navy gradient
 * with a light "listening ear" glyph). Keep these as the single source
 * of truth so the bar, the glow, the icon tint, and every screen stay
 * in sync with the brand mark.
 *
 * The icon's own gradient runs from slate-700 (#334155) in its lightest
 * corner down to slate-900 (#0F172A) in its darkest — so the app
 * background stays *inside* that range (slate-900) instead of going
 * darker than the icon itself (the old slate-950 read as too heavy).
 *
 * Palette reference (Tailwind Slate):
 *   slate-900 #0F172A  slate-800 #1E293B  slate-700 #334155
 *   slate-400 #94A3B8  slate-200 #E2E8F0  slate-50  #F8FAFC
 */
export const colors = {
  // App-wide background — the icon's own darkest tone, not darker than it.
  screenBackground: "#0F172A",
  screenBackgroundElevated: "#1E293B",

  // Tab bar sits one step lighter than the screen so it visually floats.
  tabBarBackground: "#1E293B",
  tabBarBorder: "rgba(226,232,240,0.10)",

  // Icon tint mirrors the glyph color straight off the app icon.
  iconInactive: "#94A3B8",
  iconActive: "#E2E8F0",
  indicator: "#E2E8F0",
  glowCore: "rgba(226,232,240,0.45)",
  glowEdge: "rgba(226,232,240,0)",

  // Text tokens for content sitting on the dark background.
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  textTertiary: "#64748B",

  // Card/surface tokens for content sections (home feed, list items).
  surface: "#1E293B",
  surfaceElevated: "#293548",
  surfaceBorder: "rgba(226,232,240,0.08)",

  // Accent used sparingly for active states (language chips, links).
  accent: "#38BDF8",
  accentMuted: "rgba(56,189,248,0.16)",

  // Feedback tokens.
  danger: "#F87171",

  // Gradient scrims over artwork (poster cards, spotlight banner) — the
  // screen background's own hue at increasing opacity, so overlaid text
  // stays legible without introducing a color the icon doesn't have.
  scrimSoft: "rgba(15,23,42,0.35)",
  scrimStrong: "rgba(15,23,42,0.92)",
} as const;
