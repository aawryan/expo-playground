import {
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDate,
  isSameMonth,
  isWeekend,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";

import type { HistoryEntry } from "@/features/library/types/library-content";
import type { MoodId } from "../types/mood";

/**
 * IMPORTANT DATA-MODEL CAVEAT — read before adding new stats here.
 *
 * `useLibraryStore`'s history is deliberately deduplicated: replaying a
 * track updates its existing entry's `playedAt` and moves it to the
 * front, rather than appending a new entry (see library-store.ts). That
 * means:
 *   - Every function below is really counting *distinct tracks per day*,
 *     never "how many times a track was played." There is no reliable
 *     play-count signal anywhere in this data.
 *   - History is capped at HISTORY_LIMIT (50) entries, so this whole
 *     module only ever "sees" a rolling window of recent activity, not a
 *     lifetime record. Streaks, milestones, etc. are framed accordingly
 *     (e.g. "tracks in rotation" rather than "tracks played ever").
 */

/** yyyy-MM-dd key derived from a timestamp — the grouping unit every
 * function in this module works in. */
export function dayKey(timestamp: number): string {
  return format(startOfDay(timestamp), "yyyy-MM-dd");
}

export interface DayActivity {
  dateKey: string;
  date: Date;
  entries: HistoryEntry[];
}

/** Buckets history entries by calendar day (most-recent-first per day,
 * since `history` itself is already most-recent-first). */
export function groupHistoryByDay(
  history: HistoryEntry[],
): Map<string, DayActivity> {
  const byDay = new Map<string, DayActivity>();
  for (const entry of history) {
    const key = dayKey(entry.playedAt);
    const existing = byDay.get(key);
    if (existing) {
      existing.entries.push(entry);
    } else {
      byDay.set(key, {
        dateKey: key,
        date: startOfDay(entry.playedAt),
        entries: [entry],
      });
    }
  }
  return byDay;
}

export interface StreakInfo {
  /** Consecutive days up to and including "today" (or "yesterday" if
   * today has no plays yet — see `activeToday`). */
  current: number;
  /** Longest consecutive run found anywhere in the (capped) history window. */
  longest: number;
  /** False when today itself has zero plays — the streak isn't broken
   * yet, but it will be at midnight unless something gets played. */
  activeToday: boolean;
}

/** Consecutive-day streak, walking backward from today. A day with no
 * plays yet doesn't reset the streak until it's actually over — so
 * "today, nothing played yet" still counts yesterday's run as current. */
export function computeStreak(
  byDay: Map<string, DayActivity>,
  today: Date = new Date(),
): StreakInfo {
  if (byDay.size === 0) {
    return { current: 0, longest: 0, activeToday: false };
  }

  const activeToday = byDay.has(dayKey(today.getTime()));
  let cursor = activeToday ? today : subDays(today, 1);
  let current = 0;
  while (byDay.has(dayKey(cursor.getTime()))) {
    current += 1;
    cursor = subDays(cursor, 1);
  }

  // Longest run anywhere in the known days, independent of today.
  const sortedDates = [...byDay.values()]
    .map((day) => day.date)
    .sort((a, b) => a.getTime() - b.getTime());
  let longest = 0;
  let run = 0;
  let previous: Date | null = null;
  for (const date of sortedDates) {
    run =
      previous && differenceInCalendarDays(date, previous) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = date;
  }

  return { current, longest: Math.max(longest, current), activeToday };
}

/** Consecutive *weekend* days (Sat/Sun) with activity, walking backward
 * from the most recent weekend day at-or-before today. Weekday listening
 * doesn't count toward or against this — it's a separate streak type
 * from `computeStreak`, not a filtered view of it. */
export function computeWeekendStreak(
  byDay: Map<string, DayActivity>,
  today: Date = new Date(),
  lookbackDays = 370,
): number {
  let cursor = today;
  let count = 0;

  for (let i = 0; i < lookbackDays; i++) {
    if (isWeekend(cursor)) {
      if (byDay.has(dayKey(cursor.getTime()))) {
        count += 1;
      } else {
        break;
      }
    }
    cursor = subDays(cursor, 1);
  }

  return count;
}

export interface MonthlyRecap {
  monthLabel: string;
  /** Distinct tracks first-played-this-month, per the dedup caveat above. */
  tracksPlayed: number;
  distinctDays: number;
  topArtist: { name: string; count: number } | null;
  busiestDay: { date: Date; count: number } | null;
}

/** Stats scoped to the calendar month containing `reference` (defaults
 * to now). Nothing here needs a network call — it's all derived from
 * whatever's already in the history array. */
export function computeMonthlyRecap(
  history: HistoryEntry[],
  reference: Date = new Date(),
): MonthlyRecap {
  const inMonth = history.filter((entry) =>
    isSameMonth(entry.playedAt, reference),
  );

  const dayKeysInMonth = new Set(inMonth.map((entry) => dayKey(entry.playedAt)));

  const artistCounts = new Map<string, number>();
  for (const entry of inMonth) {
    const name = entry.track.artists?.trim();
    if (!name) continue;
    artistCounts.set(name, (artistCounts.get(name) ?? 0) + 1);
  }
  let topArtist: MonthlyRecap["topArtist"] = null;
  for (const [name, count] of artistCounts) {
    if (!topArtist || count > topArtist.count) topArtist = { name, count };
  }

  const dayCounts = new Map<string, { date: Date; count: number }>();
  for (const entry of inMonth) {
    const key = dayKey(entry.playedAt);
    const existing = dayCounts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      dayCounts.set(key, { date: startOfDay(entry.playedAt), count: 1 });
    }
  }
  let busiestDay: MonthlyRecap["busiestDay"] = null;
  for (const day of dayCounts.values()) {
    if (!busiestDay || day.count > busiestDay.count) busiestDay = day;
  }

  return {
    monthLabel: format(reference, "MMMM yyyy"),
    tracksPlayed: inMonth.length,
    distinctDays: dayKeysInMonth.size,
    topArtist,
    busiestDay,
  };
}

export interface OnThisDayMemory {
  date: Date;
  entries: HistoryEntry[];
  monthsAgo: number;
}

/** Finds the most recent *past* day sharing today's day-of-month, if any
 * exists in the (capped) history window. Returns null rather than a
 * placeholder — callers should just not render the section. */
export function computeOnThisDay(
  byDay: Map<string, DayActivity>,
  today: Date = new Date(),
): OnThisDayMemory | null {
  const todayKey = dayKey(today.getTime());
  const todayDayOfMonth = getDate(today);

  const matches = [...byDay.values()]
    .filter(
      (day) =>
        day.dateKey !== todayKey &&
        day.date.getTime() < today.getTime() &&
        getDate(day.date) === todayDayOfMonth,
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const best = matches[0];
  if (!best) return null;

  const monthsAgo = Math.max(
    1,
    Math.round(differenceInCalendarDays(today, best.date) / 30),
  );

  return { date: best.date, entries: best.entries, monthsAgo };
}

export interface Milestone {
  id: string;
  threshold: number;
  label: string;
  achieved: boolean;
}

const MILESTONE_THRESHOLDS = [5, 15, 30, 50] as const;

/** Milestones framed around "tracks currently in rotation" (i.e.
 * `history.length`), not lifetime plays — see module doc comment for
 * why a true lifetime counter isn't available from this data. */
export function computeMilestones(history: HistoryEntry[]): Milestone[] {
  const count = history.length;
  return MILESTONE_THRESHOLDS.map((threshold) => ({
    id: `rotation-${threshold}`,
    threshold,
    label: `${threshold} tracks in rotation`,
    achieved: count >= threshold,
  }));
}

export interface HeatmapDay {
  date: Date;
  dateKey: string;
  inCurrentMonth: boolean;
  isToday: boolean;
  count: number;
}

/** Full 7-column grid (including the leading/trailing days from
 * adjacent months needed to fill whole weeks) for the month containing
 * `monthAnchor`. */
export function buildMonthGrid(
  byDay: Map<string, DayActivity>,
  monthAnchor: Date,
  today: Date = new Date(),
): HeatmapDay[] {
  const start = startOfWeek(startOfMonth(monthAnchor));
  const end = endOfWeek(endOfMonth(monthAnchor));
  const todayKey = dayKey(today.getTime());

  return eachDayOfInterval({ start, end }).map((date) => {
    const key = dayKey(date.getTime());
    return {
      date,
      dateKey: key,
      inCurrentMonth: isSameMonth(date, monthAnchor),
      isToday: key === todayKey,
      count: byDay.get(key)?.entries.length ?? 0,
    };
  });
}

export interface TopMood {
  mood: MoodId;
  count: number;
}

/** Most-tagged mood within the calendar month containing `reference`.
 * Moods live in a separate, purely-user-entered store (mood-store.ts) —
 * this stays independent of `history`/`byDay` on purpose, same reasoning
 * as the module doc comment: don't conflate "what was played" with
 * "how the user says they felt." */
export function computeTopMood(
  moodByDay: Record<string, MoodId>,
  reference: Date = new Date(),
): TopMood | null {
  const counts = new Map<MoodId, number>();
  for (const [key, mood] of Object.entries(moodByDay)) {
    if (!isSameMonth(parseISO(key), reference)) continue;
    counts.set(mood, (counts.get(mood) ?? 0) + 1);
  }

  let best: TopMood | null = null;
  for (const [mood, count] of counts) {
    if (!best || count > best.count) best = { mood, count };
  }
  return best;
}
