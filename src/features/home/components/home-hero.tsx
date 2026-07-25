import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import logoGlyph from "../../../../assets/images/android-icon-foreground.png";

const LOGO_SIZE = moderateScale(40);

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Deer raat 🌙";
  if (hour < 12) return "Good Morning ☀️";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Deer raat 🌙";
}

/**
 * Hero header for the home tab — a soft radial glow behind the brand
 * mark keeps the logo from reading as a flat sticker while staying true
 * to the icon's own slate/navy + light-glyph palette (see theme/colors.ts).
 */
export function HomeHero() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.accentMuted, "transparent"]}
        style={styles.glow}
        pointerEvents="none"
      />

      <View style={styles.row}>
        <View style={styles.textColumn}>
          <Text style={[typography.body, styles.eyebrow]}>{getGreeting()}</Text>
          <Text style={typography.h1}>Namaste 👋</Text>
        </View>

        <View style={styles.logoBadge}>
          <Image source={logoGlyph} style={styles.logo} contentFit="contain" />
        </View>
      </View>

      <Text style={[typography.body, styles.tagline]}>
        Yahan hai aapke liye kuch naya.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  glow: {
    position: "absolute",
    top: -moderateScale(40),
    right: -moderateScale(20),
    width: moderateScale(220),
    height: moderateScale(220),
    borderRadius: moderateScale(110),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textColumn: {
    gap: 2,
  },
  eyebrow: {
    color: colors.textTertiary,
  },
  logoBadge: {
    width: LOGO_SIZE + spacing.sm * 2,
    height: LOGO_SIZE + spacing.sm * 2,
    borderRadius: (LOGO_SIZE + spacing.sm * 2) / 2,
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  tagline: {
    marginTop: spacing.sm,
  },
});
