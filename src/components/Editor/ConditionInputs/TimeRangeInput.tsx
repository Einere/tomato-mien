import type { RangeCondition } from "@/types/alarm";
import { formatTimeValue } from "@/lib/dayjs";
import { Input } from "@tomato-mien/ui";

interface TimeRangeInputProps {
  condition: RangeCondition;
  onChange: (updated: RangeCondition) => void;
}

function parseTime(str: string): { hour: number; minute: number } {
  const [h, m] = str.split(":").map(Number);
  return { hour: h ?? 0, minute: m ?? 0 };
}

export function TimeRangeInput({ condition, onChange }: TimeRangeInputProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="time"
        value={formatTimeValue(condition.startHour, condition.startMinute)}
        onChange={e => {
          const { hour, minute } = parseTime(e.target.value);
          onChange({ ...condition, startHour: hour, startMinute: minute });
        }}
        className="min-w-0 flex-1 px-2 py-1.5"
      />
      <span className="text-caption text-subtle-foreground shrink-0">to</span>
      <Input
        type="time"
        value={formatTimeValue(condition.endHour, condition.endMinute)}
        onChange={e => {
          const { hour, minute } = parseTime(e.target.value);
          onChange({ ...condition, endHour: hour, endMinute: minute });
        }}
        className="min-w-0 flex-1 px-2 py-1.5"
      />
    </div>
  );
}
