import { gaanaClient } from "@/lib/api/clients";
import type {
  HomeArtwork,
  HomeChart,
  HomeLanguage,
  HomeTrack,
  PlaylistDetail,
  PlaylistSong,
} from "../types/home-content";

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
  return urls?.very_high_quality ?? urls?.high_quality ?? urls?.medium_quality ?? urls?.low_quality;
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
export async function fetchTrending(language: HomeLanguage): Promise<HomeTrack[]> {
  const { data } = await gaanaClient.get<GaanaTrackResponse[]>("/trending", {
    params: { language },
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

export async function fetchNewReleases(language: HomeLanguage): Promise<HomeTrack[]> {
  const { data } = await gaanaClient.get<GaanaNewReleasesResponse | GaanaTrackResponse[]>(
    "/newreleases",
    { params: { language } },
  );
  const songs = Array.isArray(data) ? data : (data?.songs ?? []);
  return songs.map(normalizeTrack);
}

// NOTE: same caveat as above — /charts returns "a list of popular
// playlists" per the docs, but no example payload is published. Field
// names below (seokey/title/images) are inferred from the consistent
// shape used elsewhere in the API; verify against a live response and
// adjust here if a field comes back under a different name.
interface GaanaChartResponse {
  seokey?: string;
  title: string;
  subtitle?: string;
  images?: { urls?: GaanaArtworkUrls };
}

export async function fetchCharts(): Promise<HomeChart[]> {
  const { data } = await gaanaClient.get<GaanaChartResponse[]>("/charts");
  return (data ?? []).map((raw, index) => ({
    id: raw.seokey ?? `chart-${index}`,
    source: "gaana" as const,
    title: raw.title,
    subtitle: raw.subtitle,
    artwork: normalizeArtwork(raw.images?.urls),
  }));
}

// Playlist/chart/album detail — GaanaPy exposes both `/playlists/info`
// and `/albums/info`, both keyed by `seokey` and both returning a
// `tracks` list of the same track object used everywhere else in the
// API. We try playlist first (top charts entries are playlists) and
// fall back to album so this also works if a chart entry turns out to
// be album-shaped.
interface GaanaDetailResponse {
  title: string;
  subtitle?: string;
  images?: { urls?: GaanaArtworkUrls };
  tracks?: GaanaTrackResponse[];
}

export async function fetchGaanaPlaylistDetail(seokey: string): Promise<PlaylistDetail> {
  let data: GaanaDetailResponse;
  try {
    ({ data } = await gaanaClient.get<GaanaDetailResponse>("/playlists/info", {
      params: { seokey },
    }));
  } catch {
    ({ data } = await gaanaClient.get<GaanaDetailResponse>("/albums/info", {
      params: { seokey },
    }));
  }

  return {
    id: seokey,
    source: "gaana",
    title: data.title,
    subtitle: data.subtitle,
    artwork: normalizeArtwork(data.images?.urls),
    songs: (data.tracks ?? []).map(normalizePlaylistSong),
  };
}
