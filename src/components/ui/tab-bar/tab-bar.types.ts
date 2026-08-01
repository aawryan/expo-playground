import type { Tabs } from "expo-router";
import type { AnimationObject } from "lottie-react-native";
import type { ComponentProps } from "react";

export type TabBarProps =
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]> extends (
    props: infer P,
  ) => unknown
    ? P
    : never;

export type TabBarRouteName =
  | "index"
  | "explore"
  | "globe"
  | "rewind"
  | "library";

export interface TabBarIconConfig {
  routeName: TabBarRouteName;
  source: AnimationObject;
  /** Exact top-level layer names ("nm") from the Lottie JSON — '**' does not match anything here. */
  colorKeypaths: string[];
  accessibilityLabel: string;
  /**
   * Per-icon overrides for ICON_FORWARD_DURATION / ICON_REVERSE_DURATION.
   * Most icons' actual motion only spans a short lead-in of their frame
   * range (door swinging open, then holding), so the default durations
   * read as a quick, snappy motion regardless. An icon whose motion runs
   * continuously across its *entire* frame range (e.g. a full rotation)
   * needs a longer duration for that same motion to still read as smooth
   * rather than rushed — falls back to the global defaults if omitted.
   */
  forwardDuration?: number;
  reverseDuration?: number;
}

export interface TabLayout {
  x: number;
  width: number;
}
