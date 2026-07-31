import { format } from "date-fns";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import type { MonthlyRecap } from "../lib/history-analytics";

interface MonthlyRecapCardProps {
  recap: MonthlyRecap;
}

export function MonthlyRecapCard({ recap }: MonthlyRecapCardProps) {
  const stats: { label: string; value: string }[] = [
    { label: "tracks played", value: String(recap.tracksPlayed) },
    { label: "active days", value: String(recap.distinctDays) },
    {
      label: "top artist",
      value: recap.topArtist ? recap.topArtist.name : "—",
    },
    {
      label: "busiest day",
      value: recap.busiestDay ? format(recap.busiestDay.date, "d MMM") : "—",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[typography.caption, styles.eyebrow]}>
        {recap.monthLabel}
      </Text>
      <View style={styles.grid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statTile}>
            <Text style={typography.title} numberOfLines={1}>
              {stat.value}
            </Text>
            <Text style={[typography.caption, styles.statLabel]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
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
  },
  eyebrow: {
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statTile: {
    flexBasis: "45%",
    flexGrow: 1,
    gap: 2,
  },
  statLabel: {
    marginTop: -2,
  },
});
