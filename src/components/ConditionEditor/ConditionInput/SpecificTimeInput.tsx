import type { SpecificCondition, TimeCondition } from '@/types';
import { Select } from '@/components/UI';

// 시간 옵션 생성 (0-23시)
const hourOptions = [
  { value: '', label: '모든 시간' },
  ...Array.from({ length: 24 }, (_, i) => ({
    value: i.toString(),
    label: i.toString().padStart(2, '0'),
  })),
];

// 분 옵션 생성 (0-59분)
const minuteOptions = [
  { value: '', label: '모든 분' },
  ...Array.from({ length: 60 }, (_, i) => ({
    value: i.toString(),
    label: i.toString().padStart(2, '0'),
  })),
];

type SpecificTimeInputProps = {
  condition: SpecificCondition;
  onChange: (condition: TimeCondition) => void;
  showDelete?: boolean;
};

export function SpecificTimeInput(props: SpecificTimeInputProps) {
  const { condition, onChange } = props;

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onChange({
      ...condition,
      hour: value ? parseInt(value) : undefined,
    });
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onChange({
      ...condition,
      minute: value ? parseInt(value) : undefined,
    });
  };

  return (
    <div className='flex items-center space-x-2'>
      <Select
        value={condition.hour?.toString() ?? ''}
        onChange={handleHourChange}
        options={hourOptions}
        className='min-w-[100px]'
      />
      <span className='text-secondary'>시</span>

      <Select
        value={condition.minute?.toString() ?? ''}
        onChange={handleMinuteChange}
        options={minuteOptions}
        className='min-w-[100px]'
      />
      <span className='text-secondary'>분</span>
    </div>
  );
}
