import { useState, useEffect, useCallback, useRef } from "react";
import { flushSync } from "react-dom";

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

function supportsViewTransition(): boolean {
  return typeof document !== "undefined" && "startViewTransition" in document;
}

export function useViewTransition() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isSupported = supportsViewTransition();

  const triggerTransition = useCallback(
    (update: () => void) => {
      if (!isSupported || prefersReducedMotion) {
        update();
        return;
      }
      document.startViewTransition(() => {
        flushSync(update);
      });
    },
    [isSupported, prefersReducedMotion],
  );

  return { triggerTransition, isSupported, prefersReducedMotion };
}

export function useViewTransitionList<T>(items: T[]): T[] {
  const { triggerTransition } = useViewTransition();
  const [displayItems, setDisplayItems] = useState(items);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    triggerTransition(() => setDisplayItems(items));
  }, [items, triggerTransition]);

  return displayItems;
}
