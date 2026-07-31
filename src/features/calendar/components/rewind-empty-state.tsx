import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";

export function RewindEmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons
          name="calendar-outline"
          size={moderateScale(28)}
          color={colors.textTertiary}
        />
      </View>
      <Text style={[typography.title, styles.title]}>Nothing played yet</Text>
      <Text style={[typography.body, styles.subtitle]}>
        Play a few songs — your calendar, streaks, and milestones will start
        showing up here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
    gap: spacing.xs,
  },
  iconWrap: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
  },
});
