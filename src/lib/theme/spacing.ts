import { moderateScale } from "@/lib/responsive";

/**
 * Every screen should pull gaps/padding from here instead of writing
 * raw numbers — keeps spacing consistent across features and means the
 * whole app re-tunes itself together if the base scale ever changes.
 */
export const spacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(24),
  xxl: moderateScale(32),
} as const;

export const radius = {
  sm: moderateScale(8),
  md: moderateScale(14),
  lg: moderateScale(20),
  pill: 999,
} as const;
