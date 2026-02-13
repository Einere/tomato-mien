import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";

vi.mock("@/db/migration", () => ({
  runMigration: vi.fn(),
}));

vi.mock("@/hooks/useTheme", () => ({
  useTheme: vi.fn(),
}));

vi.mock("@/hooks/useAlarmService", () => ({
  useAlarmService: vi.fn(),
}));

vi.mock("@/hooks/useElectronMenu", () => ({
  useElectronMenu: vi.fn(),
}));

import App from "@/App";
import { runMigration } from "@/db/migration";

describe("HydrationGate", () => {
  let migrationResolve: () => void;
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    vi.useFakeTimers();
    originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const promise = new Promise<void>(resolve => {
      migrationResolve = resolve;
    });
    vi.mocked(runMigration).mockReturnValue(promise);
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("마이그레이션 전에는 스플래시 화면을 표시한다", () => {
    render(<App />);
    expect(screen.getByText("Tomato Mien")).toBeInTheDocument();
  });

  it("마이그레이션 완료 후 메인 컨텐츠를 표시한다", async () => {
    render(<App />);

    await act(async () => {
      migrationResolve();
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // 2 rAFs
    await act(async () => {
      vi.advanceTimersByTime(32);
    });

    expect(screen.getByRole("heading", { name: "Rules" })).toBeInTheDocument();
  });

  it("fade-in 애니메이션 완료 후 animate-fade-in 클래스를 제거한다", async () => {
    const { container } = render(<App />);

    await act(async () => {
      migrationResolve();
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    await act(async () => {
      vi.advanceTimersByTime(32);
    });

    // animate-fade-in 클래스가 적용된 wrapper 확인
    const wrapper = container.querySelector(".animate-fade-in");
    expect(wrapper).not.toBeNull();

    // animationend 이벤트 발생
    await act(async () => {
      fireEvent.animationEnd(wrapper!);
    });

    // 클래스 제거 확인
    expect(container.querySelector(".animate-fade-in")).toBeNull();
    // 메인 컨텐츠는 여전히 표시
    expect(screen.getByRole("heading", { name: "Rules" })).toBeInTheDocument();
  });
});
