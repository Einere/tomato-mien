import { useRef, useState, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";

// Module-level singleton so all useViewTransition instances share
// the same active transition. This prevents concurrent hook instances
// from racing on skipTransition() or leaving dangling data attributes.

let activeTransition: ViewTransition | null = null;

export type TransitionDirection =
  | "drill-forward"
  | "drill-backward"
  | "slide-left"
  | "slide-right";

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
    (update: () => void, direction?: TransitionDirection) => {
      if (!isSupported || prefersReducedMotion) {
        update();
        return;
      }

      // If a directional transition is already running and this call has no
      // direction, apply the DOM update directly to avoid interrupting the
      // ongoing animation (e.g. useViewTransitionList firing after a view change).
      if (!direction && document.documentElement.dataset.transitionDirection) {
        update();
        return;
      }

      if (activeTransition) {
        activeTransition.skipTransition();
      }

      if (direction) {
        document.documentElement.dataset.transitionDirection = direction;
      } else {
        delete document.documentElement.dataset.transitionDirection;
      }

      const transition = document.startViewTransition(() => {
        flushSync(update);
      });

      activeTransition = transition;

      transition.finished.finally(() => {
        if (activeTransition === transition) {
          delete document.documentElement.dataset.transitionDirection;
          activeTransition = null;
        }
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
