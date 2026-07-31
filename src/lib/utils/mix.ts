/**
 * Interleaves two arrays 1-for-1 (a, b, a, b, ...) so neither source
 * dominates the front of a list. Used to give Gaana and JioSaavn equal
 * billing in the home feed instead of just concatenating one after the
 * other. Leftover items from the longer array are appended at the end.
 */
export function interleaveEqually<T>(a: T[], b: T[]): T[] {
  const result: T[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (i < a.length) result.push(a[i]);
    if (i < b.length) result.push(b[i]);
  }
  return result;
}

/**
 * Drops later items whose `key(item)` repeats one already kept, keeping
 * first-seen order. Gaana and JioSaavn each independently report largely
 * the same trending/new Bollywood tracks, but under different provider
 * ids (a Gaana `seokey` and a JioSaavn id are never equal for "the same"
 * song) — so an id-based Set wouldn't have caught this. The caller
 * should pass a key built from title+artist instead, which is what
 * actually identifies "the same song" across two different catalogs.
 */
export function dedupeByKey<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    result.push(item);
  }
  return result;
}
