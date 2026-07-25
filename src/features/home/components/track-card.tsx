import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import type { HomeTrack } from "../types/home-content";

// Damped rather than linear so artwork stays a sensible, tappable size
// on a tablet instead of ballooning with screen width.
const CARD_WIDTH = moderateScale(140, 0.3);
const ARTWORK_SIZE = CARD_WIDTH;

interface TrackCardProps {
  track: HomeTrack;
  onPress?: (track: HomeTrack) => void;
}

export function TrackCard({ track, onPress }: TrackCardProps) {
  const artworkUri = track.artwork.medium ?? track.artwork.large ?? track.artwork.small;

  return (
    <Pressable
      onPress={() => onPress?.(track)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${track.title} by ${track.artists}`}
    >
      <View style={styles.artworkWrapper}>
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
      </View>
      <Text style={[typography.label, styles.title]} numberOfLines={1}>
        {track.title}
      </Text>
      <Text style={[typography.caption, styles.artists]} numberOfLines={1}>
        {track.artists}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    gap: spacing.xs / 2,
  },
  pressed: {
    opacity: 0.7,
  },
  artworkWrapper: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
  },
  artworkFallback: {
    backgroundColor: colors.surfaceElevated,
  },
  title: {
    marginTop: spacing.xs,
  },
  artists: {},
});
