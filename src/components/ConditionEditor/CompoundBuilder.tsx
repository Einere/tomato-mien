import React from 'react'
import type {
  TimeCondition,
  RangeCondition,
  IntervalCondition,
  SpecificCondition,
  CompoundCondition,
  LogicalOperator,
} from '../../types/alarm'
import { ConditionBuilder } from './ConditionBuilder'

interface CompoundBuilderProps {
  condition: CompoundCondition
  onChange: (condition: CompoundCondition) => void
}

const createDefaultRange = (): RangeCondition => ({
  type: 'range',
  startHour: 9,
  startMinute: 0,
  endHour: 17,
  endMinute: 0,
})

const createDefaultInterval = (): IntervalCondition => ({
  type: 'interval',
  intervalMinutes: 15,
})

const createDefaultSpecific = (): SpecificCondition => ({
  type: 'specific',
  hour: 14,
  minute: 30,
})

// TODO: 이 컴포넌트는 사용하지 않는다. 삭제할 예정
export const CompoundBuilder: React.FC<CompoundBuilderProps> = ({
  condition,
  onChange,
}) => {
  const updateOperator = (operator: LogicalOperator) => {
    onChange({ ...condition, operator })
  }

  const updateChild = (index: number, updated: TimeCondition | CompoundCondition) => {
    const next = [...condition.conditions]
    next[index] = updated
    onChange({ ...condition, conditions: next })
  }

  const addChildSimple = (type: TimeCondition['type']) => {
    const nextChild: TimeCondition =
      type === 'range'
        ? createDefaultRange()
        : type === 'interval'
          ? createDefaultInterval()
          : createDefaultSpecific()
    onChange({ ...condition, conditions: [...condition.conditions, nextChild] })
  }

  const addChildGroup = () => {
    const group: CompoundCondition = { operator: 'AND', conditions: [createDefaultRange()] }
    onChange({ ...condition, conditions: [...condition.conditions, group] })
  }

  const removeChild = (index: number) => {
    const next = condition.conditions.filter((_, i) => i !== index)
    onChange({ ...condition, conditions: next })
  }

  return (
    <div className="space-y-4">
      {/* Operator */}
      <div>
        <label className="block text-sm font-medium text-primary mb-2">논리 연산자</label>
        <div className="flex items-center space-x-2">
          <button
            className={`px-3 py-2 rounded-md text-sm font-medium ${condition.operator === 'AND'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-primary hover:bg-gray-300'
              }`}
            onClick={() => updateOperator('AND')}
          >
            AND (모두 만족)
          </button>
          <button
            className={`px-3 py-2 rounded-md text-sm font-medium ${condition.operator === 'OR'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-primary hover:bg-gray-300'
              }`}
            onClick={() => updateOperator('OR')}
          >
            OR (하나라도 만족)
          </button>
        </div>
      </div>

      {/* Children */}
      <div className="space-y-3">
        {condition.conditions.map((child, index) => (
          <div key={index} className="border border-gray-200 rounded-md p-3 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-secondary">조건 #{index + 1}</div>
              <button
                className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => removeChild(index)}
              >
                삭제
              </button>
            </div>
            {'operator' in child ? (
              <CompoundBuilder
                condition={child}
                onChange={(updated) => updateChild(index, updated)}
              />
            ) : (
              <ConditionBuilder
                condition={child}
                onChange={(updated) => updateChild(index, updated)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Add child */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
        <button
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
          onClick={() => addChildSimple('range')}
        >
          + 시간 범위
        </button>
        <button
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
          onClick={() => addChildSimple('interval')}
        >
          + 간격
        </button>
        <button
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
          onClick={() => addChildSimple('specific')}
        >
          + 특정 시간
        </button>
        <button
          className="px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-md text-sm text-blue-700"
          onClick={addChildGroup}
        >
          + 그룹 추가
        </button>
      </div>
    </div>
  )
}


