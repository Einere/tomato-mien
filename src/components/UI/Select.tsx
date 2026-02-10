import { clsx } from "clsx";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  disabled = false,
  className,
}: SelectProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className={clsx(
        'focus-visible:border-primary-500 focus-visible:ring-primary-500 cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2020%2020%27%20fill%3D%27%2364748b%27%3E%3Cpath%20fill-rule%3D%27evenodd%27%20d%3D%27M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%27%20clip-rule%3D%27evenodd%27%2F%3E%3C%2Fsvg%3E")] bg-[length:1.25rem_1.25rem] bg-[right_0.375rem_center] bg-no-repeat py-1.5 pr-8 pl-3 text-sm text-slate-700 shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
