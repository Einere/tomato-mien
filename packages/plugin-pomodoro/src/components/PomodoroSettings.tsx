import { useCallback } from "react";
import { Input, Toggle } from "@tomato-mien/ui";
import type { PomodoroConfig } from "../schemas/pomodoroSchema";

interface PomodoroSettingsProps {
  config: PomodoroConfig;
  onChange: (config: PomodoroConfig) => void;
}

interface NumberFieldConfig {
  key: keyof PomodoroConfig;
  label: string;
  min: number;
  max: number;
  suffix: string;
}

const numberFields: NumberFieldConfig[] = [
  { key: "workMinutes", label: "Work", min: 1, max: 120, suffix: "min" },
  {
    key: "shortBreakMinutes",
    label: "Short Break",
    min: 1,
    max: 60,
    suffix: "min",
  },
  {
    key: "longBreakMinutes",
    label: "Long Break",
    min: 1,
    max: 120,
    suffix: "min",
  },
  {
    key: "longBreakInterval",
    label: "Long Break Every",
    min: 1,
    max: 10,
    suffix: "cycles",
  },
];

export function PomodoroSettings({
  config,
  onChange,
}: PomodoroSettingsProps) {
  const handleNumberChange = useCallback(
    (key: keyof PomodoroConfig, value: string, min: number, max: number) => {
      const parsed = parseInt(value, 10);
      if (isNaN(parsed)) return;
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange({ ...config, [key]: clamped });
    },
    [config, onChange],
  );

  return (
    <div className="flex flex-col gap-4">
      {numberFields.map(({ key, label, min, max, suffix }) => (
        <div key={key} className="flex items-center justify-between gap-3">
          <label htmlFor={`pomodoro-${key}`} className="text-sm text-foreground">
            {label}
          </label>
          <div className="flex items-center gap-2">
            <Input
              id={`pomodoro-${key}`}
              type="number"
              min={min}
              max={max}
              value={config[key] as number}
              onChange={(e) =>
                handleNumberChange(key, e.target.value, min, max)
              }
              className="w-20 text-center"
            />
            <span className="text-xs text-muted-foreground w-12">
              {suffix}
            </span>
          </div>
        </div>
      ))}
      <div className="flex flex-col gap-1">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-foreground">Auto Start</span>
          <Toggle
            checked={config.autoStart}
            onChange={(checked) => onChange({ ...config, autoStart: checked })}
          />
        </label>
        <p className="text-xs text-muted-foreground">
          Automatically start the next session when the current one ends.
        </p>
      </div>
    </div>
  );
}
