import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * Tracks the OS-level "Reduce Motion" accessibility setting (iOS Settings
 * → Accessibility → Motion, Android Settings → Accessibility → Remove
 * animations). Components should use this to skip or shorten spring/
 * timing animations for people who've explicitly asked their device to
 * minimize motion — this is a standard accessibility expectation, not a
 * cosmetic preference.
 */
export function useReduceMotionEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setEnabled(value);
    });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setEnabled,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return enabled;
}
