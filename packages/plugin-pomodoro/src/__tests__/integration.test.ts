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
import type { PomodoroConfig } from "../schemas/pomodoroSchema";

describe("Pomodoro Integration", () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  /** Helper: tick down to transition and return the new state */
  function tickToTransition() {
    store.set(pomodoroSessionAtom, {
      ...store.get(pomodoroSessionAtom),
      remainingSeconds: 1,
    });
    return store.set(tickAtom);
  }

  /** Helper: resume a paused session */
  function resume() {
    store.set(startAtom);
  }

  describe("full 4-cycle pomodoro sequence", () => {
    it("completes work → shortBreak → work cycle 3 times, then longBreak", () => {
      store.set(startAtom);
      expect(store.get(pomodoroSessionAtom).state).toBe("working");

      for (let cycle = 0; cycle < 3; cycle++) {
        // Work → Short Break
        expect(store.get(pomodoroSessionAtom).state).toBe("working");
        const breakState = tickToTransition();
        expect(breakState).toBe("shortBreak");
        expect(store.get(pomodoroSessionAtom).state).toBe("shortBreak");
        expect(store.get(pomodoroSessionAtom).remainingSeconds).toBe(5 * 60);
        expect(store.get(pomodoroSessionAtom).completedCycles).toBe(cycle + 1);

        // Short Break → Working (manual resume since autoStart is off)
        resume();
        const workState = tickToTransition();
        expect(workState).toBe("working");
        expect(store.get(pomodoroSessionAtom).state).toBe("working");
        resume();
      }

      // Cycle 4: Work → Long Break
      expect(store.get(pomodoroSessionAtom).state).toBe("working");
      const longBreakState = tickToTransition();
      expect(longBreakState).toBe("longBreak");
      expect(store.get(pomodoroSessionAtom).state).toBe("longBreak");
      expect(store.get(pomodoroSessionAtom).remainingSeconds).toBe(15 * 60);
      expect(store.get(pomodoroSessionAtom).completedCycles).toBe(4);
    });
  });

  describe("pause and resume", () => {
    it("pauses timer and resumes without losing time", () => {
      store.set(startAtom);

      // Tick a few times
      store.set(tickAtom);
      store.set(tickAtom);
      store.set(tickAtom);
      const remainingBeforePause =
        store.get(pomodoroSessionAtom).remainingSeconds;

      // Pause
      store.set(pauseAtom);
      expect(store.get(pomodoroSessionAtom).isRunning).toBe(false);

      // Tick should not decrement while paused
      store.set(tickAtom);
      store.set(tickAtom);
      expect(store.get(pomodoroSessionAtom).remainingSeconds).toBe(
        remainingBeforePause,
      );

      // Resume
      store.set(startAtom);
      expect(store.get(pomodoroSessionAtom).isRunning).toBe(true);
      expect(store.get(pomodoroSessionAtom).remainingSeconds).toBe(
        remainingBeforePause,
      );

      // Tick works again
      store.set(tickAtom);
      expect(store.get(pomodoroSessionAtom).remainingSeconds).toBe(
        remainingBeforePause - 1,
      );
    });
  });

  describe("reset mid-session", () => {
    it("resets to idle from any state", () => {
      store.set(startAtom);
      store.set(tickAtom);
      store.set(tickAtom);

      store.set(resetAtom);
      expect(store.get(pomodoroSessionAtom)).toEqual({
        state: "idle",
        remainingSeconds: 0,
        completedCycles: 0,
        isRunning: false,
      });
    });

    it("resets during break", () => {
      store.set(startAtom);
      tickToTransition(); // → shortBreak
      resume();

      store.set(resetAtom);
      expect(store.get(pomodoroSessionAtom).state).toBe("idle");
    });
  });

  describe("autoStart behavior", () => {
    it("auto-starts next session when autoStart is enabled", () => {
      store.set(pomodoroConfigAtom, {
        ...store.get(pomodoroConfigAtom),
        autoStart: true,
      });

      store.set(startAtom);

      // Work → Short Break (auto-started)
      tickToTransition();
      expect(store.get(pomodoroSessionAtom).state).toBe("shortBreak");
      expect(store.get(pomodoroSessionAtom).isRunning).toBe(true);

      // Short Break → Working (auto-started)
      tickToTransition();
      expect(store.get(pomodoroSessionAtom).state).toBe("working");
      expect(store.get(pomodoroSessionAtom).isRunning).toBe(true);
    });

    it("stops on transition when autoStart is disabled", () => {
      store.set(startAtom);

      tickToTransition();
      expect(store.get(pomodoroSessionAtom).state).toBe("shortBreak");
      expect(store.get(pomodoroSessionAtom).isRunning).toBe(false);
    });
  });

  describe("custom config", () => {
    it("uses custom work/break durations", () => {
      const customConfig: PomodoroConfig = {
        workMinutes: 50,
        shortBreakMinutes: 10,
        longBreakMinutes: 30,
        longBreakInterval: 2,
        autoStart: false,
      };
      store.set(pomodoroConfigAtom, customConfig);

      store.set(startAtom);
      expect(store.get(pomodoroSessionAtom).remainingSeconds).toBe(50 * 60);
      expect(store.get(totalSecondsAtom)).toBe(50 * 60);

      // Work → Short Break
      tickToTransition();
      expect(store.get(pomodoroSessionAtom).remainingSeconds).toBe(10 * 60);

      // Short Break → Working
      resume();
      tickToTransition();
      expect(store.get(pomodoroSessionAtom).state).toBe("working");
      resume();

      // Cycle 2: Work → Long Break (interval is 2)
      tickToTransition();
      expect(store.get(pomodoroSessionAtom).state).toBe("longBreak");
      expect(store.get(pomodoroSessionAtom).remainingSeconds).toBe(30 * 60);
      expect(store.get(pomodoroSessionAtom).completedCycles).toBe(2);
    });
  });

  describe("progress tracking", () => {
    it("tracks progress through a work session", () => {
      store.set(startAtom);
      expect(store.get(progressAtom)).toBe(0);

      // Tick 750 times (halfway through 25min)
      store.set(pomodoroSessionAtom, {
        ...store.get(pomodoroSessionAtom),
        remainingSeconds: 750,
      });
      expect(store.get(progressAtom)).toBeCloseTo(0.5, 1);

      // Near end
      store.set(pomodoroSessionAtom, {
        ...store.get(pomodoroSessionAtom),
        remainingSeconds: 1,
      });
      const progress = store.get(progressAtom);
      expect(progress).toBeGreaterThan(0.99);
      expect(progress).toBeLessThanOrEqual(1);
    });
  });

  describe("derived atoms consistency", () => {
    it("totalSecondsAtom matches session state throughout lifecycle", () => {
      // Idle
      expect(store.get(totalSecondsAtom)).toBe(0);

      // Working
      store.set(startAtom);
      expect(store.get(totalSecondsAtom)).toBe(25 * 60);

      // Short Break
      tickToTransition();
      resume();
      expect(store.get(totalSecondsAtom)).toBe(5 * 60);

      // Back to Working
      tickToTransition();
      resume();
      expect(store.get(totalSecondsAtom)).toBe(25 * 60);
    });
  });
});
