import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { usePlayerStore } from "@/lib/audio/player-store";
import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import type { HomeTrack } from "../types/home-content";

const SPOTLIGHT_HEIGHT = moderateScale(280, 0.3);

interface SpotlightCardProps {
  track: HomeTrack;
  onPress: (track: HomeTrack) => void;
}

/**
 * The one big "hero" moment at the top of the feed — full-bleed artwork,
 * a bottom scrim for legible type, and a glowing play button that reuses
 * the tab bar indicator's own glow (see tab-bar.tsx `indicator` style)
 * so the brightest thing on the whole screen still ties back to it.
 */
export function SpotlightCard({ track, onPress }: SpotlightCardProps) {
  const artworkUri =
    track.artwork.large ?? track.artwork.medium ?? track.artwork.small;
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isActive = currentIndex >= 0 && queue[currentIndex]?.id === track.id;

  return (
    <Pressable
      onPress={() => onPress(track)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Play ${track.title} by ${track.artists}`}
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

      <View style={styles.content}>
        <Text style={styles.eyebrow}>TODAY'S SPOTLIGHT</Text>
        <Text style={typography.h1} numberOfLines={2}>
          {track.title}
        </Text>
        <Text style={[typography.body, styles.artists]} numberOfLines={1}>
          {track.artists}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.playButton}>
            <Ionicons
              name={isActive && isPlaying ? "pause" : "play"}
              size={moderateScale(20)}
              color={colors.screenBackground}
              style={isActive && isPlaying ? undefined : styles.playIconOffset}
            />
          </View>
          {isActive ? (
            <Text style={[typography.caption, styles.nowPlayingLabel]}>
              {isPlaying ? "Now Playing" : "Paused"}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    height: SPOTLIGHT_HEIGHT,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.92,
  },
  artwork: {
    ...StyleSheet.absoluteFill,
  },
  artworkFallback: {
    backgroundColor: colors.surfaceElevated,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.lg,
    gap: 2,
  },
  eyebrow: {
    color: colors.indicator,
    fontSize: moderateScale(11, 0.3),
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: spacing.xs / 2,
  },
  artists: {
    color: colors.textOnImage,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  playButton: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: colors.indicator,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.indicator,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 8,
  },
  playIconOffset: {
    marginLeft: 2,
  },
  nowPlayingLabel: {
    color: colors.textPrimary,
  },
});
