import { useQueries, useQuery } from "@tanstack/react-query";

import { fetchCharts, fetchNewReleases, fetchTrending } from "../api/gaana-home-api";
import type { HomeLanguage } from "../types/home-content";

const HOME_LANGUAGES: HomeLanguage[] = ["Hindi", "English"];

/** One query per language so a slow/failed language never blocks the other. */
export function useTrendingByLanguage() {
  return useQueries({
    queries: HOME_LANGUAGES.map((lang) => ({
      queryKey: ["home", "trending", lang] as const,
      queryFn: () => fetchTrending(lang),
    })),
  });
}

export function useNewReleases() {
  return useQuery({
    queryKey: ["home", "new-releases"],
    queryFn: async () => {
      const results = await Promise.all(HOME_LANGUAGES.map(fetchNewReleases));
      return results.flat();
    },
  });
}

export function useCharts() {
  return useQuery({
    queryKey: ["home", "charts"],
    queryFn: fetchCharts,
  });
}
