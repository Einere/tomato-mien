import type { SpecificCondition } from "@/types/alarm";
import { Select } from "@/components/UI/Select";

const HOUR_OPTIONS = [
  { value: "", label: "매시" },
  ...Array.from({ length: 24 }, (_, i) => ({
    value: String(i),
    label: String(i).padStart(2, "0"),
  })),
];

const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => ({
  value: String(i),
  label: String(i).padStart(2, "0"),
}));

interface SpecificTimeInputProps {
  condition: SpecificCondition;
  onChange: (updated: SpecificCondition) => void;
}

export function SpecificTimeInput({
  condition,
  onChange,
}: SpecificTimeInputProps) {
  const hourValue =
    condition.hour !== undefined ? String(condition.hour) : "";
  const minuteValue = String(condition.minute ?? 0);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={hourValue}
        onChange={v =>
          onChange({
            ...condition,
            hour: v === "" ? undefined : Number(v),
          })
        }
        options={HOUR_OPTIONS}
      />
      <span className="text-xs text-slate-500">:</span>
      <Select
        value={minuteValue}
        onChange={v =>
          onChange({
            ...condition,
            minute: Number(v),
          })
        }
        options={MINUTE_OPTIONS}
      />
    </div>
  );
}
