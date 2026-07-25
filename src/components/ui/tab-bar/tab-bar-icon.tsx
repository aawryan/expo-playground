import LottieView, { type AnimationObject } from "lottie-react-native";
import { memo, useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/lib/theme/colors";
import {
  ICON_FORWARD_DURATION,
  ICON_REVERSE_DURATION,
  ICON_SIZE,
  SPRING_CONFIG,
} from "./tab-bar.constants";

// Wrapping LottieView lets us drive its `progress` prop straight off a
// Reanimated shared value instead of calling the imperative play(from, to)
// API. That imperative API sets the native animator's start frame and
// begins playing from there — if you reverse direction while a forward
// play is still mid-flight, it snaps to the requested start frame first
// and *then* plays, which reads as a jump/delay when switching tabs fast.
// A continuously-driven progress value has no such handoff: reversing
// just retargets the same timing animation from wherever it currently is.
const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

interface TabBarIconProps {
  source: AnimationObject;
  colorKeypaths: string[];
  focused: boolean;
}

function TabBarIconBase({ source, colorKeypaths, focused }: TabBarIconProps) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(0);
  const tint = focused ? colors.iconActive : colors.iconInactive;

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, {
      // Settling back to the resting frame is quicker than playing in,
      // so an icon that just lost focus doesn't lag behind the tab
      // switch that's already happened.
      duration: focused ? ICON_FORWARD_DURATION : ICON_REVERSE_DURATION,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withSpring(focused ? 1.12 : 1, SPRING_CONFIG);
  }, [focused, progress, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedProps = useAnimatedProps(() => ({
    progress: progress.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <AnimatedLottieView
        source={source}
        loop={false}
        autoPlay={false}
        animatedProps={animatedProps}
        style={{ width: ICON_SIZE, height: ICON_SIZE }}
        colorFilters={colorKeypaths.map((keypath) => ({
          keypath,
          color: tint,
        }))}
      />
    </Animated.View>
  );
}

export const TabBarIcon = memo(TabBarIconBase);
