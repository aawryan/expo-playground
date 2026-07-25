import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import logoGlyph from "../../../../assets/images/android-icon-foreground.png";
import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";

const LOGO_SIZE = moderateScale(22);
const BADGE_SIZE = LOGO_SIZE + spacing.sm * 2;

/**
 * Minimal top bar — brand mark + a way into search. No greeting copy:
 * the feed itself is the "hello", not a text banner sitting on top of it.
 */
export function HomeHero() {
  const router = useRouter();

  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <View style={styles.logoBadge}>
          <Image source={logoGlyph} style={styles.logo} contentFit="contain" />
        </View>
        <Text style={[typography.caption, styles.eyebrow]}>FOR YOU</Text>
      </View>

      <Pressable
        onPress={() => router.push("/explore")}
        hitSlop={12}
        style={styles.searchButton}
        accessibilityRole="button"
        accessibilityLabel="Search"
      >
        <Ionicons name="search" size={moderateScale(18)} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoBadge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.indicator,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  eyebrow: {
    color: colors.textTertiary,
    letterSpacing: 1.2,
  },
  searchButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
  },
});
