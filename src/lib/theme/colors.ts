/**
 * Design tokens rebuilt to match the app icon's actual character: a true
 * black/gray gradient (not a blue-tinted slate) with a stark white glyph.
 * Previously these leaned on Tailwind's Slate scale, which carries a
 * faint blue tint — close, but not what the icon actually is. This pass
 * moves to a neutral (Zinc-style) gray scale and swaps every accent that
 * used to be blue for plain white, so the whole app reads as the same
 * grayscale material as the icon itself, with white doing the job color
 * used to do (the "glowing white indicator" look).
 *
 * Palette reference (neutral gray):
 *   #0A0A0B (near-black bg)   #161618 (elevated surface)
 *   #232326 (raised surface)  #6E6E76 / #9A9AA2 (muted text)
 *   #FAFAFA / #FFFFFF (glyph white)
 */
export const colors = {
  // App-wide background — near-black rather than pure #000, which reads
  // as "dead" on OLED screens and flattens shadows; this keeps just
  // enough depth for elevation to still read.
  screenBackground: "#0A0A0B",
  screenBackgroundElevated: "#161618",

  // Tab bar sits one step lighter than the screen so it visually floats.
  tabBarBackground: "#161618",
  tabBarBorder: "rgba(255,255,255,0.10)",

  // Icon tint mirrors the glyph color straight off the app icon: dark
  // ring, stark white needle/active state.
  iconInactive: "#8A8A90",
  iconActive: "#FFFFFF",
  indicator: "#FFFFFF",
  glowCore: "rgba(255,255,255,0.55)",
  glowEdge: "rgba(255,255,255,0)",

  // Text tokens for content sitting on the dark background.
  textPrimary: "#FAFAFA",
  textSecondary: "#9A9AA2",
  textTertiary: "#6E6E76",

  // Card/surface tokens for content sections (home feed, list items).
  surface: "#161618",
  surfaceElevated: "#232326",
  surfaceBorder: "rgba(255,255,255,0.08)",

  // Accent used for active states (language chips, links, play button,
  // progress fill). No longer blue — the icon has no color of its own,
  // so the brightest neutral (white) carries that "this is active/lit
  // up" job instead, same as the tab bar's glow and indicator.
  accent: "#FFFFFF",
  accentMuted: "rgba(255,255,255,0.14)",

  // Feedback tokens — kept as a real color since it's functional
  // (errors), not decorative, and needs to read as "different" from
  // the rest of the now fully monochrome palette.
  danger: "#F87171",

  // Gradient scrims over artwork (poster cards, spotlight banner) — pure
  // black at increasing opacity, matching the new screen background's
  // own hue so overlaid text stays legible without introducing a color
  // the icon doesn't have.
  scrimSoft: "rgba(0,0,0,0.35)",
  scrimStrong: "rgba(0,0,0,0.92)",

  // Faded white text sitting directly on artwork (track/chart card
  // captions, rank numbers) — same white as textPrimary, just at
  // different opacities depending on how much it needs to recede.
  textOnImage: "rgba(250,250,250,0.75)",
  textOnImageMuted: "rgba(250,250,250,0.55)",
  textOnImageFaint: "rgba(250,250,250,0.28)",
} as const;
