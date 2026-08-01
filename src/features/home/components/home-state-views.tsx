import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import { MEDIA_TILE_WIDTH } from "./media-tile";

export function TrackRowSkeleton() {
  return (
    <View style={styles.skeletonRow}>
      {[0, 1, 2, 3].map((key) => (
        <View key={key} style={styles.skeletonTile}>
          <View style={styles.skeletonArtwork} />
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
        </View>
      ))}
    </View>
  );
}

interface SectionErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export function SectionErrorView({
  message = "Couldn't load this section.",
  onRetry,
}: SectionErrorViewProps) {
  return (
    <View style={styles.errorContainer}>
      <Ionicons
        name="cloud-offline-outline"
        size={moderateScale(22)}
        color={colors.textTertiary}
      />
      <Text style={[typography.body, styles.errorMessage]}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryButtonPressed,
          ]}
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
      ) : null}
    </View>
  );
}

export function SectionLoadingView() {
  return <TrackRowSkeleton />;
}

const styles = StyleSheet.create({
  skeletonRow: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  skeletonTile: {
    width: MEDIA_TILE_WIDTH,
  },
  skeletonArtwork: {
    width: MEDIA_TILE_WIDTH,
    height: MEDIA_TILE_WIDTH,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  skeletonLine: {
    height: moderateScale(11),
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
  },
  skeletonLineShort: {
    width: "60%",
    marginTop: spacing.xs,
  },
  errorContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  errorMessage: {},
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.accentMuted,
  },
  retryButtonPressed: {
    opacity: 0.7,
  },
  retryLabel: {
    color: colors.accent,
  },
});
