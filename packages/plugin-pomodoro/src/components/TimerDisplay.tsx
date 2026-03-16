import type { PomodoroState } from "../schemas/pomodoroSchema";
import { formatRemainingTime } from "../utils/pomodoroTimer";

interface TimerDisplayProps {
  remainingSeconds: number;
  totalSeconds: number;
  state: PomodoroState;
}

const stateLabels: Record<PomodoroState, string> = {
  idle: "",
  working: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

const stateColors: Record<PomodoroState, string> = {
  idle: "stroke-slate-300",
  working: "stroke-primary-600",
  shortBreak: "stroke-success-600",
  longBreak: "stroke-secondary-600",
};

const SIZE = 200;
const STROKE_WIDTH = 8;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function TimerDisplay({
  remainingSeconds,
  totalSeconds,
  state,
}: TimerDisplayProps) {
  const progress = totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0;
  const offset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE_WIDTH}
            className="stroke-slate-200"
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className={`transition-[stroke-dashoffset] duration-1000 ease-linear ${stateColors[state]}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-foreground text-4xl font-bold tabular-nums">
            {formatRemainingTime(remainingSeconds)}
          </span>
          {stateLabels[state] && (
            <span className="text-muted-foreground mt-1 text-sm">
              {stateLabels[state]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
