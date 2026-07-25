import { gaanaClient } from "@/lib/api/clients";
import type { HomeArtwork, HomeChart, HomeLanguage, HomeTrack } from "../types/home-content";

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

// Shape confirmed against the GaanaPy README's example track response
// (https://github.com/ZingyTomato/GaanaPy) — /songs/search, /trending
// and /newreleases all return this same track object.
interface GaanaTrackResponse {
  track_id: string;
  title: string;
  artists: string;
  language?: string;
  song_url?: string;
  images?: { urls?: GaanaArtworkUrls };
}

function normalizeTrack(raw: GaanaTrackResponse): HomeTrack {
  return {
    id: raw.track_id,
    title: raw.title,
    artists: raw.artists,
    language: raw.language,
    url: raw.song_url,
    artwork: normalizeArtwork(raw.images?.urls),
  };
}

export async function fetchTrending(lang: HomeLanguage): Promise<HomeTrack[]> {
  const { data } = await gaanaClient.get<GaanaTrackResponse[]>("/trending", {
    params: { lang },
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

export async function fetchNewReleases(lang: HomeLanguage): Promise<HomeTrack[]> {
  const { data } = await gaanaClient.get<GaanaNewReleasesResponse | GaanaTrackResponse[]>(
    "/newreleases",
    { params: { lang } },
  );
  const songs = Array.isArray(data) ? data : (data?.songs ?? []);
  return songs.map(normalizeTrack);
}

// NOTE: same caveat as above — /charts returns "a list of popular
// playlists" per the docs, but no example payload is published. Field
// names below (title/seokey/images) are inferred from the consistent
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
    title: raw.title,
    subtitle: raw.subtitle,
    artwork: normalizeArtwork(raw.images?.urls),
  }));
}
