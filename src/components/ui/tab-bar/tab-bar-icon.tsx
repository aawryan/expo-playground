import LottieView, { type AnimationObject } from "lottie-react-native";
import { memo, useEffect, useRef } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { colors } from "@/lib/theme/colors";
import { ICON_SIZE, SPRING_CONFIG } from "./tab-bar.constants";

interface TabBarIconProps {
  source: AnimationObject;
  colorKeypaths: string[];
  focused: boolean;
}

function TabBarIconBase({ source, colorKeypaths, focused }: TabBarIconProps) {
  const lottieRef = useRef<LottieView>(null);
  const wasFocused = useRef(false);
  const scale = useSharedValue(1);
  const tint = focused ? colors.iconActive : colors.iconInactive;

  useEffect(() => {
    const endFrame = source.op ?? 0;

    if (focused) {
      lottieRef.current?.play(0, endFrame);
      scale.value = withSpring(1.12, SPRING_CONFIG);
      wasFocused.current = true;
    } else {
      if (wasFocused.current) {
        // Play the closing/reverse half of the animation instead of
        // snapping straight back to frame 0.
        lottieRef.current?.play(endFrame, 0);
      }
      scale.value = withSpring(1, SPRING_CONFIG);
      wasFocused.current = false;
    }
  }, [focused, scale, source]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <LottieView
        ref={lottieRef}
        source={source}
        loop={false}
        autoPlay={false}
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
