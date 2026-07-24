import type { TabBarIconConfig } from "./tab-bar.types";

import calendarAnimation from "@/assets/lottie/calendar.json";
import exploreAnimation from "@/assets/lottie/explore.json";
import homeAnimation from "@/assets/lottie/home.json";
import libraryAnimation from "@/assets/lottie/library.json";

export const TAB_BAR_HEIGHT = 64;
export const TAB_BAR_HORIZONTAL_MARGIN = 20;
/** Extra gap kept above the device's safe-area bottom inset (nav bar / home indicator). */
export const TAB_BAR_BOTTOM_MARGIN = 16;
export const TAB_BAR_RADIUS = TAB_BAR_HEIGHT / 2;

export const ICON_SIZE = 28;

export const INDICATOR_WIDTH = 30;
export const INDICATOR_HEIGHT = 4;
/** Sits flush against the bar's own top border instead of inset below it. */
export const INDICATOR_TOP_INSET = 0;

/** How long the glow stays fully hidden ("absorbed") before it falls back in on the new tab. */
export const GLOW_ABSORB_DURATION = 130;
export const GLOW_TRAVEL_DELAY = 220;
/** How long the "pour" (top-to-bottom reveal) itself takes once it starts. */
export const GLOW_FALL_DURATION = 260;

/** Clipped inside the bar's own rounded shape, so height matches the bar exactly. Narrow — hugs the icon, not the whole tab segment. */
export const GLOW_WIDTH_TOP = 12;
export const GLOW_WIDTH_BOTTOM = 40;
export const GLOW_HEIGHT = TAB_BAR_HEIGHT;

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
