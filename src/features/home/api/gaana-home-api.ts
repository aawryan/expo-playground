import { gaanaClient } from "@/lib/api/clients";
import type {
  HomeArtwork,
  HomeChart,
  HomeLanguage,
  HomeTrack,
  PlaylistDetail,
  PlaylistSong,
} from "../types/home-content";
import { fetchJiosaavnPlaylistDetailByName } from "./jiosaavn-home-api";

interface GaanaArtworkUrls {
  small_artwork?: string;
  medium_artwork?: string;
  large_artwork?: string;
}

function normalizeArtwork(urls?: GaanaArtworkUrls): HomeArtwork {
  return {
    small: urls?.small_artwork,
    medium: urls?.medium_artwork,
    large: urls?.large_artwork,
  };
}

interface GaanaStreamUrls {
  very_high_quality?: string;
  high_quality?: string;
  medium_quality?: string;
  low_quality?: string;
}

/** Picks the best available quality, falling back down the ladder. */
function highestQualityStreamUrl(urls?: GaanaStreamUrls): string | undefined {
  return (
    urls?.very_high_quality ??
    urls?.high_quality ??
    urls?.medium_quality ??
    urls?.low_quality
  );
}

// Shape confirmed against the GaanaPy README's example track response
// (https://github.com/ZingyTomato/GaanaPy) — /songs/search, /trending,
// /newreleases, and playlist/album song lists all return this same
// track object. Identity lives in `seokey` (not `track_id`), and the
// playable URL lives under `stream_urls.urls` (not a flat `song_url`).
interface GaanaTrackResponse {
  seokey: string;
  title: string;
  artists: string;
  language?: string;
  images?: { urls?: GaanaArtworkUrls };
  stream_urls?: { urls?: GaanaStreamUrls };
}

function normalizeTrack(raw: GaanaTrackResponse): HomeTrack {
  return {
    id: raw.seokey,
    source: "gaana",
    title: raw.title,
    artists: raw.artists,
    language: raw.language,
    artwork: normalizeArtwork(raw.images?.urls),
    streamUrl: highestQualityStreamUrl(raw.stream_urls?.urls),
  };
}

function normalizePlaylistSong(raw: GaanaTrackResponse): PlaylistSong {
  return {
    id: raw.seokey,
    source: "gaana",
    title: raw.title,
    artists: raw.artists,
    artwork: normalizeArtwork(raw.images?.urls),
    streamUrl: highestQualityStreamUrl(raw.stream_urls?.urls),
  };
}

// BUG FIX: the API requires the param named `language` (case-sensitive
// value, e.g. "Hindi"/"English") — this previously sent `lang`, which
// isn't a param the API recognises. Since `language` is required for
// both /trending and /newreleases, the missing-required-param request
// was failing validation and coming back as an error, which is why
// these two sections showed "load nahi ho paaye" while /charts (which
// takes no params) loaded fine.
//
// BUG FIX 2 (confirmed by reading GaanaPy's actual FastAPI source,
// github.com/ZingyTomato/GaanaPy/blob/main/app.py): every one of these
// three endpoints defaults `limit` to 10 server-side when the caller
// doesn't pass one — which is exactly why Trending/New Releases/Charts
// all felt thin. `MAX_LIMIT` there is 100; we ask for a generous chunk
// of that (not the max, to keep response time reasonable) rather than
// silently taking the API's default floor.
const GAANA_TRACK_LIMIT = 30;
const GAANA_CHART_LIMIT = 60;

export async function fetchTrending(
  language: HomeLanguage,
  limit = GAANA_TRACK_LIMIT,
): Promise<HomeTrack[]> {
  const { data } = await gaanaClient.get<GaanaTrackResponse[]>("/trending", {
    params: { language, limit },
  });
  return (data ?? []).map(normalizeTrack);
}

// NOTE: the GaanaPy docs don't publish a full example payload for
// /newreleases — going by the README description it returns new songs
// *and* new albums together for the language. We only surface the
// `songs` list on the home feed for now; if the live shape differs
// (e.g. a different key than `songs`), this is the one spot to adjust.
interface GaanaNewReleasesResponse {
  songs?: GaanaTrackResponse[];
  albums?: unknown[];
}

export async function fetchNewReleases(
  language: HomeLanguage,
  limit = GAANA_TRACK_LIMIT,
): Promise<HomeTrack[]> {
  const { data } = await gaanaClient.get<
    GaanaNewReleasesResponse | GaanaTrackResponse[]
  >("/newreleases", { params: { language, limit } });
  const songs = Array.isArray(data) ? data : (data?.songs ?? []);
  return songs.map(normalizeTrack);
}

// NOTE: same caveat as above — /charts returns "a list of popular
// playlists" per the docs, but no example payload is published. Field
// names below (seokey/title/images) are inferred from the consistent
// shape used elsewhere in the API; verify against a live response and
// adjust here if a field comes back under a different name.
//
// `language` IS confirmed real (present in GaanaPy's own
// format_json_charts output) — `subtitle` never was, it was a guess
// that always came back undefined. Using `language` instead means the
// card actually shows something instead of silently showing nothing.
interface GaanaChartResponse {
  seokey?: string;
  title: string;
  language?: string;
  images?: { urls?: GaanaArtworkUrls };
}

export async function fetchCharts(
  limit = GAANA_CHART_LIMIT,
): Promise<HomeChart[]> {
  const { data } = await gaanaClient.get<GaanaChartResponse[]>("/charts", {
    params: { limit },
  });
  return (data ?? []).map((raw, index) => ({
    id: raw.seokey ?? `chart-${index}`,
    source: "gaana" as const,
    title: raw.title,
    subtitle: raw.language,
    artwork: normalizeArtwork(raw.images?.urls),
  }));
}

// Playlist/chart detail — GaanaPy exposes `/playlists/info`, keyed by
// `seokey`, returning a `tracks` list of the same track object used
// everywhere else in the API.
//
// BUG FIX: this used to also fire `/albums/info` in parallel and fall
// back to whichever came back with tracks — on the theory that an
// occasional chart card's seokey might resolve as an album instead of a
// playlist. That theory doesn't hold: GaanaPy's own `/charts` route is
// documented as "charts are just playlists" (app.py:
// `summary="Retrieve the current top charts (charts are just
// playlists)"`) — every chart seokey IS a playlist seokey, never an
// album's. Calling `/albums/info` with a playlist's seokey doesn't
// reliably 404; it can come back with *some* unrelated album's data
// instead (Gaana's album lookup doesn't require an exact seokey match),
// which is exactly why a Top Charts card's title matched gaana.com but
// its songs didn't — the album fallback was winning whenever the real
// playlist call was merely slow or the ternary's ordering favored it.
// Only `/playlists/info` is called now; if that genuinely fails, we
// fall through to the JioSaavn name-search fallback below instead of a
// second guess at Gaana's own API.
interface GaanaDetailResponse {
  title: string;
  subtitle?: string;
  images?: { urls?: GaanaArtworkUrls };
  tracks?: GaanaTrackResponse[];
}

/** Loose equality for titles across two providers/APIs — lowercases,
 * strips everything but letters/digits, so "Hindi Top 50", "Hindi Top
 * 50!", and "hindi-top-50" all normalize the same way. */
function normalizeTitleForCompare(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function titlesRoughlyMatch(a: string, b: string): boolean {
  const normA = normalizeTitleForCompare(a);
  const normB = normalizeTitleForCompare(b);
  if (!normA || !normB) return false;
  return normA.includes(normB) || normB.includes(normA);
}

export async function fetchGaanaPlaylistDetail(
  seokey: string,
  knownTitle?: string,
): Promise<PlaylistDetail> {
  let data: GaanaDetailResponse | undefined;
  try {
    const response = await gaanaClient.get<GaanaDetailResponse>(
      "/playlists/info",
      { params: { seokey } },
    );
    const candidate = response.data;
    // BUG FIX: a non-empty `tracks` array was being treated as proof
    // this was the right playlist. It isn't — GaanaPy's `/playlists/info`
    // can come back with a completely different (but perfectly
    // well-formed, non-empty) playlist's data for a given seokey. This
    // is a real upstream data-integrity issue, not something fixable by
    // changing our request. The one thing we CAN check from our side:
    // we already know the chart's real title from `/charts` before this
    // screen even opens (`knownTitle`) — if what came back doesn't
    // reasonably match it, it's the wrong playlist, full stop, no matter
    // how many tracks it has. Skip `knownTitle`-checking only when we
    // genuinely don't have one to compare against.
    if (
      candidate?.tracks?.length &&
      (!knownTitle || titlesRoughlyMatch(candidate.title, knownTitle))
    ) {
      data = candidate;
    }
  } catch {
    // fall through to the JioSaavn fallback below
  }

  if (data) {
    return {
      id: seokey,
      source: "gaana",
      title: data.title,
      subtitle: data.subtitle,
      artwork: normalizeArtwork(data.images?.urls),
      songs: (data.tracks ?? []).map(normalizePlaylistSong),
    };
  }

  // The Gaana playlist lookup failed or came back empty — rather than
  // dead-ending on the error state, try the same content by name on
  // JioSaavn instead.
  //
  // BUG FIX: this used to search by a de-slugified seokey (e.g.
  // "gaana-dj-hindi-top-50-1" → "gaana dj hindi top 50 1"). That query
  // is full of noise — "gaana"/"dj" are Gaana's own branding words, not
  // part of the playlist's real name, and the trailing "-1" is an
  // internal edition/index suffix — so it was matching whatever
  // unrelated playlist scored best against that noise (that's how a
  // "Hindi Top 50" card ended up opening something like "Made by DJ
  // AD"). `knownTitle` is the same clean title already shown on the
  // card *before* this screen even opens (e.g. "Hindi Top 50" — the
  // real title, confirmed against gaana.com) — searching by that
  // instead is a real name lookup, not a guess from a slug. Only fall
  // back to de-slugifying the seokey if a title genuinely isn't
  // available (shouldn't normally happen from the home feed).
  const fallbackQuery = knownTitle ?? seokey.replace(/-/g, " ");
  const fallback = await fetchJiosaavnPlaylistDetailByName(fallbackQuery);
  if (fallback) return fallback;

  throw new Error("Gaana playlist detail returned no data.");
}
