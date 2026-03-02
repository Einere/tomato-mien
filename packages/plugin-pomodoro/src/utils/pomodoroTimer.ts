import type { PomodoroConfig, PomodoroState } from "../schemas/pomodoroSchema";

export function getNextState(
  currentState: PomodoroState,
  completedCycles: number,
  config: PomodoroConfig,
): { state: PomodoroState; completedCycles: number } {
  switch (currentState) {
    case "working": {
      const newCycles = completedCycles + 1;
      if (newCycles % config.longBreakInterval === 0) {
        return { state: "longBreak", completedCycles: newCycles };
      }
      return { state: "shortBreak", completedCycles: newCycles };
    }
    case "shortBreak":
    case "longBreak":
      return { state: "working", completedCycles };
    case "idle":
      return { state: "working", completedCycles: 0 };
  }
}

export function getDurationSeconds(
  state: PomodoroState,
  config: PomodoroConfig,
): number {
  switch (state) {
    case "working":
      return config.workMinutes * 60;
    case "shortBreak":
      return config.shortBreakMinutes * 60;
    case "longBreak":
      return config.longBreakMinutes * 60;
    case "idle":
      return 0;
  }
}

export function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
