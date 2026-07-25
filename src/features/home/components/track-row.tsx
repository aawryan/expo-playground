import { FlashList } from "@shopify/flash-list";
import { StyleSheet } from "react-native";

import { spacing } from "@/lib/theme/spacing";
import type { HomeTrack } from "../types/home-content";
import { TrackCard } from "./track-card";

interface TrackRowProps {
  tracks: HomeTrack[];
  onTrackPress?: (track: HomeTrack) => void;
}

export function TrackRow({ tracks, onTrackPress }: TrackRowProps) {
  return (
    <FlashList
      data={tracks}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => <TrackCard track={item} onPress={onTrackPress} />}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});
