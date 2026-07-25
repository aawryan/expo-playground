import { useEffect, useState } from "react";
import { Dimensions, type ScaledSize } from "react-native";

import { getDeviceClass, type DeviceClass } from "./breakpoints";
import { moderateScale, normalizeFont, scale, verticalScale } from "./scale";

export interface ResponsiveInfo {
  width: number;
  height: number;
  deviceClass: DeviceClass;
  isTablet: boolean;
  isLandscape: boolean;
  /** Number of grid columns a section should use at this width. */
  gridColumns: number;
  scale: typeof scale;
  verticalScale: typeof verticalScale;
  moderateScale: typeof moderateScale;
  font: typeof normalizeFont;
}

function buildInfo(window: ScaledSize): ResponsiveInfo {
  const deviceClass = getDeviceClass(window.width);
  const gridColumns = deviceClass === "expanded" ? 4 : deviceClass === "medium" ? 3 : 2;

  return {
    width: window.width,
    height: window.height,
    deviceClass,
    isTablet: deviceClass !== "compact",
    isLandscape: window.width > window.height,
    gridColumns,
    scale,
    verticalScale,
    moderateScale,
    font: normalizeFont,
  };
}

/**
 * Use inside components that need to *react* to size changes (rotation,
 * foldables, split-screen) — e.g. switching column count on a grid.
 * For one-off style values that don't need to re-render on rotation,
 * call `scale()`/`moderateScale()` directly instead (cheaper).
 */
export function useResponsive(): ResponsiveInfo {
  const [info, setInfo] = useState(() => buildInfo(Dimensions.get("window")));

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setInfo(buildInfo(window));
    });
    return () => subscription.remove();
  }, []);

  return info;
}
