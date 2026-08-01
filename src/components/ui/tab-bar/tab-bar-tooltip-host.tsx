import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTabBarTooltipStore } from "@/lib/navigation/tab-bar-tooltip-store";
import { TabBarTooltip } from "./tab-bar-tooltip";

/**
 * Mount exactly once, at the app root, *after* `<MiniPlayer />` — see the
 * doc comment on TabBarTooltip for why paint order matters here and why
 * this isn't a native `<Modal>` anymore.
 */
export function TabBarTooltipHost() {
  const tooltip = useTabBarTooltipStore((state) => state.tooltip);
  const insets = useSafeAreaInsets();

  if (!tooltip) return null;

  return (
    <View style={styles.screen} pointerEvents="box-none">
      <TabBarTooltip
        label={tooltip.label}
        centerX={tooltip.centerX}
        insets={insets}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFill,
  },
});
