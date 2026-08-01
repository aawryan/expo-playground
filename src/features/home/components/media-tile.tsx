import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";

// One consistent tile size everywhere artwork shows up on the home feed
// (Trending, New Releases, genre rows, Top Charts) — a square thumbnail
// with text underneath, the same shape Spotify uses for every
// horizontal row regardless of section. The section itself (a header, a
// small badge) is what tells rows apart, not the card's shape or size.
export const MEDIA_TILE_WIDTH = moderateScale(112, 0.3);

interface MediaTileProps {
  artworkUri?: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  accessibilityLabel: string;
  isActive?: boolean;
  isNew?: boolean;
  /** 1-based rank badge in the corner — used by Top Charts. */
  rank?: number;
}

export function MediaTile({
  artworkUri,
  title,
  subtitle,
  onPress,
  accessibilityLabel,
  isActive,
  isNew,
  rank,
}: MediaTileProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={[styles.artworkWrapper, isActive && styles.artworkActive]}>
        {artworkUri ? (
          <Image
            source={{ uri: artworkUri }}
            style={styles.artwork}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View style={[styles.artwork, styles.artworkFallback]} />
        )}

        {rank !== undefined ? (
          <View style={styles.rankBadge}>
            <Text style={styles.rankBadgeText}>{rank}</Text>
          </View>
        ) : null}

        {isNew ? <View style={styles.newDot} /> : null}
      </View>

      <Text style={[typography.label, styles.title]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[typography.caption, styles.subtitle]} numberOfLines={1}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: MEDIA_TILE_WIDTH,
  },
  pressed: {
    opacity: 0.7,
  },
  artworkWrapper: {
    width: MEDIA_TILE_WIDTH,
    height: MEDIA_TILE_WIDTH,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  artworkActive: {
    borderWidth: 2,
    borderColor: colors.indicator,
  },
  artwork: {
    width: "100%",
    height: "100%",
  },
  artworkFallback: {
    backgroundColor: colors.surfaceElevated,
  },
  rankBadge: {
    position: "absolute",
    top: spacing.xs,
    left: spacing.xs,
    minWidth: moderateScale(20),
    height: moderateScale(20),
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.scrimStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadgeText: {
    color: colors.textPrimary,
    fontSize: moderateScale(10, 0.3),
    fontWeight: "800",
  },
  newDot: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    width: moderateScale(7),
    height: moderateScale(7),
    borderRadius: moderateScale(3.5),
    backgroundColor: colors.indicator,
  },
  title: {
    marginTop: spacing.sm,
  },
  subtitle: {
    marginTop: 1,
  },
});
