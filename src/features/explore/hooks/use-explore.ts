import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useDebouncedValue } from "@/lib/utils/use-debounced-value";
import { fetchGenreTracks, searchTracks } from "../api/explore-api";
import { EXPLORE_GENRES } from "../constants/genres";
import type { ExploreGenre } from "../types/explore-content";

/**
 * One small query per genre tile (limit 4) — just enough to pull a
 * representative artwork for the tile background without paying for a
 * full 20-track fetch on a screen that shows eight of these at once.
 */
export function useGenrePreviews() {
  const results = useQueries({
    queries: EXPLORE_GENRES.map((genre) => ({
      queryKey: ["explore", "genre-preview", genre.id] as const,
      queryFn: () => fetchGenreTracks(genre, 4),
      staleTime: 30 * 60 * 1000, // artwork picks don't need to be fresh
    })),
  });

  return useMemo(
    () =>
      EXPLORE_GENRES.map((genre, index) => ({
        genre,
        artworkTrack: results[index]?.data?.[0],
        isLoading: results[index]?.isLoading ?? false,
      })),
    [results],
  );
}

export function useGenreTracks(genreId: string | undefined) {
  const genre = EXPLORE_GENRES.find((g) => g.id === genreId);

  const query = useQuery({
    queryKey: ["explore", "genre-tracks", genreId],
    queryFn: () => fetchGenreTracks(genre as ExploreGenre, 30),
    enabled: Boolean(genre),
  });

  return { genre, ...query };
}

const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 400;

export function useSearchTracks(rawQuery: string) {
  const query = useDebouncedValue(rawQuery.trim(), SEARCH_DEBOUNCE_MS);
  const isEligible = query.length >= MIN_SEARCH_LENGTH;

  const result = useQuery({
    queryKey: ["explore", "search", query],
    queryFn: () => searchTracks(query),
    enabled: isEligible,
  });

  return {
    ...result,
    // While the person is still typing (rawQuery hasn't settled into
    // `query` yet), the query is technically idle rather than loading —
    // but the search box should still show a spinner, not an empty state.
    isSearching: rawQuery.trim().length >= MIN_SEARCH_LENGTH,
    isDebouncing: rawQuery.trim() !== query,
  };
}
