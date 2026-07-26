import { PixelRatio, useWindowDimensions } from "react-native";

import {
  getDeviceClass,
  isSmallDeviceWidth,
  type DeviceClass,
} from "./breakpoints";
import { moderateScale, normalizeFont, scale, verticalScale } from "./scale";

export interface ResponsiveInfo {
  width: number;
  height: number;
  deviceClass: DeviceClass;
  isTablet: boolean;
  isLandscape: boolean;
  /** Sub-360dp: older/budget Android phones, a foldable's cover screen. */
  isSmallDevice: boolean;
  /** The OS-level "larger text" accessibility multiplier, uncapped — see normalizeFont for the capped version already baked into font sizing. */
  fontScale: number;
  /** Number of grid columns a section should use at this width. */
  gridColumns: number;
  scale: typeof scale;
  verticalScale: typeof verticalScale;
  moderateScale: typeof moderateScale;
  font: typeof normalizeFont;
}

function gridColumnsFor(deviceClass: DeviceClass): number {
  return deviceClass === "expanded" ? 4 : deviceClass === "medium" ? 3 : 2;
}

/**
 * Use inside components that need to *react* to size changes (rotation,
 * foldables, split-screen, an Expo-web browser resize) — e.g. switching
 * column count on a grid. For one-off style values that don't need to
 * re-render on rotation, call `scale()`/`moderateScale()` directly
 * instead (cheaper).
 *
 * Built on RN's own `useWindowDimensions`, rather than a manual
 * `Dimensions.addEventListener` subscription — it's the platform's own
 * reactive primitive, so rotation/fold/split-screen/web-resize all stay
 * correct without us re-solving edge cases RN already handles.
 */
export function useResponsive(): ResponsiveInfo {
  const window = useWindowDimensions();
  const deviceClass = getDeviceClass(window.width);

  return {
    width: window.width,
    height: window.height,
    deviceClass,
    isTablet: deviceClass !== "compact",
    isLandscape: window.width > window.height,
    isSmallDevice: isSmallDeviceWidth(window.width),
    fontScale: PixelRatio.getFontScale(),
    gridColumns: gridColumnsFor(deviceClass),
    scale,
    verticalScale,
    moderateScale,
    font: normalizeFont,
  };
}
