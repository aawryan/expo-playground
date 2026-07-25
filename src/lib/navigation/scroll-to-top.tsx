import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

type ScrollToTopHandler = () => void;

interface ScrollToTopContextValue {
  register: (routeName: string, handler: ScrollToTopHandler | null) => void;
  scrollToTop: (routeName: string) => void;
}

const ScrollToTopContext = createContext<ScrollToTopContextValue | null>(
  null,
);

/** Wrap the tab navigator with this once, near the top of the tree. */
export function ScrollToTopProvider({ children }: { children: ReactNode }) {
  // A plain ref-backed map, not state — registering/unregistering a
  // handler shouldn't itself trigger any re-render.
  const handlers = useRef(new Map<string, ScrollToTopHandler>());

  const register = useCallback(
    (routeName: string, handler: ScrollToTopHandler | null) => {
      if (handler) {
        handlers.current.set(routeName, handler);
      } else {
        handlers.current.delete(routeName);
      }
    },
    [],
  );

  const scrollToTop = useCallback((routeName: string) => {
    handlers.current.get(routeName)?.();
  }, []);

  return (
    <ScrollToTopContext.Provider value={{ register, scrollToTop }}>
      {children}
    </ScrollToTopContext.Provider>
  );
}

function useScrollToTopContext() {
  const ctx = useContext(ScrollToTopContext);
  if (!ctx) {
    throw new Error(
      "Scroll-to-top hooks must be used within a ScrollToTopProvider.",
    );
  }
  return ctx;
}

/**
 * Call from a screen to make double-tapping its own tab scroll it back
 * to the top. `routeName` must match the route's expo-router segment
 * name (e.g. "index", "explore"). Pass a stable callback (wrap in
 * useCallback) so this doesn't re-register on every render.
 */
export function useRegisterScrollToTop(
  routeName: string,
  handler: ScrollToTopHandler,
) {
  const { register } = useScrollToTopContext();

  useEffect(() => {
    register(routeName, handler);
    return () => register(routeName, null);
  }, [routeName, handler, register]);
}

/** Call from the tab bar to trigger whatever screen is registered for a route. */
export function useScrollToTop() {
  const { scrollToTop } = useScrollToTopContext();
  return scrollToTop;
}
