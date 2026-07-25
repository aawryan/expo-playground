import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { spacing } from "@/lib/theme/spacing";
import type { HomeTrack } from "../types/home-content";
import { TrackCard, type TrackCardVariant } from "./track-card";

interface TrackRowProps {
  tracks: HomeTrack[];
  onTrackPress?: (track: HomeTrack) => void;
  variant?: TrackCardVariant;
  /** Alternates every other card up/down — used for New Releases so it reads distinctly from Trending's flush row. */
  staggered?: boolean;
}

const STAGGER_OFFSET = moderateScale(18);

export function TrackRow({ tracks, onTrackPress, variant = "trending", staggered = false }: TrackRowProps) {
  return (
    <FlashList
      data={tracks}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        paddingHorizontal: spacing.lg,
        paddingTop: staggered ? STAGGER_OFFSET : 0,
        paddingBottom: staggered ? STAGGER_OFFSET : 0,
      }}
      renderItem={({ item, index }) => (
        <View
          style={{
            marginRight: spacing.md,
            marginTop: staggered && index % 2 === 1 ? STAGGER_OFFSET : 0,
          }}
        >
          <TrackCard track={item} onPress={onTrackPress} variant={variant} />
        </View>
      )}
    />
  );
}
