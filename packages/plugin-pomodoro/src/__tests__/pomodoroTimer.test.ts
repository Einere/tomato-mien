import { describe, it, expect } from "vitest";
import type { PomodoroConfig } from "../schemas/pomodoroSchema";
import {
  getNextState,
  getDurationSeconds,
  formatRemainingTime,
} from "../utils/pomodoroTimer";

const defaultConfig: PomodoroConfig = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStart: false,
};

describe("getNextState", () => {
  it("transitions from idle to working with cycles reset to 0", () => {
    const result = getNextState("idle", 3, defaultConfig);
    expect(result).toEqual({ state: "working", completedCycles: 0 });
  });

  it("transitions from working to shortBreak (normal cycle)", () => {
    const result = getNextState("working", 0, defaultConfig);
    expect(result).toEqual({ state: "shortBreak", completedCycles: 1 });
  });

  it("transitions from working to longBreak at longBreakInterval boundary", () => {
    const result = getNextState("working", 3, defaultConfig);
    expect(result).toEqual({ state: "longBreak", completedCycles: 4 });
  });

  it("transitions from shortBreak to working", () => {
    const result = getNextState("shortBreak", 2, defaultConfig);
    expect(result).toEqual({ state: "working", completedCycles: 2 });
  });

  it("transitions from longBreak to working", () => {
    const result = getNextState("longBreak", 4, defaultConfig);
    expect(result).toEqual({ state: "working", completedCycles: 4 });
  });

  it("triggers longBreak at custom interval (every 2 cycles)", () => {
    const config = { ...defaultConfig, longBreakInterval: 2 };
    const result = getNextState("working", 1, config);
    expect(result).toEqual({ state: "longBreak", completedCycles: 2 });
  });

  it("increments completedCycles only when leaving working state", () => {
    const result1 = getNextState("working", 0, defaultConfig);
    expect(result1.completedCycles).toBe(1);

    const result2 = getNextState("shortBreak", 1, defaultConfig);
    expect(result2.completedCycles).toBe(1);
  });
});

describe("getDurationSeconds", () => {
  it("returns work duration for working state", () => {
    expect(getDurationSeconds("working", defaultConfig)).toBe(25 * 60);
  });

  it("returns short break duration for shortBreak state", () => {
    expect(getDurationSeconds("shortBreak", defaultConfig)).toBe(5 * 60);
  });

  it("returns long break duration for longBreak state", () => {
    expect(getDurationSeconds("longBreak", defaultConfig)).toBe(15 * 60);
  });

  it("returns 0 for idle state", () => {
    expect(getDurationSeconds("idle", defaultConfig)).toBe(0);
  });

  it("uses custom config values", () => {
    const config = { ...defaultConfig, workMinutes: 50 };
    expect(getDurationSeconds("working", config)).toBe(50 * 60);
  });
});

describe("formatRemainingTime", () => {
  it("formats 0 seconds as 00:00", () => {
    expect(formatRemainingTime(0)).toBe("00:00");
  });

  it("formats 59 seconds as 00:59", () => {
    expect(formatRemainingTime(59)).toBe("00:59");
  });

  it("formats 60 seconds as 01:00", () => {
    expect(formatRemainingTime(60)).toBe("01:00");
  });

  it("formats 1500 seconds as 25:00", () => {
    expect(formatRemainingTime(1500)).toBe("25:00");
  });

  it("formats 3599 seconds as 59:59", () => {
    expect(formatRemainingTime(3599)).toBe("59:59");
  });

  it("pads single digits with leading zero", () => {
    expect(formatRemainingTime(65)).toBe("01:05");
  });

  it("handles negative input gracefully", () => {
    expect(formatRemainingTime(-1)).toBe("00:00");
  });

  it("formats 3600 seconds (1 hour) as HH:MM:SS", () => {
    expect(formatRemainingTime(3600)).toBe("01:00:00");
  });

  it("formats 7200 seconds (120 min) as HH:MM:SS", () => {
    expect(formatRemainingTime(7200)).toBe("02:00:00");
  });

  it("formats 3661 seconds as 01:01:01", () => {
    expect(formatRemainingTime(3661)).toBe("01:01:01");
  });
});
