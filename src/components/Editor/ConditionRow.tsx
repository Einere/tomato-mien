import type { TimeCondition } from '@/types/alarm';
import { Badge } from '@/components/UI/Badge';
import { Icon } from '@/components/UI/Icon';
import { TimeRangeInput } from './ConditionInputs/TimeRangeInput';
import { IntervalInput } from './ConditionInputs/IntervalInput';
import { SpecificTimeInput } from './ConditionInputs/SpecificTimeInput';

interface ConditionRowProps {
  condition: TimeCondition;
  onChange: (updated: TimeCondition) => void;
  onDelete: () => void;
}

const typeLabels: Record<TimeCondition['type'], string> = {
  range: 'Range',
  interval: 'Interval',
  specific: 'Specific',
};

const typeBadgeVariant: Record<
  TimeCondition['type'],
  'default' | 'primary' | 'success'
> = {
  range: 'primary',
  interval: 'success',
  specific: 'default',
};

export function ConditionRow({
  condition,
  onChange,
  onDelete,
}: ConditionRowProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
      <Badge variant={typeBadgeVariant[condition.type]}>
        {typeLabels[condition.type]}
      </Badge>
      <div className="flex-1">
        {condition.type === 'range' && (
          <TimeRangeInput
            condition={condition}
            onChange={(c) => onChange(c)}
          />
        )}
        {condition.type === 'interval' && (
          <IntervalInput
            condition={condition}
            onChange={(c) => onChange(c)}
          />
        )}
        {condition.type === 'specific' && (
          <SpecificTimeInput
            condition={condition}
            onChange={(c) => onChange(c)}
          />
        )}
      </div>
      <button
        onClick={onDelete}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-600"
      >
        <Icon name="close" size="sm" />
      </button>
    </div>
  );
}
