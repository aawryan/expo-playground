import type { HomeChart } from "../types/home-content";
import { MediaTile } from "./media-tile";

interface ChartTileProps {
  chart: HomeChart;
  rank?: number;
  fallbackLabel?: string;
  onPress?: (chart: HomeChart) => void;
}

export function ChartTile({
  chart,
  rank,
  fallbackLabel = "Playlist",
  onPress,
}: ChartTileProps) {
  return (
    <MediaTile
      artworkUri={
        chart.artwork.medium ?? chart.artwork.large ?? chart.artwork.small
      }
      title={chart.title}
      subtitle={chart.subtitle ?? fallbackLabel}
      onPress={() => onPress?.(chart)}
      accessibilityLabel={
        rank !== undefined ? `${chart.title}, rank ${rank}` : chart.title
      }
      rank={rank}
    />
  );
}
