import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { SongRow } from "@/features/playlist/components";
import type { HomeTrack } from "@/features/home/types/home-content";
import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";

interface SearchResultsListProps {
  query: string;
  tracks: HomeTrack[];
  isLoading: boolean;
  isError: boolean;
  activeTrackId?: string;
  isPlaying: boolean;
  onTrackPress: (track: HomeTrack, index: number) => void;
}

export function SearchResultsList({
  query,
  tracks,
  isLoading,
  isError,
  activeTrackId,
  isPlaying,
  onTrackPress,
}: SearchResultsListProps) {
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Ionicons
          name="cloud-offline-outline"
          size={moderateScale(24)}
          color={colors.textTertiary}
        />
        <Text style={[typography.body, styles.message]}>
          Search abhi load nahi ho paayi.
        </Text>
      </View>
    );
  }

  if (tracks.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons
          name="search-outline"
          size={moderateScale(24)}
          color={colors.textTertiary}
        />
        <Text style={[typography.body, styles.message]}>
          "{query}" ke liye kuch nahi mila.
        </Text>
      </View>
    );
  }

  return (
    <FlashList
      data={tracks}
      keyExtractor={(item) => `${item.source}-${item.id}`}
      contentContainerStyle={styles.listContent}
      renderItem={({ item, index }) => (
        <SongRow
          song={item}
          index={index}
          isActive={activeTrackId === item.id}
          isPlaying={activeTrackId === item.id && isPlaying}
          onPress={() => onTrackPress(item, index)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  message: {
    textAlign: "center",
  },
  listContent: {
    paddingBottom: spacing.xxl * 2,
  },
});
