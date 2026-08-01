import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import type { MonthlyRecap, TopMood } from "../lib/history-analytics";
import { moodOptionFor } from "../types/mood";

interface MonthlyRecapCardProps {
  recap: MonthlyRecap;
  topMood: TopMood | null;
}

function buildShareText(recap: MonthlyRecap, topMood: TopMood | null): string {
  const lines = [
    `My ${recap.monthLabel} on Rewind`,
    `${recap.tracksPlayed} tracks across ${recap.distinctDays} active days`,
  ];
  if (recap.topArtist) lines.push(`Top artist: ${recap.topArtist.name}`);
  const mood = moodOptionFor(topMood?.mood);
  if (mood) lines.push(`Mostly feeling: ${mood.emoji} ${mood.label}`);
  return lines.join("\n");
}

export function MonthlyRecapCard({ recap, topMood }: MonthlyRecapCardProps) {
  const moodOption = moodOptionFor(topMood?.mood);

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
  if (moodOption) {
    stats.push({
      label: "top mood",
      value: `${moodOption.emoji} ${moodOption.label}`,
    });
  }

  function handleShare() {
    // Fire-and-forget — Share.share already surfaces its own native UI
    // for success/cancel, nothing useful to do with the resolved value.
    Share.share({ message: buildShareText(recap, topMood) }).catch(() => {
      // User cancelling the native share sheet also rejects on some
      // platforms — nothing to surface to them either way.
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.caption, styles.eyebrow]}>
          {recap.monthLabel}
        </Text>
        <Pressable
          onPress={handleShare}
          hitSlop={8}
          style={({ pressed }) => pressed && styles.sharePressed}
          accessibilityRole="button"
          accessibilityLabel="Share this month's recap"
        >
          <Ionicons
            name="share-outline"
            size={moderateScale(18)}
            color={colors.textSecondary}
          />
        </Pressable>
      </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  sharePressed: {
    opacity: 0.6,
  },
  eyebrow: {
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
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
