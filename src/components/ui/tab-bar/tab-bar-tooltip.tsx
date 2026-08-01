import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import type { EdgeInsets } from "react-native-safe-area-context";

import { colors } from "@/lib/theme/colors";
import { spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import {
  TAB_BAR_BOTTOM_MARGIN,
  TAB_BAR_HEIGHT,
  TAB_BAR_HORIZONTAL_MARGIN,
  TOOLTIP_BOTTOM_GAP,
} from "./tab-bar.constants";

interface TabBarTooltipProps {
  label: string;
  /** Center x of the tab icon it points at, relative to the bar. */
  centerX: number;
  insets: EdgeInsets;
}

/**
 * Small label bubble that pops up above a tab icon on long-press — e.g.
 * long-pressing Home shows "Home" — then fades out on its own.
 *
 * Rendered as a plain sibling at the *root* of the app (see
 * TabBarTooltipHost, mounted in app/_layout.tsx right after
 * `<MiniPlayer />`) rather than nested inside the tab bar — the tab bar
 * lives deep inside `<Stack>`, while `MiniPlayer` is mounted as a later
 * sibling of the whole `<Stack>` specifically so it floats above every
 * screen. A later sibling always paints on top of an earlier one
 * regardless of any `position: absolute` trick inside the earlier one, so
 * a tooltip nested inside the tab bar was getting drawn first and then
 * covered by MiniPlayer whenever it was showing.
 *
 * This used to be wrapped in a native `<Modal>` to solve that same
 * ordering problem instead (a Modal renders into its own top-level native
 * layer, above everything). That "worked" visually but had a real bug:
 * while a Modal is up, Android in particular can fail to hand fresh touch
 * gestures — like a *new* long-press starting on a different tab — to the
 * view hierarchy underneath it, since the Modal owns a separate native
 * window. That's exactly what caused long-pressing a second tab to do
 * nothing until the first tab's tooltip had already auto-dismissed itself.
 * Being a normal sibling in the same window fixes that at the root: there
 * is no separate native layer for touches to get stuck behind.
 */
export function TabBarTooltip({ label, centerX, insets }: TabBarTooltipProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(120)}
      exiting={FadeOut.duration(120)}
      pointerEvents="none"
      style={[
        styles.wrapper,
        {
          left: TAB_BAR_HORIZONTAL_MARGIN + insets.left + centerX,
          bottom:
            insets.bottom +
            TAB_BAR_BOTTOM_MARGIN +
            TAB_BAR_HEIGHT +
            TOOLTIP_BOTTOM_GAP,
        },
      ]}
    >
      <View style={styles.bubble}>
        <Text style={[typography.caption, styles.label]}>{label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Positioned by its left edge at the icon's center x, then pulled back
  // by 50% of its own width via transform so it ends up truly centered
  // without needing to know its rendered width up front.
  wrapper: {
    position: "absolute",
    transform: [{ translateX: "-50%" }],
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
    backgroundColor: colors.screenBackgroundElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.tabBarBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
});
