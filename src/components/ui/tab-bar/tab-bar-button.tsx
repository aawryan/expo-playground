import type { AnimationObject } from "lottie-react-native";
import { memo, useCallback } from "react";
import {
  Pressable,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { TabBarIcon } from "./tab-bar-icon";
import type { TabLayout } from "./tab-bar.types";

interface TabBarButtonProps {
  source: AnimationObject;
  colorKeypaths: string[];
  focused: boolean;
  accessibilityLabel: string;
  onPress: () => void;
  onLongPress: () => void;
  onLayout: (layout: TabLayout) => void;
  style?: StyleProp<ViewStyle>;
  forwardDuration?: number;
  reverseDuration?: number;
}

function TabBarButtonBase({
  source,
  colorKeypaths,
  focused,
  accessibilityLabel,
  onPress,
  onLongPress,
  onLayout,
  style,
  forwardDuration,
  reverseDuration,
}: TabBarButtonProps) {
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      onLayout({ x, width });
    },
    [onLayout],
  );

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onLongPress={onLongPress}
      onLayout={handleLayout}
      hitSlop={8}
      style={style}
    >
      <TabBarIcon
        source={source}
        colorKeypaths={colorKeypaths}
        focused={focused}
        forwardDuration={forwardDuration}
        reverseDuration={reverseDuration}
      />
    </Pressable>
  );
}

export const TabBarButton = memo(TabBarButtonBase);
