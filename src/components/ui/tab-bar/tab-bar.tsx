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

import { useReduceMotionEnabled } from "@/lib/accessibility/use-reduce-motion";
import { useScrollToTop } from "@/lib/navigation/scroll-to-top";
import { colors } from "@/lib/theme/colors";
import { TabBarGlow } from "./tab-bar-glow";
import { TabBarTab } from "./tab-bar-tab";
import {
  GLOW_ABSORB_DURATION,
  GLOW_FALL_DURATION,
  GLOW_HEIGHT,
  GLOW_TRAVEL_DELAY,
  GLOW_WIDTH_BOTTOM_FALLBACK,
  GLOW_WIDTH_BOTTOM_RATIO,
  GLOW_WIDTH_TOP_FALLBACK,
  GLOW_WIDTH_TOP_RATIO,
  INDICATOR_HEIGHT,
  INDICATOR_TOP_INSET,
  INDICATOR_WIDTH_FALLBACK,
  INDICATOR_WIDTH_RATIO,
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
  // Mirrors hasMeasuredInitial, but as state rather than a ref: it needs
  // to actually trigger a re-render, since it's what switches the very
  // first paint from a plain (non-Reanimated) fallback over to the
  // Animated.View version. See the render below for why.
  const [isReadyForAnimation, setIsReadyForAnimation] = useState(false);
  const reduceMotion = useReduceMotionEnabled();
  const scrollToTop = useScrollToTop();

  const indicatorX = useSharedValue(0);
  const indicatorScaleX = useSharedValue(1);
  const glowX = useSharedValue(0);
  // 0 = fully retracted (hidden), 1 = fully revealed down to the icon.
  const glowReveal = useSharedValue(0);

  const activeLayout = layouts[state.index];

  // Ratio of the tab's own measured width, not a fixed pixel value — so
  // the halo hugs each icon with the same proportional space on a small
  // phone and a wide tablet alike, instead of looking cramped on one and
  // lost on the other.
  const glowWidthBottom = activeLayout
    ? activeLayout.width * GLOW_WIDTH_BOTTOM_RATIO
    : GLOW_WIDTH_BOTTOM_FALLBACK;
  const glowWidthTop = activeLayout
    ? activeLayout.width * GLOW_WIDTH_TOP_RATIO
    : GLOW_WIDTH_TOP_FALLBACK;
  const indicatorWidth = activeLayout
    ? activeLayout.width * INDICATOR_WIDTH_RATIO
    : INDICATOR_WIDTH_FALLBACK;

  useEffect(() => {
    if (!activeLayout) return;

    const indicatorTarget =
      activeLayout.x + activeLayout.width / 2 - indicatorWidth / 2;
    const glowTarget =
      activeLayout.x + activeLayout.width / 2 - glowWidthBottom / 2;

    if (!hasMeasuredInitial.current || reduceMotion) {
      // Snap into place instead of springing/sequencing in — either
      // because this is the very first measurement, or because the
      // person has Reduce Motion on and every subsequent switch should
      // respect that the same way.
      indicatorX.value = indicatorTarget;
      glowX.value = glowTarget;
      glowReveal.value = 1;
      hasMeasuredInitial.current = true;
      setIsReadyForAnimation(true);
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
  }, [
    activeLayout,
    glowWidthBottom,
    indicatorWidth,
    indicatorX,
    indicatorScaleX,
    glowX,
    glowReveal,
    reduceMotion,
  ]);

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

  // Plain (non-Reanimated) target positions, computed directly at render
  // time — used only for the fallback below, for the window between
  // "we just got a real measurement" and "the effect above has had a
  // chance to hand off to Reanimated".
  const staticIndicatorTarget = activeLayout
    ? activeLayout.x + activeLayout.width / 2 - indicatorWidth / 2
    : 0;
  const staticGlowTarget = activeLayout
    ? activeLayout.x + activeLayout.width / 2 - glowWidthBottom / 2
    : 0;

  // Single stable callback shared by every tab (not a per-index curried
  // one) — TabBarTab just tells us which index changed, so identity here
  // never depends on anything that changes per-tab.
  const handleLayoutChange = useCallback((index: number, layout: TabLayout) => {
    // On the very first layout pass (especially on Android), a flex
    // child can briefly report {x: 0, width: 0} before the row has
    // finished settling. If we stored that, the glow would snap into
    // place at a bogus position on first mount, then only get a
    // *second*, correct measurement once something else (like a tab
    // press) forced another layout pass — which is exactly why the
    // light looked "missing" until you started navigating. Ignoring
    // zero-width reports means the effect waits for the real one.
    if (layout.width === 0) return;

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
  }, []);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          left: TAB_BAR_HORIZONTAL_MARGIN + insets.left,
          right: TAB_BAR_HORIZONTAL_MARGIN + insets.right,
          // Docked flush against the bottom edge (like most apps'
          // standard bottom bar) instead of floating above it — the
          // safe-area inset is absorbed as padding *inside* the bar
          // (see `bar` style) so its background still reaches the true
          // edge while the icons themselves stay clear of the home
          // indicator / nav bar.
          bottom: TAB_BAR_BOTTOM_MARGIN,
        },
      ]}
    >
      <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
        <View style={styles.glowClip} pointerEvents="none">
          {isReadyForAnimation ? (
            <Animated.View style={[styles.glow, glowStyle]}>
              <Animated.View
                style={[
                  styles.glowReveal,
                  { width: glowWidthBottom },
                  glowRevealStyle,
                ]}
              >
                <TabBarGlow
                  widthBottom={glowWidthBottom}
                  widthTop={glowWidthTop}
                />
              </Animated.View>
            </Animated.View>
          ) : activeLayout ? (
            // Plain View, not Animated.View: this renders through React
            // Native's normal bridge/commit path the instant we have a
            // real measurement, with zero dependency on Reanimated's
            // UI-thread timing — which is what a bare shared-value
            // assignment on a genuine cold start was silently missing.
            // Once the effect above hands off to Reanimated (same
            // target values, so no visible jump), isReadyForAnimation
            // flips and this branch is never shown again.
            <View
              style={[
                styles.glow,
                { transform: [{ translateX: staticGlowTarget }] },
              ]}
            >
              <View
                style={[
                  styles.glowReveal,
                  { width: glowWidthBottom, height: GLOW_HEIGHT },
                ]}
              >
                <TabBarGlow
                  widthBottom={glowWidthBottom}
                  widthTop={glowWidthTop}
                />
              </View>
            </View>
          ) : null}
        </View>

        {/* Indicator is a normal child of the bar now — fully inside the
            pill, not a sibling poking above its rounded edge. */}
        {isReadyForAnimation ? (
          <Animated.View
            style={[
              styles.indicator,
              { width: indicatorWidth },
              indicatorStyle,
            ]}
            pointerEvents="none"
          />
        ) : activeLayout ? (
          <View
            style={[
              styles.indicator,
              {
                width: indicatorWidth,
                transform: [{ translateX: staticIndicatorTarget }],
              },
            ]}
            pointerEvents="none"
          />
        ) : null}

        {state.routes.map((route, index) => {
          const config = TAB_ICON_CONFIG.find(
            (c) => c.routeName === route.name,
          );
          if (!config) return null;

          return (
            <TabBarTab
              key={route.key}
              route={route}
              index={index}
              isFocused={state.index === index}
              config={config}
              navigation={navigation}
              scrollToTop={scrollToTop}
              tabLayout={layouts[index]}
              onLayoutChange={handleLayoutChange}
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
    // No fixed height: the row's own content (TAB_BAR_HEIGHT-tall
    // buttons) plus the safe-area paddingBottom applied inline determine
    // it, so the bar's total height adapts per device instead of a
    // fixed guess.
    width: "100%",
    borderRadius: TAB_BAR_RADIUS,
    backgroundColor: colors.tabBarBackground,
    // A docked, edge-to-edge bar only needs a top separator — side/
    // bottom hairlines would sit exactly on the screen's own edge and
    // do nothing.
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.tabBarBorder,
    // Intentionally NOT overflow:hidden here — that would also clip the
    // glow reveal below. Clipping is scoped to glowClip instead. (No
    // floating shadow anymore — a bar flush against the screen edge
    // doesn't cast one.)
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
    // Width is applied inline now (see JSX) since it's computed per-tab
    // rather than a fixed constant.
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
    // Width is applied inline (see JSX) since it's computed per-tab now.
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
