import React from 'react'
import type { AlarmRule } from '../../../types/alarm'
import { InfoIcon } from '../../UI/Icons'

interface RuleInfoProps {
  rule: AlarmRule
}

export const RuleInfo: React.FC<RuleInfoProps> = ({ rule }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
            <InfoIcon className="w-4 h-4 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">규칙 정보</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">생성일</p>
            <p className="text-gray-900">{new Date(rule.createdAt).toLocaleDateString('ko-KR')}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">수정일</p>
            <p className="text-gray-900">{new Date(rule.updatedAt).toLocaleDateString('ko-KR')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
