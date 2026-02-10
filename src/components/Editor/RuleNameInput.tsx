interface RuleNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function RuleNameInput({ value, onChange }: RuleNameInputProps) {
  return (
    <div className="px-5 pb-4">
      <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-400 uppercase">
        Rule Name
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Enter rule name..."
        className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-1"
      />
    </div>
  );
}
