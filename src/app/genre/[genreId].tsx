import { useLocalSearchParams } from "expo-router";

import { GenreScreen } from "@/features/explore/screens/genre-screen";

export default function GenreRoute() {
  const { genreId } = useLocalSearchParams<{ genreId: string }>();
  return <GenreScreen genreId={genreId} />;
}
