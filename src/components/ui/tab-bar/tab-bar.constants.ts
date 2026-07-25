import type { TabBarIconConfig } from "./tab-bar.types";

import calendarAnimation from "@/assets/lottie/calendar.json";
import exploreAnimation from "@/assets/lottie/explore.json";
import homeAnimation from "@/assets/lottie/home.json";
import libraryAnimation from "@/assets/lottie/library.json";
import { moderateScale } from "@/lib/responsive";

// Authored at a 375-wide reference and run through the shared responsive
// scale — so the bar reads the same proportional size on a small phone
// and a tablet instead of the fixed-px version being cramped on one and
// lost on the other. moderateScale (not the linear scale) is used so the
// bar doesn't balloon on wide screens.
export const TAB_BAR_HEIGHT = moderateScale(64);
export const TAB_BAR_HORIZONTAL_MARGIN = moderateScale(20);
/** Extra gap kept above the device's safe-area bottom inset (nav bar / home indicator). */
export const TAB_BAR_BOTTOM_MARGIN = moderateScale(16);
export const TAB_BAR_RADIUS = TAB_BAR_HEIGHT / 2;

export const ICON_SIZE = moderateScale(28);

/** Lottie progress is driven continuously (0→1 / 1→0) instead of via
 * imperative play() calls, so switching direction mid-animation always
 * reverses smoothly from wherever it currently is — no jump, no queueing. */
export const ICON_FORWARD_DURATION = 260;
/** Reverse is intentionally quicker than forward — an icon losing focus
 * should settle back down fast, even if you're already on the next tab. */
export const ICON_REVERSE_DURATION = 150;

/** Ratio of the tab's measured width — same reasoning as the glow: a
 * fixed 30px indicator looks right on a phone but gets visually lost
 * inside a much wider tab on a tablet, so it scales with the tab. */
export const INDICATOR_WIDTH_RATIO = 0.35;
export const INDICATOR_WIDTH_FALLBACK = moderateScale(30);
export const INDICATOR_HEIGHT = moderateScale(4);
/** Sits flush against the bar's own top border instead of inset below it. */
export const INDICATOR_TOP_INSET = 0;

/** How long the glow stays fully hidden ("absorbed") before it falls back in on the new tab. */
export const GLOW_ABSORB_DURATION = 130;
export const GLOW_TRAVEL_DELAY = 220;
/** How long the "pour" (top-to-bottom reveal) itself takes once it starts. */
export const GLOW_FALL_DURATION = 260;

/**
 * The glow is sized as a ratio of each tab's own measured width rather
 * than a fixed pixel value, so the "halo" hugs every icon with the same
 * proportional space around it — a 4-tab bar on a small phone and a wide
 * tablet both end up looking identical instead of the fixed-px version
 * being cramped on one and lost on the other.
 */
export const GLOW_WIDTH_TOP_RATIO = 0.14;
export const GLOW_WIDTH_BOTTOM_RATIO = 0.46;
/** Used only for the very first frame, before any tab has been measured. */
export const GLOW_WIDTH_TOP_FALLBACK = moderateScale(12);
export const GLOW_WIDTH_BOTTOM_FALLBACK = moderateScale(40);

/**
 * The icon sits vertically centered in the TAB_BAR_HEIGHT-tall button
 * (ICON_SIZE centered → spans y=18 to y=46 of the 64px bar), so this is
 * calibrated directly off that: icon's bottom edge (46) plus a small
 * margin so the light visibly extends a little past the icon, then
 * stops well short of the bar's own bottom edge (64) instead of either
 * cutting off right at the icon or pouring all the way down.
 */
export const GLOW_HEIGHT =
  (TAB_BAR_HEIGHT - ICON_SIZE) / 2 + ICON_SIZE + moderateScale(8);

export const SPRING_CONFIG = {
  damping: 16,
  stiffness: 180,
  mass: 0.5,
} as const;

/**
 * colorKeypaths target the Lottie's TOP-LEVEL LAYER name (its "nm"), not
 * nested shape-group names — lottie-react-native's colorFilters resolves a
 * keypath against a layer and then cascades to everything beneath it, so
 * one correct layer-name keypath recolors the whole icon. A nested group
 * name that never matches any layer silently recolors nothing (this is
 * why "library" was staying black before).
 */
export const TAB_ICON_CONFIG: TabBarIconConfig[] = [
  {
    routeName: "index",
    source: homeAnimation,
    // home.json top-level layer name: "home"
    colorKeypaths: ["home"],
    accessibilityLabel: "Home",
  },
  {
    routeName: "explore",
    source: exploreAnimation,
    // explore.json top-level layer name: "compass"
    colorKeypaths: ["compass"],
    accessibilityLabel: "Explore",
  },
  {
    routeName: "library",
    source: libraryAnimation,
    // library.json (folder.json) top-level layer name: "Folder" (capital F)
    colorKeypaths: ["Folder"],
    accessibilityLabel: "Library",
  },
  {
    routeName: "calendar",
    source: calendarAnimation,
    // calendar.json top-level layer name: "calendar"
    colorKeypaths: ["calendar"],
    accessibilityLabel: "Calendar",
  },
];
