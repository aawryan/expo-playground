import { addMonths, isSameMonth, subMonths } from "date-fns";
import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLibraryStore } from "@/features/library/store/library-store";
import type { HistoryEntry } from "@/features/library/types/library-content";
import { usePlayerStore } from "@/lib/audio/player-store";
import { useRegisterScrollToTop } from "@/lib/navigation/scroll-to-top";
import { colors } from "@/lib/theme/colors";
import { spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import {
  DayDetailSheet,
  ListeningHeatmap,
  MilestoneTimeline,
  MonthlyRecapCard,
  OnThisDayCard,
  RewindEmptyState,
  StreakCard,
} from "../components";
import {
  buildMonthGrid,
  computeMilestones,
  computeMonthlyRecap,
  computeOnThisDay,
  computeStreak,
  computeWeekendStreak,
  dayKey,
  groupHistoryByDay,
} from "../lib/history-analytics";
import { useMoodStore } from "../store/mood-store";

export function CalendarScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const history = useLibraryStore((state) => state.history);
  const moodByDay = useMoodStore((state) => state.moodByDay);
  const setMood = useMoodStore((state) => state.setMood);
  const clearMood = useMoodStore((state) => state.clearMood);
  const playTrack = usePlayerStore((state) => state.playTrack);

  const [monthAnchor, setMonthAnchor] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  useRegisterScrollToTop(
    "calendar",
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, []),
  );

  // Stable per-mount "now" — recomputing this every render would shift
  // day boundaries mid-session for no benefit.
  const today = useMemo(() => new Date(), []);
  const byDay = useMemo(() => groupHistoryByDay(history), [history]);

  const streak = useMemo(() => computeStreak(byDay, today), [byDay, today]);
  const weekendStreak = useMemo(
    () => computeWeekendStreak(byDay, today),
    [byDay, today],
  );
  const recap = useMemo(
    () => computeMonthlyRecap(history, today),
    [history, today],
  );
  const onThisDay = useMemo(
    () => computeOnThisDay(byDay, today),
    [byDay, today],
  );
  const milestones = useMemo(() => computeMilestones(history), [history]);
  const heatmapDays = useMemo(
    () => buildMonthGrid(byDay, monthAnchor, today),
    [byDay, monthAnchor, today],
  );

  const selectedDayEntries: HistoryEntry[] = selectedDateKey
    ? byDay.get(selectedDateKey)?.entries ?? []
    : [];

  function openDay(key: string) {
    setSelectedDateKey(key);
  }

  function closeDay() {
    setSelectedDateKey(null);
  }

  function handlePlayTrack(entry: HistoryEntry) {
    playTrack({
      id: entry.track.id,
      source: entry.track.source,
      title: entry.track.title,
      artists: entry.track.artists,
      artworkUrl: entry.track.artworkUrl,
      streamUrl: entry.track.streamUrl,
    });
  }

  const hasHistory = history.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={typography.h1}>Rewind</Text>
          <Text style={[typography.body, styles.headerSubtitle]}>
            Tumhara listening calendar, streaks aur memories.
          </Text>
        </View>

        {!hasHistory ? (
          <RewindEmptyState />
        ) : (
          <View style={styles.sections}>
            <StreakCard streak={streak} weekendStreak={weekendStreak} />

            {onThisDay ? (
              <OnThisDayCard
                memory={onThisDay}
                onPress={() => openDay(dayKey(onThisDay.date.getTime()))}
              />
            ) : null}

            <ListeningHeatmap
              monthAnchor={monthAnchor}
              days={heatmapDays}
              moodByDay={moodByDay}
              onSelectDay={openDay}
              onPrevMonth={() => setMonthAnchor((d) => subMonths(d, 1))}
              onNextMonth={() => setMonthAnchor((d) => addMonths(d, 1))}
              canGoNext={!isSameMonth(monthAnchor, today)}
            />

            <MonthlyRecapCard recap={recap} />

            <MilestoneTimeline milestones={milestones} />
          </View>
        )}
      </ScrollView>

      <DayDetailSheet
        visible={selectedDateKey !== null}
        dateKey={selectedDateKey}
        entries={selectedDayEntries}
        selectedMood={selectedDateKey ? moodByDay[selectedDateKey] : undefined}
        onClose={closeDay}
        onSelectMood={(mood) =>
          selectedDateKey && setMood(selectedDateKey, mood)
        }
        onClearMood={() => selectedDateKey && clearMood(selectedDateKey)}
        onPlayTrack={handlePlayTrack}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  scrollContent: {
    paddingBottom: spacing.xxl * 4,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.xs / 2,
  },
  headerSubtitle: {
    marginTop: -2,
  },
  sections: {
    gap: spacing.lg,
  },
});
