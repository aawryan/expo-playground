import { jiosaavnClient } from "@/lib/api/clients";
import type {
  HomeArtwork,
  HomeChart,
  HomeLanguage,
  HomeTrack,
  PlaylistDetail,
  PlaylistSong,
} from "../types/home-content";

// NepoTuneAPI is built on the same well-documented JioSaavn-wrapper
// family as saavn.dev (search/song/album/playlist routes, `data.results`
// / `data.songs` envelopes). Confirmed against that family's published
// schema: https://saavn.sumit.co/docs — adjust here first if a live
// response comes back under different keys.
interface JiosaavnImage {
  quality?: string;
  url: string;
}

interface JiosaavnDownloadLink {
  quality?: string;
  url: string;
}

interface JiosaavnSongResponse {
  id: string;
  name: string;
  language?: string;
  artists?: { primary?: { name: string }[] };
  primaryArtists?: string;
  image?: JiosaavnImage[];
  downloadUrl?: JiosaavnDownloadLink[];
  duration?: number;
}

interface JiosaavnAlbumOrPlaylistResponse {
  id: string;
  name: string;
  language?: string;
  songCount?: number;
  image?: JiosaavnImage[];
  songs?: JiosaavnSongResponse[];
}

interface JiosaavnSearchEnvelope<T> {
  success?: boolean;
  data?: {
    total?: number;
    start?: number;
    results?: T[];
  };
}

interface JiosaavnDetailEnvelope<T> {
  success?: boolean;
  data?: T;
}

/** Image arrays are ordered smallest → largest; the last entry is the biggest we have. */
function bestArtwork(images?: JiosaavnImage[]): HomeArtwork {
  if (!images || images.length === 0) return {};
  return {
    small: images[0]?.url,
    medium: images[Math.floor(images.length / 2)]?.url,
    large: images[images.length - 1]?.url,
  };
}

/** Quality arrays are ordered lowest → highest bitrate; prefer an explicit 320kbps, else the last (highest) entry. */
function highestQualityUrl(links?: JiosaavnDownloadLink[]): string | undefined {
  if (!links || links.length === 0) return undefined;
  return (
    links.find((link) => link.quality === "320kbps")?.url ??
    links[links.length - 1]?.url
  );
}

function artistNames(song: JiosaavnSongResponse): string {
  if (song.primaryArtists) return song.primaryArtists;
  return (
    song.artists?.primary?.map((artist) => artist.name).join(", ") ??
    "Unknown Artist"
  );
}

function normalizeSong(raw: JiosaavnSongResponse): HomeTrack {
  return {
    id: raw.id,
    source: "jiosaavn",
    title: raw.name,
    artists: artistNames(raw),
    language: raw.language,
    artwork: bestArtwork(raw.image),
    streamUrl: highestQualityUrl(raw.downloadUrl),
  };
}

function normalizePlaylistSong(raw: JiosaavnSongResponse): PlaylistSong {
  return {
    id: raw.id,
    source: "jiosaavn",
    title: raw.name,
    artists: artistNames(raw),
    artwork: bestArtwork(raw.image),
    durationSeconds: raw.duration,
    streamUrl: highestQualityUrl(raw.downloadUrl),
  };
}

// The wrapper doesn't expose a dedicated "trending"/"home" endpoint (it
// mirrors JioSaavn's own search-first API surface) — so trending/new
// content is sourced via curated search queries per language instead.
// This is the one spot to swap in a real trending endpoint later if
// NepoTuneAPI adds one.
const TRENDING_QUERY: Record<HomeLanguage, string> = {
  Hindi: "Bollywood Trending",
  English: "English Trending Hits",
};

const NEW_RELEASES_QUERY: Record<HomeLanguage, string> = {
  Hindi: "New Hindi Songs",
  English: "New English Songs",
};

export async function fetchJiosaavnTrending(
  language: HomeLanguage,
): Promise<HomeTrack[]> {
  const { data } = await jiosaavnClient.get<
    JiosaavnSearchEnvelope<JiosaavnSongResponse>
  >("/search/songs", {
    params: { query: TRENDING_QUERY[language], limit: 10 },
  });
  return (data?.data?.results ?? []).map(normalizeSong);
}

/**
 * Generic song search — powers both Explore's live search box and its
 * genre/mood tiles (each genre is really just a curated query under the
 * hood, same as TRENDING_QUERY/NEW_RELEASES_QUERY above).
 */
export async function fetchJiosaavnSongSearch(
  query: string,
  limit = 20,
): Promise<HomeTrack[]> {
  const { data } = await jiosaavnClient.get<
    JiosaavnSearchEnvelope<JiosaavnSongResponse>
  >("/search/songs", { params: { query, limit } });
  return (data?.data?.results ?? []).map(normalizeSong);
}

export async function fetchJiosaavnNewReleases(
  language: HomeLanguage,
): Promise<HomeTrack[]> {
  const { data } = await jiosaavnClient.get<
    JiosaavnSearchEnvelope<JiosaavnSongResponse>
  >("/search/songs", {
    params: { query: NEW_RELEASES_QUERY[language], limit: 10 },
  });
  return (data?.data?.results ?? []).map(normalizeSong);
}

export async function fetchJiosaavnCharts(): Promise<HomeChart[]> {
  const { data } = await jiosaavnClient.get<
    JiosaavnSearchEnvelope<JiosaavnAlbumOrPlaylistResponse>
  >("/search/playlists", { params: { query: "Top Charts", limit: 8 } });

  return (data?.data?.results ?? []).map((raw) => ({
    id: raw.id,
    source: "jiosaavn" as const,
    title: raw.name,
    subtitle: raw.songCount ? `${raw.songCount} songs` : undefined,
    artwork: bestArtwork(raw.image),
  }));
}

export async function fetchJiosaavnPlaylistDetail(
  id: string,
): Promise<PlaylistDetail> {
  let data: JiosaavnAlbumOrPlaylistResponse | undefined;
  try {
    const response = await jiosaavnClient.get<
      JiosaavnDetailEnvelope<JiosaavnAlbumOrPlaylistResponse>
    >("/playlists", { params: { id } });
    data = response.data?.data;
  } catch {
    const response = await jiosaavnClient.get<
      JiosaavnDetailEnvelope<JiosaavnAlbumOrPlaylistResponse>
    >("/albums", { params: { id } });
    data = response.data?.data;
  }

  if (!data) {
    throw new Error("JioSaavn playlist/album detail returned no data.");
  }

  return {
    id: data.id,
    source: "jiosaavn",
    title: data.name,
    subtitle: data.songCount ? `${data.songCount} songs` : undefined,
    artwork: bestArtwork(data.image),
    songs: (data.songs ?? []).map(normalizePlaylistSong),
  };
}
