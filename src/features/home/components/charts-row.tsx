import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import { spacing } from "@/lib/theme/spacing";
import type { HomeChart } from "../types/home-content";
import { ChartTile } from "./chart-tile";

interface ChartsRowProps {
  charts: HomeChart[];
  onChartPress?: (chart: HomeChart) => void;
}

export function ChartsRow({ charts, onChartPress }: ChartsRowProps) {
  return (
    <FlashList
      data={charts}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: spacing.lg }}
      renderItem={({ item, index }) => (
        <View style={{ marginRight: spacing.md }}>
          <ChartTile chart={item} rank={index + 1} onPress={onChartPress} />
        </View>
      )}
    />
  );
}
