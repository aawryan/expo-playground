import { jiosaavnClient } from "@/lib/api/clients";
import { dedupeByKey, interleaveEqually } from "@/lib/utils/mix";
import type {
  HomeArtist,
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

export interface JiosaavnSongResponse {
  id: string;
  name: string;
  language?: string;
  artists?: { primary?: { id?: string; name: string }[] };
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

/** {id, name} pairs for a song's primary artists — the only side (of
 * Gaana/JioSaavn) with a real artist id, so this is what the Followed
 * Artists feature reads from instead of the display-only artistNames()
 * string above. Artists without an id (the API doesn't guarantee one on
 * every entry) are dropped since there'd be nothing stable to follow
 * them by. */
export function primaryArtistRefs(
  song: JiosaavnSongResponse,
): { id: string; name: string }[] {
  return (song.artists?.primary ?? []).filter(
    (artist): artist is { id: string; name: string } => Boolean(artist.id),
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
//
// BUG FIX: these queries used to literally contain the words "Trending"
// and "Top Charts" ("Bollywood Trending", "English Trending Hits", the
// /search/playlists query "Top Charts" below). JioSaavn's search matches
// query text against titles, so it was surfacing songs/playlists whose
// title *literally contains the word "Trending"* (random trending-
// megamix uploads, etc.) rather than genuinely trending music — that's
// the root cause of the odd/irrelevant titles. Replaced with real
// descriptive genre/mood queries. Each language also now mixes *two*
// distinct real queries instead of one static string, so the section
// isn't the exact same 10 results every single time the app opens.
const TRENDING_QUERIES: Record<HomeLanguage, [string, string]> = {
  Hindi: ["Bollywood Hit Songs", "Hindi Party Anthems"],
  English: ["English Pop Hits", "Billboard Hot Hits"],
};

const NEW_RELEASES_QUERIES: Record<HomeLanguage, [string, string]> = {
  Hindi: ["New Bollywood Songs", "Latest Hindi Music"],
  English: ["New English Songs", "Latest Pop Releases"],
};

/** Runs two same-provider query variants in parallel and interleaves them
 * — real variety instead of one static query's fixed top-N. The two
 * curated queries (e.g. "New Bollywood Songs" / "Latest Hindi Music")
 * routinely surface the same popular song under both, so this also
 * dedupes by id before returning — same-provider ids are a reliable
 * unique key here (unlike across Gaana/JioSaavn). Left undeduped, the
 * repeated id broke FlashList's keyExtractor and showed up as blank
 * cells in the row, not just a visibly repeated song. */
async function fetchTwoQueriesMixed(
  queries: [string, string],
  fetchOne: (query: string) => Promise<HomeTrack[]>,
): Promise<HomeTrack[]> {
  const [a, b] = await Promise.allSettled(queries.map(fetchOne));
  const mixed = interleaveEqually(
    a.status === "fulfilled" ? a.value : [],
    b.status === "fulfilled" ? b.value : [],
  );
  return dedupeByKey(mixed, (track) => track.id);
}

export async function fetchJiosaavnTrending(
  language: HomeLanguage,
): Promise<HomeTrack[]> {
  return fetchTwoQueriesMixed(TRENDING_QUERIES[language], (query) =>
    fetchJiosaavnSongSearch(query, 15),
  );
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
  return fetchTwoQueriesMixed(NEW_RELEASES_QUERIES[language], (query) =>
    fetchJiosaavnSongSearch(query, 15),
  );
}

const CHARTS_QUERIES: [string, string] = [
  "Bollywood Top Playlist",
  "English Top Playlist",
];

export async function fetchJiosaavnCharts(): Promise<HomeChart[]> {
  const fetchOne = async (query: string): Promise<HomeChart[]> => {
    const { data } = await jiosaavnClient.get<
      JiosaavnSearchEnvelope<JiosaavnAlbumOrPlaylistResponse>
    >("/search/playlists", { params: { query, limit: 15 } });
    return (data?.data?.results ?? []).map((raw) => ({
      id: raw.id,
      source: "jiosaavn" as const,
      title: raw.name,
      subtitle: raw.songCount ? `${raw.songCount} songs` : undefined,
      artwork: bestArtwork(raw.image),
    }));
  };

  const [a, b] = await Promise.allSettled(CHARTS_QUERIES.map(fetchOne));
  const mixed = interleaveEqually(
    a.status === "fulfilled" ? a.value : [],
    b.status === "fulfilled" ? b.value : [],
  );
  return dedupeByKey(mixed, (chart) => chart.id);
}

/**
 * Shape confirmed against the public docs for this same JioSaavn-wrapper
 * family (docs.saavn.me/search/albums) — a real example response, not a
 * guess. Reuses `JiosaavnAlbumOrPlaylistResponse`'s `image`/`songCount`
 * fields since albums follow the same `{quality, url}` image convention
 * as songs/playlists there. Not yet confirmed against a live response
 * from *this* app's actual NepoTuneAPI deployment though (same caveat as
 * every other endpoint here marked this way) — if an album card ever
 * shows a wrong/blank artist line or artwork, that's the first thing to
 * check against a real response.
 */
interface JiosaavnAlbumResponse extends JiosaavnAlbumOrPlaylistResponse {
  year?: string;
  primaryArtists?: { id?: string; name: string }[];
}

const ALBUM_QUERIES: [string, string] = ["Bollywood Album", "English Album"];

export async function fetchJiosaavnAlbums(): Promise<HomeChart[]> {
  const fetchOne = async (query: string): Promise<HomeChart[]> => {
    const { data } = await jiosaavnClient.get<
      JiosaavnSearchEnvelope<JiosaavnAlbumResponse>
    >("/search/albums", { params: { query, limit: 15 } });
    return (data?.data?.results ?? []).map((raw) => ({
      id: raw.id,
      source: "jiosaavn" as const,
      title: raw.name,
      subtitle:
        raw.primaryArtists?.map((artist) => artist.name).join(", ") || raw.year,
      artwork: bestArtwork(raw.image),
    }));
  };

  const [a, b] = await Promise.allSettled(ALBUM_QUERIES.map(fetchOne));
  const mixed = interleaveEqually(
    a.status === "fulfilled" ? a.value : [],
    b.status === "fulfilled" ? b.value : [],
  );
  return dedupeByKey(mixed, (album) => album.id);
}

/**
 * Shape confirmed against docs.saavn.me/search/artists — a real example
 * response. Important difference from every other entity in this file:
 * an artist's `image` array uses a `link` field, not `url` — reusing
 * `bestArtwork()` (which reads `.url`) here would silently produce all
 * `undefined` artwork, so this gets its own small parser instead.
 */
interface JiosaavnArtistImage {
  quality?: string;
  link: string;
}

interface JiosaavnArtistResponse {
  id: string;
  name: string;
  image?: JiosaavnArtistImage[];
}

function bestArtistImage(images?: JiosaavnArtistImage[]): string | undefined {
  if (!images || images.length === 0) return undefined;
  return images[images.length - 1]?.link;
}

const ARTIST_QUERIES: [string, string] = ["Bollywood Singers", "Pop Artists"];

export async function fetchJiosaavnArtists(): Promise<HomeArtist[]> {
  const fetchOne = async (query: string): Promise<HomeArtist[]> => {
    const { data } = await jiosaavnClient.get<
      JiosaavnSearchEnvelope<JiosaavnArtistResponse>
    >("/search/artists", { params: { query, limit: 15 } });
    return (data?.data?.results ?? []).map((raw) => ({
      id: raw.id,
      name: raw.name,
      imageUrl: bestArtistImage(raw.image),
    }));
  };

  const [a, b] = await Promise.allSettled(ARTIST_QUERIES.map(fetchOne));
  const mixed = interleaveEqually(
    a.status === "fulfilled" ? a.value : [],
    b.status === "fulfilled" ? b.value : [],
  );
  return dedupeByKey(mixed, (artist) => artist.id);
}

/**
 * Finds the closest-matching JioSaavn playlist for a free-text name and
 * returns its full track detail. Used as a cross-provider fallback (see
 * `fetchGaanaPlaylistDetail`) for the cases where a Gaana chart's seokey
 * resolves as neither a playlist nor an album on Gaana's own API — we'd
 * rather surface the same real playlist via JioSaavn than a dead end.
 * Picks the result with the most songs, since a same-name shell playlist
 * with 0-1 tracks is a worse match than a fuller one further down the
 * search results.
 */
export async function fetchJiosaavnPlaylistDetailByName(
  name: string,
): Promise<PlaylistDetail | undefined> {
  const { data } = await jiosaavnClient.get<
    JiosaavnSearchEnvelope<JiosaavnAlbumOrPlaylistResponse>
  >("/search/playlists", { params: { query: name, limit: 10 } });
  const results = data?.data?.results ?? [];
  if (results.length === 0) return undefined;

  const best = [...results].sort(
    (a, b) => (b.songCount ?? 0) - (a.songCount ?? 0),
  )[0];
  return fetchJiosaavnPlaylistDetail(best.id);
}

// BUG FIX (confirmed by reading NepoTuneAPI's actual route source,
// github.com/Sandipeyy/NepoTuneAPI — src/modules/playlists/controllers/
// playlist.controller.ts): /playlists defaults `limit` to 10 server-side
// when the caller doesn't pass one. This was called with no limit at
// all, which is exactly why every JioSaavn playlist/chart capped out at
// 10 playable songs no matter how big the real playlist was.
const JIOSAAVN_PLAYLIST_SONG_LIMIT = 50;

export async function fetchJiosaavnPlaylistDetail(
  id: string,
): Promise<PlaylistDetail> {
  let data: JiosaavnAlbumOrPlaylistResponse | undefined;
  try {
    const response = await jiosaavnClient.get<
      JiosaavnDetailEnvelope<JiosaavnAlbumOrPlaylistResponse>
    >("/playlists", { params: { id, limit: JIOSAAVN_PLAYLIST_SONG_LIMIT } });
    data = response.data?.data;
  } catch {
    const response = await jiosaavnClient.get<
      JiosaavnDetailEnvelope<JiosaavnAlbumOrPlaylistResponse>
    >("/albums", { params: { id, limit: JIOSAAVN_PLAYLIST_SONG_LIMIT } });
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
