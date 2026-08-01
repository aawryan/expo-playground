import type { HomeChart } from "../types/home-content";
import { MediaTile } from "./media-tile";

interface ChartTileProps {
  chart: HomeChart;
  rank: number;
  onPress?: (chart: HomeChart) => void;
}

export function ChartTile({ chart, rank, onPress }: ChartTileProps) {
  return (
    <MediaTile
      artworkUri={
        chart.artwork.medium ?? chart.artwork.large ?? chart.artwork.small
      }
      title={chart.title}
      subtitle={chart.subtitle ?? "Playlist"}
      onPress={() => onPress?.(chart)}
      accessibilityLabel={`${chart.title}, rank ${rank}`}
      rank={rank}
    />
  );
}
