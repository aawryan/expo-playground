import { useLocalSearchParams } from "expo-router";

import type { ContentSource } from "@/features/home/types/home-content";
import { PlaylistScreen } from "@/features/playlist/screens/playlist-screen";

export default function PlaylistRoute() {
  const { source, id } = useLocalSearchParams<{
    source: ContentSource;
    id: string;
  }>();
  return <PlaylistScreen source={source} id={id} />;
}
