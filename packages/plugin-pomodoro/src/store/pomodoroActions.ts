import { atom } from "jotai";
import type { PomodoroState } from "../schemas/pomodoroSchema";
import { getNextState, getDurationSeconds } from "../utils/pomodoroTimer";
import { pomodoroConfigAtom, pomodoroSessionAtom } from "./pomodoroAtoms";

export const startAtom = atom(null, (get, set) => {
  const session = get(pomodoroSessionAtom);
  if (session.isRunning) return;

  const config = get(pomodoroConfigAtom);

  if (session.state === "idle") {
    set(pomodoroSessionAtom, {
      state: "working",
      remainingSeconds: getDurationSeconds("working", config),
      completedCycles: 0,
      isRunning: true,
    });
  } else {
    set(pomodoroSessionAtom, { ...session, isRunning: true });
  }
});

export const pauseAtom = atom(null, (get, set) => {
  const session = get(pomodoroSessionAtom);
  if (session.state !== "idle") {
    set(pomodoroSessionAtom, { ...session, isRunning: false });
  }
});

export const resetAtom = atom(null, (_get, set) => {
  set(pomodoroSessionAtom, {
    state: "idle",
    remainingSeconds: 0,
    completedCycles: 0,
    isRunning: false,
  });
});

export const tickAtom = atom(null, (get, set): PomodoroState | null => {
  const session = get(pomodoroSessionAtom);
  if (!session.isRunning) return null;

  const newRemaining = session.remainingSeconds - 1;

  if (newRemaining > 0) {
    set(pomodoroSessionAtom, { ...session, remainingSeconds: newRemaining });
    return null;
  }

  // Guard against double-tick: if already at 0 or below, do not transition again
  if (newRemaining < 0) return null;

  // newRemaining === 0: transition to next state
  const config = get(pomodoroConfigAtom);
  const { state: nextState, completedCycles } = getNextState(
    session.state,

    session.completedCycles,
    config,
  );

  set(pomodoroSessionAtom, {
    state: nextState,
    remainingSeconds: getDurationSeconds(nextState, config),
    completedCycles,
    isRunning: config.autoStart,
  });

  return nextState;
});
