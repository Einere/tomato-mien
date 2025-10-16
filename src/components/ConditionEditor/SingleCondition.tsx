import React from 'react'
import type { TimeCondition } from '../../types/alarm'
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
          <span className="text-gray-600 text-sm">{getConditionLabel(condition)}</span>
        </div>
        <div className="flex items-center space-x-2">
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

      <div className="space-y-4">
        {condition.type === 'range' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={condition.startHour}
                  onChange={(e) => onChange({ ...condition, startHour: parseInt(e.target.value) || 0 })}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500 self-center">시</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={condition.startMinute}
                  onChange={(e) => onChange({ ...condition, startMinute: parseInt(e.target.value) || 0 })}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500 self-center">분</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={condition.endHour}
                  onChange={(e) => onChange({ ...condition, endHour: parseInt(e.target.value) || 0 })}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500 self-center">시</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={condition.endMinute}
                  onChange={(e) => onChange({ ...condition, endMinute: parseInt(e.target.value) || 0 })}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500 self-center">분</span>
              </div>
            </div>
          </div>
        )}

        {condition.type === 'interval' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">간격 (분)</label>
            <input
              type="number"
              min="1"
              max="720"
              value={condition.intervalMinutes}
              onChange={(e) => onChange({ ...condition, intervalMinutes: parseInt(e.target.value) || 1 })}
              className="w-32 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {condition.type === 'specific' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
              <select
                value={condition.hour ?? ''}
                onChange={(e) => onChange({ ...condition, hour: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">모든 시간</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{i.toString().padStart(2, '0')}시</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">분</label>
              <select
                value={condition.minute ?? ''}
                onChange={(e) => onChange({ ...condition, minute: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">모든 분</option>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>{i.toString().padStart(2, '0')}분</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}