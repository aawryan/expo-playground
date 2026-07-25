import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import type { PlaylistSong } from "@/features/home/types/home-content";

const ARTWORK_SIZE = moderateScale(48);

interface SongRowProps {
  song: PlaylistSong;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onPress: () => void;
}

function formatDuration(seconds?: number): string | null {
  if (!seconds || seconds <= 0) return null;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function SongRow({ song, index, isActive, isPlaying, onPress }: SongRowProps) {
  const artworkUri = song.artwork.small ?? song.artwork.medium ?? song.artwork.large;
  const duration = formatDuration(song.durationSeconds);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${song.title} by ${song.artists}`}
    >
      <View style={styles.leading}>
        {artworkUri ? (
          <Image source={{ uri: artworkUri }} style={styles.artwork} contentFit="cover" />
        ) : (
          <View style={[styles.artwork, styles.artworkFallback]} />
        )}
        {isActive ? (
          <View style={styles.activeBadge}>
            <Ionicons
              name={isPlaying ? "volume-high" : "pause"}
              size={moderateScale(12)}
              color={colors.accent}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.textColumn}>
        <Text
          style={[typography.label, styles.title, isActive && styles.titleActive]}
          numberOfLines={1}
        >
          {song.title}
        </Text>
        <Text style={[typography.caption, styles.artists]} numberOfLines={1}>
          {song.artists}
        </Text>
      </View>

      {duration ? <Text style={[typography.caption, styles.duration]}>{duration}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.6,
  },
  leading: {
    position: "relative",
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: radius.sm,
  },
  artworkFallback: {
    backgroundColor: colors.surface,
  },
  activeBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    backgroundColor: colors.screenBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  textColumn: {
    flex: 1,
    gap: 1,
  },
  title: {},
  titleActive: {
    color: colors.accent,
  },
  artists: {},
  duration: {},
});
