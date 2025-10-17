import React from 'react'
import type { AlarmRule } from '../../../types/alarm'
import { Button, ActivationStatus } from '../../UI'

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
              className="text-2xl font-semibold text-primary bg-transparent border-none outline-none w-full placeholder-gray-400"
              placeholder="규칙 이름을 입력하세요"
            />
            <div className="text-sm text-secondary mt-1">
              <ActivationStatus enabled={rule.enabled} light={true} />
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
              className={!hasChanges ? 'bg-gray-300 text-secondary cursor-not-allowed' : ''}
            >
              저장
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
