import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import { spacing } from "@/lib/theme/spacing";
import type { HomeTrack } from "../types/home-content";
import { TrackTile } from "./track-tile";

interface TrackRowProps {
  tracks: HomeTrack[];
  onTrackPress?: (track: HomeTrack) => void;
  /** Marks every tile as new-release — used by New Releases. */
  isNew?: boolean;
  /** Shows a 1-based rank badge on every tile — used by Top Charts. Real
   * horizontal FlashList virtualization here (rather than the old
   * non-scrolling multi-column grid nested in the outer ScrollView,
   * which had to render every item up front) is what keeps a 50+ item
   * chart light regardless of list length. */
  showRank?: boolean;
}

export function TrackRow({
  tracks,
  onTrackPress,
  isNew = false,
  showRank = false,
}: TrackRowProps) {
  return (
    <FlashList
      data={tracks}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: spacing.lg }}
      renderItem={({ item, index }) => (
        <View style={{ marginRight: spacing.md }}>
          <TrackTile
            track={item}
            onPress={onTrackPress}
            isNew={isNew}
            rank={showRank ? index + 1 : undefined}
          />
        </View>
      )}
    />
  );
}
