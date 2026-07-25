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
