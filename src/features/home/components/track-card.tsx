import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { usePlayerStore } from "@/lib/audio/player-store";
import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import type { HomeTrack } from "../types/home-content";

export type TrackCardVariant = "trending" | "new";

// Damped rather than linear so artwork stays a sensible, tappable size
// on a tablet instead of ballooning with screen width.
const TRENDING_WIDTH = moderateScale(168, 0.3);
const NEW_WIDTH = moderateScale(136, 0.3);

interface TrackCardProps {
  track: HomeTrack;
  onPress?: (track: HomeTrack) => void;
  variant?: TrackCardVariant;
}

export function TrackCard({
  track,
  onPress,
  variant = "trending",
}: TrackCardProps) {
  const artworkUri =
    track.artwork.medium ?? track.artwork.large ?? track.artwork.small;
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isActive = currentIndex >= 0 && queue[currentIndex]?.id === track.id;

  const isTrending = variant === "trending";
  const width = isTrending ? TRENDING_WIDTH : NEW_WIDTH;

  return (
    <Pressable
      onPress={() => onPress?.(track)}
      style={({ pressed }) => [
        styles.container,
        { width },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${track.title} by ${track.artists}`}
    >
      <View
        style={[
          styles.artworkWrapper,
          { aspectRatio: isTrending ? 0.82 : 1 },
          isActive && styles.artworkWrapperActive,
        ]}
      >
        {artworkUri ? (
          <Image
            source={{ uri: artworkUri }}
            style={styles.artwork}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View style={[styles.artwork, styles.artworkFallback]} />
        )}

        <LinearGradient
          colors={["transparent", colors.scrimSoft, colors.scrimStrong]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />

        {!isTrending ? (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        ) : null}

        <View style={styles.overlayText}>
          <Text
            style={[
              isTrending ? typography.title : typography.label,
              styles.title,
            ]}
            numberOfLines={isTrending ? 2 : 1}
          >
            {track.title}
          </Text>
          <Text style={[typography.caption, styles.artists]} numberOfLines={1}>
            {track.artists}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {},
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  artworkWrapper: {
    width: "100%",
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  artworkWrapperActive: {
    borderWidth: 2,
    borderColor: colors.indicator,
  },
  artwork: {
    width: "100%",
    height: "100%",
  },
  artworkFallback: {
    backgroundColor: colors.surfaceElevated,
  },
  newBadge: {
    position: "absolute",
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: colors.accent,
    fontSize: moderateScale(9, 0.3),
    fontWeight: "800",
    letterSpacing: 0.6,
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
  artists: {
    color: "rgba(248,250,252,0.7)",
  },
});
