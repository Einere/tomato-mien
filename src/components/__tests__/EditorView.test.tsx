import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { EditorView } from "@/components/Editor/EditorView";
import { rulesAtom, viewAtom } from "@/store";
import type { AlarmRule } from "@/types/alarm";

function createTestRule(overrides?: Partial<AlarmRule>): AlarmRule {
  return {
    id: "test-rule-id",
    name: "Test Rule",
    enabled: true,
    condition: { type: "interval", intervalMinutes: 15 },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function renderEditorView(store: ReturnType<typeof createStore>) {
  return render(
    <Provider store={store}>
      <EditorView />
    </Provider>,
  );
}

describe("EditorView 삭제 confirm", () => {
  let store: ReturnType<typeof createStore>;
  let confirmSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    store = createStore();
    confirmSpy = vi.spyOn(window, "confirm");
  });

  it("Delete 버튼 클릭 시 confirm 다이얼로그를 표시한다", () => {
    confirmSpy.mockReturnValue(false);
    const rule = createTestRule();
    store.set(rulesAtom, [rule]);
    store.set(viewAtom, { view: "editor", ruleId: rule.id });

    renderEditorView(store);
    fireEvent.click(screen.getByRole("button", { name: /delete rule/i }));

    expect(confirmSpy).toHaveBeenCalledWith("이 규칙을 삭제하시겠습니까?");
  });

  it("confirm 승인 시 규칙이 삭제된다", () => {
    confirmSpy.mockReturnValue(true);
    const rule = createTestRule();
    store.set(rulesAtom, [rule]);
    store.set(viewAtom, { view: "editor", ruleId: rule.id });

    renderEditorView(store);
    fireEvent.click(screen.getByRole("button", { name: /delete rule/i }));

    expect(store.get(rulesAtom)).toHaveLength(0);
    expect(store.get(viewAtom)).toBe("dashboard");
  });

  it("confirm 거부 시 규칙이 삭제되지 않는다", () => {
    confirmSpy.mockReturnValue(false);
    const rule = createTestRule();
    store.set(rulesAtom, [rule]);
    store.set(viewAtom, { view: "editor", ruleId: rule.id });

    renderEditorView(store);
    fireEvent.click(screen.getByRole("button", { name: /delete rule/i }));

    expect(store.get(rulesAtom)).toHaveLength(1);
    expect(store.get(viewAtom)).toEqual({ view: "editor", ruleId: rule.id });
  });
});
