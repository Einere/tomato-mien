import type { IntervalCondition, TimeCondition } from '@/types';

type TimeIntervalInputProps = {
  condition: IntervalCondition;
  onChange: (condition: TimeCondition) => void;
  showDelete?: boolean;
};

export function TimeIntervalInput(props: TimeIntervalInputProps) {
  const { condition, onChange } = props;

  return (
    <form>
      <input
        type='number'
        min='1'
        max='720'
        value={condition.intervalMinutes}
        onChange={e =>
          onChange({
            ...condition,
            intervalMinutes: parseInt(e.target.value) || 1,
          })
        }
      />
      <span className='text-secondary self-center'>&nbsp;분 마다</span>
    </form>
  );
}
