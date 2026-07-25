import LottieView, { type AnimationObject } from "lottie-react-native";
import { memo, useEffect, useMemo, useRef } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { colors } from "@/lib/theme/colors";
import {
  ICON_FORWARD_DURATION,
  ICON_MAX_SPEED_MULTIPLIER,
  ICON_REVERSE_DURATION,
  ICON_SIZE,
  SPRING_CONFIG,
} from "./tab-bar.constants";

// Back to the imperative play() API — it's the library's primary,
// best-supported path (both progress-prop approaches we tried, via
// Reanimated and via classic Animated.Value, turned out unreliable for
// this particular set of Lottie sources: one icon wouldn't animate at
// all, others updated inconsistently).
//
// We compute `speed` ourselves rather than passing `duration` straight
// through: the library's own internal conversion
// (Math.round(source.op / source.fr * 1000 / duration)) rounds to the
// nearest *integer* speed multiplier. That's a small, unnoticeable
// error for a short animation (e.g. 8 frames @ 30fps = ~267ms natural),
// but for a longer one (explore's compass: 25 frames @ 30fps = ~833ms
// natural) our target duration only lands on coarse steps like 3x or
// 6x — which plays as an abrupt flick instead of a smooth motion. A
// precise, unrounded speed avoids that entirely.
interface TabBarIconProps {
  source: AnimationObject;
  colorKeypaths: string[];
  focused: boolean;
}

function TabBarIconBase({ source, colorKeypaths, focused }: TabBarIconProps) {
  const lottieRef = useRef<LottieView>(null);
  const scale = useSharedValue(1);
  // Tracks whether this icon has ever been focused, so we don't fire a
  // reverse play() on mount for tabs that start out inactive.
  const wasFocused = useRef(false);
  const tint = focused ? colors.iconActive : colors.iconInactive;

  const naturalDurationMs = (source.op / source.fr) * 1000;
  const targetDurationMs = focused
    ? ICON_FORWARD_DURATION
    : ICON_REVERSE_DURATION;
  const speed = Math.min(
    naturalDurationMs / targetDurationMs,
    ICON_MAX_SPEED_MULTIPLIER,
  );

  useEffect(() => {
    const endFrame = source.op;

    if (focused) {
      lottieRef.current?.play(0, endFrame);
      wasFocused.current = true;
    } else if (wasFocused.current) {
      lottieRef.current?.play(endFrame, 0);
      wasFocused.current = false;
    }

    scale.value = withSpring(focused ? 1.12 : 1, SPRING_CONFIG);
  }, [focused, scale, source]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Stable identity unless the tint itself actually changes, so we're
  // not handing the native view a new colorFilters array (and risking
  // an internal re-init) on every unrelated re-render.
  const colorFilters = useMemo(
    () => colorKeypaths.map((keypath) => ({ keypath, color: tint })),
    [colorKeypaths, tint],
  );

  return (
    <Animated.View style={animatedStyle}>
      <LottieView
        ref={lottieRef}
        source={source}
        loop={false}
        autoPlay={false}
        // Reverse is intentionally quicker than forward — an icon that
        // just lost focus should settle back down fast, even if you're
        // already on the next tab. Passing `speed` (not `duration`)
        // keeps this exact, avoiding the library's internal rounding.
        speed={speed}
        style={{ width: ICON_SIZE, height: ICON_SIZE }}
        colorFilters={colorFilters}
      />
    </Animated.View>
  );
}

export const TabBarIcon = memo(TabBarIconBase);
