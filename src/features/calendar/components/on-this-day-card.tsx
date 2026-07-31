import { Image } from "expo-image";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import type { OnThisDayMemory } from "../lib/history-analytics";

interface OnThisDayCardProps {
  memory: OnThisDayMemory;
  onPress?: () => void;
}

function monthsAgoLabel(monthsAgo: number): string {
  if (monthsAgo < 1) return "Kal";
  if (monthsAgo === 1) return "1 mahine pehle";
  if (monthsAgo < 12) return `${monthsAgo} mahine pehle`;
  const years = Math.round(monthsAgo / 12);
  return years === 1 ? "1 saal pehle" : `${years} saal pehle`;
}

export function OnThisDayCard({ memory, onPress }: OnThisDayCardProps) {
  const preview = memory.entries.slice(0, 3);
  const extraCount = memory.entries.length - preview.length;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="On this day memory"
    >
      <View style={styles.header}>
        <Ionicons
          name="sparkles"
          size={moderateScale(16)}
          color={colors.accent}
        />
        <Text style={[typography.caption, styles.eyebrow]}>
          {monthsAgoLabel(memory.monthsAgo)} aaj — {format(memory.date, "d MMM")}
        </Text>
      </View>

      <View style={styles.artworkStack}>
        {preview.map((entry, index) => {
          const uri = entry.track.artworkUrl;
          return (
            <View
              key={`${entry.track.source}:${entry.track.id}`}
              style={[
                styles.artworkWrap,
                index > 0 && { marginLeft: -moderateScale(14) },
              ]}
            >
              {uri ? (
                <Image
                  source={{ uri }}
                  style={styles.artwork}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.artwork, styles.artworkFallback]} />
              )}
            </View>
          );
        })}
        {extraCount > 0 ? (
          <View style={[styles.artworkWrap, styles.moreBadge]}>
            <Text style={[typography.caption, styles.moreBadgeText]}>
              +{extraCount}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={[typography.subtitle, styles.title]} numberOfLines={1}>
        {preview[0]?.track.title}
      </Text>
      <Text style={[typography.body, styles.subtitle]} numberOfLines={1}>
        {preview[0]?.track.artists}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.9,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  eyebrow: {
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  artworkStack: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  artworkWrap: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: radius.sm,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.surfaceElevated,
    backgroundColor: colors.surface,
  },
  artwork: {
    width: "100%",
    height: "100%",
  },
  artworkFallback: {
    backgroundColor: colors.surface,
  },
  moreBadge: {
    marginLeft: -moderateScale(14),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceElevated,
  },
  moreBadgeText: {
    color: colors.textPrimary,
  },
  title: {},
  subtitle: {
    marginTop: -2,
  },
});
