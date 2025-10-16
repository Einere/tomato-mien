import React from 'react'
import type { AlarmRule } from '../../../types/alarm'
import { Button } from '../../UI/Button'

interface RuleHeaderProps {
  rule: AlarmRule
  onNameChange: (name: string) => void
  onEnabledChange: (enabled: boolean) => void
  onDelete: () => void
  onSave: () => void
  hasChanges: boolean
}

export const RuleHeader: React.FC<RuleHeaderProps> = ({
  rule,
  onNameChange,
  onEnabledChange,
  onDelete,
  onSave,
  hasChanges,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <input
              type="text"
              value={rule.name}
              onChange={(e) => onNameChange(e.target.value)}
              className="text-2xl font-semibold text-gray-900 bg-transparent border-none outline-none w-full placeholder-gray-400"
              placeholder="규칙 이름을 입력하세요"
            />
            <div className="text-sm text-gray-500 mt-1">
              {rule.enabled ? (
                <span className="inline-flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  활성화됨
                </span>
              ) : (
                <span className="inline-flex items-center text-gray-400">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                  비활성화됨
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => onEnabledChange(!rule.enabled)}
              variant={rule.enabled ? 'success' : 'secondary'}
            >
              {rule.enabled ? '비활성화' : '활성화'}
            </Button>
            <Button
              onClick={onDelete}
              variant="danger"
            >
              삭제
            </Button>
            <Button
              onClick={onSave}
              disabled={!hasChanges}
              variant="primary"
              className={!hasChanges ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : ''}
            >
              저장
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
