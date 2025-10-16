import React from 'react'
import type { IntervalCondition, SpecificCondition, TimeCondition } from '../../types/alarm'
import { Button } from '../UI/Button'
import { Select } from '../UI/Select'
import { XIcon } from '../UI/Icons'
import { createConditionByType, getConditionLabel } from '../../utils/alarmRules'

interface SingleConditionProps {
  condition: TimeCondition
  onChange: (condition: TimeCondition) => void
  onDelete: () => void
  showDelete?: boolean
}

export const SingleCondition: React.FC<SingleConditionProps> = ({
  condition,
  onChange,
  onDelete,
  showDelete = true
}) => {
  const handleTypeChange = (newType: TimeCondition['type']) => {
    onChange(createConditionByType(newType))
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Select
            value={condition.type}
            onChange={(e) => handleTypeChange(e.target.value as TimeCondition['type'])}
            options={[
              { value: 'range', label: '시간 범위' },
              { value: 'interval', label: '간격' },
              { value: 'specific', label: '특정 시간' }
            ]}
            className="min-w-[120px]"
          />
          {/* TODO: input 요소를 여기로 옮기자 */}
          {condition.type === 'range' && (
            <TimeRangeInput condition={condition} onChange={onChange} />
          )}
          {condition.type === 'interval' && (
            <TimeIntervalInput condition={condition} onChange={onChange} />
          )}
          {condition.type === 'specific' && (
            <SpecificTimeInput condition={condition} onChange={onChange} />
          )}
          {/* <span className="text-gray-600 text-sm">{getConditionLabel(condition)}</span> */}
        </div>
        <div className="flex items-center space-x-2">
          {showDelete && (
            <Button
              onClick={onDelete}
              variant="ghost"
              size="sm"
            >
              <XIcon className="w-4 h-4 text-red-400 hover:text-red-600" />
            </Button>
          )}
        </div>
      </div>


    </div>
  )
}

type TimeRangeInputProps = Omit<SingleConditionProps, "condition" | "onDelete"> & {
  condition: RangeCondition;
};
function TimeRangeInput(props: TimeRangeInputProps) {
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

function TimeIntervalInput(props: Omit<SingleConditionProps, "condition" | "onDelete"> & {
  condition: IntervalCondition;
}) {
  const { condition, onChange } = props;


  return (
    <form>
      <input
        type="number"
        min="1"
        max="720"
        value={condition.intervalMinutes}
        onChange={(e) => onChange({ ...condition, intervalMinutes: parseInt(e.target.value) || 1 })}
      />
      <span className="text-secondary self-center">&nbsp;분 마다</span>
    </form>
  );

}

type SpecificTimeInputProps = Omit<SingleConditionProps, "condition" | "onDelete"> & {
  condition: SpecificCondition;
};
function SpecificTimeInput(props: SpecificTimeInputProps) {
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