import type { IntervalCondition } from "@/types/alarm";

interface IntervalInputProps {
  condition: IntervalCondition;
  onChange: (updated: IntervalCondition) => void;
}

export function IntervalInput({ condition, onChange }: IntervalInputProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-caption text-muted-foreground">Every</span>
      <input
        type="number"
        min={1}
        max={1440}
        value={condition.intervalMinutes}
        onChange={e => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val)) {
            onChange({ ...condition, intervalMinutes: val });
          }
        }}
        className="focus:border-primary-500 focus:ring-ring border-border bg-surface text-body text-foreground w-20 rounded-lg border px-2 py-1.5 text-center focus:ring-1"
      />
      <span className="text-caption text-muted-foreground">min</span>
    </div>
  );
}
