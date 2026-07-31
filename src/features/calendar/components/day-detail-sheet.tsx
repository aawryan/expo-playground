import { Image } from "expo-image";
import { format, parseISO } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";
import type { HistoryEntry } from "@/features/library/types/library-content";
import { MOOD_OPTIONS, type MoodId } from "../types/mood";

interface DayDetailSheetProps {
  visible: boolean;
  dateKey: string | null;
  entries: HistoryEntry[];
  selectedMood?: MoodId;
  onClose: () => void;
  onSelectMood: (mood: MoodId) => void;
  onClearMood: () => void;
  onPlayTrack: (entry: HistoryEntry) => void;
}

export function DayDetailSheet({
  visible,
  dateKey,
  entries,
  selectedMood,
  onClose,
  onSelectMood,
  onClearMood,
  onPlayTrack,
}: DayDetailSheetProps) {
  const date = dateKey ? parseISO(dateKey) : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <SafeAreaView edges={["bottom"]} style={styles.sheet}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <Text style={typography.h2}>
              {date ? format(date, "EEEE, d MMM") : ""}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons
                name="close"
                size={moderateScale(22)}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>

          <Text style={[typography.caption, styles.moodEyebrow]}>
            Iss din ka mood
          </Text>
          <View style={styles.moodRow}>
            {MOOD_OPTIONS.map((mood) => {
              const active = selectedMood === mood.id;
              return (
                <Pressable
                  key={mood.id}
                  onPress={() =>
                    active ? onClearMood() : onSelectMood(mood.id)
                  }
                  style={({ pressed }) => [
                    styles.moodChip,
                    active && styles.moodChipActive,
                    pressed && styles.moodChipPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={mood.label}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {entries.length === 0 ? (
              <Text style={[typography.body, styles.emptyText]}>
                Iss din kuch nahi suna.
              </Text>
            ) : (
              entries.map((entry) => {
                const uri = entry.track.artworkUrl;
                return (
                  <Pressable
                    key={`${entry.track.source}:${entry.track.id}`}
                    onPress={() => onPlayTrack(entry)}
                    style={({ pressed }) => [
                      styles.trackRow,
                      pressed && styles.trackRowPressed,
                    ]}
                  >
                    {uri ? (
                      <Image
                        source={{ uri }}
                        style={styles.artwork}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.artwork, styles.artworkFallback]} />
                    )}
                    <View style={styles.trackText}>
                      <Text
                        style={typography.subtitle}
                        numberOfLines={1}
                      >
                        {entry.track.title}
                      </Text>
                      <Text
                        style={[typography.body, styles.trackArtists]}
                        numberOfLines={1}
                      >
                        {entry.track.artists}
                      </Text>
                    </View>
                    <Ionicons
                      name="play-circle-outline"
                      size={moderateScale(24)}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: colors.scrimStrong,
  },
  sheet: {
    backgroundColor: colors.screenBackgroundElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    maxHeight: "80%",
  },
  grabber: {
    alignSelf: "center",
    width: moderateScale(36),
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceBorder,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  moodEyebrow: {
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  moodRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  moodChip: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  moodChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  moodChipPressed: {
    opacity: 0.7,
  },
  moodEmoji: {
    fontSize: moderateScale(18),
  },
  list: {
    marginBottom: spacing.lg,
  },
  emptyText: {
    paddingVertical: spacing.lg,
    textAlign: "center",
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  trackRowPressed: {
    opacity: 0.7,
  },
  artwork: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: radius.sm,
  },
  artworkFallback: {
    backgroundColor: colors.surface,
  },
  trackText: {
    flex: 1,
    gap: 2,
  },
  trackArtists: {
    marginTop: -2,
  },
});
