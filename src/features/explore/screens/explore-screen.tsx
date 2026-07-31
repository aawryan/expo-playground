import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SectionHeader } from "@/features/home/components";
import type { HomeTrack } from "@/features/home/types/home-content";
import { usePlayerStore } from "@/lib/audio/player-store";
import { useRegisterScrollToTop } from "@/lib/navigation/scroll-to-top";
import { colors } from "@/lib/theme/colors";
import { spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import { ExploreSearchBar, GenreGrid, SearchResultsList } from "../components";
import { useGenrePreviews, useSearchTracks } from "../hooks/use-explore";
import type { ExploreGenre } from "../types/explore-content";

function toPlayerTrack(track: HomeTrack) {
  return {
    id: track.id,
    title: track.title,
    artists: track.artists,
    artworkUrl:
      track.artwork.medium ?? track.artwork.large ?? track.artwork.small,
    streamUrl: track.streamUrl,
  };
}

export function ExploreScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const genreEntries = useGenrePreviews();
  const searchResult = useSearchTracks(searchQuery);
  const isSearchActive = searchResult.isSearching;

  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playQueue = usePlayerStore((state) => state.playQueue);
  const activeTrackId = currentIndex >= 0 ? queue[currentIndex]?.id : undefined;

  useRegisterScrollToTop(
    "explore",
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, []),
  );

  function openGenre(genre: ExploreGenre) {
    router.push(`/genre/${genre.id}` as unknown as Href);
  }

  function playSearchResult(track: HomeTrack, index: number) {
    playQueue((searchResult.data ?? []).map(toPlayerTrack), index);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={typography.h1}>Explore</Text>
        <Text style={[typography.body, styles.headerSubtitle]}>
          Search anything, or pick a mood to queue up
        </Text>
      </View>

      <ExploreSearchBar value={searchQuery} onChangeText={setSearchQuery} />

      {isSearchActive ? (
        <SearchResultsList
          query={searchQuery.trim()}
          tracks={searchResult.data ?? []}
          isLoading={searchResult.isLoading || searchResult.isDebouncing}
          isError={searchResult.isError}
          activeTrackId={activeTrackId}
          isPlaying={isPlaying}
          onTrackPress={playSearchResult}
        />
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <SectionHeader
              title="Browse by Mood"
              subtitle="Curated queues, one tap to play"
            />
            <GenreGrid entries={genreEntries} onGenrePress={openGenre} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: 2,
  },
  headerSubtitle: {
    marginTop: -2,
  },
  scrollContent: {
    paddingBottom: spacing.xxl * 4,
  },
  section: {
    marginBottom: spacing.xl,
  },
});
