import { describe, it, expect } from "vitest";
import {
  PomodoroConfigSchema,
  PomodoroStateSchema,
  PomodoroSessionSchema,
} from "../schemas/pomodoroSchema";

describe("PomodoroConfigSchema", () => {
  it("parses with all defaults when given empty object", () => {
    const result = PomodoroConfigSchema.parse({});
    expect(result).toEqual({
      workMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      longBreakInterval: 4,
      autoStart: false,
    });
  });

  it("accepts valid custom config", () => {
    const config = {
      workMinutes: 50,
      shortBreakMinutes: 10,
      longBreakMinutes: 30,
      longBreakInterval: 3,
      autoStart: true,
    };
    expect(PomodoroConfigSchema.parse(config)).toEqual(config);
  });

  it("rejects workMinutes below 1", () => {
    const result = PomodoroConfigSchema.safeParse({ workMinutes: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects workMinutes above 120", () => {
    const result = PomodoroConfigSchema.safeParse({ workMinutes: 121 });
    expect(result.success).toBe(false);
  });

  it("rejects shortBreakMinutes above 60", () => {
    const result = PomodoroConfigSchema.safeParse({ shortBreakMinutes: 61 });
    expect(result.success).toBe(false);
  });

  it("rejects longBreakInterval above 10", () => {
    const result = PomodoroConfigSchema.safeParse({ longBreakInterval: 11 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer values", () => {
    const result = PomodoroConfigSchema.safeParse({ workMinutes: 25.5 });
    expect(result.success).toBe(false);
  });
});

describe("PomodoroStateSchema", () => {
  it.each(["idle", "working", "shortBreak", "longBreak"] as const)(
    'accepts valid state "%s"',
    (state) => {
      expect(PomodoroStateSchema.parse(state)).toBe(state);
    },
  );

  it("rejects invalid state", () => {
    const result = PomodoroStateSchema.safeParse("invalid");
    expect(result.success).toBe(false);
  });
});

describe("PomodoroSessionSchema", () => {
  it("parses valid session", () => {
    const session = {
      state: "working",
      remainingSeconds: 1500,
      completedCycles: 0,
      isRunning: true,
    };
    expect(PomodoroSessionSchema.parse(session)).toEqual(session);
  });

  it("rejects negative remainingSeconds", () => {
    const result = PomodoroSessionSchema.safeParse({
      state: "working",
      remainingSeconds: -1,
      completedCycles: 0,
      isRunning: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative completedCycles", () => {
    const result = PomodoroSessionSchema.safeParse({
      state: "idle",
      remainingSeconds: 0,
      completedCycles: -1,
      isRunning: false,
    });
    expect(result.success).toBe(false);
  });
});
