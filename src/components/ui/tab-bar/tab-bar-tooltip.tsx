import { Modal, StyleSheet, Text, View } from "react-native";
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
 * Rendered through a `Modal` rather than as a normal child of the tab
 * bar: the tab bar lives deep inside `<Stack>`, while `MiniPlayer` is
 * mounted as a *later* sibling of the whole `<Stack>` at the root layout
 * (intentionally, so playback controls float above every screen). A
 * later sibling always paints on top of an earlier one regardless of any
 * `position: absolute` trick inside the earlier one, so a tooltip nested
 * inside the tab bar was getting drawn first and then covered by
 * MiniPlayer whenever it was showing. `Modal` renders into its own
 * top-level native layer above the whole app (MiniPlayer included), so
 * this sidesteps that ordering entirely. `pointerEvents="box-none"` on
 * the full-screen wrapper keeps it purely visual — nothing underneath
 * loses touch.
 */
export function TabBarTooltip({ label, centerX, insets }: TabBarTooltipProps) {
  return (
    <Modal
      transparent
      animationType="none"
      visible
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={styles.screen} pointerEvents="box-none">
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
          <Animated.View style={styles.bubble}>
            <Text style={[typography.caption, styles.label]}>{label}</Text>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
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
