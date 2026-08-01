import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SongRow } from "@/features/playlist/components";
import { usePlayerStore } from "@/lib/audio/player-store";
import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import { useShallow } from "zustand/react/shallow";
import { getLikedSongsOrdered, useLibraryStore } from "../store/library-store";
import { libraryTrackToPlaylistSong } from "../types/library-content";

export function LikedSongsScreen() {
  const router = useRouter();
  const likedSongs = useLibraryStore(useShallow(getLikedSongsOrdered));
  const songs = likedSongs.map(libraryTrackToPlaylistSong);

  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playQueue = usePlayerStore((state) => state.playQueue);
  const activeTrackId = currentIndex >= 0 ? queue[currentIndex]?.id : undefined;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="chevron-back"
            size={moderateScale(22)}
            color={colors.textPrimary}
          />
        </Pressable>
      </View>

      <FlashList
        data={songs}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.hero}>
            <View style={styles.iconWrapper}>
              <Ionicons
                name="heart"
                size={moderateScale(56)}
                color={colors.accent}
              />
            </View>
            <Text style={typography.h1}>Liked Songs</Text>
            <Text style={[typography.body, styles.subtitle]}>
              {songs.length} {songs.length === 1 ? "song" : "songs"}
            </Text>

            {songs.length > 0 ? (
              <Pressable
                onPress={() => playQueue(songs.map(toPlayerTrack), 0)}
                style={styles.playAllButton}
                accessibilityRole="button"
                accessibilityLabel="Play all"
              >
                <Ionicons
                  name="play"
                  size={moderateScale(16)}
                  color={colors.screenBackground}
                />
                <Text style={styles.playAllLabel}>Play All</Text>
              </Pressable>
            ) : (
              <Text style={[typography.caption, styles.emptyNote]}>
                Songs you like will show up here. Tap the heart on any song to
                add it.
              </Text>
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <SongRow
            song={item}
            index={index}
            isActive={activeTrackId === item.id}
            isPlaying={activeTrackId === item.id && isPlaying}
            onPress={() => playQueue(songs.map(toPlayerTrack), index)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      <LinearGradient
        colors={["transparent", colors.screenBackground]}
        style={styles.topFade}
        pointerEvents="none"
      />
    </SafeAreaView>
  );
}

function toPlayerTrack(song: ReturnType<typeof libraryTrackToPlaylistSong>) {
  return {
    id: song.id,
    source: song.source,
    title: song.title,
    artists: song.artists,
    artworkUrl: song.artwork.medium ?? song.artwork.large ?? song.artwork.small,
    streamUrl: song.streamUrl,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  topBar: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.lg,
    zIndex: 10,
  },
  backButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  topFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: moderateScale(48),
  },
  listContent: {
    paddingBottom: spacing.xxl * 2,
  },
  hero: {
    alignItems: "center",
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  iconWrapper: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  subtitle: {
    textAlign: "center",
  },
  playAllButton: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  playAllLabel: {
    color: colors.screenBackground,
    fontWeight: "700",
    fontSize: moderateScale(14, 0.3),
  },
  emptyNote: {
    marginTop: spacing.md,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
});
