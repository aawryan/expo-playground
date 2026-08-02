import { Ionicons } from "@expo/vector-icons";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { ExploreSearchBar } from "@/features/explore/components";
import type { ContentSource } from "@/features/home/types/home-content";
import { usePlayerStore } from "@/lib/audio/player-store";
import { useRegisterScrollToTop } from "@/lib/navigation/scroll-to-top";
import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import { LibraryRow, LikedSongsThumb, PillTabs } from "../components";
import { getLikedSongsOrdered, useLibraryStore } from "../store/library-store";
import {
  libraryTrackKey,
  type FollowedArtist,
  type LibraryTrack,
} from "../types/library-content";

const FILTER_OPTIONS = ["All", "Playlists", "Artists", "Songs"] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

const SORT_OPTIONS = ["Recently Played", "Alphabetical"] as const;
type SortMode = (typeof SORT_OPTIONS)[number];

type LibraryListItem =
  | { key: string; kind: "liked-songs" }
  | { key: string; kind: "song"; track: LibraryTrack }
  | { key: string; kind: "artist"; artist: FollowedArtist };

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

function titleOf(item: LibraryListItem): string {
  if (item.kind === "liked-songs") return "Liked Songs";
  if (item.kind === "song") return item.track.title;
  return item.artist.name;
}

export function LibraryScreen() {
  const router = useRouter();
  const listRef = useRef<FlashListRef<LibraryListItem>>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterOption>("All");
  const [sortMode, setSortMode] = useState<SortMode>("Recently Played");

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
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, []),
  );

  const isLibraryEmpty =
    likedSongsOrdered.length === 0 &&
    history.length === 0 &&
    followedArtists.length === 0;

  const items = useMemo<LibraryListItem[]>(() => {
    const likedItem: LibraryListItem[] =
      likedSongsOrdered.length > 0
        ? [{ key: "liked-songs", kind: "liked-songs" }]
        : [];
    const songItems: LibraryListItem[] = history.map((entry) => ({
      key: `song:${libraryTrackKey(entry.track)}`,
      kind: "song",
      track: entry.track,
    }));
    const artistItems: LibraryListItem[] = followedArtists.map((artist) => ({
      key: `artist:${artist.id}`,
      kind: "artist",
      artist,
    }));

    const base =
      filter === "Playlists"
        ? likedItem
        : filter === "Artists"
          ? artistItems
          : filter === "Songs"
            ? songItems
            : [...likedItem, ...songItems, ...artistItems];

    if (sortMode === "Alphabetical") {
      return [...base].sort((a, b) => titleOf(a).localeCompare(titleOf(b)));
    }
    return base;
  }, [filter, sortMode, likedSongsOrdered.length, history, followedArtists]);

  const searchResults = useMemo<LibraryListItem[] | null>(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.trim();
    const songItems: LibraryListItem[] = likedSongsOrdered
      .filter(
        (track) =>
          matchesQuery(track.title, q) || matchesQuery(track.artists, q),
      )
      .map((track) => ({
        key: `song:${libraryTrackKey(track)}`,
        kind: "song",
        track,
      }));
    const artistItems: LibraryListItem[] = followedArtists
      .filter((artist) => matchesQuery(artist.name, q))
      .map((artist) => ({
        key: `artist:${artist.id}`,
        kind: "artist",
        artist,
      }));
    return [...songItems, ...artistItems];
  }, [searchQuery, likedSongsOrdered, followedArtists]);

  function playSong(track: LibraryTrack, sourceList: LibraryTrack[]) {
    const index = sourceList.findIndex(
      (t) => libraryTrackKey(t) === libraryTrackKey(track),
    );
    playQueue(sourceList.map(toPlayerTrack), Math.max(index, 0));
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

  function renderItem(item: LibraryListItem) {
    if (item.kind === "liked-songs") {
      return (
        <LibraryRow
          title="Liked Songs"
          subtitle={`Playlist · ${likedSongsOrdered.length} song${likedSongsOrdered.length === 1 ? "" : "s"}`}
          thumbnailOverride={<LikedSongsThumb />}
          onPress={openLikedSongs}
        />
      );
    }
    if (item.kind === "song") {
      return (
        <LibraryRow
          title={item.track.title}
          subtitle={`${item.track.artists} · Song`}
          artworkUrl={item.track.artworkUrl}
          isActive={activeTrackId === item.track.id}
          onPress={() =>
            playSong(
              item.track,
              searchResults
                ? likedSongsOrdered
                : history.map((entry) => entry.track),
            )
          }
        />
      );
    }
    return (
      <LibraryRow
        title={item.artist.name}
        subtitle="Artist"
        shape="circle"
        artworkUrl={item.artist.imageUrl}
        onPress={() => openArtist(item.artist)}
      />
    );
  }

  const listData = searchResults ?? items;
  const showClear =
    !searchResults &&
    filter !== "Playlists" &&
    filter !== "Artists" &&
    history.length > 0;

  if (isLibraryEmpty && !isSearching) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.headerRow}>
          <Text style={typography.h1}>Your Library</Text>
        </View>
        <View style={styles.fullEmpty}>
          <View style={styles.fullEmptyIcon}>
            <Ionicons
              name="library-outline"
              size={moderateScale(28)}
              color={colors.textTertiary}
            />
          </View>
          <Text style={[typography.h2, styles.fullEmptyTitle]}>
            Your library is empty
          </Text>
          <Text style={[typography.body, styles.fullEmptyMessage]}>
            Like songs and follow artists — they'll show up here.
          </Text>
        </View>
      </SafeAreaView>
    );
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

      {isSearching ? (
        <View style={styles.searchBarWrapper}>
          <ExploreSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search liked songs, artists…"
          />
        </View>
      ) : (
        <View style={styles.controlsRow}>
          <View style={styles.chipsWrapper}>
            <PillTabs
              options={FILTER_OPTIONS}
              value={filter}
              onChange={setFilter}
            />
          </View>
          <Pressable
            onPress={() =>
              setSortMode((mode) =>
                mode === "Recently Played" ? "Alphabetical" : "Recently Played",
              )
            }
            hitSlop={8}
            style={styles.sortButton}
            accessibilityRole="button"
            accessibilityLabel={`Sort: ${sortMode}`}
          >
            <Ionicons
              name="swap-vertical"
              size={moderateScale(14)}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>
      )}

      {showClear ? (
        <Pressable
          onPress={confirmClearHistory}
          hitSlop={8}
          style={styles.clearRow}
        >
          <Text style={[typography.caption, styles.clearAction]}>
            Clear Recently Played
          </Text>
        </Pressable>
      ) : null}

      <FlashList
        ref={listRef}
        data={listData}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => renderItem(item)}
        contentContainerStyle={{
          paddingBottom: spacing.xxl * 4,
          paddingTop: spacing.sm,
        }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name={searchResults ? "search-outline" : "musical-notes-outline"}
              size={moderateScale(24)}
              color={colors.textTertiary}
            />
            <Text style={[typography.subtitle, styles.emptyTitle]}>
              {searchResults ? "No matches" : "Nothing here yet"}
            </Text>
            <Text style={[typography.caption, styles.emptyMessage]}>
              {searchResults
                ? "Try a different song or artist name."
                : "Items you add will show up here."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
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
    marginBottom: spacing.md,
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
  searchBarWrapper: {
    marginBottom: spacing.sm,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  chipsWrapper: {
    flex: 1,
  },
  sortButton: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  clearRow: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  clearAction: {
    color: colors.textTertiary,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    gap: spacing.xs,
  },
  emptyTitle: {
    textAlign: "center",
  },
  emptyMessage: {
    textAlign: "center",
  },
  fullEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  fullEmptyIcon: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  fullEmptyTitle: {
    textAlign: "center",
  },
  fullEmptyMessage: {
    textAlign: "center",
    color: colors.textSecondary,
  },
});
