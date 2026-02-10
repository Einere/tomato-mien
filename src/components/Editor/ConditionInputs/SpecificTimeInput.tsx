import type { SpecificCondition } from "@/types/alarm";
import { formatTimeValue } from "@/lib/dayjs";

interface SpecificTimeInputProps {
  condition: SpecificCondition;
  onChange: (updated: SpecificCondition) => void;
}

export function SpecificTimeInput({
  condition,
  onChange,
}: SpecificTimeInputProps) {
  const timeValue =
    condition.hour !== undefined && condition.minute !== undefined
      ? formatTimeValue(condition.hour, condition.minute)
      : "";

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">At</span>
      <input
        type="time"
        value={timeValue}
        onChange={e => {
          const [h, m] = e.target.value.split(":").map(Number);
          onChange({
            ...condition,
            hour: h ?? undefined,
            minute: m ?? undefined,
          });
        }}
        className="focus:border-primary-500 focus:ring-primary-500 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:ring-1"
      />
    </div>
  );
}
