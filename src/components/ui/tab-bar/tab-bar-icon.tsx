import LottieView, { type AnimationObject } from "lottie-react-native";
import { memo, useEffect, useMemo, useRef } from "react";
import { Animated as RNAnimated, Easing as RNEasing } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { colors } from "@/lib/theme/colors";
import {
  ICON_FORWARD_DURATION,
  ICON_REVERSE_DURATION,
  ICON_SIZE,
  SPRING_CONFIG,
} from "./tab-bar.constants";

// lottie-react-native's own documented, tested way to control animation
// position is a classic React Native `Animated.Value` wired straight to
// the `progress` prop (see their README). Driving it instead through
// Reanimated's `useAnimatedProps` looked smoother on paper but turned
// out unreliable in practice — some sources didn't animate at all
// (explore's compass), others updated inconsistently frame-to-frame
// (read as "flashy" instead of smooth). This is the supported path.
const AnimatedLottieView = RNAnimated.createAnimatedComponent(LottieView);

interface TabBarIconProps {
  source: AnimationObject;
  colorKeypaths: string[];
  focused: boolean;
}

function TabBarIconBase({ source, colorKeypaths, focused }: TabBarIconProps) {
  const scale = useSharedValue(1);
  const progress = useRef(new RNAnimated.Value(0)).current;
  const tint = focused ? colors.iconActive : colors.iconInactive;

  useEffect(() => {
    // Animated.timing retargets smoothly from wherever the value
    // currently sits, so switching tabs mid-animation reverses cleanly
    // instead of jumping — no imperative play(from, to) queueing.
    RNAnimated.timing(progress, {
      toValue: focused ? 1 : 0,
      // Settling back to rest is quicker than playing in, so an icon
      // that just lost focus doesn't lag behind the tab switch that's
      // already happened.
      duration: focused ? ICON_FORWARD_DURATION : ICON_REVERSE_DURATION,
      easing: RNEasing.out(RNEasing.cubic),
      // `progress` isn't a transform/opacity style prop, so it can't
      // run on the native driver — this animation stays on the JS
      // thread, which is what the library itself expects here.
      useNativeDriver: false,
    }).start();

    scale.value = withSpring(focused ? 1.12 : 1, SPRING_CONFIG);
  }, [focused, progress, scale]);

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
      <AnimatedLottieView
        source={source}
        loop={false}
        autoPlay={false}
        progress={progress}
        style={{ width: ICON_SIZE, height: ICON_SIZE }}
        colorFilters={colorFilters}
      />
    </Animated.View>
  );
}

export const TabBarIcon = memo(TabBarIconBase);
