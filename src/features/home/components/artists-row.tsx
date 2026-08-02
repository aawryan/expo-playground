import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import { spacing } from "@/lib/theme/spacing";
import type { HomeArtist } from "../types/home-content";
import { ArtistTile } from "./artist-tile";

interface ArtistsRowProps {
  artists: HomeArtist[];
  onArtistPress?: (artist: HomeArtist) => void;
}

export function ArtistsRow({ artists, onArtistPress }: ArtistsRowProps) {
  return (
    <FlashList
      data={artists}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: spacing.lg }}
      renderItem={({ item }) => (
        <View style={{ marginRight: spacing.lg }}>
          <ArtistTile artist={item} onPress={onArtistPress} />
        </View>
      )}
    />
  );
}
