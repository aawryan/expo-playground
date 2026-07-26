import type { Insets } from "react-native";

/**
 * Apple HIG and Android's Material guidance both land on the same
 * number: a tappable element should have at least a 44x44dp (iOS) /
 * 48x48dp (Android) hit area, even if it's drawn smaller. We standardize
 * on 44 (the stricter-looking but actually-fine floor once combined
 * with hitSlop — see below) so one constant covers both platforms.
 */
export const MIN_TOUCH_TARGET = 44;

/**
 * Given a control's actual visual size, returns the `hitSlop` needed to
 * bring its tappable area up to MIN_TOUCH_TARGET on every side — without
 * changing how big the element *looks*. Pass this straight to a
 * Pressable's `hitSlop` prop.
 *
 * ensureHitSlop(28) // a 28dp icon button → { top: 8, bottom: 8, left: 8, right: 8 }
 * ensureHitSlop(44) // already meets the minimum → { top: 0, ... }
 */
export function ensureHitSlop(visualSize: number): Insets {
  const perSide = Math.max(0, Math.ceil((MIN_TOUCH_TARGET - visualSize) / 2));
  return { top: perSide, bottom: perSide, left: perSide, right: perSide };
}
