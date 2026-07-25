import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";

const ROW_HEIGHT = moderateScale(140, 0.3) + moderateScale(48);

export function TrackRowSkeleton() {
  return (
    <View style={styles.skeletonRow}>
      {[0, 1, 2].map((key) => (
        <View key={key} style={styles.skeletonCard} />
      ))}
    </View>
  );
}

export function SectionErrorView({ message = "Couldn't load this section." }: { message?: string }) {
  return (
    <View style={styles.centered}>
      <Text style={[typography.body, { color: colors.danger }]}>{message}</Text>
    </View>
  );
}

export function SectionLoadingView() {
  return (
    <View style={[styles.centered, { height: ROW_HEIGHT }]}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonRow: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  skeletonCard: {
    width: moderateScale(140, 0.3),
    height: ROW_HEIGHT,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  centered: {
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    alignItems: "flex-start",
  },
});
