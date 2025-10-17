import type { SpecificCondition, TimeCondition } from "../../../types";

type SpecificTimeInputProps = {
  condition: SpecificCondition;
  onChange: (condition: TimeCondition) => void
  showDelete?: boolean
};
export function SpecificTimeInput(props: SpecificTimeInputProps) {
  const { condition, onChange } = props;

  return (
    <form>
      <select
        value={condition.hour ?? ''}
        onChange={(e) => onChange({ ...condition, hour: e.target.value ? parseInt(e.target.value) : undefined })}
      >
        <option value="">모든 시간</option>
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
        ))}
      </select>
      <span className="text-secondary self-center">&nbsp;시&nbsp;</span>
      <select
        value={condition.minute ?? ''}
        onChange={(e) => onChange({ ...condition, minute: e.target.value ? parseInt(e.target.value) : undefined })}
      >
        <option value="">모든 분</option>
        {Array.from({ length: 60 }, (_, i) => (
          <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
        ))}
      </select>
      <span>&nbsp;분</span>
    </form>
  );
}