import { describe, it, expect, beforeEach } from "vitest";
import { createStore } from "jotai";
import {
  pomodoroConfigAtom,
  pomodoroSessionAtom,
  totalSecondsAtom,
  progressAtom,
} from "../store/pomodoroAtoms";
import {
  startAtom,
  pauseAtom,
  resetAtom,
  tickAtom,
} from "../store/pomodoroActions";

describe("pomodoroAtoms", () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  describe("initial state", () => {
    it("has default config", () => {
      const config = store.get(pomodoroConfigAtom);
      expect(config).toEqual({
        workMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        longBreakInterval: 4,
        autoStart: false,
      });
    });

    it("has idle session", () => {
      const session = store.get(pomodoroSessionAtom);
      expect(session).toEqual({
        state: "idle",
        remainingSeconds: 0,
        completedCycles: 0,
        isRunning: false,
      });
    });

    it("has 0 total seconds in idle", () => {
      expect(store.get(totalSecondsAtom)).toBe(0);
    });

    it("has 0 progress in idle", () => {
      expect(store.get(progressAtom)).toBe(0);
    });
  });

  describe("startAtom", () => {
    it("transitions from idle to working and sets timer", () => {
      store.set(startAtom);
      const session = store.get(pomodoroSessionAtom);
      expect(session.state).toBe("working");
      expect(session.remainingSeconds).toBe(25 * 60);
      expect(session.isRunning).toBe(true);
      expect(session.completedCycles).toBe(0);
    });

    it("resumes paused session without changing state", () => {
      store.set(startAtom);
      store.set(pauseAtom);
      const beforeResume = store.get(pomodoroSessionAtom);
      expect(beforeResume.isRunning).toBe(false);

      store.set(startAtom);
      const afterResume = store.get(pomodoroSessionAtom);
      expect(afterResume.isRunning).toBe(true);
      expect(afterResume.state).toBe("working");
      expect(afterResume.remainingSeconds).toBe(beforeResume.remainingSeconds);
    });

    it("sets totalSecondsAtom to work duration after start", () => {
      store.set(startAtom);
      expect(store.get(totalSecondsAtom)).toBe(25 * 60);
    });

    it("does nothing when already running", () => {
      store.set(startAtom);
      const before = store.get(pomodoroSessionAtom);
      store.set(startAtom);
      const after = store.get(pomodoroSessionAtom);
      expect(before).toBe(after);
    });
  });

  describe("pauseAtom", () => {
    it("pauses running session", () => {
      store.set(startAtom);
      store.set(pauseAtom);
      const session = store.get(pomodoroSessionAtom);
      expect(session.isRunning).toBe(false);
      expect(session.state).toBe("working");
    });

    it("does nothing when idle", () => {
      store.set(pauseAtom);
      const session = store.get(pomodoroSessionAtom);
      expect(session.state).toBe("idle");
      expect(session.isRunning).toBe(false);
    });
  });

  describe("resetAtom", () => {
    it("resets to idle state", () => {
      store.set(startAtom);
      store.set(resetAtom);
      const session = store.get(pomodoroSessionAtom);
      expect(session).toEqual({
        state: "idle",
        remainingSeconds: 0,
        completedCycles: 0,
        isRunning: false,
      });
    });
  });

  describe("tickAtom", () => {
    it("decrements remainingSeconds by 1", () => {
      store.set(startAtom);
      const before = store.get(pomodoroSessionAtom).remainingSeconds;
      store.set(tickAtom);
      const after = store.get(pomodoroSessionAtom).remainingSeconds;
      expect(after).toBe(before - 1);
    });

    it("transitions to shortBreak when working timer reaches 0", () => {
      store.set(startAtom);
      store.set(pomodoroSessionAtom, {
        state: "working",
        remainingSeconds: 1,
        completedCycles: 0,
        isRunning: true,
      });

      const result = store.set(tickAtom);
      const session = store.get(pomodoroSessionAtom);
      expect(session.state).toBe("shortBreak");
      expect(session.remainingSeconds).toBe(5 * 60);
      expect(session.completedCycles).toBe(1);
      expect(result).toBe("shortBreak");
    });

    it("transitions to longBreak after longBreakInterval cycles", () => {
      store.set(pomodoroSessionAtom, {
        state: "working",
        remainingSeconds: 1,
        completedCycles: 3,
        isRunning: true,
      });

      const result = store.set(tickAtom);
      const session = store.get(pomodoroSessionAtom);
      expect(session.state).toBe("longBreak");
      expect(session.remainingSeconds).toBe(15 * 60);
      expect(session.completedCycles).toBe(4);
      expect(result).toBe("longBreak");
    });

    it("transitions from shortBreak to working", () => {
      store.set(pomodoroSessionAtom, {
        state: "shortBreak",
        remainingSeconds: 1,
        completedCycles: 1,
        isRunning: true,
      });

      const result = store.set(tickAtom);
      const session = store.get(pomodoroSessionAtom);
      expect(session.state).toBe("working");
      expect(session.remainingSeconds).toBe(25 * 60);
      expect(result).toBe("working");
    });

    it("does not tick when not running", () => {
      store.set(pomodoroSessionAtom, {
        state: "working",
        remainingSeconds: 100,
        completedCycles: 0,
        isRunning: false,
      });

      store.set(tickAtom);
      expect(store.get(pomodoroSessionAtom).remainingSeconds).toBe(100);
    });

    it("returns null when no transition occurs", () => {
      store.set(startAtom);
      const result = store.set(tickAtom);
      expect(result).toBeNull();
    });

    it("auto-starts next session when autoStart is enabled", () => {
      store.set(pomodoroConfigAtom, {
        ...store.get(pomodoroConfigAtom),
        autoStart: true,
      });
      store.set(pomodoroSessionAtom, {
        state: "working",
        remainingSeconds: 1,
        completedCycles: 0,
        isRunning: true,
      });

      store.set(tickAtom);
      const session = store.get(pomodoroSessionAtom);
      expect(session.isRunning).toBe(true);
    });

    it("pauses on transition when autoStart is disabled", () => {
      store.set(pomodoroSessionAtom, {
        state: "working",
        remainingSeconds: 1,
        completedCycles: 0,
        isRunning: true,
      });

      store.set(tickAtom);
      const session = store.get(pomodoroSessionAtom);
      expect(session.isRunning).toBe(false);
    });

    it("guards against double-tick when remainingSeconds is already 0", () => {
      store.set(pomodoroSessionAtom, {
        state: "working",
        remainingSeconds: 0,
        completedCycles: 0,
        isRunning: true,
      });

      const result = store.set(tickAtom);
      expect(result).toBeNull();
      expect(store.get(pomodoroSessionAtom).state).toBe("working");
    });
  });

  describe("progressAtom", () => {
    it("is 0 at start of session", () => {
      store.set(startAtom);
      expect(store.get(progressAtom)).toBe(0);
    });

    it("increases as time passes", () => {
      store.set(startAtom);
      store.set(tickAtom);
      const progress = store.get(progressAtom);
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(1);
    });

    it("is approximately 0.5 at halfway point", () => {
      store.set(startAtom);
      store.set(pomodoroSessionAtom, {
        ...store.get(pomodoroSessionAtom),
        remainingSeconds: 25 * 30,
      });
      expect(store.get(progressAtom)).toBeCloseTo(0.5, 1);
    });

    it("clamps to 0 when remaining exceeds total", () => {
      store.set(startAtom);
      store.set(pomodoroSessionAtom, {
        ...store.get(pomodoroSessionAtom),
        remainingSeconds: 25 * 60 + 100,
      });
      expect(store.get(progressAtom)).toBe(0);
    });
  });
});
