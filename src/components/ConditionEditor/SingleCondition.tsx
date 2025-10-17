import React from 'react'
import type { TimeCondition } from '../../types'
import { Button, Select, XIcon } from '../UI'
import { createConditionByType } from '../../utils/alarmRules'
import { SpecificTimeInput, TimeIntervalInput, TimeRangeInput } from './ConditionInput'

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
          {(() => {
            switch (condition.type) {
              case 'range':
                return <TimeRangeInput condition={condition} onChange={onChange} />
              case 'interval':
                return <TimeIntervalInput condition={condition} onChange={onChange} />
              case 'specific':
                return <SpecificTimeInput condition={condition} onChange={onChange} />
              default:
                return null;
            }
          })()}
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