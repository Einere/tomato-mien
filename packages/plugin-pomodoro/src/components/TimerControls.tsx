import { Button } from "@tomato-mien/ui";
import type { PomodoroState } from "../schemas/pomodoroSchema";

interface TimerControlsProps {
  state: PomodoroState;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function TimerControls({
  state,
  isRunning,
  onStart,
  onPause,
  onReset,
}: TimerControlsProps) {
  if (state === "idle") {
    return (
      <div className="flex justify-center gap-3">
        <Button onClick={onStart}>Start</Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-3">
      {isRunning ? (
        <Button onClick={onPause}>
          Pause
        </Button>
      ) : (
        <Button onClick={onStart}>Resume</Button>
      )}
      <Button variant="secondary" color="danger" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}
