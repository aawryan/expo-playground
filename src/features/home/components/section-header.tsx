import { StyleSheet, Text, View } from "react-native";

import { spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={typography.h2}>{title}</Text>
      {subtitle ? (
        <Text style={[typography.body, styles.subtitle]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.xs / 2,
  },
  subtitle: {
    marginTop: -2,
  },
});
