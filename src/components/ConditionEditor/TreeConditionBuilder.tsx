import React from 'react'
import type {
  TimeCondition,
  RangeCondition,
  IntervalCondition,
  SpecificCondition,
  CompoundCondition,
  LogicalOperator,
} from '../../types/alarm'

type AnyCondition = TimeCondition | CompoundCondition

interface TreeConditionBuilderProps {
  condition: AnyCondition
  onChange: (condition: AnyCondition) => void
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

const OperatorBadge: React.FC<{ operator: LogicalOperator }> = ({ operator }) => (
  <span
    className={
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ' +
      (operator === 'AND'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-purple-100 text-purple-700')
    }
  >
    {operator}
  </span>
)

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded border text-xs text-primary bg-white">
    {label}
  </span>
)

export const TreeConditionBuilder: React.FC<TreeConditionBuilderProps> = ({
  condition,
  onChange,
}) => {
  const renderSimpleEditor = (c: TimeCondition) => {
    if (c.type === 'range') {
      return (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <SectionLabel label="시작" />
            <div className="mt-2 flex gap-2">
              <select
                value={c.startHour}
                onChange={(e) => onChange({ ...c, startHour: parseInt(e.target.value) })}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, '0')}시
                  </option>
                ))}
              </select>
              <select
                value={c.startMinute}
                onChange={(e) => onChange({ ...c, startMinute: parseInt(e.target.value) })}
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
            <SectionLabel label="종료" />
            <div className="mt-2 flex gap-2">
              <select
                value={c.endHour}
                onChange={(e) => onChange({ ...c, endHour: parseInt(e.target.value) })}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, '0')}시
                  </option>
                ))}
              </select>
              <select
                value={c.endMinute}
                onChange={(e) => onChange({ ...c, endMinute: parseInt(e.target.value) })}
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
    }
    if (c.type === 'interval') {
      return (
        <div className="flex items-center gap-2">
          <SectionLabel label="간격(분)" />
          <select
            value={c.intervalMinutes}
            onChange={(e) => onChange({ ...c, intervalMinutes: parseInt(e.target.value) })}
          >
            {[5, 10, 15, 30, 60].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )
    }
    // specific
    return (
      <div className="grid grid-cols-2 gap-2">
        <div>
          <SectionLabel label="시간" />
          <select
            className="mt-2 w-full"
            value={c.hour ?? ''}
            onChange={(e) => onChange({ ...c, hour: e.target.value ? parseInt(e.target.value) : undefined })}
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
          <SectionLabel label="분" />
          <select
            className="mt-2 w-full"
            value={c.minute ?? ''}
            onChange={(e) => onChange({ ...c, minute: e.target.value ? parseInt(e.target.value) : undefined })}
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
  }

  const renderNode = (node: AnyCondition, level: number, onNodeChange: (updated: AnyCondition) => void) => {
    const indentClass = level > 0 ? 'pl-4 md:pl-6' : ''

    if ('operator' in node) {
      return (
        <div className={`space-y-3 ${indentClass}`}>
          <div className="flex items-center justify-between relative">
            {level > 0 && (
              <div className="absolute -left-3 top-1 bottom-1 w-px bg-gray-200" />
            )}
            <div className="flex items-center gap-2">
              <OperatorBadge operator={node.operator} />
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => onNodeChange({ ...node, operator: node.operator === 'AND' ? 'OR' : 'AND' })}
              >
                연산자 전환
              </button>
              <button
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                onClick={() => onNodeChange({ ...node, conditions: [...node.conditions, createDefaultRange()] })}
              >
                + 조건
              </button>
              <button
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                onClick={() => onNodeChange({ ...node, conditions: [...node.conditions, { operator: 'AND', conditions: [createDefaultRange()] }] })}
              >
                + 그룹
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {node.conditions.map((child, idx) => (
              <div key={idx} className="relative">
                {level >= 0 && (
                  <div className="absolute -left-3 top-0 bottom-0 w-px bg-gray-200" />
                )}
                <div className="absolute -left-3 top-3 w-2 h-2 bg-gray-300 rounded-full" />
                {renderNode(child, level + 1, (updated) => {
                  const next = [...node.conditions]
                  next[idx] = updated
                  onNodeChange({ ...node, conditions: next })
                })}
                <div className="mt-2 flex gap-2">
                  <button
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => {
                      const next = node.conditions.filter((_, i) => i !== idx)
                      onNodeChange({ ...node, conditions: next })
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    // simple node
    return (
      <div className={`space-y-2 ${indentClass} relative`}>
        {level > 0 && (
          <div className="absolute -left-3 top-1 bottom-1 w-px bg-gray-200" />
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SectionLabel label={
              node.type === 'range' ? '시간 범위' : node.type === 'interval' ? '간격' : '특정 시간'
            } />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative group">
              <select
                value={node.type}
                onChange={(e) => {
                  const t = e.target.value as TimeCondition['type']
                  if (t === 'range') onNodeChange(createDefaultRange())
                  else if (t === 'interval') onNodeChange(createDefaultInterval())
                  else onNodeChange(createDefaultSpecific())
                }}
              >
                <option value="range">시간 범위</option>
                <option value="interval">간격</option>
                <option value="specific">특정 시간</option>
              </select>
            </div>
            <button
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              onClick={() => onNodeChange({ operator: 'AND', conditions: [node] })}
            >
              그룹화
            </button>
          </div>
        </div>
        <div className="bg-white p-3 border rounded">
          {renderSimpleEditor(node)}
        </div>
      </div>
    )
  }

  return <div>{renderNode(condition, 0, onChange)}</div>
}


