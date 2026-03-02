import { useCallback, useEffect, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Button, Card } from "@tomato-mien/ui";
import type { PomodoroState } from "./schemas/pomodoroSchema";
import {
  pomodoroConfigAtom,
  pomodoroSessionAtom,
  totalSecondsAtom,
} from "./store/pomodoroAtoms";
import { startAtom, pauseAtom, resetAtom } from "./store/pomodoroActions";
import { usePomodoroTimer } from "./hooks/usePomodoroTimer";
import { getPluginContext } from "./index";
import { TimerDisplay } from "./components/TimerDisplay";
import { TimerControls } from "./components/TimerControls";
import { CycleIndicator } from "./components/CycleIndicator";
import { PomodoroSettings } from "./components/PomodoroSettings";

const transitionMessages: Record<PomodoroState, string> = {
  idle: "",
  working: "Break is over. Time to focus!",
  shortBreak: "Great work! Take a short break.",
  longBreak: "Excellent! You earned a long break.",
};

export function PomodoroView() {
  const session = useAtomValue(pomodoroSessionAtom);
  const config = useAtomValue(pomodoroConfigAtom);
  const setConfig = useSetAtom(pomodoroConfigAtom);
  const totalSeconds = useAtomValue(totalSecondsAtom);
  const start = useSetAtom(startAtom);
  const pause = useSetAtom(pauseAtom);
  const reset = useSetAtom(resetAtom);
  const [showSettings, setShowSettings] = useState(false);

  const handleTransition = useCallback((nextState: PomodoroState) => {
    const message = transitionMessages[nextState];
    if (!message) return;

    try {
      const ctx = getPluginContext();
      ctx.notifications.show("Pomodoro", message).catch(() => {});
      ctx.audio.playAlarm().catch(() => {});
    } catch {
      // Plugin not activated — skip notification
    }
  }, []);

  usePomodoroTimer(handleTransition);

  const currentCycle = session.completedCycles % config.longBreakInterval;
  const isTimerActive = session.state !== "idle";

  useEffect(() => {
    if (isTimerActive) setShowSettings(false);
  }, [isTimerActive]);

  return (
    <div className="px-5 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-heading-1 text-foreground">Pomodoro</h1>
        {!isTimerActive && (
          <Button variant="ghost" onClick={() => setShowSettings(s => !s)}>
            {showSettings ? "Done" : "Settings"}
          </Button>
        )}
      </div>
      {showSettings && !isTimerActive ? (
        <Card>
          <PomodoroSettings config={config} onChange={setConfig} />
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col items-center gap-6 py-6">
            <TimerDisplay
              remainingSeconds={session.remainingSeconds}
              totalSeconds={totalSeconds}
              state={session.state}
            />
            <CycleIndicator
              completed={currentCycle}
              total={config.longBreakInterval}
            />
            <TimerControls
              state={session.state}
              isRunning={session.isRunning}
              onStart={start}
              onPause={pause}
              onReset={reset}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
