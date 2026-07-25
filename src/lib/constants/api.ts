/**
 * Single source of truth for every external API base URL used in the
 * app. Values come from `.env` (EXPO_PUBLIC_* vars are inlined at build
 * time by Expo) — nothing should read `process.env` directly outside
 * this file. Import `API_URLS` wherever a base URL is needed instead,
 * so there's exactly one place to update if a provider's URL changes.
 */
export const API_URLS = {
  GAANA_BASE_URL: process.env.EXPO_PUBLIC_GAANA_BASE_URL,
  JIOSAAVN_BASE_URL: process.env.EXPO_PUBLIC_JIOSAAVN_BASE_URL,
} as const;

if (__DEV__) {
  (Object.entries(API_URLS) as [string, string | undefined][]).forEach(([key, value]) => {
    if (!value) {
      console.warn(
        `[api] ${key} is not set — check that .env exists at the project root and the dev server was restarted after adding it.`,
      );
    }
  });
}
