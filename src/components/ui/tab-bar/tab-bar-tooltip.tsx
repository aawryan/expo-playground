import { StyleSheet, Text } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { colors } from "@/lib/theme/colors";
import { spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import { TOOLTIP_BOTTOM_GAP, TOOLTIP_HEIGHT } from "./tab-bar.constants";

interface TabBarTooltipProps {
  label: string;
  /** Center x of the tab icon it points at, relative to the bar. */
  centerX: number;
}

/** Small label bubble that pops up above a tab icon on long-press —
 * e.g. long-pressing Home shows "Home" — then fades out on its own. */
export function TabBarTooltip({ label, centerX }: TabBarTooltipProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(120)}
      exiting={FadeOut.duration(120)}
      pointerEvents="none"
      style={[
        styles.wrapper,
        { left: centerX, top: -(TOOLTIP_HEIGHT + TOOLTIP_BOTTOM_GAP) },
      ]}
    >
      <Animated.View style={styles.bubble}>
        <Text style={[typography.caption, styles.label]}>{label}</Text>
      </Animated.View>
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
