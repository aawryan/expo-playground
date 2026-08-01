import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useCallback, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { ContentSource } from "@/features/home/types/home-content";
import { SectionHeader, TrackRow } from "@/features/home/components";
import { SongRow } from "@/features/playlist/components";
import { usePlayerStore } from "@/lib/audio/player-store";
import { useRegisterScrollToTop } from "@/lib/navigation/scroll-to-top";
import { colors } from "@/lib/theme/colors";
import { spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import { ArtistChip } from "../components";
import { getLikedSongsOrdered, useLibraryStore } from "../store/library-store";
import {
  libraryTrackToHomeTrack,
  libraryTrackToPlaylistSong,
  type FollowedArtist,
} from "../types/library-content";

/** How many liked songs show in the on-screen preview before "View All"
 * takes over. */
const LIKED_SONGS_PREVIEW_COUNT = 5;

interface QueueableTrack {
  id: string;
  source: ContentSource;
  title: string;
  artists: string;
  artworkUrl?: string;
  streamUrl?: string;
}

function toPlayerTrack(track: QueueableTrack) {
  return {
    id: track.id,
    source: track.source,
    title: track.title,
    artists: track.artists,
    artworkUrl: track.artworkUrl,
    streamUrl: track.streamUrl,
  };
}

export function LibraryScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const history = useLibraryStore((state) => state.history);
  const likedSongsOrdered = useLibraryStore(getLikedSongsOrdered);
  const followedArtists = useLibraryStore((state) =>
    Object.values(state.followedArtists),
  );
  const playQueue = usePlayerStore((state) => state.playQueue);
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const activeTrackId = currentIndex >= 0 ? queue[currentIndex]?.id : undefined;

  useRegisterScrollToTop(
    "library",
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, []),
  );

  const recentTracks = history.map((entry) =>
    libraryTrackToHomeTrack(entry.track),
  );
  const likedPreview = likedSongsOrdered
    .slice(0, LIKED_SONGS_PREVIEW_COUNT)
    .map(libraryTrackToPlaylistSong);

  function playRecent(trackId: string) {
    const index = recentTracks.findIndex((t) => t.id === trackId);
    playQueue(recentTracks.map(toPlayerTrack), Math.max(index, 0));
  }

  function playLikedFrom(index: number) {
    playQueue(likedPreview.map(toPlayerTrack), index);
  }

  function openLikedSongs() {
    router.push("/library/liked-songs" as unknown as Href);
  }

  function openArtist(artist: FollowedArtist) {
    // No dedicated artist-detail route yet — searching by their name is
    // the closest existing screen that can show their songs today.
    router.push({
      pathname: "/(tabs)/explore",
      params: { q: artist.name },
    } as unknown as Href);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.h1, styles.pageTitle]}>Library</Text>

        <View style={styles.section}>
          <SectionHeader title="Recently Played" />
          {recentTracks.length > 0 ? (
            <TrackRow
              tracks={recentTracks}
              variant="new"
              onTrackPress={(track) => playRecent(track.id)}
            />
          ) : (
            <Text style={[typography.caption, styles.emptyNote]}>
              Tracks you play will show up here.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <SectionHeader
              title="Liked Songs"
              subtitle={
                likedSongsOrdered.length > 0
                  ? `${likedSongsOrdered.length} ${
                      likedSongsOrdered.length === 1 ? "song" : "songs"
                    }`
                  : undefined
              }
            />
            {likedSongsOrdered.length > 0 ? (
              <Pressable onPress={openLikedSongs} hitSlop={8}>
                <Text style={[typography.label, styles.viewAll]}>
                  View All
                </Text>
              </Pressable>
            ) : null}
          </View>
          {likedPreview.length > 0 ? (
            <View>
              {likedPreview.map((song, index) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={index}
                  isActive={activeTrackId === song.id}
                  isPlaying={activeTrackId === song.id && isPlaying}
                  onPress={() => playLikedFrom(index)}
                />
              ))}
            </View>
          ) : (
            <Text style={[typography.caption, styles.emptyNote]}>
              Songs you like will show up here. Tap the heart on any song to
              add it.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Followed Artists" />
          {followedArtists.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.artistRow}
            >
              {followedArtists.map((artist) => (
                <ArtistChip
                  key={artist.id}
                  artist={artist}
                  onPress={openArtist}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={[typography.caption, styles.emptyNote]}>
              Artists you follow will show up here.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  scrollContent: {
    paddingBottom: spacing.xxl * 4,
  },
  pageTitle: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingRight: spacing.lg,
  },
  viewAll: {
    color: colors.accent,
  },
  emptyNote: {
    paddingHorizontal: spacing.lg,
  },
  artistRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});
