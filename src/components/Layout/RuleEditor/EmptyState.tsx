import React from 'react'
import { ClockIcon } from '../../UI/Icons'

export const EmptyState: React.FC = () => {
  return (
    <div className="bg-gray-50 h-full flex items-center justify-center">
      <div className="text-center text-secondary max-w-sm">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
          <ClockIcon className="w-8 h-8 text-muted" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-primary">알람 규칙을 선택하세요</h3>
        <p className="text-sm text-secondary">
          좌측에서 규칙을 선택하거나 새 규칙을 추가해보세요.
        </p>
      </div>
    </div>
  )
}
