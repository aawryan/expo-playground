import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/lib/theme/colors";
import { TabBarButton } from "./tab-bar-button";
import { TabBarGlow } from "./tab-bar-glow";
import {
  GLOW_ABSORB_DURATION,
  GLOW_FALL_DURATION,
  GLOW_HEIGHT,
  GLOW_TRAVEL_DELAY,
  GLOW_WIDTH_BOTTOM,
  INDICATOR_HEIGHT,
  INDICATOR_TOP_INSET,
  INDICATOR_WIDTH,
  SPRING_CONFIG,
  TAB_BAR_BOTTOM_MARGIN,
  TAB_BAR_HEIGHT,
  TAB_BAR_HORIZONTAL_MARGIN,
  TAB_BAR_RADIUS,
  TAB_ICON_CONFIG,
} from "./tab-bar.constants";
import type { TabBarProps, TabLayout } from "./tab-bar.types";

export function TabBar({ state, navigation, insets }: TabBarProps) {
  const [layouts, setLayouts] = useState<Record<number, TabLayout>>({});
  const hasMeasuredInitial = useRef(false);

  const indicatorX = useSharedValue(0);
  const indicatorScaleX = useSharedValue(1);
  const glowX = useSharedValue(0);
  // 0 = fully retracted (hidden), 1 = fully revealed down to the icon.
  const glowReveal = useSharedValue(0);

  const activeLayout = layouts[state.index];

  useEffect(() => {
    if (!activeLayout) return;

    const indicatorTarget =
      activeLayout.x + activeLayout.width / 2 - INDICATOR_WIDTH / 2;
    const glowTarget =
      activeLayout.x + activeLayout.width / 2 - GLOW_WIDTH_BOTTOM / 2;

    if (!hasMeasuredInitial.current) {
      // Snap into place on first measure instead of springing in from 0.
      indicatorX.value = indicatorTarget;
      glowX.value = glowTarget;
      glowReveal.value = 1;
      hasMeasuredInitial.current = true;
      return;
    }

    // Indicator always slides smoothly and stays visible throughout.
    indicatorX.value = withSpring(indicatorTarget, SPRING_CONFIG);
    indicatorScaleX.value = withSequence(
      withTiming(1.7, { duration: 140 }),
      withSpring(1, SPRING_CONFIG),
    );

    // The glow's position updates immediately (while retracted), but
    // visually it gets "absorbed" back up into the indicator, travels
    // hidden, then pours smoothly top-to-bottom onto the new icon.
    glowX.value = withSpring(glowTarget, SPRING_CONFIG);
    glowReveal.value = withSequence(
      withTiming(0, { duration: GLOW_ABSORB_DURATION }),
      withDelay(
        GLOW_TRAVEL_DELAY,
        withTiming(1, {
          duration: GLOW_FALL_DURATION,
          easing: Easing.out(Easing.cubic),
        }),
      ),
    );
  }, [activeLayout, indicatorX, indicatorScaleX, glowX, glowReveal]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: indicatorX.value },
      { scaleX: indicatorScaleX.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: glowX.value }],
  }));

  // Cropping this container's height from 0 → GLOW_HEIGHT (anchored at the
  // top) reveals the fixed-size glow graphic progressively downward — the
  // "light falling from the indicator onto the icon" motion.
  const glowRevealStyle = useAnimatedStyle(() => ({
    height: glowReveal.value * GLOW_HEIGHT,
  }));

  const handleLayoutFor = useCallback(
    (index: number) => (layout: TabLayout) => {
      setLayouts((prev) => {
        const existing = prev[index];
        if (
          existing &&
          existing.x === layout.x &&
          existing.width === layout.width
        ) {
          return prev;
        }
        return { ...prev, [index]: layout };
      });
    },
    [],
  );

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          left: TAB_BAR_HORIZONTAL_MARGIN + insets.left,
          right: TAB_BAR_HORIZONTAL_MARGIN + insets.right,
          // Sits above the system nav bar / home indicator on every
          // device, instead of a fixed guess that only worked on some.
          bottom: insets.bottom + TAB_BAR_BOTTOM_MARGIN,
        },
      ]}
    >
      <View style={styles.bar}>
        <View style={styles.glowClip} pointerEvents="none">
          <Animated.View style={[styles.glow, glowStyle]}>
            <Animated.View style={[styles.glowReveal, glowRevealStyle]}>
              <TabBarGlow />
            </Animated.View>
          </Animated.View>
        </View>

        {/* Indicator is a normal child of the bar now — fully inside the
            pill, not a sibling poking above its rounded edge. */}
        <Animated.View
          style={[styles.indicator, indicatorStyle]}
          pointerEvents="none"
        />

        {state.routes.map((route, index) => {
          const config = TAB_ICON_CONFIG.find(
            (c) => c.routeName === route.name,
          );
          if (!config) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <TabBarButton
              key={route.key}
              source={config.source}
              colorKeypaths={config.colorKeypaths}
              focused={isFocused}
              accessibilityLabel={config.accessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              onLayout={handleLayoutFor(index)}
              style={styles.button}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: TAB_BAR_HEIGHT,
    width: "100%",
    borderRadius: TAB_BAR_RADIUS,
    backgroundColor: colors.tabBarBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.tabBarBorder,
    // Intentionally NOT overflow:hidden here — that would also clip the
    // shadow below. Clipping is scoped to glowClip instead.
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  // Matches the bar's exact bounds/shape, clipping the glow to the pill —
  // contained "stage light" instead of spilling out above the bar.
  glowClip: {
    ...StyleSheet.absoluteFill,
    borderRadius: TAB_BAR_RADIUS,
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  glowReveal: {
    width: GLOW_WIDTH_BOTTOM,
    overflow: "hidden",
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: TAB_BAR_HEIGHT,
  },
  indicator: {
    position: "absolute",
    top: INDICATOR_TOP_INSET,
    left: 0,
    width: INDICATOR_WIDTH,
    height: INDICATOR_HEIGHT,
    borderRadius: INDICATOR_HEIGHT / 2,
    backgroundColor: colors.indicator,
    // Its own small glow so it reads clearly against the dark bar.
    shadowColor: colors.indicator,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },
});
