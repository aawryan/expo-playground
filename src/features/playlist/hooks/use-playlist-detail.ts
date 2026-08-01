import { useQuery } from "@tanstack/react-query";

import { fetchGaanaPlaylistDetail } from "@/features/home/api/gaana-home-api";
import { fetchJiosaavnPlaylistDetail } from "@/features/home/api/jiosaavn-home-api";
import type {
  ContentSource,
  HomeArtwork,
} from "@/features/home/types/home-content";

/** Routes to the right provider's detail fetch based on which source the card came from.
 * `knownTitle`/`knownArtwork` (the chart card's already-correct title
 * and cover art, passed in via route params) are what the Gaana path
 * uses for the playlist's title/artwork and its fallback search — see
 * `fetchGaanaPlaylistDetail`. */
export function usePlaylistDetail(
  source: ContentSource,
  id: string,
  knownTitle?: string,
  knownArtwork?: HomeArtwork,
) {
  return useQuery({
    queryKey: ["playlist-detail", source, id],
    queryFn: () =>
      source === "gaana"
        ? fetchGaanaPlaylistDetail(id, knownTitle, knownArtwork)
        : fetchJiosaavnPlaylistDetail(id),
    enabled: Boolean(id),
  });
}
