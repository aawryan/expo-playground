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
// `seokey`.
//
// BUG FIX (the real one): this was parsing the response as
// `{ title, subtitle, images, tracks: [...] }` — a wrapper object that
// was never confirmed against a live response (the docs don't publish
// an example for this endpoint) and turned out to be wrong. The actual
// response is a flat array of track objects, the exact same shape
// `/trending` and `/charts`'s song lists use (confirmed against a real
// `/playlists/info?seokey=gaana-dj-hindi-top-50-1` response). Since
// `response.data` was really an array, `response.data.tracks` was
// `undefined` on *every* call — the primary lookup silently "failed"
// every single time, for every chart, and the app was quietly falling
// through to the JioSaavn-by-name fallback below 100% of the time. Every
// previous fix here (parallel album lookup, title-matching, fallback
// query cleanup) was polishing that fallback without knowing the real
// Gaana data was never actually being read. Parsing it as the track
// array it actually is fixes the root cause directly.
//
// There's no playlist-level title/artwork in this response (it's just
// tracks) — `knownTitle`/`knownArtwork` (the chart's own title and cover
// art, already confirmed correct against gaana.com, passed in from the
// home feed before this screen even opens) are used for those instead
// of guessing from the track list.
export async function fetchGaanaPlaylistDetail(
  seokey: string,
  knownTitle?: string,
  knownArtwork?: HomeArtwork,
): Promise<PlaylistDetail> {
  let tracks: GaanaTrackResponse[] = [];
  try {
    const response = await gaanaClient.get<GaanaTrackResponse[]>(
      "/playlists/info",
      { params: { seokey } },
    );
    tracks = Array.isArray(response.data) ? response.data : [];
  } catch {
    // fall through to the JioSaavn fallback below
  }

  if (tracks.length > 0) {
    return {
      id: seokey,
      source: "gaana",
      title: knownTitle ?? tracks[0].title,
      subtitle: tracks[0].language,
      artwork: knownArtwork ?? normalizeArtwork(tracks[0].images?.urls),
      songs: tracks.map(normalizePlaylistSong),
    };
  }

  // The Gaana playlist lookup genuinely failed or came back empty —
  // rather than dead-ending on the error state, try the same content by
  // name on JioSaavn instead. `knownTitle` (the real chart title, e.g.
  // "Hindi Top 50") gives a real name lookup instead of a guess.
  const fallbackQuery = knownTitle ?? seokey.replace(/-/g, " ");
  const fallback = await fetchJiosaavnPlaylistDetailByName(fallbackQuery);
  if (fallback) return fallback;

  throw new Error("Gaana playlist detail returned no tracks.");
}
