/** Which provider a piece of content came from — drives how we fetch its detail/stream URL later. */
export type ContentSource = "gaana" | "jiosaavn";

export type HomeLanguage = "Hindi" | "English";

export interface HomeArtwork {
  small?: string;
  medium?: string;
  large?: string;
}

export interface HomeTrack {
  id: string;
  source: ContentSource;
  title: string;
  artists: string;
  artwork: HomeArtwork;
  language?: string;
  /** Highest-quality playable stream URL we could resolve for this track, if any. */
  streamUrl?: string;
}

export interface HomeChart {
  id: string;
  source: ContentSource;
  title: string;
  subtitle?: string;
  artwork: HomeArtwork;
}

/** A performer/band — JioSaavn-only, same reasoning as `FollowedArtist`
 * in the library feature: Gaana's API has no artist entity of its own
 * (just a plain `artists: string` on a track), so there's no stable id
 * to key this by on that side. */
export interface HomeArtist {
  id: string;
  name: string;
  imageUrl?: string;
}

/** A single playable song inside a playlist/album/chart detail screen. */
export interface PlaylistSong {
  id: string;
  source: ContentSource;
  title: string;
  artists: string;
  artwork: HomeArtwork;
  durationSeconds?: number;
  streamUrl?: string;
}

/** Full detail payload for a playlist, album, or chart opened from the home feed. */
export interface PlaylistDetail {
  id: string;
  source: ContentSource;
  title: string;
  subtitle?: string;
  artwork: HomeArtwork;
  songs: PlaylistSong[];
}
