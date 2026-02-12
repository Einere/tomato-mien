import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  usePrefersReducedMotion,
  useViewTransition,
  useViewTransitionList,
} from "@/hooks/useViewTransition";

function createMockMatchMedia(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  const mql = {
    matches,
    addEventListener: vi.fn(
      (_event: string, handler: (e: MediaQueryListEvent) => void) => {
        listeners.push(handler);
      },
    ),
    removeEventListener: vi.fn(
      (_event: string, handler: (e: MediaQueryListEvent) => void) => {
        const idx = listeners.indexOf(handler);
        if (idx >= 0) listeners.splice(idx, 1);
      },
    ),
  };
  return { mql, listeners };
}

describe("usePrefersReducedMotion", () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("prefers-reduced-motion이 활성화되어 있으면 true 반환", () => {
    const { mql } = createMockMatchMedia(true);
    window.matchMedia = vi.fn().mockReturnValue(mql);

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it("prefers-reduced-motion이 비활성화되어 있으면 false 반환", () => {
    const { mql } = createMockMatchMedia(false);
    window.matchMedia = vi.fn().mockReturnValue(mql);

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it("미디어 쿼리 변경 시 값이 업데이트됨", () => {
    const { mql, listeners } = createMockMatchMedia(false);
    window.matchMedia = vi.fn().mockReturnValue(mql);

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      listeners.forEach(fn => fn({ matches: true } as MediaQueryListEvent));
    });

    expect(result.current).toBe(true);
  });

  it("언마운트 시 이벤트 리스너를 제거함", () => {
    const { mql } = createMockMatchMedia(false);
    window.matchMedia = vi.fn().mockReturnValue(mql);

    const { unmount } = renderHook(() => usePrefersReducedMotion());
    unmount();

    expect(mql.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });
});

describe("useViewTransition", () => {
  let originalMatchMedia: typeof window.matchMedia;
  let originalStartViewTransition: typeof document.startViewTransition;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    originalStartViewTransition = document.startViewTransition;
    const { mql } = createMockMatchMedia(false);
    window.matchMedia = vi.fn().mockReturnValue(mql);
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    document.startViewTransition = originalStartViewTransition;
  });

  it("View Transition API 미지원 시 콜백을 직접 실행", () => {
    // jsdom에는 startViewTransition이 없으므로 기본적으로 미지원
    delete (document as Record<string, unknown>).startViewTransition;

    const { result } = renderHook(() => useViewTransition());
    const callback = vi.fn();

    act(() => {
      result.current.triggerTransition(callback);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isSupported).toBe(false);
  });

  it("prefers-reduced-motion 활성 시 콜백을 직접 실행 (transition 미사용)", () => {
    document.startViewTransition = vi.fn();
    const { mql } = createMockMatchMedia(true);
    window.matchMedia = vi.fn().mockReturnValue(mql);

    const { result } = renderHook(() => useViewTransition());
    const callback = vi.fn();

    act(() => {
      result.current.triggerTransition(callback);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(document.startViewTransition).not.toHaveBeenCalled();
    expect(result.current.prefersReducedMotion).toBe(true);
  });

  it("API 지원 + reduced-motion 비활성 시 startViewTransition 호출", () => {
    document.startViewTransition = vi.fn((cb: () => void) => {
      cb();
      return {
        finished: Promise.resolve(),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        skipTransition: vi.fn(),
      } as unknown as ViewTransition;
    });

    const { result } = renderHook(() => useViewTransition());
    const callback = vi.fn();

    act(() => {
      result.current.triggerTransition(callback);
    });

    expect(document.startViewTransition).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe("useViewTransitionList", () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    // 기본: reduced-motion 비활성, startViewTransition 미지원 (jsdom)
    const { mql } = createMockMatchMedia(false);
    window.matchMedia = vi.fn().mockReturnValue(mql);
    delete (document as Record<string, unknown>).startViewTransition;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("초기 렌더 시 입력 items를 그대로 반환", () => {
    const items = [{ id: "1" }, { id: "2" }];
    const { result } = renderHook(() => useViewTransitionList(items));
    expect(result.current).toEqual(items);
  });

  it("items 변경 시 displayItems가 업데이트됨", () => {
    const initial = [{ id: "1" }];
    const updated = [{ id: "1" }, { id: "2" }];

    const { result, rerender } = renderHook(
      ({ items }) => useViewTransitionList(items),
      { initialProps: { items: initial } },
    );

    expect(result.current).toEqual(initial);

    act(() => {
      rerender({ items: updated });
    });

    expect(result.current).toEqual(updated);
  });

  it("items가 빈 배열로 변경되면 빈 배열 반환", () => {
    const initial = [{ id: "1" }];
    const empty: { id: string }[] = [];

    const { result, rerender } = renderHook(
      ({ items }) => useViewTransitionList(items),
      { initialProps: { items: initial } },
    );

    act(() => {
      rerender({ items: empty });
    });

    expect(result.current).toEqual([]);
  });
});
