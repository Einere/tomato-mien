import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { BottomNav } from "@/components/Layout/BottomNav";
import { viewAtom } from "@/store";

function renderBottomNav(store: ReturnType<typeof createStore>) {
  return render(
    <Provider store={store}>
      <BottomNav />
    </Provider>,
  );
}

function getTabButton(label: string): HTMLElement {
  const button = screen
    .getByText(label)
    .closest("button") as HTMLElement | null;
  expect(button).not.toBeNull();
  return button!;
}

describe("BottomNav", () => {
  it("Rules와 Settings 탭을 렌더링한다", () => {
    const store = createStore();
    renderBottomNav(store);

    expect(screen.getByText("Rules")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("dashboard 뷰일 때 Rules 탭이 활성화된다", () => {
    const store = createStore();
    store.set(viewAtom, "dashboard");
    renderBottomNav(store);

    expect(getTabButton("Rules")).toHaveAttribute("aria-current", "page");
    expect(getTabButton("Settings")).not.toHaveAttribute("aria-current");
  });

  it("settings 뷰일 때 Settings 탭이 활성화된다", () => {
    const store = createStore();
    store.set(viewAtom, "settings");
    renderBottomNav(store);

    expect(getTabButton("Settings")).toHaveAttribute("aria-current", "page");
    expect(getTabButton("Rules")).not.toHaveAttribute("aria-current");
  });

  it("editor 뷰일 때 Rules 탭이 활성화된다", () => {
    const store = createStore();
    store.set(viewAtom, "editor");
    renderBottomNav(store);

    expect(getTabButton("Rules")).toHaveAttribute("aria-current", "page");
    expect(getTabButton("Settings")).not.toHaveAttribute("aria-current");
  });

  it("Rules 탭 클릭 시 dashboard 뷰로 전환한다", () => {
    const store = createStore();
    store.set(viewAtom, "settings");
    renderBottomNav(store);

    fireEvent.click(screen.getByText("Rules"));
    expect(store.get(viewAtom)).toBe("dashboard");
  });

  it("Settings 탭 클릭 시 settings 뷰로 전환한다", () => {
    const store = createStore();
    store.set(viewAtom, "dashboard");
    renderBottomNav(store);

    fireEvent.click(screen.getByText("Settings"));
    expect(store.get(viewAtom)).toBe("settings");
  });

  it("nav 요소로 렌더링된다", () => {
    const store = createStore();
    renderBottomNav(store);

    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
