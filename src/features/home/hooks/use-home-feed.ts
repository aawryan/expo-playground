import { useQueries, useQuery } from "@tanstack/react-query";

import { interleaveEqually } from "@/lib/utils/mix";
import {
  fetchCharts,
  fetchNewReleases,
  fetchTrending,
} from "../api/gaana-home-api";
import {
  fetchJiosaavnCharts,
  fetchJiosaavnNewReleases,
  fetchJiosaavnTrending,
} from "../api/jiosaavn-home-api";
import type { HomeChart, HomeLanguage, HomeTrack } from "../types/home-content";

const HOME_LANGUAGES: HomeLanguage[] = ["Hindi", "English"];

/**
 * Runs both providers in parallel and mixes their results equally via
 * `interleaveEqually`. Uses `allSettled` (not `all`) so a single failed
 * provider degrades gracefully to "show the other provider's results"
 * instead of failing the whole section — same resilience philosophy as
 * the existing per-language query split below.
 */
async function fetchMixed<T>(
  fetchers: Array<() => Promise<T[]>>,
): Promise<T[]> {
  const settled = await Promise.allSettled(fetchers.map((fetch) => fetch()));
  const lists = settled.map((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
  return lists.reduce((mixed, list) => interleaveEqually(mixed, list));
}

/** One query per language so a slow/failed language never blocks the other. */
export function useTrendingByLanguage() {
  return useQueries({
    queries: HOME_LANGUAGES.map((lang) => ({
      queryKey: ["home", "trending", lang] as const,
      queryFn: () =>
        fetchMixed<HomeTrack>([
          () => fetchTrending(lang),
          () => fetchJiosaavnTrending(lang),
        ]),
    })),
  });
}

export function useNewReleases() {
  return useQuery({
    queryKey: ["home", "new-releases"],
    queryFn: async () => {
      const perLanguage = await Promise.all(
        HOME_LANGUAGES.map((lang) =>
          fetchMixed<HomeTrack>([
            () => fetchNewReleases(lang),
            () => fetchJiosaavnNewReleases(lang),
          ]),
        ),
      );
      return perLanguage.flat();
    },
  });
}

export function useCharts() {
  return useQuery({
    queryKey: ["home", "charts"],
    queryFn: () => fetchMixed<HomeChart>([fetchCharts, fetchJiosaavnCharts]),
  });
}
