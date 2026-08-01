import { BlurView } from "expo-blur";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";

interface PillTabsProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

export function PillTabs<T extends string>({
  options,
  value,
  onChange,
}: PillTabsProps<T>) {
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
              <Text
                style={[
                  typography.label,
                  styles.pillText,
                  isActive && styles.pillTextActive,
                ]}
              >
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
