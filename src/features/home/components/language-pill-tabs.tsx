import { BlurView } from "expo-blur";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import type { HomeLanguage } from "../types/home-content";

interface LanguagePillTabsProps {
  options: readonly HomeLanguage[];
  value: HomeLanguage;
  onChange: (value: HomeLanguage) => void;
}

export function LanguagePillTabs({ options, value, onChange }: LanguagePillTabsProps) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const isActive = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            hitSlop={8}
            style={styles.pillTouchArea}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <BlurView
              intensity={isActive ? 40 : 20}
              tint="dark"
              style={[styles.pill, isActive && styles.pillActive]}
            >
              <Text style={[typography.label, styles.pillText, isActive && styles.pillTextActive]}>
                {option}
              </Text>
            </BlurView>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  pillTouchArea: {
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    overflow: "hidden",
  },
  pillActive: {
    borderColor: colors.accent,
  },
  pillText: {
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.accent,
  },
});
