import { render, screen, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { SplashScreen } from "../SplashScreen";

describe("SplashScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("로고와 버전을 렌더링한다", () => {
    render(<SplashScreen />);
    expect(screen.getByText("Tomato Mien")).toBeInTheDocument();
  });

  it("로딩 멘트가 점(.)으로 끝난다", () => {
    render(<SplashScreen />);
    const loadingText = screen.getByText(/\.{1,3}$/);
    expect(loadingText).toBeInTheDocument();
  });

  it("800ms마다 점이 증가한다 (. → .. → ...)", () => {
    render(<SplashScreen />);

    const getDotsCount = () => {
      const el = screen.getByText(/\.{1,3}$/);
      const match = el.textContent?.match(/\.+$/);
      return match ? match[0].length : 0;
    };

    expect(getDotsCount()).toBe(1);

    act(() => vi.advanceTimersByTime(800));
    expect(getDotsCount()).toBe(2);

    act(() => vi.advanceTimersByTime(800));
    expect(getDotsCount()).toBe(3);
  });

  it("점 3개 후 다시 1개로 돌아가며 멘트가 변경된다", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<SplashScreen />);

    const getTextContent = () => screen.getByText(/\.{1,3}$/).textContent;

    // . → .. → ... → . (한 사이클 완료, 새 메시지)
    act(() => vi.advanceTimersByTime(800 * 3));

    const newText = getTextContent();
    // 점이 다시 1개로 리셋됨
    expect(newText).toMatch(/\.$/);
    expect(newText).not.toMatch(/\.{2,}$/);

    vi.spyOn(Math, "random").mockRestore();
  });

  it("에러 메시지가 있으면 표시한다", () => {
    render(<SplashScreen error="Load failed" />);
    expect(screen.getByText("Load failed")).toBeInTheDocument();
  });

  it("에러가 없으면 에러 영역이 없다", () => {
    render(<SplashScreen />);
    expect(screen.queryByText("Load failed")).not.toBeInTheDocument();
  });
});
