import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { MoodId } from "../types/mood";

interface MoodState {
  /** Keyed by "yyyy-MM-dd" (see dayKey in ../lib/history-analytics). One
   * mood per day, purely a user annotation — never derived from listening
   * data, so it works even on days with zero plays. */
  moodByDay: Record<string, MoodId>;

  setMood: (dateKey: string, mood: MoodId) => void;
  clearMood: (dateKey: string) => void;
}

export const useMoodStore = create<MoodState>()(
  persist(
    (set) => ({
      moodByDay: {},

      setMood: (dateKey, mood) => {
        set((state) => ({
          moodByDay: { ...state.moodByDay, [dateKey]: mood },
        }));
      },

      clearMood: (dateKey) => {
        set((state) => {
          const next = { ...state.moodByDay };
          delete next[dateKey];
          return { moodByDay: next };
        });
      },
    }),
    {
      name: "rewind-moods",
      storage: createJSONStorage(() => AsyncStorage),
      // Independent from the library store's own version counter — this
      // is a separate persisted slice with its own shape to migrate.
      version: 1,
    },
  ),
);
