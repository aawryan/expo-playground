import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { moderateScale } from "@/lib/responsive";
import { colors } from "@/lib/theme/colors";
import { radius, spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";

interface ExploreSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function ExploreSearchBar({
  value,
  onChangeText,
  placeholder = "Songs, artists, moods…",
}: ExploreSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.touchArea}>
      <BlurView
        intensity={isFocused ? 45 : 25}
        tint="dark"
        style={[styles.bar, isFocused && styles.barFocused]}
      >
        <Ionicons
          name="search"
          size={moderateScale(18)}
          color={isFocused ? colors.textPrimary : colors.textTertiary}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          style={[typography.body, styles.input]}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Search songs, artists, or moods"
        />
        {value.length > 0 ? (
          <Pressable
            onPress={() => onChangeText("")}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons
              name="close-circle"
              size={moderateScale(18)}
              color={colors.textTertiary}
            />
          </Pressable>
        ) : null}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  touchArea: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: moderateScale(46),
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    overflow: "hidden",
  },
  barFocused: {
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    padding: 0,
  },
});
