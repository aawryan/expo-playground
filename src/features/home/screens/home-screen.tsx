import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePlayerStore } from "@/lib/audio/player-store";
import { colors } from "@/lib/theme/colors";
import { spacing } from "@/lib/theme/spacing";
import {
  AmbientGlow,
  ChartsGrid,
  ChartsGridSkeleton,
  HomeHero,
  LanguagePillTabs,
  SectionErrorView,
  SectionHeader,
  SpotlightCard,
  TrackRow,
  TrackRowSkeleton,
} from "../components";
import {
  useCharts,
  useNewReleases,
  useTrendingByLanguage,
} from "../hooks/use-home-feed";
import type { HomeChart, HomeLanguage, HomeTrack } from "../types/home-content";

const TRENDING_LANGUAGES: readonly HomeLanguage[] = ["Hindi", "English"];

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

export function HomeScreen() {
  const router = useRouter();
  const [trendingLanguage, setTrendingLanguage] =
    useState<HomeLanguage>("Hindi");
  const trendingQueries = useTrendingByLanguage();
  const newReleasesQuery = useNewReleases();
  const chartsQuery = useCharts();
  const playQueue = usePlayerStore((state) => state.playQueue);

  const activeTrendingIndex = TRENDING_LANGUAGES.indexOf(trendingLanguage);
  const activeTrendingQuery = trendingQueries[activeTrendingIndex];
  const spotlightTrack = activeTrendingQuery?.data?.[0];

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
      params: { source: chart.source, id: chart.id },
    } as unknown as Href);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <AmbientGlow />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HomeHero />

        {spotlightTrack ? (
          <View style={styles.section}>
            <SpotlightCard
              track={spotlightTrack}
              onPress={(track) =>
                playFromList(activeTrendingQuery?.data ?? [], track)
              }
            />
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader title="Trending Now" />
          <LanguagePillTabs
            options={TRENDING_LANGUAGES}
            value={trendingLanguage}
            onChange={setTrendingLanguage}
          />
          {activeTrendingQuery?.isLoading ? (
            <TrackRowSkeleton />
          ) : activeTrendingQuery?.isError ? (
            <SectionErrorView
              message="Trending tracks couldn't load."
              onRetry={() => activeTrendingQuery?.refetch()}
            />
          ) : (
            <TrackRow
              tracks={activeTrendingQuery?.data ?? []}
              variant="trending"
              onTrackPress={(track) =>
                playFromList(activeTrendingQuery?.data ?? [], track)
              }
            />
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="New Releases"
            subtitle="Fresh from Hindi & English"
          />
          {newReleasesQuery.isLoading ? (
            <TrackRowSkeleton />
          ) : newReleasesQuery.isError ? (
            <SectionErrorView
              message="New releases couldn't load."
              onRetry={() => newReleasesQuery.refetch()}
            />
          ) : (
            <TrackRow
              tracks={newReleasesQuery.data ?? []}
              variant="new"
              staggered
              onTrackPress={(track) =>
                playFromList(newReleasesQuery.data ?? [], track)
              }
            />
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Top Charts" />
          {chartsQuery.isLoading ? (
            <ChartsGridSkeleton />
          ) : chartsQuery.isError ? (
            <SectionErrorView
              message="Charts couldn't load."
              onRetry={() => chartsQuery.refetch()}
            />
          ) : (
            <ChartsGrid
              charts={chartsQuery.data ?? []}
              onChartPress={openChart}
            />
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
  section: {
    marginBottom: spacing.xl,
  },
});
