import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

/**
 * One player instance for the whole app — created once, then driven
 * imperatively (`.replace()`, `.play()`, `.pause()`) by the player
 * store below. A singleton (rather than one player per screen) is what
 * lets the mini-player keep playing as the user navigates between tabs
 * and into a playlist detail screen.
 */
export const audioPlayer = createAudioPlayer();

/** Call once at app startup — lets audio continue in the background and over the silent switch, matching the `UIBackgroundModes: ["audio"]` already declared in app.json. */
export async function configureAudioSession(): Promise<void> {
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: "duckOthers",
  });
}
