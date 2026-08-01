import { usePlayerStore } from "@/lib/audio/player-store";
import type { HomeTrack } from "../types/home-content";
import { MediaTile } from "./media-tile";

interface TrackTileProps {
  track: HomeTrack;
  onPress?: (track: HomeTrack) => void;
  isNew?: boolean;
  /** 1-based rank badge — used by the Top Charts row. */
  rank?: number;
}

/** A song tile — thin wrapper around MediaTile that adds the "currently
 * playing" highlight, which only makes sense for an actual queueable
 * track (not a chart/playlist card — see ChartTile). */
export function TrackTile({ track, onPress, isNew, rank }: TrackTileProps) {
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isActive = currentIndex >= 0 && queue[currentIndex]?.id === track.id;

  return (
    <MediaTile
      artworkUri={
        track.artwork.medium ?? track.artwork.large ?? track.artwork.small
      }
      title={track.title}
      subtitle={track.artists}
      onPress={() => onPress?.(track)}
      accessibilityLabel={`${track.title} by ${track.artists}`}
      isActive={isActive}
      isNew={isNew}
      rank={rank}
    />
  );
}
