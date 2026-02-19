import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { createElement } from "react";
import { Provider, createStore } from "jotai";
import { useElectronMenu } from "@/hooks/useElectronMenu";
import {
  rulesAtom,
  viewAtom,
  editorRuleIdAtom,
  settingsSubViewAtom,
} from "@/store";
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

describe("useElectronMenu", () => {
  let store: ReturnType<typeof createStore>;
  let confirmSpy: ReturnType<typeof vi.spyOn>;
  let mock: ReturnType<typeof createMockElectronAPI>;

  beforeEach(() => {
    store = createStore();
    confirmSpy = vi.spyOn(window, "confirm");
    mock = createMockElectronAPI();
    (window as unknown as Record<string, unknown>).electronAPI = mock.api;
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>).electronAPI;
  });

  function renderMenu() {
    return renderHook(() => useElectronMenu(), {
      wrapper: ({ children }) => createElement(Provider, { store }, children),
    });
  }

  describe("menu-new-rule", () => {
    it("새 규칙을 생성하고 editor 뷰로 이동한다", () => {
      store.set(rulesAtom, []);
      store.set(viewAtom, "dashboard");

      renderMenu();
      mock.trigger("menu-new-rule");

      const rules = store.get(rulesAtom);
      expect(rules).toHaveLength(1);
      expect(rules[0].name).toBe("New Rule");
      expect(store.get(viewAtom)).toBe("editor");
      expect(store.get(editorRuleIdAtom)).toBe(rules[0].id);
    });
  });

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

  describe("menu-about", () => {
    it("settings 뷰의 about 서브뷰로 이동한다", () => {
      store.set(viewAtom, "dashboard");

      renderMenu();
      mock.trigger("menu-about");

      expect(store.get(viewAtom)).toBe("settings");
      expect(store.get(settingsSubViewAtom)).toBe("about");
    });

    it("이미 settings 뷰에 있을 때도 about 서브뷰로 이동한다", () => {
      store.set(viewAtom, "settings");
      store.set(settingsSubViewAtom, "main");

      renderMenu();
      mock.trigger("menu-about");

      expect(store.get(viewAtom)).toBe("settings");
      expect(store.get(settingsSubViewAtom)).toBe("about");
    });
  });

  describe("cleanup", () => {
    it("언마운트 시 removeMenuListeners를 호출한다", () => {
      const { unmount } = renderMenu();

      expect(mock.api.removeMenuListeners).not.toHaveBeenCalled();
      unmount();
      expect(mock.api.removeMenuListeners).toHaveBeenCalledOnce();
    });
  });

  describe("electronAPI 없는 환경", () => {
    it("electronAPI가 없으면 에러 없이 동작한다", () => {
      delete (window as unknown as Record<string, unknown>).electronAPI;

      expect(() => renderMenu()).not.toThrow();
    });
  });
});
