import {
  fetchJiosaavnPlaylistDetailByName,
  fetchJiosaavnSongSearch,
} from "@/features/home/api/jiosaavn-home-api";
import type {
  HomeTrack,
  PlaylistSong,
} from "@/features/home/types/home-content";
import type { ExploreGenre } from "../types/explore-content";

function toHomeTrack(song: PlaylistSong): HomeTrack {
  return {
    id: song.id,
    source: song.source,
    title: song.title,
    artists: song.artists,
    artwork: song.artwork,
    streamUrl: song.streamUrl,
  };
}

/**
 * Full track list for a genre tile — used by the genre detail screen and,
 * at a small limit, by each tile's own background artwork.
 *
 * Tries a real curated JioSaavn playlist for the mood first (`playlistQuery`,
 * e.g. "Workout" or "Bhakti Hits") — an editorial playlist is what actually
 * carries popular/relevant tracks for a mood. Plain `/search/songs` only
 * matches literal song-title text, so a query like "Workout Gym Motivation
 * Hits" mostly surfaces whatever songs happen to have those words in their
 * title rather than songs people associate with the mood. Falls back to
 * that raw song search only if no matching playlist turns up.
 */
export async function fetchGenreTracks(
  genre: ExploreGenre,
  limit = 20,
): Promise<HomeTrack[]> {
  try {
    const playlist = await fetchJiosaavnPlaylistDetailByName(
      genre.playlistQuery,
    );
    if (playlist && playlist.songs.length > 0) {
      return playlist.songs.slice(0, limit).map(toHomeTrack);
    }
  } catch {
    // fall through to the song-search fallback below
  }

  return fetchJiosaavnSongSearch(genre.query, limit);
}

/** Free-text search, powering the search box. */
export function searchTracks(query: string, limit = 25): Promise<HomeTrack[]> {
  return fetchJiosaavnSongSearch(query, limit);
}
