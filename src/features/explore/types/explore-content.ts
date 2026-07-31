import type { Ionicons } from "@expo/vector-icons";

/**
 * A "genre" here is really a curated search query wearing a mood's
 * clothing — the API layer has no real genre taxonomy, so each tile
 * maps to a hand-picked query that reliably returns the right vibe.
 * `id` doubles as the dynamic route param for the genre detail screen.
 */
export interface ExploreGenre {
  id: string;
  label: string;
  tagline: string;
  /** Free-text query for a plain song search — matches literally against song titles, so it's only a fallback (see `playlistQuery`). */
  query: string;
  /** Name to look up an actual curated JioSaavn playlist for this mood — real editorial playlists give far more popular/relevant tracks than title-text song search. */
  playlistQuery: string;
  icon: keyof typeof Ionicons.glyphMap;
}
