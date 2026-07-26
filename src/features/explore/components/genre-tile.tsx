import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import type { ExploreGenre } from "../types/explore-content";

interface GenreTileProps {
  genre: ExploreGenre;
  artworkUri?: string;
  onPress: (genre: ExploreGenre) => void;
}

/**
 * Real artwork pulled from the genre's own top track, not a flat color
 * swatch — the whole app is monochrome now, so what makes each tile
 * read as distinct is the photo underneath it, the same way a record
 * store's genre dividers are just labels in front of the records
 * themselves.
 */
export function GenreTile({ genre, artworkUri, onPress }: GenreTileProps) {
  return (
    <Pressable
      onPress={() => onPress(genre)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Browse ${genre.label}: ${genre.tagline}`}
    >
      {artworkUri ? (
        <Image
          source={{ uri: artworkUri }}
          style={styles.artwork}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.artwork, styles.artworkFallback]} />
      )}

      <LinearGradient
        colors={["rgba(0,0,0,0.15)", colors.scrimSoft, colors.scrimStrong]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.iconBadge}>
        <Ionicons
          name={genre.icon}
          size={moderateScale(15)}
          color={colors.textPrimary}
        />
      </View>

      <View style={styles.textBlock}>
        <Text style={[typography.title, styles.label]} numberOfLines={1}>
          {genre.label}
        </Text>
        <Text style={[typography.caption, styles.tagline]} numberOfLines={1}>
          {genre.tagline}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 1.05,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  artwork: {
    ...StyleSheet.absoluteFill,
  },
  artworkFallback: {
    backgroundColor: colors.surfaceElevated,
  },
  iconBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    position: "absolute",
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    gap: 1,
  },
  label: {
    color: colors.textPrimary,
  },
  tagline: {
    color: colors.textOnImage,
  },
});
