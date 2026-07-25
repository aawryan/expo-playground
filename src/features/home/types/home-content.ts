export type HomeLanguage = "Hindi" | "English";

export interface HomeArtwork {
  small?: string;
  medium?: string;
  large?: string;
}

export interface HomeTrack {
  id: string;
  title: string;
  artists: string;
  artwork: HomeArtwork;
  language?: string;
  url?: string;
}

export interface HomeChart {
  id: string;
  title: string;
  subtitle?: string;
  artwork: HomeArtwork;
}
