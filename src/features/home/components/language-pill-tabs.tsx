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
            style={[styles.pill, isActive && styles.pillActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[typography.label, styles.pillText, isActive && styles.pillTextActive]}>
              {option}
            </Text>
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
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  pillActive: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  pillText: {
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.accent,
  },
});
