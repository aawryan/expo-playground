export type MoodId =
  | "chill"
  | "energetic"
  | "focus"
  | "sad"
  | "party"
  | "nostalgic";

export interface MoodOption {
  id: MoodId;
  emoji: string;
  label: string;
}

/** Fixed, small palette rather than free text — keeps the heatmap legend
 * finite and the picker a single row instead of an open-ended input. */
export const MOOD_OPTIONS: readonly MoodOption[] = [
  { id: "chill", emoji: "😌", label: "Chill" },
  { id: "energetic", emoji: "⚡", label: "Energetic" },
  { id: "focus", emoji: "🎯", label: "Focus" },
  { id: "party", emoji: "🎉", label: "Party" },
  { id: "sad", emoji: "🌧️", label: "Sad" },
  { id: "nostalgic", emoji: "🕰️", label: "Nostalgic" },
];

export function moodOptionFor(id: MoodId | undefined): MoodOption | null {
  if (!id) return null;
  return MOOD_OPTIONS.find((option) => option.id === id) ?? null;
}
