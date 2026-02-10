import type { SpecificCondition } from '@/types/alarm';

interface SpecificTimeInputProps {
  condition: SpecificCondition;
  onChange: (updated: SpecificCondition) => void;
}

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

export function SpecificTimeInput({
  condition,
  onChange,
}: SpecificTimeInputProps) {
  const timeValue =
    condition.hour !== undefined && condition.minute !== undefined
      ? `${pad2(condition.hour)}:${pad2(condition.minute)}`
      : '';

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">At</span>
      <input
        type="time"
        value={timeValue}
        onChange={(e) => {
          const [h, m] = e.target.value.split(':').map(Number);
          onChange({
            ...condition,
            hour: h ?? undefined,
            minute: m ?? undefined,
          });
        }}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-tomato-500 focus:ring-1 focus:ring-tomato-500"
      />
    </div>
  );
}
