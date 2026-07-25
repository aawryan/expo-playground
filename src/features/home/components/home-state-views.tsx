import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { moderateScale, useResponsive } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";

const ROW_HEIGHT = moderateScale(168, 0.3) * 1.22 + moderateScale(48);

export function TrackRowSkeleton() {
  return (
    <View style={styles.skeletonRow}>
      {[0, 1, 2].map((key) => (
        <View key={key} style={[styles.skeletonCard, { height: ROW_HEIGHT }]} />
      ))}
    </View>
  );
}

export function ChartsGridSkeleton() {
  const { gridColumns } = useResponsive();
  return (
    <View style={styles.skeletonGrid}>
      {Array.from({ length: gridColumns * 2 }).map((_, index) => (
        <View key={index} style={[styles.skeletonTile, { aspectRatio: 0.88 }]} />
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
      <Ionicons name="cloud-offline-outline" size={moderateScale(22)} color={colors.textTertiary} />
      <Text style={[typography.body, styles.errorMessage]}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Ionicons name="refresh" size={moderateScale(14)} color={colors.accent} />
          <Text style={[typography.label, styles.retryLabel]}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function SectionLoadingView() {
  return <ChartsGridSkeleton />;
}

const styles = StyleSheet.create({
  skeletonRow: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  skeletonCard: {
    width: moderateScale(168, 0.3),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  skeletonTile: {
    flexBasis: "47%",
    flexGrow: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
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
