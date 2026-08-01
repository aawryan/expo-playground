import { Tabs } from "expo-router";

import { TabBar } from "@/components/ui/tab-bar";
import { ScrollToTopProvider } from "@/lib/navigation/scroll-to-top";
import { colors } from "@/lib/theme/colors";

export default function TabsLayout() {
  return (
    <ScrollToTopProvider>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
          // Without this the scene container defaults to a white card, so
          // every tab switch — fast or slow — has a chance of showing a
          // white flash before the screen's own background paints.
          sceneStyle: { backgroundColor: colors.screenBackground },
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="explore" options={{ title: "Explore" }} />
        <Tabs.Screen name="globe" options={{ title: "Globe" }} />
        <Tabs.Screen name="rewind" options={{ title: "Rewind" }} />
        <Tabs.Screen name="library" options={{ title: "Library" }} />
      </Tabs>
    </ScrollToTopProvider>
  );
}
