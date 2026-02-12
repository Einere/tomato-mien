import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { createElement } from "react";
import { Provider, createStore } from "jotai";
import { useElectronMenu } from "@/hooks/useElectronMenu";
import { rulesAtom } from "@/store";
import type { AlarmRule } from "@/types/alarm";

function createTestRule(overrides?: Partial<AlarmRule>): AlarmRule {
  return {
    id: crypto.randomUUID(),
    name: "Test Rule",
    enabled: true,
    condition: { type: "interval", intervalMinutes: 15 },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

type MenuCallback = (event: unknown, action: string) => void;

function createMockElectronAPI() {
  let callback: MenuCallback | null = null;
  return {
    api: {
      onMenuAction: vi.fn((cb: MenuCallback) => {
        callback = cb;
      }),
      removeMenuListeners: vi.fn(),
    },
    trigger(action: string) {
      callback?.(null, action);
    },
  };
}

describe("useElectronMenu confirm", () => {
  let store: ReturnType<typeof createStore>;
  let confirmSpy: ReturnType<typeof vi.spyOn>;
  let mock: ReturnType<typeof createMockElectronAPI>;

  beforeEach(() => {
    store = createStore();
    confirmSpy = vi.spyOn(window, "confirm");
    mock = createMockElectronAPI();
    (window as Record<string, unknown>).electronAPI = mock.api;
  });

  afterEach(() => {
    delete (window as Record<string, unknown>).electronAPI;
  });

  function renderMenu() {
    return renderHook(() => useElectronMenu(), {
      wrapper: ({ children }) => createElement(Provider, { store }, children),
    });
  }

  describe("menu-enable-all-alarms", () => {
    it("confirm 승인 시 모든 규칙이 활성화된다", () => {
      confirmSpy.mockReturnValue(true);
      store.set(rulesAtom, [
        createTestRule({ enabled: false }),
        createTestRule({ enabled: false }),
      ]);

      renderMenu();
      mock.trigger("menu-enable-all-alarms");

      expect(confirmSpy).toHaveBeenCalledWith("Enable all rules?");
      expect(store.get(rulesAtom).every(r => r.enabled)).toBe(true);
    });

    it("confirm 거부 시 규칙 상태가 변경되지 않는다", () => {
      confirmSpy.mockReturnValue(false);
      store.set(rulesAtom, [
        createTestRule({ enabled: false }),
        createTestRule({ enabled: false }),
      ]);

      renderMenu();
      mock.trigger("menu-enable-all-alarms");

      expect(store.get(rulesAtom).every(r => !r.enabled)).toBe(true);
    });
  });

  describe("menu-disable-all-alarms", () => {
    it("confirm 승인 시 모든 규칙이 비활성화된다", () => {
      confirmSpy.mockReturnValue(true);
      store.set(rulesAtom, [
        createTestRule({ enabled: true }),
        createTestRule({ enabled: true }),
      ]);

      renderMenu();
      mock.trigger("menu-disable-all-alarms");

      expect(confirmSpy).toHaveBeenCalledWith("Disable all rules?");
      expect(store.get(rulesAtom).every(r => !r.enabled)).toBe(true);
    });

    it("confirm 거부 시 규칙 상태가 변경되지 않는다", () => {
      confirmSpy.mockReturnValue(false);
      store.set(rulesAtom, [
        createTestRule({ enabled: true }),
        createTestRule({ enabled: true }),
      ]);

      renderMenu();
      mock.trigger("menu-disable-all-alarms");

      expect(store.get(rulesAtom).every(r => r.enabled)).toBe(true);
    });
  });
});
