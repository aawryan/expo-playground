import { create } from "zustand";

interface TooltipInfo {
  label: string;
  /** Center x of the tab icon it points at, relative to the bar. */
  centerX: number;
}

interface TabBarTooltipState {
  tooltip: TooltipInfo | null;
  /** Shows (or re-targets) the tooltip and (re)starts its auto-dismiss
   * timer. Calling this again for a *different* tab while one is already
   * showing just updates `tooltip` in place — no unmount/remount, so
   * there's nothing for a second long-press to wait out. */
  show: (label: string, centerX: number) => void;
  hide: () => void;
}

let dismissTimeout: ReturnType<typeof setTimeout> | null = null;

/** How long a long-press tooltip stays up before auto-dismissing. This is
 * the single source of truth for that value — tab-bar.constants.ts
 * re-exports it rather than the other way around, since this store is
 * the lower-level piece (`lib/`) and the tab bar component (`components/
 * ui/`) is what depends on it, not vice versa. */
export const TOOLTIP_VISIBLE_DURATION = 1400;

export const useTabBarTooltipStore = create<TabBarTooltipState>((set) => ({
  tooltip: null,

  show: (label, centerX) => {
    if (dismissTimeout) clearTimeout(dismissTimeout);
    set({ tooltip: { label, centerX } });
    dismissTimeout = setTimeout(() => {
      set({ tooltip: null });
      dismissTimeout = null;
    }, TOOLTIP_VISIBLE_DURATION);
  },

  hide: () => {
    if (dismissTimeout) clearTimeout(dismissTimeout);
    dismissTimeout = null;
    set({ tooltip: null });
  },
}));
