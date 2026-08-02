import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePlayerStore } from "@/lib/audio/player-store";
import { useRegisterScrollToTop } from "@/lib/navigation/scroll-to-top";
import { colors } from "@/lib/theme/colors";
import { spacing } from "@/lib/theme/spacing";
import {
  ArtistsRow,
  ArtistsRowSkeleton,
  ChartsRow,
  HomeHero,
  HomeSectionState,
  LanguagePillTabs,
  SectionHeader,
  TrackRow,
  TrackRowSkeleton,
} from "../components";
import {
  useAlbums,
  useArtists,
  useCharts,
  useGenreRows,
  useNewReleases,
  useTrendingByLanguage,
} from "../hooks/use-home-feed";
import type {
  HomeArtist,
  HomeChart,
  HomeLanguage,
  HomeTrack,
} from "../types/home-content";

const TRENDING_LANGUAGES: readonly HomeLanguage[] = ["Hindi", "English"];

function toPlayerTrack(track: HomeTrack) {
  return {
    id: track.id,
    source: track.source,
    title: track.title,
    artists: track.artists,
    artworkUrl:
      track.artwork.medium ?? track.artwork.large ?? track.artwork.small,
    streamUrl: track.streamUrl,
  };
}

export function HomeScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [trendingLanguage, setTrendingLanguage] =
    useState<HomeLanguage>("Hindi");
  const trendingQueries = useTrendingByLanguage();
  const newReleasesQuery = useNewReleases();
  const chartsQuery = useCharts();
  const albumsQuery = useAlbums();
  const artistsQuery = useArtists();
  const genreRows = useGenreRows();
  const playQueue = usePlayerStore((state) => state.playQueue);

  useRegisterScrollToTop(
    "index",
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, []),
  );

  const activeTrendingIndex = TRENDING_LANGUAGES.indexOf(trendingLanguage);
  const activeTrendingQuery = trendingQueries[activeTrendingIndex];

  function playFromList(list: HomeTrack[], track: HomeTrack) {
    const index = list.findIndex(
      (item) => item.id === track.id && item.source === track.source,
    );
    playQueue(list.map(toPlayerTrack), Math.max(index, 0));
  }

  function openChart(chart: HomeChart) {
    // Cast via `unknown`: expo-router's generated Href union only lists
    // routes that existed the last time `npx expo start` ran, so it won't
    // know about this dynamic route until the dev server (or the CI
    // typecheck step) has regenerated it. Going through `unknown` always
    // compiles regardless of that timing.
    router.push({
      pathname: "/playlist/[source]/[id]",
      params: {
        source: chart.source,
        id: chart.id,
        title: chart.title,
        artworkUrl:
          chart.artwork.large ??
          chart.artwork.medium ??
          chart.artwork.small ??
          "",
      },
    } as unknown as Href);
  }

  function openArtist(artist: HomeArtist) {
    // Same pattern Library's Followed Artists row already uses — no
    // dedicated artist page yet, so the closest existing way to surface
    // an artist's songs is a deep-link straight into Explore's search.
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
        <HomeHero />

        <View style={styles.section}>
          <SectionHeader title="Trending Now" />
          <LanguagePillTabs
            options={TRENDING_LANGUAGES}
            value={trendingLanguage}
            onChange={setTrendingLanguage}
          />
          <HomeSectionState
            isLoading={activeTrendingQuery?.isLoading ?? true}
            isError={activeTrendingQuery?.isError ?? false}
            data={activeTrendingQuery?.data}
            errorMessage="Trending tracks load nahi ho paaye."
            onRetry={() => activeTrendingQuery?.refetch()}
            renderSkeleton={() => <TrackRowSkeleton />}
            renderContent={(tracks) => (
              <TrackRow
                tracks={tracks}
                onTrackPress={(track) =>
                  playFromList(activeTrendingQuery?.data ?? [], track)
                }
              />
            )}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="New Releases"
            subtitle="Fresh from Hindi & English"
          />
          <HomeSectionState
            isLoading={newReleasesQuery.isLoading}
            isError={newReleasesQuery.isError}
            data={newReleasesQuery.data}
            errorMessage="New releases load nahi ho paaye."
            onRetry={() => newReleasesQuery.refetch()}
            renderSkeleton={() => <TrackRowSkeleton />}
            renderContent={(tracks) => (
              <TrackRow
                tracks={tracks}
                isNew
                onTrackPress={(track) => playFromList(tracks, track)}
              />
            )}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Top Charts" />
          <HomeSectionState
            isLoading={chartsQuery.isLoading}
            isError={chartsQuery.isError}
            data={chartsQuery.data}
            errorMessage="Charts load nahi ho paaye."
            onRetry={() => chartsQuery.refetch()}
            renderSkeleton={() => <TrackRowSkeleton />}
            renderContent={(charts) => (
              <ChartsRow charts={charts} onChartPress={openChart} />
            )}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Popular Artists" />
          <HomeSectionState
            isLoading={artistsQuery.isLoading}
            isError={artistsQuery.isError}
            data={artistsQuery.data}
            errorMessage="Artists load nahi ho paaye."
            onRetry={() => artistsQuery.refetch()}
            renderSkeleton={() => <ArtistsRowSkeleton />}
            renderContent={(artists) => (
              <ArtistsRow artists={artists} onArtistPress={openArtist} />
            )}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Popular Albums" />
          <HomeSectionState
            isLoading={albumsQuery.isLoading}
            isError={albumsQuery.isError}
            data={albumsQuery.data}
            errorMessage="Albums load nahi ho paaye."
            onRetry={() => albumsQuery.refetch()}
            renderSkeleton={() => <TrackRowSkeleton />}
            renderContent={(albums) => (
              <ChartsRow
                charts={albums}
                onChartPress={openChart}
                showRank={false}
                fallbackLabel="Album"
              />
            )}
          />
        </View>

        {genreRows.map(({ genre, query }) => (
          <View key={genre.id} style={styles.section}>
            <SectionHeader title={genre.label} subtitle={genre.tagline} />
            <HomeSectionState
              isLoading={query.isLoading}
              isError={query.isError}
              data={query.data}
              errorMessage={`${genre.label} load nahi ho paaya.`}
              onRetry={() => query.refetch()}
              renderSkeleton={() => <TrackRowSkeleton />}
              renderContent={(tracks) => (
                <TrackRow
                  tracks={tracks}
                  onTrackPress={(track) => playFromList(tracks, track)}
                />
              )}
            />
          </View>
        ))}
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
  section: {
    marginBottom: spacing.lg,
  },
});
