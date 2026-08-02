import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import type { HomeArtist } from "../types/home-content";

const AVATAR_SIZE = moderateScale(96, 0.3);

interface ArtistTileProps {
  artist: HomeArtist;
  onPress?: (artist: HomeArtist) => void;
}

export function ArtistTile({ artist, onPress }: ArtistTileProps) {
  return (
    <Pressable
      onPress={() => onPress?.(artist)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={artist.name}
    >
      {artist.imageUrl ? (
        <Image
          source={{ uri: artist.imageUrl }}
          style={styles.avatar}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.initial}>
            {artist.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <Text style={[typography.label, styles.name]} numberOfLines={1}>
        {artist.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: AVATAR_SIZE,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.surface,
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  initial: {
    color: colors.textSecondary,
    fontSize: moderateScale(28),
    fontWeight: "700",
  },
  name: {
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
