import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import type { HomeChart } from "../types/home-content";

interface ChartCardProps {
  chart: HomeChart;
  rank: number;
  onPress?: (chart: HomeChart) => void;
}

export function ChartCard({ chart, rank, onPress }: ChartCardProps) {
  const artworkUri =
    chart.artwork.medium ?? chart.artwork.large ?? chart.artwork.small;
  const isTopThree = rank <= 3;

  return (
    <Pressable
      onPress={() => onPress?.(chart)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${chart.title}, rank ${rank}`}
    >
      <View
        style={[styles.artworkWrapper, isTopThree && styles.artworkWrapperTop]}
      >
        {artworkUri ? (
          <Image
            source={{ uri: artworkUri }}
            style={styles.artwork}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.artwork, styles.artworkFallback]} />
        )}

        <LinearGradient
          colors={["transparent", colors.scrimSoft, colors.scrimStrong]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />

        <Text style={[styles.rank, isTopThree && styles.rankTop]}>{rank}</Text>

        <View style={styles.overlayText}>
          <Text style={[typography.label, styles.title]} numberOfLines={2}>
            {chart.title}
          </Text>
          {chart.subtitle ? (
            <Text
              style={[typography.caption, styles.subtitle]}
              numberOfLines={1}
            >
              {chart.subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  artworkWrapper: {
    width: "100%",
    aspectRatio: 0.88,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  artworkWrapperTop: {
    borderWidth: 1.5,
    borderColor: colors.indicator,
  },
  artwork: {
    width: "100%",
    height: "100%",
  },
  artworkFallback: {
    backgroundColor: colors.surfaceElevated,
  },
  rank: {
    position: "absolute",
    top: -moderateScale(6, 0.3),
    left: spacing.sm,
    fontSize: moderateScale(46, 0.3),
    fontWeight: "800",
    color: colors.textOnImageFaint,
    letterSpacing: -1,
  },
  rankTop: {
    color: colors.textOnImageMuted,
  },
  overlayText: {
    position: "absolute",
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    gap: 1,
  },
  title: {
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textOnImage,
  },
});
