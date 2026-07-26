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
 * Bounds the width/height ratio used for scaling. Without this, a
 * foldable's cover screen (~280dp) or a small old Android (~320dp)
 * shrinks every dimension in the app below a usable/readable size, and
 * a large tablet or Expo-web window stretches them past what still
 * looks intentional. Clamping the *ratio* (not the output px) keeps
 * moderateScale's damping behavior identical for every existing caller.
 */
const MIN_SCALE_RATIO = 0.85;
const MAX_SCALE_RATIO = 1.35;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function widthRatio(): number {
  const { width } = Dimensions.get("window");
  return clamp(width / BASE_WIDTH, MIN_SCALE_RATIO, MAX_SCALE_RATIO);
}

function heightRatio(): number {
  const { height } = Dimensions.get("window");
  return clamp(height / BASE_HEIGHT, MIN_SCALE_RATIO, MAX_SCALE_RATIO);
}

/**
 * Horizontal scale — use for widths, horizontal padding/margin, and
 * anything that should track the screen getting wider (card widths,
 * icon sizes, horizontal gaps).
 */
export function scale(size: number): number {
  return widthRatio() * size;
}

/**
 * Vertical scale — use for heights and vertical spacing where the
 * device's *height* (not width) is the more relevant axis, e.g. a
 * fixed-height header or bottom bar.
 */
export function verticalScale(size: number): number {
  return heightRatio() * size;
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
 * Caps how far the OS-level "larger text" accessibility setting is
 * allowed to stretch our type scale. Ignoring it entirely fails those
 * users; applying it uncapped lets a 200% system setting break card
 * layouts that assume roughly-fixed text heights. 1.3x is generous
 * enough to genuinely help while staying inside what our layouts (2-line
 * clamps, fixed-height rows) can absorb without clipping.
 */
const MAX_FONT_SCALE = 1.3;

function boundedFontScale(): number {
  return clamp(PixelRatio.getFontScale(), 1, MAX_FONT_SCALE);
}

/**
 * Font sizing gets its own (gentler) factor than general UI chrome —
 * text needs to stay readable rather than scaling as aggressively as
 * spacing/radii do — and now also honors the device's own accessibility
 * text-size setting (capped, see boundedFontScale), snapped to the
 * nearest device pixel so it renders crisply either way.
 */
export function normalizeFont(size: number): number {
  const scaled = moderateScale(size, 0.3) * boundedFontScale();
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
}
