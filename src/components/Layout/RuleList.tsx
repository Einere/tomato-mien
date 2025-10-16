import React from 'react'
import type { AlarmRule } from '../../types/alarm'

interface RuleListProps {
  rules: AlarmRule[]
  selectedRuleId?: string
  onRuleSelect: (ruleId: string) => void
  onToggleEnabled: (ruleId: string) => void
}

export const RuleList: React.FC<RuleListProps> = ({
  rules,
  selectedRuleId,
  onRuleSelect,
  onToggleEnabled,
}) => {
  return (
    <div className="bg-white border-r border-gray-200 h-full shadow-sm">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="mr-2">📋</span>
          알람 규칙
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          총 {rules.length}개 규칙
        </p>
      </div>
      <div className="overflow-y-auto">
        {rules.length === 0 ? (
          <div className="p-6 text-gray-500 text-center">
            <div className="text-4xl mb-3">⏰</div>
            <p className="font-medium mb-2">알람 규칙이 없습니다</p>
            <p className="text-sm">
              새 규칙을 추가해보세요.
            </p>
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
                selectedRuleId === rule.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => onRuleSelect(rule.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 flex items-center">
                    <span className="mr-2">{rule.enabled ? '🔔' : '🔕'}</span>
                    {rule.name}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    rule.enabled ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {rule.enabled ? '활성화됨' : '비활성화됨'}
                  </p>
                </div>
                <button
                  className={`ml-2 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    rule.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleEnabled(rule.id)
                  }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
                      rule.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
