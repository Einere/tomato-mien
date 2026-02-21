import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// 모듈 캐시 초기화를 위해 매 테스트마다 동적 import
let playAlarmSound: () => Promise<void>;

function createMockAudioContext(
  overrides?: Partial<{
    state: AudioContextState;
    currentTime: number;
    resumeImpl: () => Promise<void>;
  }>,
) {
  const oscillator = {
    connect: vi.fn(),
    frequency: { setValueAtTime: vi.fn() },
    type: "sine" as OscillatorType,
    start: vi.fn(),
    stop: vi.fn(),
  };

  const gainNode = {
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  };

  const context = {
    createOscillator: vi.fn(() => oscillator),
    createGain: vi.fn(() => gainNode),
    destination: {},
    currentTime: overrides?.currentTime ?? 0,
    state: (overrides?.state ?? "running") as AudioContextState,
    resume: vi.fn(
      overrides?.resumeImpl ??
        (() => {
          context.state = "running" as AudioContextState;
          return Promise.resolve();
        }),
    ),
  };

  return { context, oscillator, gainNode };
}

// stub한 window 프로퍼티 복원용
const originalProps: Record<string, unknown> = {};

function stubWindowProp(name: string, value: unknown) {
  if (!(name in originalProps)) {
    originalProps[name] = (window as unknown as Record<string, unknown>)[name];
  }
  Object.defineProperty(window, name, {
    value,
    writable: true,
    configurable: true,
  });
}

function restoreWindowProps() {
  for (const [name, value] of Object.entries(originalProps)) {
    Object.defineProperty(window, name, {
      value,
      writable: true,
      configurable: true,
    });
  }
  for (const key of Object.keys(originalProps)) {
    delete originalProps[key];
  }
}

beforeEach(async () => {
  // sharedAudioContext 캐시 초기화를 위해 모듈 재로드
  vi.resetModules();
  const mod = await import("../alarmSound");
  playAlarmSound = mod.playAlarmSound;
});

afterEach(() => {
  vi.restoreAllMocks();
  restoreWindowProps();
});

describe("playAlarmSound", () => {
  it("AudioContext 네이티브 스케줄링으로 핑 사운드를 3회 재생", async () => {
    const { context, oscillator } = createMockAudioContext();
    stubWindowProp("AudioContext", function () {
      return context;
    });

    await playAlarmSound();

    // setTimeout 없이 즉시 3개 oscillator 생성
    expect(context.createOscillator).toHaveBeenCalledTimes(3);

    // 각 핑의 시작 시간이 0.3초 간격으로 스케줄됨
    expect(oscillator.start).toHaveBeenCalledTimes(3);
    expect(oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(500, 0);
    expect(oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(500, 0.3);
    expect(oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(500, 0.6);
  });

  it("gain 엔벨로프를 올바르게 설정 (attack → decay)", async () => {
    const { context, gainNode } = createMockAudioContext();
    stubWindowProp("AudioContext", function () {
      return context;
    });

    await playAlarmSound();

    // 첫 번째 핑 (startTime=0)의 엔벨로프 확인
    expect(gainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
    expect(gainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      0.3,
      0.01,
    );
    expect(gainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
      0.01,
      0.5,
    );
  });

  it("suspended 상태이면 resume()을 호출", async () => {
    const { context } = createMockAudioContext({ state: "suspended" });
    stubWindowProp("AudioContext", function () {
      return context;
    });

    await playAlarmSound();

    expect(context.resume).toHaveBeenCalled();
  });

  it("resume 후에도 running이 아니면 새 컨텍스트 생성", async () => {
    let callCount = 0;

    // 첫 번째 컨텍스트: resume 해도 suspended 유지
    const stuckContext = createMockAudioContext({
      state: "suspended",
      resumeImpl: () => Promise.resolve(), // state 변경하지 않음
    });

    // 두 번째 컨텍스트: 정상 동작
    const goodContext = createMockAudioContext();

    stubWindowProp("AudioContext", function () {
      callCount++;
      if (callCount === 1) return stuckContext.context;
      return goodContext.context;
    });

    await playAlarmSound();

    expect(callCount).toBe(2);
    expect(goodContext.context.createOscillator).toHaveBeenCalledTimes(3);
  });

  it("AudioContext를 재사용한다", async () => {
    const { context } = createMockAudioContext();
    let callCount = 0;
    stubWindowProp("AudioContext", function () {
      callCount++;
      return context;
    });

    await playAlarmSound();
    await playAlarmSound();

    expect(callCount).toBe(1);
  });

  it("AudioContext 미지원 시 fallback으로 WAV Blob 재생", async () => {
    stubWindowProp("AudioContext", undefined);

    const mockPlay = vi.fn(() => Promise.resolve());
    const mockAudioElement = { src: "", play: mockPlay };
    stubWindowProp("Audio", function () {
      return mockAudioElement;
    });

    const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
    stubWindowProp("URL", { createObjectURL: mockCreateObjectURL });

    await playAlarmSound();

    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(mockAudioElement.src).toBe("blob:mock-url");
    expect(mockPlay).toHaveBeenCalled();
  });

  it("AudioContext와 Audio 모두 실패하면 조용히 실패", async () => {
    stubWindowProp("AudioContext", undefined);
    stubWindowProp("Audio", function () {
      throw new Error("Audio not supported");
    });

    await expect(playAlarmSound()).resolves.toBeUndefined();
  });
});
