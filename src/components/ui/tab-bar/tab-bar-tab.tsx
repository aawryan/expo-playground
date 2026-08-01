import * as Haptics from "expo-haptics";
import { memo, useCallback, useRef } from "react";
import type { StyleProp, ViewStyle } from "react-native";

import { useTabBarTooltipStore } from "@/lib/navigation/tab-bar-tooltip-store";
import { TabBarButton } from "./tab-bar-button";
import { DOUBLE_TAP_MAX_INTERVAL } from "./tab-bar.constants";
import type { TabBarIconConfig, TabBarProps, TabLayout } from "./tab-bar.types";

interface TabBarTabProps {
  route: TabBarProps["state"]["routes"][number];
  index: number;
  isFocused: boolean;
  config: TabBarIconConfig;
  navigation: TabBarProps["navigation"];
  scrollToTop: (routeName: string) => void;
  tabLayout: TabLayout | undefined;
  onLayoutChange: (index: number, layout: TabLayout) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Previously, `onPress`/`onLongPress`/`onLayout` were built inline inside
 * TabBar's `state.routes.map(...)`, which meant every single tab got a
 * brand-new closure on every TabBar render — including renders triggered
 * by something unrelated to that tab, like another tab's layout
 * measurement coming in or the (now-removed) tooltip state changing. Since
 * `TabBarButton` is wrapped in `memo`, that new-closure-every-time was
 * silently defeating the memoization for all N tabs on every one of those
 * renders. Moving handler construction in here means each tab's `memo`
 * boundary is a real one: a re-render of this component only happens when
 * *its own* props (route/index/isFocused/config/tabLayout) actually
 * change, and the handlers below are stable across everything else.
 */
function TabBarTabBase({
  route,
  index,
  isFocused,
  config,
  navigation,
  scrollToTop,
  tabLayout,
  onLayoutChange,
  style,
}: TabBarTabProps) {
  // Per-tab, not a shared `Record<number, number>` on the parent — same
  // behavior, one less piece of state living outside where it's used.
  const lastPressAt = useRef(0);
  const showTooltip = useTabBarTooltipStore((state) => state.show);

  const handlePress = useCallback(() => {
    // A light tick on every tab press — small, but its absence is
    // exactly the kind of thing that makes a bar feel "flat".
    Haptics.selectionAsync();

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused) {
      lastPressAt.current = Date.now();
      if (!event.defaultPrevented) {
        navigation.navigate(route.name);
      }
      return;
    }

    // Tapping the tab you're already on doesn't navigate anywhere, so
    // this is where a double-tap can mean something: scroll that screen
    // back to the top.
    const now = Date.now();
    const isDoubleTap = now - lastPressAt.current < DOUBLE_TAP_MAX_INTERVAL;
    lastPressAt.current = now;

    if (isDoubleTap) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      scrollToTop(route.name);
    }
  }, [isFocused, navigation, route.key, route.name, scrollToTop]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // tabLayout can briefly be undefined before the first real layout
    // measurement comes in — just skip the tooltip that one frame rather
    // than showing it at a wrong (0,0) position.
    if (tabLayout) {
      showTooltip(config.accessibilityLabel, tabLayout.x + tabLayout.width / 2);
    }
    navigation.emit({ type: "tabLongPress", target: route.key });
  }, [
    config.accessibilityLabel,
    navigation,
    route.key,
    showTooltip,
    tabLayout,
  ]);

  const handleLayout = useCallback(
    (layout: TabLayout) => {
      onLayoutChange(index, layout);
    },
    [index, onLayoutChange],
  );

  return (
    <TabBarButton
      source={config.source}
      colorKeypaths={config.colorKeypaths}
      focused={isFocused}
      accessibilityLabel={config.accessibilityLabel}
      onPress={handlePress}
      onLongPress={handleLongPress}
      onLayout={handleLayout}
      style={style}
      forwardDuration={config.forwardDuration}
      reverseDuration={config.reverseDuration}
    />
  );
}

export const TabBarTab = memo(TabBarTabBase);
