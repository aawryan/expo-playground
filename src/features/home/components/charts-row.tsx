import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import { spacing } from "@/lib/theme/spacing";
import type { HomeChart } from "../types/home-content";
import { ChartTile } from "./chart-tile";

interface ChartsRowProps {
  charts: HomeChart[];
  onChartPress?: (chart: HomeChart) => void;
  /** Numbered rank badges — appropriate for an actual Top Charts list,
   * not for a generic "browse these" row like Popular Albums. */
  showRank?: boolean;
  fallbackLabel?: string;
}

export function ChartsRow({
  charts,
  onChartPress,
  showRank = true,
  fallbackLabel,
}: ChartsRowProps) {
  return (
    <FlashList
      data={charts}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: spacing.lg }}
      renderItem={({ item, index }) => (
        <View style={{ marginRight: spacing.md }}>
          <ChartTile
            chart={item}
            rank={showRank ? index + 1 : undefined}
            fallbackLabel={fallbackLabel}
            onPress={onChartPress}
          />
        </View>
      )}
    />
  );
}
