import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import { useResponsive } from "@/lib/responsive";
import { spacing } from "@/lib/theme/spacing";
import type { HomeChart } from "../types/home-content";
import { ChartCard } from "./chart-card";

interface ChartsGridProps {
  charts: HomeChart[];
  onChartPress?: (chart: HomeChart) => void;
}

export function ChartsGrid({ charts, onChartPress }: ChartsGridProps) {
  // Reactive to rotation/foldables — a static scale() value wouldn't
  // update if the device rotates while the screen is mounted.
  const { gridColumns } = useResponsive();

  return (
    <FlashList
      data={charts}
      key={gridColumns}
      numColumns={gridColumns}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      contentContainerStyle={{ paddingHorizontal: spacing.lg }}
      ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
      renderItem={({ item, index }) => (
        <View
          style={{
            flex: 1,
            marginRight: (index + 1) % gridColumns === 0 ? 0 : spacing.md,
          }}
        >
          <ChartCard chart={item} rank={index + 1} onPress={onChartPress} />
        </View>
      )}
    />
  );
}
