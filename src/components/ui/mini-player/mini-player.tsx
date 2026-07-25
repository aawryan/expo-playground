import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayerStatus } from "expo-audio";
import { Image } from "expo-image";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  TAB_BAR_BOTTOM_MARGIN,
  TAB_BAR_HEIGHT,
  TAB_BAR_HORIZONTAL_MARGIN,
} from "@/components/ui/tab-bar/tab-bar.constants";
import { audioPlayer } from "@/lib/audio/player";
import { usePlayerStore } from "@/lib/audio/player-store";
import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";

const MINI_PLAYER_HEIGHT = moderateScale(56);
const GAP_ABOVE_TAB_BAR = moderateScale(10);

/**
 * Floats directly above the custom tab bar (same horizontal rhythm and
 * bottom-safe-area handling) so playback stays visible and reachable
 * from every tab, without covering the bar itself.
 */
export function MiniPlayer() {
  const insets = useSafeAreaInsets();
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const playNext = usePlayerStore((state) => state.playNext);

  const status = useAudioPlayerStatus(audioPlayer);
  const currentTrack = currentIndex >= 0 ? queue[currentIndex] : undefined;

  // Auto-advance the queue when a track finishes.
  useEffect(() => {
    if (status?.didJustFinish) {
      playNext();
    }
  }, [status?.didJustFinish, playNext]);

  if (!currentTrack) return null;

  const progress =
    status?.duration && status.duration > 0
      ? (status.currentTime ?? 0) / status.duration
      : 0;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          left: TAB_BAR_HORIZONTAL_MARGIN + insets.left,
          right: TAB_BAR_HORIZONTAL_MARGIN + insets.right,
          bottom:
            insets.bottom +
            TAB_BAR_BOTTOM_MARGIN +
            TAB_BAR_HEIGHT +
            GAP_ABOVE_TAB_BAR,
        },
      ]}
    >
      <View style={styles.bar}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(progress, 1) * 100}%` },
            ]}
          />
        </View>

        <View style={styles.row}>
          {currentTrack.artworkUrl ? (
            <Image
              source={{ uri: currentTrack.artworkUrl }}
              style={styles.artwork}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.artwork, styles.artworkFallback]} />
          )}

          <View style={styles.textColumn}>
            <Text style={[typography.label, styles.title]} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text
              style={[typography.caption, styles.artists]}
              numberOfLines={1}
            >
              {currentTrack.artists}
            </Text>
          </View>

          <Pressable
            onPress={togglePlayPause}
            hitSlop={12}
            style={styles.playButton}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? "Pause" : "Play"}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={moderateScale(18)}
              color={colors.screenBackground}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
  },
  bar: {
    height: MINI_PLAYER_HEIGHT,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  progressTrack: {
    height: 2,
    backgroundColor: colors.surfaceBorder,
  },
  progressFill: {
    height: 2,
    backgroundColor: colors.accent,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  artwork: {
    width: MINI_PLAYER_HEIGHT - spacing.sm * 2,
    height: MINI_PLAYER_HEIGHT - spacing.sm * 2,
    borderRadius: radius.sm,
  },
  artworkFallback: {
    backgroundColor: colors.surface,
  },
  textColumn: {
    flex: 1,
    gap: 1,
  },
  title: {},
  artists: {},
  playButton: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
