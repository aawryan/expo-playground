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
  query: string;
  icon: keyof typeof Ionicons.glyphMap;
}
