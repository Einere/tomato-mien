import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import type { PomodoroState } from "../schemas/pomodoroSchema";
import { pomodoroSessionAtom } from "../store/pomodoroAtoms";
import { tickAtom } from "../store/pomodoroActions";

export function usePomodoroTimer(
  onTransition?: (nextState: PomodoroState) => void,
) {
  const session = useAtomValue(pomodoroSessionAtom);
  const tick = useSetAtom(tickAtom);

  useEffect(() => {
    if (!session.isRunning) return;

    const interval = setInterval(() => {
      const nextState = tick();
      if (nextState && onTransition) {
        onTransition(nextState);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session.isRunning, tick, onTransition]);
}
