import { fetchJiosaavnSongSearch } from "@/features/home/api/jiosaavn-home-api";
import type { HomeTrack } from "@/features/home/types/home-content";
import type { ExploreGenre } from "../types/explore-content";

/** Full track list for a genre tile — used by the genre detail screen and, at a small limit, by each tile's own background artwork. */
export function fetchGenreTracks(genre: ExploreGenre, limit = 20): Promise<HomeTrack[]> {
  return fetchJiosaavnSongSearch(genre.query, limit);
}

/** Free-text search, powering the search box. */
export function searchTracks(query: string, limit = 25): Promise<HomeTrack[]> {
  return fetchJiosaavnSongSearch(query, limit);
}
