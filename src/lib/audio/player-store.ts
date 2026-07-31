import { create } from "zustand";

import type { ContentSource } from "@/features/home/types/home-content";
import { useLibraryStore } from "@/features/library/store/library-store";
import { audioPlayer } from "./player";

/** Minimal shape the player needs — both HomeTrack and PlaylistSong satisfy this already. */
export interface PlayerTrack {
  id: string;
  source: ContentSource;
  title: string;
  artists: string;
  artworkUrl?: string;
  streamUrl?: string;
}

interface PlayerState {
  queue: PlayerTrack[];
  currentIndex: number;
  isPlaying: boolean;
  /** True when the tapped track had no resolvable stream URL — surfaced by the mini-player as a toast/inline note. */
  lastError: string | null;
  /** Replaces the queue and starts playing at `startIndex` (e.g. a whole playlist, tapped at a specific song). */
  playQueue: (queue: PlayerTrack[], startIndex: number) => void;
  /** Plays a single track as a one-item queue (e.g. tapping a card on the home feed). */
  playTrack: (track: PlayerTrack) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  stop: () => void;
}

function loadAndPlay(track: PlayerTrack | undefined): boolean {
  if (!track?.streamUrl) return false;
  audioPlayer.replace({ uri: track.streamUrl });
  audioPlayer.play();
  return true;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  lastError: null,

  playQueue: (queue, startIndex) => {
    const track = queue[startIndex];
    const started = loadAndPlay(track);
    if (started && track) {
      useLibraryStore.getState().addToHistory({
        id: track.id,
        source: track.source,
        title: track.title,
        artists: track.artists,
        artworkUrl: track.artworkUrl,
        streamUrl: track.streamUrl,
      });
    }
    set({
      queue,
      currentIndex: startIndex,
      isPlaying: started,
      lastError: started ? null : "This track can't be streamed right now.",
    });
  },

  playTrack: (track) => {
    const started = loadAndPlay(track);
    if (started) {
      useLibraryStore.getState().addToHistory({
        id: track.id,
        source: track.source,
        title: track.title,
        artists: track.artists,
        artworkUrl: track.artworkUrl,
        streamUrl: track.streamUrl,
      });
    }
    set({
      queue: [track],
      currentIndex: 0,
      isPlaying: started,
      lastError: started ? null : "This track can't be streamed right now.",
    });
  },

  togglePlayPause: () => {
    const { isPlaying, queue, currentIndex } = get();
    if (currentIndex < 0 || !queue[currentIndex]) return;
    if (isPlaying) {
      audioPlayer.pause();
    } else {
      audioPlayer.play();
    }
    set({ isPlaying: !isPlaying });
  },

  playNext: () => {
    const { queue, currentIndex } = get();
    const nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      set({ isPlaying: false });
      return;
    }
    const track = queue[nextIndex];
    const started = loadAndPlay(track);
    if (started && track) {
      useLibraryStore.getState().addToHistory({
        id: track.id,
        source: track.source,
        title: track.title,
        artists: track.artists,
        artworkUrl: track.artworkUrl,
        streamUrl: track.streamUrl,
      });
    }
    set({ currentIndex: nextIndex, isPlaying: started });
  },

  playPrevious: () => {
    const { queue, currentIndex } = get();
    const prevIndex = currentIndex - 1;
    if (prevIndex < 0) return;
    const track = queue[prevIndex];
    const started = loadAndPlay(track);
    if (started && track) {
      useLibraryStore.getState().addToHistory({
        id: track.id,
        source: track.source,
        title: track.title,
        artists: track.artists,
        artworkUrl: track.artworkUrl,
        streamUrl: track.streamUrl,
      });
    }
    set({ currentIndex: prevIndex, isPlaying: started });
  },

  stop: () => {
    audioPlayer.pause();
    set({ queue: [], currentIndex: -1, isPlaying: false });
  },
}));
