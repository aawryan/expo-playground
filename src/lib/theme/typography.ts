import type { TextStyle } from "react-native";

import { normalizeFont } from "@/lib/responsive";
import { colors } from "./colors";

type NamedTextStyle = TextStyle & { fontSize: number; fontWeight: TextStyle["fontWeight"] };

export const typography: Record<
  "h1" | "h2" | "title" | "subtitle" | "body" | "caption" | "label",
  NamedTextStyle
> = {
  h1: {
    fontSize: normalizeFont(28),
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  h2: {
    fontSize: normalizeFont(22),
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  title: {
    fontSize: normalizeFont(17),
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: normalizeFont(15),
    fontWeight: "600",
    color: colors.textPrimary,
  },
  body: {
    fontSize: normalizeFont(14),
    fontWeight: "400",
    color: colors.textSecondary,
  },
  caption: {
    fontSize: normalizeFont(12),
    fontWeight: "500",
    color: colors.textSecondary,
  },
  label: {
    fontSize: normalizeFont(13),
    fontWeight: "600",
    color: colors.textPrimary,
  },
};
