import type { AnimationObject } from "lottie-react-native";
import { memo, useCallback } from "react";
import {
  Pressable,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ensureHitSlop } from "@/lib/responsive";
import { TabBarIcon } from "./tab-bar-icon";
import { ICON_SIZE } from "./tab-bar.constants";
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
      hitSlop={ensureHitSlop(ICON_SIZE)}
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
