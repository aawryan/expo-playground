/**
 * Design tokens lifted directly from the reference tab bar mock.
 * Keep these as the single source of truth so the bar, the glow,
 * and the icon tint never drift out of sync with each other.
 */
export const colors = {
  tabBarBackground: "#141414",
  tabBarBorder: "rgba(255,255,255,0.06)",
  iconInactive: "#8A8A8E",
  iconActive: "#FF3B3B",
  indicator: "#FF3B3B",
  glowCore: "rgba(255,59,59,0.4)",
  glowEdge: "rgba(255,59,59,0)",
  screenBackground: "#FBDADD",
} as const;
