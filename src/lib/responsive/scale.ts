import { Dimensions, PixelRatio } from "react-native";

/**
 * Every screen in the app is designed against this reference canvas
 * (iPhone 13 mini / a common small-Android baseline). `scale()` and
 * friends then stretch or shrink those authored numbers to whatever
 * device is actually running — so one set of design values reads
 * correctly on a small phone, a big phone, and a tablet alike, instead
 * of every screen re-deriving its own device-size math.
 */
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Horizontal scale — use for widths, horizontal padding/margin, and
 * anything that should track the screen getting wider (card widths,
 * icon sizes, horizontal gaps).
 */
export function scale(size: number): number {
  const { width } = Dimensions.get("window");
  return (width / BASE_WIDTH) * size;
}

/**
 * Vertical scale — use for heights and vertical spacing where the
 * device's *height* (not width) is the more relevant axis, e.g. a
 * fixed-height header or bottom bar.
 */
export function verticalScale(size: number): number {
  const { height } = Dimensions.get("window");
  return (height / BASE_HEIGHT) * size;
}

/**
 * Blends the linear `scale()` result back toward the original size by
 * `factor`. A pure linear scale looks great on phones but makes UI
 * chrome (padding, radii, icon sizes) look oversized on a tablet — this
 * dampens that growth while still responding to screen size.
 */
export function moderateScale(size: number, factor = 0.5): number {
  return size + (scale(size) - size) * factor;
}

export function moderateVerticalScale(size: number, factor = 0.5): number {
  return size + (verticalScale(size) - size) * factor;
}

/**
 * Font sizing gets its own (gentler) factor than general UI chrome —
 * text needs to stay readable rather than scaling as aggressively as
 * spacing/radii do, and the result is snapped to the nearest device
 * pixel so it renders crisply.
 */
export function normalizeFont(size: number): number {
  const scaled = moderateScale(size, 0.3);
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
}
