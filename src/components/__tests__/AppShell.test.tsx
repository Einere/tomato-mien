import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { AppShell } from "@/components/Layout/AppShell";
import { viewAtom } from "@/store";

vi.mock("@/hooks/useAlarmService", () => ({
  useAlarmService: vi.fn(),
}));

vi.mock("@/hooks/useElectronMenu", () => ({
  useElectronMenu: vi.fn(),
}));

function renderAppShell(store: ReturnType<typeof createStore>) {
  return render(
    <Provider store={store}>
      <AppShell />
    </Provider>,
  );
}

describe("AppShell 레이아웃", () => {
  it("main 영역과 BottomNav를 렌더링한다", () => {
    const store = createStore();
    renderAppShell(store);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  // Regression: min-h-screen → h-screen 변경으로 BottomNav 하단 고정
  it("컨테이너가 h-screen으로 뷰포트 높이에 고정된다", () => {
    const store = createStore();
    renderAppShell(store);

    const nav = screen.getByRole("navigation");
    const container = nav.closest(".h-screen");
    expect(container).not.toBeNull();
  });

  it("BottomNav가 main 영역 뒤에 위치한다", () => {
    const store = createStore();
    renderAppShell(store);

    const main = screen.getByRole("main");
    const nav = screen.getByRole("navigation");
    expect(main.nextElementSibling).toBe(nav);
  });

  it("dashboard 뷰에서 DashboardView를 렌더링한다", () => {
    const store = createStore();
    store.set(viewAtom, "dashboard");
    renderAppShell(store);

    expect(screen.getByRole("heading", { name: "Rules" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
  });
});
