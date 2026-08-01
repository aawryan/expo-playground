import type {
  ContentSource,
  HomeTrack,
  PlaylistSong,
} from "@/features/home/types/home-content";

/**
 * Minimal, self-contained snapshot of a track — enough to re-render a
 * card/row and re-queue it for playback later, without needing to
 * re-fetch anything. This is what actually gets persisted to disk (via
 * AsyncStorage), so it's deliberately small rather than storing the
 * full HomeTrack/PlaylistSong shape.
 */
export interface LibraryTrack {
  id: string;
  source: ContentSource;
  title: string;
  artists: string;
  artworkUrl?: string;
  streamUrl?: string;
}

/** `${source}:${id}` — the stable identity used everywhere a track needs
 * a lookup key (liked-songs map, history dedup). Using id alone isn't
 * safe: Gaana's seokey and a JioSaavn id are drawn from two entirely
 * different id spaces and could theoretically collide. */
export function libraryTrackKey(track: {
  id: string;
  source: ContentSource;
}): string {
  return `${track.source}:${track.id}`;
}

/**
 * Followed-artist entity — JioSaavn-only for now. Gaana's API has no
 * artist entity of its own (just a plain `artists: string` field on a
 * track), so there's no stable id to follow on that side. `id` here is
 * always a JioSaavn artist id.
 */
export interface FollowedArtist {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface HistoryEntry {
  track: LibraryTrack;
  playedAt: number;
}

/** Adapts a LibraryTrack into the HomeTrack shape so the existing
 * TrackRow/TrackCard components can render it without modification —
 * only the artwork field shape actually differs. */
export function libraryTrackToHomeTrack(track: LibraryTrack): HomeTrack {
  return {
    id: track.id,
    source: track.source,
    title: track.title,
    artists: track.artists,
    artwork: { small: track.artworkUrl },
    streamUrl: track.streamUrl,
  };
}

/** Same idea as libraryTrackToHomeTrack, but for SongRow. */
export function libraryTrackToPlaylistSong(track: LibraryTrack): PlaylistSong {
  return {
    id: track.id,
    source: track.source,
    title: track.title,
    artists: track.artists,
    artwork: { small: track.artworkUrl },
    streamUrl: track.streamUrl,
  };
}
