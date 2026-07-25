import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import type { HomeChart } from "../types/home-content";

interface ChartCardProps {
  chart: HomeChart;
  onPress?: (chart: HomeChart) => void;
}

export function ChartCard({ chart, onPress }: ChartCardProps) {
  const artworkUri = chart.artwork.medium ?? chart.artwork.large ?? chart.artwork.small;

  return (
    <Pressable
      onPress={() => onPress?.(chart)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={chart.title}
    >
      <View style={styles.artworkWrapper}>
        {artworkUri ? (
          <Image source={{ uri: artworkUri }} style={styles.artwork} contentFit="cover" />
        ) : (
          <View style={[styles.artwork, styles.artworkFallback]} />
        )}
      </View>
      <Text style={[typography.label, styles.title]} numberOfLines={2}>
        {chart.title}
      </Text>
      {chart.subtitle ? (
        <Text style={[typography.caption]} numberOfLines={1}>
          {chart.subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  pressed: {
    opacity: 0.7,
  },
  artworkWrapper: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  artwork: {
    width: "100%",
    height: "100%",
  },
  artworkFallback: {
    backgroundColor: colors.surfaceElevated,
  },
  title: {
    marginTop: spacing.xs,
  },
});
