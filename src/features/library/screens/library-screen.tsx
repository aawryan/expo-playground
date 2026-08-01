import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { ExploreSearchBar } from "@/features/explore/components";
import { SectionHeader, TrackRow } from "@/features/home/components";
import type { ContentSource } from "@/features/home/types/home-content";
import { SongRow } from "@/features/playlist/components";
import { usePlayerStore } from "@/lib/audio/player-store";
import { useRegisterScrollToTop } from "@/lib/navigation/scroll-to-top";
import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import { ArtistChip, QuickAccessTile } from "../components";
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

function matchesQuery(text: string, query: string) {
  return text.toLowerCase().includes(query.toLowerCase());
}

export function LibraryScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const recentlyPlayedY = useRef(0);

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const history = useLibraryStore((state) => state.history);
  const likedSongsOrdered = useLibraryStore(useShallow(getLikedSongsOrdered));
  const followedArtists = useLibraryStore(
    useShallow((state) => Object.values(state.followedArtists)),
  );
  const clearHistory = useLibraryStore((state) => state.clearHistory);

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

  // Everything liked/followed searched by name — cheap client-side filter
  // since both sets are already fully in memory from the store.
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.trim();
    return {
      songs: likedSongsOrdered
        .filter(
          (track) =>
            matchesQuery(track.title, q) || matchesQuery(track.artists, q),
        )
        .map(libraryTrackToPlaylistSong),
      artists: followedArtists.filter((artist) => matchesQuery(artist.name, q)),
    };
  }, [searchQuery, likedSongsOrdered, followedArtists]);

  function playRecent(trackId: string) {
    const index = recentTracks.findIndex((t) => t.id === trackId);
    playQueue(recentTracks.map(toPlayerTrack), Math.max(index, 0));
  }

  function playLikedFrom(
    songs: ReturnType<typeof libraryTrackToPlaylistSong>[],
    index: number,
  ) {
    playQueue(songs.map(toPlayerTrack), index);
  }

  function openLikedSongs() {
    router.push("/library/liked-songs" as unknown as Href);
  }

  function openArtist(artist: FollowedArtist) {
    router.push({
      pathname: "/(tabs)/explore",
      params: { q: artist.name },
    } as unknown as Href);
  }

  function scrollToRecentlyPlayed() {
    scrollRef.current?.scrollTo({
      y: recentlyPlayedY.current - spacing.lg,
      animated: true,
    });
  }

  function confirmClearHistory() {
    Alert.alert(
      "Clear Recently Played?",
      "This removes your play history. Liked songs aren't affected.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: clearHistory },
      ],
    );
  }

  function closeSearch() {
    setIsSearching(false);
    setSearchQuery("");
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerRow}>
        <Text style={typography.h1}>Your Library</Text>
        <Pressable
          onPress={() => (isSearching ? closeSearch() : setIsSearching(true))}
          hitSlop={10}
          style={styles.headerIconButton}
          accessibilityRole="button"
          accessibilityLabel={
            isSearching ? "Close search" : "Search your library"
          }
        >
          <Ionicons
            name={isSearching ? "close" : "search"}
            size={moderateScale(20)}
            color={colors.textPrimary}
          />
        </Pressable>
      </View>

      {!isSearching ? (
        <Text style={[typography.caption, styles.statsLine]}>
          {likedSongsOrdered.length} liked · {followedArtists.length} artist
          {followedArtists.length === 1 ? "" : "s"} followed
        </Text>
      ) : null}

      {isSearching ? (
        <View style={styles.searchBarWrapper}>
          <ExploreSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search liked songs, artists…"
          />
        </View>
      ) : null}

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {searchResults ? (
          <SearchResults
            results={searchResults}
            activeTrackId={activeTrackId}
            isPlaying={isPlaying}
            onPlaySong={(songs, index) => playLikedFrom(songs, index)}
            onOpenArtist={openArtist}
          />
        ) : (
          <>
            <View style={styles.quickAccessRow}>
              <QuickAccessTile
                icon="heart"
                title="Liked Songs"
                subtitle={`${likedSongsOrdered.length} song${likedSongsOrdered.length === 1 ? "" : "s"}`}
                tone="elevated"
                onPress={openLikedSongs}
              />
              <QuickAccessTile
                icon="time-outline"
                title="Recently Played"
                subtitle={
                  recentTracks.length > 0
                    ? recentTracks[0].title
                    : "Nothing yet"
                }
                tone="raised"
                onPress={scrollToRecentlyPlayed}
              />
            </View>

            <View
              style={styles.section}
              onLayout={(event) => {
                recentlyPlayedY.current = event.nativeEvent.layout.y;
              }}
            >
              <View style={styles.sectionHeaderRow}>
                <SectionHeader title="Recently Played" />
                {recentTracks.length > 0 ? (
                  <Pressable onPress={confirmClearHistory} hitSlop={8}>
                    <Text style={[typography.label, styles.clearAction]}>
                      Clear
                    </Text>
                  </Pressable>
                ) : null}
              </View>
              {recentTracks.length > 0 ? (
                <TrackRow
                  tracks={recentTracks}
                  onTrackPress={(track) => playRecent(track.id)}
                />
              ) : (
                <EmptyState
                  icon="time-outline"
                  title="Nothing played yet"
                  message="Songs you play will show up here."
                />
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
                      onPress={() => playLikedFrom(likedPreview, index)}
                    />
                  ))}
                </View>
              ) : (
                <EmptyState
                  icon="heart-outline"
                  title="No liked songs yet"
                  message="Tap the heart on any song to add it here."
                />
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
                <EmptyState
                  icon="person-outline"
                  title="No followed artists"
                  message="Artists you follow will show up here."
                />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface SearchResultsProps {
  results: {
    songs: ReturnType<typeof libraryTrackToPlaylistSong>[];
    artists: FollowedArtist[];
  };
  activeTrackId?: string;
  isPlaying: boolean;
  onPlaySong: (
    songs: ReturnType<typeof libraryTrackToPlaylistSong>[],
    index: number,
  ) => void;
  onOpenArtist: (artist: FollowedArtist) => void;
}

function SearchResults({
  results,
  activeTrackId,
  isPlaying,
  onPlaySong,
  onOpenArtist,
}: SearchResultsProps) {
  const hasResults = results.songs.length > 0 || results.artists.length > 0;

  if (!hasResults) {
    return (
      <EmptyState
        icon="search-outline"
        title="No matches"
        message="Try a different song or artist name."
      />
    );
  }

  return (
    <>
      {results.artists.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="Artists" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.artistRow}
          >
            {results.artists.map((artist) => (
              <ArtistChip
                key={artist.id}
                artist={artist}
                onPress={onOpenArtist}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {results.songs.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="Songs" />
          {results.songs.map((song, index) => (
            <SongRow
              key={song.id}
              song={song}
              index={index}
              isActive={activeTrackId === song.id}
              isPlaying={activeTrackId === song.id && isPlaying}
              onPress={() => onPlaySong(results.songs, index)}
            />
          ))}
        </View>
      ) : null}
    </>
  );
}

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
}

function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrapper}>
        <Ionicons
          name={icon}
          size={moderateScale(24)}
          color={colors.textTertiary}
        />
      </View>
      <Text style={[typography.subtitle, styles.emptyTitle]}>{title}</Text>
      <Text style={[typography.caption, styles.emptyMessage]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  headerIconButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  statsLine: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs / 2,
  },
  searchBarWrapper: {
    marginTop: spacing.md,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl * 4,
  },
  quickAccessRow: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
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
  clearAction: {
    color: colors.textTertiary,
  },
  artistRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  emptyIconWrapper: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  emptyTitle: {
    textAlign: "center",
  },
  emptyMessage: {
    textAlign: "center",
  },
});
