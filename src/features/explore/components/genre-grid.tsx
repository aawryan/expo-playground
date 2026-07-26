import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import { useResponsive } from "@/lib/responsive";
import { spacing } from "@/lib/theme/spacing";
import type { ExploreGenre } from "../types/explore-content";
import { GenreTile } from "./genre-tile";

interface GenreGridEntry {
  genre: ExploreGenre;
  artworkTrack?: { artwork: { small?: string; medium?: string; large?: string } };
}

interface GenreGridProps {
  entries: GenreGridEntry[];
  onGenrePress: (genre: ExploreGenre) => void;
}

export function GenreGrid({ entries, onGenrePress }: GenreGridProps) {
  const { gridColumns } = useResponsive();

  return (
    <FlashList
      data={entries}
      key={gridColumns}
      numColumns={gridColumns}
      keyExtractor={(item) => item.genre.id}
      scrollEnabled={false}
      contentContainerStyle={{ paddingHorizontal: spacing.lg }}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      renderItem={({ item, index }) => (
        <View
          style={{
            flex: 1,
            marginRight: (index + 1) % gridColumns === 0 ? 0 : spacing.md,
          }}
        >
          <GenreTile
            genre={item.genre}
            artworkUri={
              item.artworkTrack?.artwork.medium ??
              item.artworkTrack?.artwork.large ??
              item.artworkTrack?.artwork.small
            }
            onPress={onGenrePress}
          />
        </View>
      )}
    />
  );
}
