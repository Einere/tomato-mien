import React, { useState } from 'react'
import type { CompoundCondition, TimeCondition, LogicalOperator } from '../../types/alarm'
import { Select } from '../UI/Select'
import { Button } from '../UI/Button'
import { Dropdown } from '../UI/Dropdown'
import { SingleCondition } from './SingleCondition'
import { ChevronDownIcon, XIcon } from '../UI/Icons'
import { createDefaultRange, createDefaultCompound, getOperatorLabel } from '../../utils/alarmRules'

type AnyCondition = TimeCondition | CompoundCondition

interface CompoundConditionsProps {
  condition: CompoundCondition
  onChange: (condition: CompoundCondition) => void
  onDelete: () => void
  showDelete?: boolean
}

export const CompoundConditions: React.FC<CompoundConditionsProps> = ({
  condition,
  onChange,
  onDelete,
  showDelete = true
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleOperatorChange = (newOperator: LogicalOperator) => {
    onChange({ ...condition, operator: newOperator })
  }

  const addCondition = () => {
    onChange({
      ...condition,
      conditions: [...condition.conditions, createDefaultRange()]
    })
  }

  const addGroup = () => {
    onChange({
      ...condition,
      conditions: [...condition.conditions, createDefaultCompound('AND')]
    })
  }

  const updateCondition = (index: number, newCondition: AnyCondition) => {
    const newConditions = [...condition.conditions]
    newConditions[index] = newCondition
    onChange({ ...condition, conditions: newConditions })
  }

  const removeCondition = (index: number) => {
    const newConditions = condition.conditions.filter((_, i) => i !== index)
    if (newConditions.length === 0) {
      onDelete()
    } else {
      onChange({ ...condition, conditions: newConditions })
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select
            value={condition.operator}
            onChange={(e) => handleOperatorChange(e.target.value as LogicalOperator)}
            options={[
              { value: 'AND', label: '그리고 (AND)' },
              { value: 'OR', label: '또는 (OR)' }
            ]}
            className="min-w-[140px]"
          />
          <span className="text-secondary text-sm">{condition.conditions.length}개 조건</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsOpen(!isOpen)}
            variant="ghost"
            size="sm"
            className="p-1 text-muted hover:text-secondary"
          >
            <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
          {showDelete && (
            <Button
              onClick={onDelete}
              variant="ghost"
              size="sm"
              className="p-1 text-red-400 hover:text-red-600"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-3">
          {condition.conditions.map((subCondition, index) => (
            <div key={index} className="relative">
              {index > 0 && (
                <div className="flex items-center justify-center my-2">
                  <span className="px-2 py-1 bg-gray-200 text-secondary text-xs rounded">
                    {getOperatorLabel(condition.operator)}
                  </span>
                </div>
              )}

              {'operator' in subCondition ? (
                <CompoundConditions
                  condition={subCondition}
                  onChange={(updated) => updateCondition(index, updated)}
                  onDelete={() => removeCondition(index)}
                />
              ) : (
                <SingleCondition
                  condition={subCondition}
                  onChange={(updated) => updateCondition(index, updated)}
                  onDelete={() => removeCondition(index)}
                />
              )}
            </div>
          ))}

          {/* 추가 버튼 */}
          <Dropdown
            trigger={
              <Button
                variant="secondary"
                className="w-full border-2 border-dashed border-gray-300 text-secondary hover:border-gray-400 hover:text-secondary"
              >
                + 조건 추가
              </Button>
            }
            items={[
              {
                label: '조건 추가',
                onClick: addCondition
              },
              {
                label: '그룹 추가',
                onClick: addGroup
              }
            ]}
          />
        </div>
      )}
    </div>
  )
}