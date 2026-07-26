import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SongRow } from "@/features/playlist/components";
import type { HomeTrack } from "@/features/home/types/home-content";
import { usePlayerStore } from "@/lib/audio/player-store";
import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import { useGenreTracks } from "../hooks/use-explore";

interface GenreScreenProps {
  genreId: string;
}

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

export function GenreScreen({ genreId }: GenreScreenProps) {
  const router = useRouter();
  const { genre, data, isLoading, isError, refetch } =
    useGenreTracks(genreId);

  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playQueue = usePlayerStore((state) => state.playQueue);
  const activeTrackId = currentIndex >= 0 ? queue[currentIndex]?.id : undefined;

  const tracks = data ?? [];

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

      {!genre ? (
        <View style={styles.centered}>
          <Text style={[typography.body, { color: colors.danger }]}>
            Ye genre nahi mila.
          </Text>
        </View>
      ) : isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={[typography.body, { color: colors.danger }]}>
            {genre.label} load nahi ho paaya.
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="Retry"
          >
            <Ionicons
              name="refresh"
              size={moderateScale(14)}
              color={colors.accent}
            />
            <Text style={[typography.label, styles.retryLabel]}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlashList
          data={tracks}
          keyExtractor={(item) => `${item.source}-${item.id}`}
          ListHeaderComponent={
            <View style={styles.hero}>
              <View style={styles.iconBadge}>
                <Ionicons
                  name={genre.icon}
                  size={moderateScale(30)}
                  color={colors.textPrimary}
                />
              </View>
              <Text style={typography.h1}>{genre.label}</Text>
              <Text style={[typography.body, styles.tagline]}>
                {genre.tagline}
              </Text>

              {tracks.length > 0 ? (
                <Pressable
                  onPress={() => playQueue(tracks.map(toPlayerTrack), 0)}
                  style={styles.playAllButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Play all ${genre.label}`}
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
                  Abhi iss mood mein koi track nahi mila.
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
              onPress={() => playQueue(tracks.map(toPlayerTrack), index)}
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
    gap: spacing.sm,
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
  iconBadge: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  tagline: {
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
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.accentMuted,
  },
  retryLabel: {
    color: colors.accent,
  },
});
