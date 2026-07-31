import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import type { HeatmapDay } from "../lib/history-analytics";
import type { MoodId } from "../types/mood";
import { moodOptionFor } from "../types/mood";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const CELL_GAP = spacing.xs / 2;

/** Four visual tiers rather than a continuous scale — with history capped
 * at a handful of tracks/day in practice, a continuous gradient would be
 * indistinguishable at a glance. Tiers read clearly regardless of the
 * cell's actual rendered size. */
function intensityFor(count: number): 0 | 1 | 2 | 3 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  return 3;
}

const TIER_BACKGROUND: Record<0 | 1 | 2 | 3, string> = {
  0: "transparent",
  1: "rgba(255,255,255,0.16)",
  2: "rgba(255,255,255,0.36)",
  3: "rgba(255,255,255,0.62)",
};

interface ListeningHeatmapProps {
  monthAnchor: Date;
  days: HeatmapDay[];
  moodByDay: Record<string, MoodId>;
  onSelectDay: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  canGoNext: boolean;
}

export function ListeningHeatmap({
  monthAnchor,
  days,
  moodByDay,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  canGoNext,
}: ListeningHeatmapProps) {
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      <View style={styles.monthHeader}>
        <Pressable
          onPress={onPrevMonth}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
        >
          <Ionicons
            name="chevron-back"
            size={moderateScale(20)}
            color={colors.textPrimary}
          />
        </Pressable>
        <Text style={typography.title}>{format(monthAnchor, "MMMM yyyy")}</Text>
        <Pressable
          onPress={onNextMonth}
          hitSlop={8}
          disabled={!canGoNext}
          accessibilityRole="button"
          accessibilityLabel="Next month"
        >
          <Ionicons
            name="chevron-forward"
            size={moderateScale(20)}
            color={canGoNext ? colors.textPrimary : colors.textTertiary}
          />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label, index) => (
          <Text
            key={`${label}-${index}`}
            style={[typography.caption, styles.weekdayLabel]}
          >
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.weeksStack}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day) => {
              const tier = intensityFor(day.count);
              const mood = moodOptionFor(moodByDay[day.dateKey]);
              return (
                <Pressable
                  key={day.dateKey}
                  onPress={() => onSelectDay(day.dateKey)}
                  style={({ pressed }) => [
                    styles.cell,
                    { backgroundColor: TIER_BACKGROUND[tier] },
                    day.isToday && styles.cellToday,
                    pressed && styles.cellPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${format(day.date, "d MMMM")}, ${day.count} tracks`}
                >
                  <Text
                    style={[
                      typography.caption,
                      styles.cellLabel,
                      !day.inCurrentMonth && styles.cellLabelMuted,
                      tier >= 2 && styles.cellLabelOnFill,
                    ]}
                  >
                    {format(day.date, "d")}
                  </Text>
                  {mood ? (
                    <Text style={styles.cellMood}>{mood.emoji}</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={[typography.caption, styles.legendLabel]}>Less</Text>
        {([0, 1, 2, 3] as const).map((tier) => (
          <View
            key={tier}
            style={[
              styles.legendSwatch,
              { backgroundColor: TIER_BACKGROUND[tier] },
            ]}
          />
        ))}
        <Text style={[typography.caption, styles.legendLabel]}>More</Text>
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
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  weekdayRow: {
    flexDirection: "row",
    gap: CELL_GAP,
    marginBottom: spacing.xs,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    color: colors.textTertiary,
  },
  weeksStack: {
    gap: CELL_GAP,
  },
  weekRow: {
    flexDirection: "row",
    gap: CELL_GAP,
  },
  // No fixed width/height: each cell is 1/7th of whatever width is
  // available (minus gaps), on any phone, tablet, or rotation — this is
  // what actually guarantees the grid never overflows its card, instead
  // of a moderateScale'd pixel value that could still overflow on an
  // extreme-narrow device (e.g. a ~280dp foldable cover screen).
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: colors.indicator,
  },
  cellPressed: {
    opacity: 0.6,
  },
  cellLabel: {
    color: colors.textSecondary,
  },
  cellLabelMuted: {
    color: colors.textTertiary,
    opacity: 0.5,
  },
  cellLabelOnFill: {
    color: colors.screenBackground,
    fontWeight: "700",
  },
  cellMood: {
    position: "absolute",
    bottom: -moderateScale(2),
    fontSize: moderateScale(9),
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.xs / 2,
    marginTop: spacing.sm,
  },
  legendLabel: {
    color: colors.textTertiary,
    marginHorizontal: spacing.xs / 2,
  },
  legendSwatch: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: radius.sm / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
});
