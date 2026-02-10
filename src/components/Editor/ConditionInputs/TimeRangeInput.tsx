import type { RangeCondition } from '@/types/alarm';

interface TimeRangeInputProps {
  condition: RangeCondition;
  onChange: (updated: RangeCondition) => void;
}

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

function timeToString(h: number, m: number) {
  return `${pad2(h)}:${pad2(m)}`;
}

function parseTime(str: string): { hour: number; minute: number } {
  const [h, m] = str.split(':').map(Number);
  return { hour: h ?? 0, minute: m ?? 0 };
}

export function TimeRangeInput({ condition, onChange }: TimeRangeInputProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="time"
        value={timeToString(condition.startHour, condition.startMinute)}
        onChange={(e) => {
          const { hour, minute } = parseTime(e.target.value);
          onChange({ ...condition, startHour: hour, startMinute: minute });
        }}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-tomato-500 focus:ring-1 focus:ring-tomato-500"
      />
      <span className="text-xs text-slate-400">to</span>
      <input
        type="time"
        value={timeToString(condition.endHour, condition.endMinute)}
        onChange={(e) => {
          const { hour, minute } = parseTime(e.target.value);
          onChange({ ...condition, endHour: hour, endMinute: minute });
        }}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-tomato-500 focus:ring-1 focus:ring-tomato-500"
      />
    </div>
  );
}
