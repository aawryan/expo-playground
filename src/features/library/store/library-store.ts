import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  libraryTrackKey,
  type FollowedArtist,
  type HistoryEntry,
  type LibraryTrack,
} from "../types/library-content";

/** Recently-played entries kept, most-recent-first. Capped rather than
 * unbounded so AsyncStorage doesn't grow forever on a long-lived install. */
const HISTORY_LIMIT = 50;

interface LibraryState {
  /** Keyed by `${source}:${id}` (see libraryTrackKey) for O(1) like lookups. */
  likedSongs: Record<string, LibraryTrack>;
  /** Most-recent-first. A re-play of an already-present track moves it
   * back to the front instead of appending a second entry. */
  history: HistoryEntry[];
  /** Keyed by JioSaavn artist id — see FollowedArtist's doc comment for
   * why this is JioSaavn-only. */
  followedArtists: Record<string, FollowedArtist>;

  toggleLikeSong: (track: LibraryTrack) => void;
  isSongLiked: (track: Pick<LibraryTrack, "id" | "source">) => boolean;

  addToHistory: (track: LibraryTrack) => void;
  clearHistory: () => void;

  followArtist: (artist: FollowedArtist) => void;
  unfollowArtist: (artistId: string) => void;
  isArtistFollowed: (artistId: string) => boolean;
}

/** Liked songs as an array, most-recently-liked first. Relies on JS
 * object key insertion order (guaranteed here since keys are always
 * `source:id` strings, never bare numeric indices) rather than storing
 * a separate order array. */
export function getLikedSongsOrdered(state: LibraryState): LibraryTrack[] {
  return Object.values(state.likedSongs).reverse();
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      likedSongs: {},
      history: [],
      followedArtists: {},

      toggleLikeSong: (track) => {
        const key = libraryTrackKey(track);
        set((state) => {
          const next = { ...state.likedSongs };
          if (next[key]) {
            delete next[key];
          } else {
            next[key] = track;
          }
          return { likedSongs: next };
        });
      },

      isSongLiked: (track) => {
        return Boolean(get().likedSongs[libraryTrackKey(track)]);
      },

      addToHistory: (track) => {
        const key = libraryTrackKey(track);
        set((state) => {
          const withoutExisting = state.history.filter(
            (entry) => libraryTrackKey(entry.track) !== key,
          );
          const next = [
            { track, playedAt: Date.now() },
            ...withoutExisting,
          ].slice(0, HISTORY_LIMIT);
          return { history: next };
        });
      },

      clearHistory: () => set({ history: [] }),

      followArtist: (artist) => {
        set((state) => ({
          followedArtists: { ...state.followedArtists, [artist.id]: artist },
        }));
      },

      unfollowArtist: (artistId) => {
        set((state) => {
          const next = { ...state.followedArtists };
          delete next[artistId];
          return { followedArtists: next };
        });
      },

      isArtistFollowed: (artistId) => {
        return Boolean(get().followedArtists[artistId]);
      },
    }),
    {
      name: "library",
      storage: createJSONStorage(() => AsyncStorage),
      // Bump this if the persisted shape ever changes incompatibly —
      // gives a hook to migrate or reset old installs' saved data.
      version: 1,
    },
  ),
);
