import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius } from "@/lib/theme/spacing";
import { GrooveTexture } from "./groove-texture";

export function LikedSongsThumb() {
  return (
    <View style={styles.tile}>
      <GrooveTexture color="rgba(255,255,255,0.08)" />
      <LinearGradient
        colors={["rgba(255,255,255,0.06)", "transparent"]}
        style={StyleSheet.absoluteFill}
      />
      <Ionicons
        name="heart"
        size={moderateScale(20)}
        color={colors.textPrimary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: "100%",
    height: "100%",
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
