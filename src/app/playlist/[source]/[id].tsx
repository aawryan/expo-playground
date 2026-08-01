import { useLocalSearchParams } from "expo-router";

import type { ContentSource } from "@/features/home/types/home-content";
import { PlaylistScreen } from "@/features/playlist/screens/playlist-screen";

export default function PlaylistRoute() {
  const { source, id, title, artworkUrl } = useLocalSearchParams<{
    source: ContentSource;
    id: string;
    title?: string;
    artworkUrl?: string;
  }>();
  return (
    <PlaylistScreen
      source={source}
      id={id}
      knownTitle={title}
      knownArtworkUrl={artworkUrl}
    />
  );
}
