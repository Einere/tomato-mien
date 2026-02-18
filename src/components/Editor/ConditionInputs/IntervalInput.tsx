import type { IntervalCondition } from "@/types/alarm";
import { Input } from "@tomato-mien/ui";

interface IntervalInputProps {
  condition: IntervalCondition;
  onChange: (updated: IntervalCondition) => void;
}

export function IntervalInput({ condition, onChange }: IntervalInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-caption text-muted-foreground">Every</span>
        <Input
          type="number"
          min={1}
          max={720}
          value={condition.intervalMinutes}
          onChange={e => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val >= 1) {
              onChange({ ...condition, intervalMinutes: val });
            }
          }}
          className="w-20 px-2 py-1.5 text-center"
        />
        <span className="text-caption text-muted-foreground">min</span>
      </div>
      <p className="text-caption text-muted-foreground leading-tight">
        Fires every {condition.intervalMinutes} min after activation
      </p>
    </div>
  );
}
