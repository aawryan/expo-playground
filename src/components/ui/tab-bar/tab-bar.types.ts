import type { Tabs } from "expo-router";
import type { AnimationObject } from "lottie-react-native";
import type { ComponentProps } from "react";

export type TabBarProps =
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]> extends (
    props: infer P,
  ) => unknown
    ? P
    : never;

export type TabBarRouteName = "index" | "explore" | "library" | "calendar";

export interface TabBarIconConfig {
  routeName: TabBarRouteName;
  source: AnimationObject;
  /** Exact top-level layer names ("nm") from the Lottie JSON — '**' does not match anything here. */
  colorKeypaths: string[];
  accessibilityLabel: string;
}

export interface TabLayout {
  x: number;
  width: number;
}
