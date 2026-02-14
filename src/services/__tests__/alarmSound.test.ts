import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { playAlarmSound } from "../alarmSound";

function createMockAudioContext() {
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
    currentTime: 0,
  };

  return { context, oscillator, gainNode };
}

function stubWindowProp(name: string, value: unknown) {
  Object.defineProperty(window, name, {
    value,
    writable: true,
    configurable: true,
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("playAlarmSound", () => {
  it("AudioContext로 핑 사운드를 3회 재생", () => {
    const { context, oscillator } = createMockAudioContext();
    stubWindowProp("AudioContext", function () {
      return context;
    });

    playAlarmSound();

    // 첫 번째 핑 (0ms 지연 → flush)
    vi.advanceTimersByTime(0);
    expect(context.createOscillator).toHaveBeenCalledTimes(1);
    expect(oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(500, 0);
    expect(oscillator.start).toHaveBeenCalled();
    expect(oscillator.stop).toHaveBeenCalled();

    // 두 번째 핑 (300ms)
    vi.advanceTimersByTime(300);
    expect(context.createOscillator).toHaveBeenCalledTimes(2);

    // 세 번째 핑 (600ms)
    vi.advanceTimersByTime(300);
    expect(context.createOscillator).toHaveBeenCalledTimes(3);
  });

  it("gain 엔벨로프를 올바르게 설정 (attack → decay)", () => {
    const { context, gainNode } = createMockAudioContext();
    stubWindowProp("AudioContext", function () {
      return context;
    });

    playAlarmSound();
    vi.advanceTimersByTime(0);

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

  it("AudioContext 미지원 시 fallback으로 WAV Blob 재생", () => {
    stubWindowProp("AudioContext", undefined);

    const mockPlay = vi.fn(() => Promise.resolve());
    const mockAudioElement = { src: "", play: mockPlay };
    stubWindowProp("Audio", function () {
      return mockAudioElement;
    });

    const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
    stubWindowProp("URL", { createObjectURL: mockCreateObjectURL });

    playAlarmSound();

    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(mockAudioElement.src).toBe("blob:mock-url");
    expect(mockPlay).toHaveBeenCalled();
  });

  it("AudioContext와 Audio 모두 실패하면 조용히 실패", () => {
    stubWindowProp("AudioContext", undefined);
    stubWindowProp("Audio", function () {
      throw new Error("Audio not supported");
    });

    expect(() => playAlarmSound()).not.toThrow();
  });
});
