import { Input } from "@tomato-mien/ui";

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
      <Input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Enter rule name..."
        className="w-full"
      />
    </div>
  );
}
