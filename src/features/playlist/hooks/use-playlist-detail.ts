import { useQuery } from "@tanstack/react-query";

import { fetchGaanaPlaylistDetail } from "@/features/home/api/gaana-home-api";
import { fetchJiosaavnPlaylistDetail } from "@/features/home/api/jiosaavn-home-api";
import type { ContentSource } from "@/features/home/types/home-content";

/** Routes to the right provider's detail fetch based on which source the card came from. */
export function usePlaylistDetail(source: ContentSource, id: string) {
  return useQuery({
    queryKey: ["playlist-detail", source, id],
    queryFn: () =>
      source === "gaana"
        ? fetchGaanaPlaylistDetail(id)
        : fetchJiosaavnPlaylistDetail(id),
    enabled: Boolean(id),
  });
}
