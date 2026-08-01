import { useQuery } from "@tanstack/react-query";

import { fetchGaanaPlaylistDetail } from "@/features/home/api/gaana-home-api";
import { fetchJiosaavnPlaylistDetail } from "@/features/home/api/jiosaavn-home-api";
import type { ContentSource } from "@/features/home/types/home-content";

/** Routes to the right provider's detail fetch based on which source the card came from.
 * `knownTitle` (the chart card's already-correct title, passed in via
 * route params) lets the Gaana fallback search by real title text
 * instead of guessing one from the seokey — see `fetchGaanaPlaylistDetail`. */
export function usePlaylistDetail(
  source: ContentSource,
  id: string,
  knownTitle?: string,
) {
  return useQuery({
    queryKey: ["playlist-detail", source, id],
    queryFn: () =>
      source === "gaana"
        ? fetchGaanaPlaylistDetail(id, knownTitle)
        : fetchJiosaavnPlaylistDetail(id),
    enabled: Boolean(id),
  });
}
