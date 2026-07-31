import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import type { StreakInfo } from "../lib/history-analytics";

interface StreakCardProps {
  streak: StreakInfo;
  weekendStreak: number;
}

export function StreakCard({ streak, weekendStreak }: StreakCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        <View style={styles.flameWrap}>
          <Ionicons
            name="flame"
            size={moderateScale(22)}
            color={streak.current > 0 ? colors.accent : colors.textTertiary}
          />
        </View>
        <View style={styles.mainText}>
          <Text style={typography.h1}>{streak.current}</Text>
          <Text style={[typography.caption, styles.label]}>
            {streak.current === 1 ? "din ka streak" : "din ka streak"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statBlock}>
          <Text style={typography.title}>{streak.longest}</Text>
          <Text style={[typography.caption, styles.label]}>best streak</Text>
        </View>

        <View style={styles.statBlock}>
          <Text style={typography.title}>{weekendStreak}</Text>
          <Text style={[typography.caption, styles.label]}>weekend run</Text>
        </View>
      </View>

      {!streak.activeToday && streak.current > 0 ? (
        <Text style={[typography.caption, styles.nudge]}>
          Aaj kuch suno — streak abhi zinda hai, lekin din khatam hone tak hi.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: spacing.sm,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  flameWrap: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  mainText: {
    gap: 2,
  },
  label: {
    marginTop: -2,
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: colors.surfaceBorder,
    marginHorizontal: spacing.xs,
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  nudge: {
    color: colors.textTertiary,
  },
});
