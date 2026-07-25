import axios from "axios";

/**
 * GaanaPy wrapper (velvet-tune-api) — used for curated/discovery feeds:
 * trending, new releases, top charts. Docs: https://velvet-tune-api.vercel.app/docs
 */
export const gaanaClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_GAANA_BASE_URL,
  timeout: 15_000,
});

/**
 * NepoTuneAPI (JioSaavn wrapper) — used for search and song/artist/album
 * lookups. Docs: https://nepotuneapi.vercel.app/docs
 */
export const jiosaavnClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_JIOSAAVN_BASE_URL,
  timeout: 15_000,
});
