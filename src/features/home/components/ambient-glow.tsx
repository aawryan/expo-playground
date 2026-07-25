import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";

/**
 * Soft light pooling behind the top of the feed — the same glyph-light
 * glow color the tab bar uses for its indicator/"stage light" effect
 * (see tab-bar.tsx), not the cyan accent. Fixed (not scrolling) so it
 * reads as ambient lighting behind the glass rather than page content.
 */
export function AmbientGlow() {
  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={[colors.glowCore, colors.glowEdge]}
        style={[styles.blob, styles.blobPrimary]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <LinearGradient
        colors={[colors.glowCore, colors.glowEdge]}
        style={[styles.blob, styles.blobSecondary]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
    </View>
  );
}

const PRIMARY_SIZE = moderateScale(280);
const SECONDARY_SIZE = moderateScale(180);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    height: moderateScale(420),
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    opacity: 0.5,
  },
  blobPrimary: {
    width: PRIMARY_SIZE,
    height: PRIMARY_SIZE,
    borderRadius: PRIMARY_SIZE / 2,
    top: -PRIMARY_SIZE * 0.55,
    left: -PRIMARY_SIZE * 0.25,
  },
  blobSecondary: {
    width: SECONDARY_SIZE,
    height: SECONDARY_SIZE,
    borderRadius: SECONDARY_SIZE / 2,
    top: -SECONDARY_SIZE * 0.1,
    right: -SECONDARY_SIZE * 0.35,
  },
});
