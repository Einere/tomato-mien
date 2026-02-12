interface RuleNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function RuleNameInput({ value, onChange }: RuleNameInputProps) {
  return (
    <div className="px-5 pb-4">
      <label className="text-overline text-subtle-foreground mb-1.5 block">
        Rule Name
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Enter rule name..."
        className="focus:border-primary-500 focus:ring-ring border-border bg-surface text-body text-foreground placeholder:text-subtle-foreground w-full rounded-lg border px-3 py-2.5 focus:ring-1"
      />
    </div>
  );
}
