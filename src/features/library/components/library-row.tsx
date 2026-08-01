import { Image } from "expo-image";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";

const THUMB_SIZE = moderateScale(52);

interface LibraryRowProps {
  title: string;
  subtitle: string;
  shape?: "square" | "circle";
  artworkUrl?: string;
  /** Swap in a custom visual (e.g. the Liked Songs icon tile) instead of
   * an artwork image/fallback initial. */
  thumbnailOverride?: ReactNode;
  onPress: () => void;
  isActive?: boolean;
}

export function LibraryRow({
  title,
  subtitle,
  shape = "square",
  artworkUrl,
  thumbnailOverride,
  onPress,
  isActive,
}: LibraryRowProps) {
  const thumbStyle = [
    styles.thumb,
    shape === "circle" && styles.thumbCircle,
  ];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${subtitle}`}
    >
      {thumbnailOverride ? (
        <View style={thumbStyle}>{thumbnailOverride}</View>
      ) : artworkUrl ? (
        <Image source={{ uri: artworkUrl }} style={thumbStyle} contentFit="cover" />
      ) : (
        <View style={[thumbStyle, styles.thumbFallback]}>
          <Text style={styles.thumbInitial}>{title.charAt(0).toUpperCase()}</Text>
        </View>
      )}

      <View style={styles.textColumn}>
        <Text
          style={[typography.label, styles.title, isActive && styles.titleActive]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text style={[typography.caption, styles.subtitle]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.sm,
  },
  thumbCircle: {
    borderRadius: THUMB_SIZE / 2,
  },
  thumbFallback: {
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  thumbInitial: {
    color: colors.textSecondary,
    fontSize: moderateScale(18),
    fontWeight: "700",
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  title: {},
  titleActive: {
    color: colors.accent,
  },
  subtitle: {},
});
