import LottieView, { type AnimationObject } from "lottie-react-native";
import { memo, useEffect, useMemo, useRef } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useReduceMotionEnabled } from "@/lib/accessibility/use-reduce-motion";
import { colors } from "@/lib/theme/colors";
import {
  ICON_FORWARD_DURATION,
  ICON_REVERSE_DURATION,
  ICON_SIZE,
  SPRING_CONFIG,
} from "./tab-bar.constants";

// Back to the imperative play() API — it's the library's primary,
// best-supported path (both progress-prop approaches we tried, via
// Reanimated and via classic Animated.Value, turned out unreliable for
// this particular set of Lottie sources: one icon wouldn't animate at
// all, others updated inconsistently). `duration` lets the imperative
// API itself run forward and reverse at different speeds, so there's no
// need to fight the progress prop for timing control.
interface TabBarIconProps {
  source: AnimationObject;
  colorKeypaths: string[];
  focused: boolean;
  forwardDuration?: number;
  reverseDuration?: number;
}

function TabBarIconBase({
  source,
  colorKeypaths,
  focused,
  forwardDuration = ICON_FORWARD_DURATION,
  reverseDuration = ICON_REVERSE_DURATION,
}: TabBarIconProps) {
  const lottieRef = useRef<LottieView>(null);
  const scale = useSharedValue(1);
  // Tracks whether this icon has ever been focused, so we don't fire a
  // reverse play() on mount for tabs that start out inactive.
  const wasFocused = useRef(false);
  const tint = focused ? colors.iconActive : colors.iconInactive;
  const reduceMotion = useReduceMotionEnabled();

  useEffect(() => {
    const endFrame = source.op;

    if (focused) {
      lottieRef.current?.play(0, endFrame);
      wasFocused.current = true;
    } else if (wasFocused.current) {
      lottieRef.current?.play(endFrame, 0);
      wasFocused.current = false;
    }

    scale.value = reduceMotion
      ? focused
        ? 1.12
        : 1
      : withSpring(focused ? 1.12 : 1, SPRING_CONFIG);
  }, [focused, scale, source, reduceMotion]);

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
        // already on the next tab. A near-zero duration when Reduce
        // Motion is on makes it snap instead of animate.
        duration={
          reduceMotion ? 1 : focused ? forwardDuration : reverseDuration
        }
        style={{ width: ICON_SIZE, height: ICON_SIZE }}
        colorFilters={colorFilters}
      />
    </Animated.View>
  );
}

export const TabBarIcon = memo(TabBarIconBase);
