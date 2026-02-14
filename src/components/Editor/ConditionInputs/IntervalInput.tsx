import type { IntervalCondition } from "@/types/alarm";
import { Input } from "@/components/UI/Input";

interface IntervalInputProps {
  condition: IntervalCondition;
  onChange: (updated: IntervalCondition) => void;
}

export function IntervalInput({ condition, onChange }: IntervalInputProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-caption text-muted-foreground">Every</span>
      <Input
        type="number"
        min={1}
        max={720}
        value={condition.intervalMinutes}
        onChange={e => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val)) {
            onChange({ ...condition, intervalMinutes: val });
          }
        }}
        className="w-20 px-2 py-1.5 text-center"
      />
      <span className="text-caption text-muted-foreground">min</span>
    </div>
  );
}
