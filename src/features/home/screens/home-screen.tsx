import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePlayerStore } from "@/lib/audio/player-store";
import { colors } from "@/lib/theme/colors";
import { spacing } from "@/lib/theme/spacing";
import {
  ChartsGrid,
  HomeHero,
  LanguagePillTabs,
  SectionErrorView,
  SectionHeader,
  SectionLoadingView,
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

  function playFromList(list: HomeTrack[], track: HomeTrack) {
    const index = list.findIndex(
      (item) => item.id === track.id && item.source === track.source,
    );
    playQueue(list.map(toPlayerTrack), Math.max(index, 0));
  }

  function openChart(chart: HomeChart) {
    router.push({
      pathname: "/playlist/[source]/[id]",
      params: { source: chart.source, id: chart.id },
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
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
          {activeTrendingQuery?.isLoading ? (
            <TrackRowSkeleton />
          ) : activeTrendingQuery?.isError ? (
            <SectionErrorView message="Trending tracks load nahi ho paaye." />
          ) : (
            <TrackRow
              tracks={activeTrendingQuery?.data ?? []}
              onTrackPress={(track) =>
                playFromList(activeTrendingQuery?.data ?? [], track)
              }
            />
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="New Releases"
            subtitle="Hindi & English, dono se"
          />
          {newReleasesQuery.isLoading ? (
            <TrackRowSkeleton />
          ) : newReleasesQuery.isError ? (
            <SectionErrorView message="New releases load nahi ho paaye." />
          ) : (
            <TrackRow
              tracks={newReleasesQuery.data ?? []}
              onTrackPress={(track) =>
                playFromList(newReleasesQuery.data ?? [], track)
              }
            />
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Top Charts" />
          {chartsQuery.isLoading ? (
            <SectionLoadingView />
          ) : chartsQuery.isError ? (
            <SectionErrorView message="Charts load nahi ho paaye." />
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
