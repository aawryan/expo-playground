import { useQueries, useQuery } from "@tanstack/react-query";

import { fetchGenreTracks } from "@/features/explore/api/explore-api";
import { EXPLORE_GENRES } from "@/features/explore/constants/genres";
import { dedupeByKey, interleaveEqually } from "@/lib/utils/mix";
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
 * A few of Explore's genre tiles pulled onto the home feed as their own
 * rows — same query/fetcher Explore already uses (fetchGenreTracks),
 * so this adds real variety (party/retro/devotional, as asked for)
 * without introducing any new, untested data path.
 */
const HOME_GENRE_IDS = ["bollywood-party", "retro", "devotional"] as const;
const HOME_GENRES = EXPLORE_GENRES.filter((genre) =>
  (HOME_GENRE_IDS as readonly string[]).includes(genre.id),
);

/**
 * Runs both providers in parallel and mixes their results equally via
 * `interleaveEqually`. Uses `allSettled` (not `all`) so a single failed
 * provider degrades gracefully to "show the other provider's results"
 * instead of failing the whole section — same resilience philosophy as
 * the existing per-language query split below.
 */
async function fetchMixed<T>(
  fetchers: Array<() => Promise<T[]>>,
  dedupeKey?: (item: T) => string,
): Promise<T[]> {
  const settled = await Promise.allSettled(fetchers.map((fetch) => fetch()));
  const lists = settled.map((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
  const mixed = lists.reduce((acc, list) => interleaveEqually(acc, list));
  return dedupeKey ? dedupeByKey(mixed, dedupeKey) : mixed;
}

/** Normalizes title+artist so "Kesariya" from Gaana and "Kesariya" from
 * JioSaavn collapse to one card instead of showing the same song twice
 * back to back, which is what an id-only check would have missed. */
const trackDedupeKey = (track: HomeTrack) =>
  `${track.title.trim().toLowerCase()}::${track.artists.trim().toLowerCase()}`;

const chartDedupeKey = (chart: HomeChart) => chart.title.trim().toLowerCase();

/** One query per language so a slow/failed language never blocks the other. */
export function useTrendingByLanguage() {
  return useQueries({
    queries: HOME_LANGUAGES.map((lang) => ({
      queryKey: ["home", "trending", lang] as const,
      queryFn: () =>
        fetchMixed<HomeTrack>(
          [() => fetchTrending(lang), () => fetchJiosaavnTrending(lang)],
          trackDedupeKey,
        ),
    })),
  });
}

export function useNewReleases() {
  return useQuery({
    queryKey: ["home", "new-releases"],
    queryFn: async () => {
      const perLanguage = await Promise.all(
        HOME_LANGUAGES.map((lang) =>
          fetchMixed<HomeTrack>(
            [
              () => fetchNewReleases(lang),
              () => fetchJiosaavnNewReleases(lang),
            ],
            trackDedupeKey,
          ),
        ),
      );
      // Also dedupe across the two language buckets themselves — a song
      // occasionally gets tagged under both Hindi and English between the
      // two providers, which would otherwise still show it twice.
      return dedupeByKey(perLanguage.flat(), trackDedupeKey);
    },
  });
}

export function useCharts() {
  return useQuery({
    queryKey: ["home", "charts"],
    queryFn: () =>
      fetchMixed<HomeChart>([fetchCharts, fetchJiosaavnCharts], chartDedupeKey),
  });
}

/** One row per curated genre (see HOME_GENRES above), each independently loading/erroring. */
export function useGenreRows() {
  const queries = useQueries({
    queries: HOME_GENRES.map((genre) => ({
      queryKey: ["home", "genre", genre.id] as const,
      queryFn: () => fetchGenreTracks(genre, 15),
    })),
  });

  return HOME_GENRES.map((genre, index) => ({
    genre,
    query: queries[index],
  }));
}
