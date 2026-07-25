import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/lib/theme/colors";
import { spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import {
  ChartsGrid,
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
import type { HomeLanguage } from "../types/home-content";

const TRENDING_LANGUAGES: readonly HomeLanguage[] = ["Hindi", "English"];

export function HomeScreen() {
  const [trendingLanguage, setTrendingLanguage] =
    useState<HomeLanguage>("Hindi");
  const trendingQueries = useTrendingByLanguage();
  const newReleasesQuery = useNewReleases();
  const chartsQuery = useCharts();

  const activeTrendingIndex = TRENDING_LANGUAGES.indexOf(trendingLanguage);
  const activeTrendingQuery = trendingQueries[activeTrendingIndex];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={typography.h1}>Namaste 👋</Text>
          <Text style={[typography.body, styles.headerSubtitle]}>
            Yahan hai aapke liye kuch naya.
          </Text>
        </View>

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
            <TrackRow tracks={activeTrendingQuery?.data ?? []} />
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
            <TrackRow tracks={newReleasesQuery.data ?? []} />
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Top Charts" />
          {chartsQuery.isLoading ? (
            <SectionLoadingView />
          ) : chartsQuery.isError ? (
            <SectionErrorView message="Charts load nahi ho paaye." />
          ) : (
            <ChartsGrid charts={chartsQuery.data ?? []} />
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
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.xs / 2,
  },
  headerSubtitle: {},
  section: {
    marginBottom: spacing.xl,
  },
});
