import type { ReactNode } from "react";

import { emptyArray } from "@/lib/utils/empty-array";
import { SectionErrorView } from "./home-state-views";

interface HomeSectionStateProps<T> {
  isLoading: boolean;
  isError: boolean;
  data: T[] | undefined;
  errorMessage: string;
  onRetry: () => void;
  renderSkeleton: () => ReactNode;
  renderContent: (data: T[]) => ReactNode;
}

export function HomeSectionState<T>({
  isLoading,
  isError,
  data,
  errorMessage,
  onRetry,
  renderSkeleton,
  renderContent,
}: HomeSectionStateProps<T>) {
  if (isLoading) return <>{renderSkeleton()}</>;
  if (isError) {
    return <SectionErrorView message={errorMessage} onRetry={onRetry} />;
  }
  return <>{renderContent(data ?? emptyArray<T>())}</>;
}
