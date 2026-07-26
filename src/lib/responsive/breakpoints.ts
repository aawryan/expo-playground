import { Dimensions } from "react-native";

/**
 * Width thresholds (dp) used to classify the current device. `compact`
 * covers virtually every phone in portrait; `medium` catches large
 * phones/foldables and small tablets in portrait; `expanded` covers
 * tablets and any landscape layout wide enough for a multi-column grid.
 */
export const BREAKPOINTS = {
  compact: 0,
  medium: 600,
  expanded: 900,
} as const;

export type DeviceClass = keyof typeof BREAKPOINTS;

export function getDeviceClass(
  width: number = Dimensions.get("window").width,
): DeviceClass {
  if (width >= BREAKPOINTS.expanded) return "expanded";
  if (width >= BREAKPOINTS.medium) return "medium";
  return "compact";
}

export function isTabletWidth(
  width: number = Dimensions.get("window").width,
): boolean {
  return width >= BREAKPOINTS.medium;
}

/** Sub-360dp covers older/budget Android phones and a foldable's cover screen. */
const SMALL_DEVICE_WIDTH = 360;

export function isSmallDeviceWidth(
  width: number = Dimensions.get("window").width,
): boolean {
  return width < SMALL_DEVICE_WIDTH;
}
