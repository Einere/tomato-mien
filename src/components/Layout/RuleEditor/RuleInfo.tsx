import React from 'react'
import type { AlarmRule } from '../../../types/alarm'
import { InfoIcon, Card } from '../../UI'

interface RuleInfoProps {
  rule: AlarmRule
}

export const RuleInfo: React.FC<RuleInfoProps> = ({ rule }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
          <InfoIcon className="w-4 h-4 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-primary">규칙 정보</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-secondary mb-1">생성일</p>
          {/* TODO: intl 유틸 함수로 추상화하기 */}
          <p className="text-primary">{new Date(rule.createdAt).toLocaleDateString('ko-KR')}</p>
        </div>
        <div>
          <p className="text-secondary mb-1">수정일</p>
          <p className="text-primary">{new Date(rule.updatedAt).toLocaleDateString('ko-KR')}</p>
        </div>
      </div>
    </Card>
  )
}
