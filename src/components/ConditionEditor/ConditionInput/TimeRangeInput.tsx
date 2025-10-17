import type { RangeCondition, TimeCondition } from "../../../types";

type TimeRangeInputProps = {
  condition: RangeCondition;
  onChange: (condition: TimeCondition) => void
  showDelete?: boolean
};
export function TimeRangeInput(props: TimeRangeInputProps) {
  const { condition, onChange } = props;

  return (
    <form >
      <input
        type="number"
        min="0"
        max="23"
        value={condition.startHour}
        onChange={(e) => onChange({ ...condition, startHour: parseInt(e.target.value) || 0 })}
      />
      <span className="text-secondary self-center">&nbsp;시&nbsp;</span>
      <input
        type="number"
        min="0"
        max="59"
        value={condition.startMinute}
        onChange={(e) => onChange({ ...condition, startMinute: parseInt(e.target.value) || 0 })}
      />
      <span className="text-secondary self-center">&nbsp;분&nbsp;부터&nbsp;</span>
      <input
        type="number"
        min="0"
        max="23"
        value={condition.endHour}
        onChange={(e) => onChange({ ...condition, endHour: parseInt(e.target.value) || 0 })}
      />
      <span className="text-secondary self-center">&nbsp;시&nbsp;</span>
      <input
        type="number"
        min="0"
        max="59"
        value={condition.endMinute}
        onChange={(e) => onChange({ ...condition, endMinute: parseInt(e.target.value) || 0 })}
      />
      <span className="text-secondary self-center">&nbsp;분 까지</span>
    </form>
  );
}