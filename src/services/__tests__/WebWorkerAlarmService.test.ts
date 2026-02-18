import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { AlarmEvent } from "@/types/alarm";

vi.mock("@/db/database", () => ({
  db: {
    rules: {
      get: vi.fn(),
    },
    settings: {
      get: vi.fn().mockResolvedValue({ timeFormat: "24h" }),
    },
  },
}));

vi.mock("../alarmSound", () => ({
  playAlarmSound: vi.fn(),
}));

let capturedOnMessage: ((event: { data: unknown }) => void) | null = null;

const mockPostMessage = vi.fn();
const mockTerminate = vi.fn();

// Worker를 function 키워드로 모킹 (new 키워드 지원)
vi.stubGlobal(
  "Worker",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function MockWorker(this: any) {
    this.postMessage = mockPostMessage;
    this.terminate = mockTerminate;

    // onmessage setter를 defineProperty로 캡처
    let _onmessage: ((event: { data: unknown }) => void) | null = null;
    Object.defineProperty(this, "onmessage", {
      get: () => _onmessage,
      set: (fn: ((event: { data: unknown }) => void) | null) => {
        _onmessage = fn;
        capturedOnMessage = fn;
      },
      configurable: true,
    });
  },
);

function createTestEvent(overrides?: Partial<AlarmEvent>): AlarmEvent {
  return {
    ruleId: "rule-1",
    ruleName: "Test Alarm",
    triggeredAt: new Date(),
    nextAlarmTime: { hour: 15, minute: 0 },
    ...overrides,
  };
}

describe("WebWorkerAlarmService", () => {
  let service: import("../WebWorkerAlarmService").WebWorkerAlarmService;

  beforeEach(async () => {
    vi.clearAllMocks();
    capturedOnMessage = null;

    const mod = await import("../WebWorkerAlarmService");
    // 싱글톤 초기화
    (mod.WebWorkerAlarmService as unknown as { instance: undefined }).instance =
      undefined;
    service = mod.WebWorkerAlarmService.getInstance();
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>).electronAPI;
    vi.restoreAllMocks();
  });

  describe("showNotification (via ALARM_TRIGGERED)", () => {
    it("Electron 환경: electronAPI.showNotification 호출", async () => {
      const { db } = await import("@/db/database");
      (db.rules.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notificationEnabled: true,
      });

      const mockShowNotification = vi.fn().mockResolvedValue({ success: true });
      (window as unknown as Record<string, unknown>).electronAPI = {
        showNotification: mockShowNotification,
        requestNotificationPermission: vi.fn(),
        onMenuAction: vi.fn(),
        removeMenuListeners: vi.fn(),
        platform: "darwin",
      };

      const event = createTestEvent();
      capturedOnMessage?.({ data: { type: "ALARM_TRIGGERED", data: event } });

      await vi.waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith("Test Alarm", {
          body: "Next: 15:00",
          icon: "/vite.svg",
        });
      });
    });

    it("브라우저 폴백: electronAPI 없으면 Web Notification 사용", async () => {
      const { db } = await import("@/db/database");
      (db.rules.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notificationEnabled: true,
      });

      delete (window as unknown as Record<string, unknown>).electronAPI;

      const MockNotification = vi.fn();
      Object.defineProperty(MockNotification, "permission", {
        value: "granted",
        configurable: true,
      });
      vi.stubGlobal("Notification", MockNotification);

      const event = createTestEvent();
      capturedOnMessage?.({ data: { type: "ALARM_TRIGGERED", data: event } });

      await vi.waitFor(() => {
        expect(MockNotification).toHaveBeenCalledWith("Test Alarm", {
          body: "Next: 15:00",
          icon: "/vite.svg",
          tag: "rule-1",
        });
      });
    });

    it("Electron IPC 실패 시 Web Notification으로 폴백", async () => {
      const { db } = await import("@/db/database");
      (db.rules.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notificationEnabled: true,
      });

      const mockShowNotification = vi
        .fn()
        .mockResolvedValue({ success: false, error: "not supported" });
      (window as unknown as Record<string, unknown>).electronAPI = {
        showNotification: mockShowNotification,
        requestNotificationPermission: vi.fn(),
        onMenuAction: vi.fn(),
        removeMenuListeners: vi.fn(),
        platform: "darwin",
      };

      const MockNotification = vi.fn();
      Object.defineProperty(MockNotification, "permission", {
        value: "granted",
        configurable: true,
      });
      vi.stubGlobal("Notification", MockNotification);

      const event = createTestEvent();
      capturedOnMessage?.({ data: { type: "ALARM_TRIGGERED", data: event } });

      await vi.waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalled();
        expect(MockNotification).toHaveBeenCalledWith("Test Alarm", {
          body: "Next: 15:00",
          icon: "/vite.svg",
          tag: "rule-1",
        });
      });
    });

    it("notificationEnabled=false 시 알림 안 보냄", async () => {
      const { db } = await import("@/db/database");
      (db.rules.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notificationEnabled: false,
      });

      const mockShowNotification = vi.fn();
      (window as unknown as Record<string, unknown>).electronAPI = {
        showNotification: mockShowNotification,
        requestNotificationPermission: vi.fn(),
        onMenuAction: vi.fn(),
        removeMenuListeners: vi.fn(),
        platform: "darwin",
      };

      const MockNotification = vi.fn();
      vi.stubGlobal("Notification", MockNotification);

      const event = createTestEvent();
      capturedOnMessage?.({ data: { type: "ALARM_TRIGGERED", data: event } });

      // playAlarmSound가 호출될 때까지 대기 후 알림이 호출되지 않았는지 확인
      const { playAlarmSound } = await import("../alarmSound");
      await vi.waitFor(() => {
        expect(playAlarmSound).toHaveBeenCalled();
      });
      expect(mockShowNotification).not.toHaveBeenCalled();
      expect(MockNotification).not.toHaveBeenCalled();
    });
  });

  describe("requestNotificationPermission", () => {
    it("Electron 환경: electronAPI.requestNotificationPermission 호출", async () => {
      const mockRequestPermission = vi.fn().mockResolvedValue(true);
      (window as unknown as Record<string, unknown>).electronAPI = {
        showNotification: vi.fn(),
        requestNotificationPermission: mockRequestPermission,
        onMenuAction: vi.fn(),
        removeMenuListeners: vi.fn(),
        platform: "darwin",
      };

      const result = await service.requestNotificationPermission();

      expect(mockRequestPermission).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("브라우저 폴백: Notification.requestPermission 사용", async () => {
      delete (window as unknown as Record<string, unknown>).electronAPI;

      const MockNotification = vi.fn();
      Object.defineProperty(MockNotification, "permission", {
        value: "default",
        configurable: true,
      });
      const mockRequestPermission = vi.fn().mockResolvedValue("granted");
      (
        MockNotification as unknown as Record<string, unknown>
      ).requestPermission = mockRequestPermission;
      vi.stubGlobal("Notification", MockNotification);

      const result = await service.requestNotificationPermission();

      expect(mockRequestPermission).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("브라우저: 이미 granted면 즉시 true 반환", async () => {
      delete (window as unknown as Record<string, unknown>).electronAPI;

      const MockNotification = vi.fn();
      Object.defineProperty(MockNotification, "permission", {
        value: "granted",
        configurable: true,
      });
      vi.stubGlobal("Notification", MockNotification);

      const result = await service.requestNotificationPermission();

      expect(result).toBe(true);
    });

    it("브라우저: denied면 즉시 false 반환", async () => {
      delete (window as unknown as Record<string, unknown>).electronAPI;

      const MockNotification = vi.fn();
      Object.defineProperty(MockNotification, "permission", {
        value: "denied",
        configurable: true,
      });
      vi.stubGlobal("Notification", MockNotification);

      const result = await service.requestNotificationPermission();

      expect(result).toBe(false);
    });
  });
});
