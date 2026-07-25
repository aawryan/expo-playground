import axios from "axios";

import { API_URLS } from "@/lib/constants/api";

/**
 * GaanaPy wrapper (velvet-tune-api) — used for curated/discovery feeds:
 * trending, new releases, top charts. Docs: https://velvet-tune-api.vercel.app/docs
 */
export const gaanaClient = axios.create({
  baseURL: API_URLS.GAANA_BASE_URL,
  timeout: 15_000,
});

/**
 * NepoTuneAPI (JioSaavn wrapper) — used for search, trending/new-release
 * discovery queries, and song/album/playlist lookups.
 * Docs: https://nepotuneapi.vercel.app/docs
 */
export const jiosaavnClient = axios.create({
  baseURL: API_URLS.JIOSAAVN_BASE_URL,
  timeout: 15_000,
});
