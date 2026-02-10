import type { IntervalCondition } from '@/types/alarm';

interface IntervalInputProps {
  condition: IntervalCondition;
  onChange: (updated: IntervalCondition) => void;
}

export function IntervalInput({ condition, onChange }: IntervalInputProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">Every</span>
      <input
        type="number"
        min={1}
        max={1440}
        value={condition.intervalMinutes}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val)) {
            onChange({ ...condition, intervalMinutes: val });
          }
        }}
        className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-sm text-slate-700 focus:border-tomato-500 focus:ring-1 focus:ring-tomato-500"
      />
      <span className="text-xs text-slate-500">min</span>
    </div>
  );
}
