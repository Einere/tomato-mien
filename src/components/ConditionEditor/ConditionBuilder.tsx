import React from 'react'
import type {
  TimeCondition,
  RangeCondition,
  IntervalCondition,
  SpecificCondition,
} from '../../types/alarm'

interface ConditionBuilderProps {
  condition: TimeCondition
  onChange: (condition: TimeCondition) => void
}

export const ConditionBuilder: React.FC<ConditionBuilderProps> = ({
  condition,
  onChange,
}) => {

  const handleTypeChange = (type: string) => {
    // 새로운 조건 생성
    switch (type) {
      case 'range':
        onChange({
          type: 'range',
          startHour: 9,
          startMinute: 0,
          endHour: 17,
          endMinute: 0,
        } as RangeCondition)
        break
      case 'interval':
        onChange({
          type: 'interval',
          intervalMinutes: 15,
        } as IntervalCondition)
        break
      case 'specific':
        onChange({
          type: 'specific',
          hour: 14,
          minute: 30,
        } as SpecificCondition)
        break
    }
  }

  const renderRangeCondition = (condition: RangeCondition) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          시작 시간
        </label>
        <div className="flex space-x-2">
          <select
            value={condition.startHour}
            onChange={(e) =>
              onChange({
                ...condition,
                startHour: parseInt(e.target.value),
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, '0')}시
              </option>
            ))}
          </select>
          <select
            value={condition.startMinute}
            onChange={(e) =>
              onChange({
                ...condition,
                startMinute: parseInt(e.target.value),
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 60 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, '0')}분
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          종료 시간
        </label>
        <div className="flex space-x-2">
          <select
            value={condition.endHour}
            onChange={(e) =>
              onChange({
                ...condition,
                endHour: parseInt(e.target.value),
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, '0')}시
              </option>
            ))}
          </select>
          <select
            value={condition.endMinute}
            onChange={(e) =>
              onChange({
                ...condition,
                endMinute: parseInt(e.target.value),
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 60 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, '0')}분
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )

  const renderIntervalCondition = (condition: IntervalCondition) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        간격 (분)
      </label>
      <select
        value={condition.intervalMinutes}
        onChange={(e) =>
          onChange({
            ...condition,
            intervalMinutes: parseInt(e.target.value),
          })
        }
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value={5}>5분마다</option>
        <option value={10}>10분마다</option>
        <option value={15}>15분마다</option>
        <option value={30}>30분마다</option>
        <option value={60}>1시간마다</option>
      </select>
    </div>
  )

  const renderSpecificCondition = (condition: SpecificCondition) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          시간 (선택사항)
        </label>
        <select
          value={condition.hour ?? ''}
          onChange={(e) =>
            onChange({
              ...condition,
              hour: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">모든 시간</option>
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>
              {i.toString().padStart(2, '0')}시
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          분 (선택사항)
        </label>
        <select
          value={condition.minute ?? ''}
          onChange={(e) =>
            onChange({
              ...condition,
              minute: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">모든 분</option>
          {Array.from({ length: 60 }, (_, i) => (
            <option key={i} value={i}>
              {i.toString().padStart(2, '0')}분
            </option>
          ))}
        </select>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          조건 타입
        </label>
        <div className="flex space-x-2">
          <button
            onClick={() => handleTypeChange('range')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              condition.type === 'range'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            시간 범위
          </button>
          <button
            onClick={() => handleTypeChange('interval')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              condition.type === 'interval'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            간격
          </button>
          <button
            onClick={() => handleTypeChange('specific')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              condition.type === 'specific'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            특정 시간
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
        {condition.type === 'range' && renderRangeCondition(condition)}
        {condition.type === 'interval' && renderIntervalCondition(condition)}
        {condition.type === 'specific' && renderSpecificCondition(condition)}
      </div>
    </div>
  )
}
