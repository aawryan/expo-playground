import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import { GrooveTexture } from "./groove-texture";

interface QuickAccessTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  /** Slightly different base shade per tile so the two don't read as one
   * fused block — still entirely within the app's grayscale palette. */
  tone?: "elevated" | "raised";
  onPress: () => void;
}

export function QuickAccessTile({
  icon,
  title,
  subtitle,
  tone = "elevated",
  onPress,
}: QuickAccessTileProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        tone === "raised" ? styles.raised : styles.elevated,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${subtitle}`}
    >
      <GrooveTexture color="rgba(255,255,255,0.05)" />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.45)"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.iconBadge}>
        <Ionicons
          name={icon}
          size={moderateScale(18)}
          color={colors.textPrimary}
        />
      </View>

      <View>
        <Text style={[typography.title, styles.title]} numberOfLines={1}>
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
  tile: {
    flex: 1,
    height: moderateScale(120),
    borderRadius: radius.lg,
    padding: spacing.md,
    justifyContent: "space-between",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  elevated: {
    backgroundColor: colors.surfaceElevated,
  },
  raised: {
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.75,
  },
  iconBadge: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginBottom: 1,
  },
  subtitle: {
    color: colors.textOnImageMuted,
  },
});
