import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { RuleCardList } from "@/components/Dashboard/RuleCardList";
import { rulesAtom, searchQueryAtom, sortOrderAtom } from "@/store";
import type { AlarmRule } from "@/types/alarm";

function createTestRule(overrides?: Partial<AlarmRule>): AlarmRule {
  return {
    id: crypto.randomUUID(),
    name: "Test Rule",
    enabled: true,
    triggers: [{ type: "interval", intervalMinutes: 15 }],
    filters: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    notificationEnabled: true,
    ...overrides,
  };
}

function renderWithStore(
  store: ReturnType<typeof createStore>,
  ui: React.ReactElement,
) {
  return render(<Provider store={store}>{ui}</Provider>);
}

describe("RuleCardList", () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    const mql = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    window.matchMedia = vi.fn().mockReturnValue(mql);
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("규칙이 없으면 빈 상태 메시지를 표시", () => {
    const store = createStore();
    store.set(rulesAtom, []);

    renderWithStore(store, <RuleCardList />);

    expect(screen.getByText("No rules yet.")).toBeInTheDocument();
    expect(
      screen.getByText('Tap "+ Create" to add your first rule.'),
    ).toBeInTheDocument();
  });

  it("규칙 목록을 렌더링", () => {
    const store = createStore();
    const rules = [
      createTestRule({ name: "Morning Alarm" }),
      createTestRule({ name: "Evening Alarm" }),
    ];
    store.set(rulesAtom, rules);

    renderWithStore(store, <RuleCardList />);

    expect(screen.getByText("Morning Alarm")).toBeInTheDocument();
    expect(screen.getByText("Evening Alarm")).toBeInTheDocument();
  });

  it("각 RuleCard에 view-transition-name 스타일이 적용됨", () => {
    const store = createStore();
    const rule = createTestRule({ id: "test-id-123", name: "Styled Rule" });
    store.set(rulesAtom, [rule]);

    const { container } = renderWithStore(store, <RuleCardList />);

    const wrapper = container.querySelector('[style*="view-transition-name"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute("style")).toContain(
      "view-transition-name: rule-card-test-id-123",
    );
  });

  it("검색 필터에 따라 규칙이 필터링됨", () => {
    const store = createStore();
    const rules = [
      createTestRule({ name: "Morning Alarm" }),
      createTestRule({ name: "Evening Alarm" }),
    ];
    store.set(rulesAtom, rules);
    store.set(searchQueryAtom, "Morning");

    renderWithStore(store, <RuleCardList />);

    expect(screen.getByText("Morning Alarm")).toBeInTheDocument();
    expect(screen.queryByText("Evening Alarm")).not.toBeInTheDocument();
  });

  it("정렬 순서에 따라 규칙이 정렬됨 (이름순)", () => {
    const store = createStore();
    const rules = [
      createTestRule({ name: "Zebra Rule" }),
      createTestRule({ name: "Alpha Rule" }),
    ];
    store.set(rulesAtom, rules);
    store.set(sortOrderAtom, "name");

    const { container } = renderWithStore(store, <RuleCardList />);

    const cards = container.querySelectorAll('[role="button"]');
    expect(cards[0]).toHaveTextContent("Alpha Rule");
    expect(cards[1]).toHaveTextContent("Zebra Rule");
  });
});
