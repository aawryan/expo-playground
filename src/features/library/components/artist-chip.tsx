import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import type { FollowedArtist } from "../types/library-content";

const AVATAR_SIZE = moderateScale(64);

interface ArtistChipProps {
  artist: FollowedArtist;
  onPress?: (artist: FollowedArtist) => void;
}

export function ArtistChip({ artist, onPress }: ArtistChipProps) {
  return (
    <Pressable
      onPress={() => onPress?.(artist)}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={artist.name}
    >
      {artist.imageUrl ? (
        <Image
          source={{ uri: artist.imageUrl }}
          style={styles.avatar}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.initial}>
            {artist.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <Text style={[typography.caption, styles.name]} numberOfLines={1}>
        {artist.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: AVATAR_SIZE + spacing.sm,
    alignItems: "center",
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.6,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarFallback: {
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  initial: {
    color: colors.textSecondary,
    fontSize: moderateScale(22),
    fontWeight: "700",
  },
  name: {
    textAlign: "center",
  },
});
