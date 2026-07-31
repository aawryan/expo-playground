import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import type { Milestone } from "../lib/history-analytics";

interface MilestoneTimelineProps {
  milestones: Milestone[];
}

export function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  return (
    <View style={styles.container}>
      <Text style={[typography.caption, styles.eyebrow]}>Milestones</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {milestones.map((milestone, index) => (
          <View key={milestone.id} style={styles.item}>
            <View
              style={[styles.badge, milestone.achieved && styles.badgeAchieved]}
            >
              {milestone.achieved ? (
                <Ionicons
                  name="checkmark"
                  size={moderateScale(16)}
                  color={colors.screenBackground}
                />
              ) : (
                <Text style={[typography.caption, styles.badgeThreshold]}>
                  {milestone.threshold}
                </Text>
              )}
            </View>
            <Text
              style={[
                typography.caption,
                styles.itemLabel,
                milestone.achieved && styles.itemLabelAchieved,
              ]}
            >
              {milestone.threshold}
            </Text>
            {index < milestones.length - 1 ? (
              <View
                style={[
                  styles.connector,
                  milestone.achieved && styles.connectorAchieved,
                ]}
              />
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const BADGE_SIZE = moderateScale(36);

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
    marginBottom: spacing.md,
  },
  row: {
    alignItems: "center",
    paddingRight: spacing.lg,
  },
  item: {
    alignItems: "center",
    width: BADGE_SIZE + moderateScale(28),
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeAchieved: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  badgeThreshold: {
    color: colors.textTertiary,
  },
  itemLabel: {
    marginTop: spacing.xs / 2,
    color: colors.textTertiary,
  },
  itemLabelAchieved: {
    color: colors.textSecondary,
  },
  connector: {
    position: "absolute",
    top: BADGE_SIZE / 2 - 1,
    left: "50%",
    width: BADGE_SIZE + moderateScale(28),
    height: 2,
    backgroundColor: colors.surfaceBorder,
    zIndex: -1,
  },
  connectorAchieved: {
    backgroundColor: colors.accent,
  },
});
