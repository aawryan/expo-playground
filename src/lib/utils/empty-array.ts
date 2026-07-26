const SHARED_EMPTY_ARRAY: readonly never[] = Object.freeze([]);

/**
 * Returns one stable, shared empty-array reference typed as T[]. Every
 * `data ?? []` in a render body creates a *new* array literal each time,
 * which is a new prop reference into whatever consumes it (e.g. a
 * FlashList) even though the actual content — "nothing" — hasn't
 * changed. That defeats reference-equality checks the consumer might do
 * and causes needless re-work. This gives back the same reference every
 * call instead.
 */
export function emptyArray<T>(): T[] {
  return SHARED_EMPTY_ARRAY as unknown as T[];
}
