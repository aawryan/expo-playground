import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type {
  ContentSource,
  HomeArtwork,
  PlaylistSong,
} from "@/features/home/types/home-content";
import { usePlayerStore } from "@/lib/audio/player-store";
import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import { SongRow } from "../components";
import { usePlaylistDetail } from "../hooks/use-playlist-detail";

const HERO_ARTWORK_SIZE = moderateScale(180);

interface PlaylistScreenProps {
  source: ContentSource;
  id: string;
  /** The chart/card's real title, already known from the home feed
   * before this screen even loads. Used as a much more reliable
   * fallback search query than guessing from the seokey — see
   * `usePlaylistDetail`. */
  knownTitle?: string;
  /** Same idea as `knownTitle` but for the card's cover art — Gaana's
   * `/playlists/info` returns only a flat track list with no
   * playlist-level artwork of its own, so this (the chart's actual
   * artwork, confirmed correct) is what the hero image uses instead of
   * falling back to a single track's own cover. */
  knownArtworkUrl?: string;
}

function toPlayerTrack(song: PlaylistSong) {
  return {
    id: song.id,
    source: song.source,
    title: song.title,
    artists: song.artists,
    artworkUrl: song.artwork.medium ?? song.artwork.large ?? song.artwork.small,
    streamUrl: song.streamUrl,
  };
}

export function PlaylistScreen({
  source,
  id,
  knownTitle,
  knownArtworkUrl,
}: PlaylistScreenProps) {
  const router = useRouter();
  const knownArtwork: HomeArtwork | undefined = knownArtworkUrl
    ? {
        small: knownArtworkUrl,
        medium: knownArtworkUrl,
        large: knownArtworkUrl,
      }
    : undefined;
  const { data, isLoading, isError } = usePlaylistDetail(
    source,
    id,
    knownTitle,
    knownArtwork,
  );

  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playQueue = usePlayerStore((state) => state.playQueue);
  const activeTrackId = currentIndex >= 0 ? queue[currentIndex]?.id : undefined;

  const heroArtwork =
    data?.artwork.large ?? data?.artwork.medium ?? data?.artwork.small;

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

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : isError || !data ? (
        <View style={styles.centered}>
          <Text style={[typography.body, { color: colors.danger }]}>
            This playlist couldn't be loaded.
          </Text>
        </View>
      ) : (
        <FlashList
          data={data.songs}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.hero}>
              <View style={styles.heroArtworkWrapper}>
                {heroArtwork ? (
                  <Image
                    source={{ uri: heroArtwork }}
                    style={styles.heroArtwork}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    style={[styles.heroArtwork, styles.heroArtworkFallback]}
                  />
                )}
              </View>
              <Text style={typography.h1} numberOfLines={2}>
                {data.title}
              </Text>
              {data.subtitle ? (
                <Text style={[typography.body, styles.subtitle]}>
                  {data.subtitle}
                </Text>
              ) : null}

              {data.songs.length > 0 ? (
                <Pressable
                  onPress={() => playQueue(data.songs.map(toPlayerTrack), 0)}
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
                  No songs found in this playlist yet.
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
              onPress={() => playQueue(data.songs.map(toPlayerTrack), index)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <LinearGradient
        colors={["transparent", colors.screenBackground]}
        style={styles.topFade}
        pointerEvents="none"
      />
    </SafeAreaView>
  );
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
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
  heroArtworkWrapper: {
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroArtwork: {
    width: HERO_ARTWORK_SIZE,
    height: HERO_ARTWORK_SIZE,
  },
  heroArtworkFallback: {
    backgroundColor: colors.surface,
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
  },
});
