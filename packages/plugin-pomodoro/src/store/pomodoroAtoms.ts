import { atom } from "jotai";
import {
  PomodoroConfigSchema,
  type PomodoroConfig,
  type PomodoroSession,
} from "../schemas/pomodoroSchema";
import { getDurationSeconds } from "../utils/pomodoroTimer";

export const pomodoroConfigAtom = atom<PomodoroConfig>(
  PomodoroConfigSchema.parse({}),
);

export const pomodoroSessionAtom = atom<PomodoroSession>({
  state: "idle",
  remainingSeconds: 0,
  completedCycles: 0,
  isRunning: false,
});

export const totalSecondsAtom = atom(get => {
  const session = get(pomodoroSessionAtom);
  const config = get(pomodoroConfigAtom);
  return getDurationSeconds(session.state, config);
});

export const progressAtom = atom(get => {
  const total = get(totalSecondsAtom);
  const remaining = get(pomodoroSessionAtom).remainingSeconds;
  return total > 0 ? Math.max(0, Math.min(1, 1 - remaining / total)) : 0;
});
