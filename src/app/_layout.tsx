import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MiniPlayer } from "@/components/ui/mini-player";
import { TabBarTooltipHost } from "@/components/ui/tab-bar";
import { configureAudioSession } from "@/lib/audio/player";
import { queryClient } from "@/lib/query/query-client";
import { colors } from "@/lib/theme/colors";

export default function RootLayout() {
  useEffect(() => {
    configureAudioSession();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.screenBackground },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="playlist/[source]/[id]"
              options={{ presentation: "card" }}
            />
          </Stack>
          {/* Mounted above the Stack so playback controls stay visible whether the
              user is on a tab screen or inside a playlist detail screen. */}
          <MiniPlayer />
          {/* Mounted after MiniPlayer so a tab's long-press tooltip paints
              above it too — see TabBarTooltip's doc comment for why this
              is a plain sibling here instead of a native Modal. */}
          <TabBarTooltipHost />
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
