import React from 'react'
import type { AlarmRule, TimeCondition, CompoundCondition } from '../../../types/alarm'
import { NotionStyleConditionBuilder } from '../../ConditionEditor'
import { describeCondition, validateCondition } from '../../../utils/condition'
import { ClockIcon, CheckIcon, WarningIcon, Card, HeaderWithIcon, IconWrapper } from '../../UI'

interface ConditionSectionProps {
  rule: AlarmRule
  onConditionChange: (condition: TimeCondition | CompoundCondition) => void
}

export const ConditionSection: React.FC<ConditionSectionProps> = ({
  rule,
  onConditionChange,
}) => {
  const validationErrors = validateCondition(rule.condition)

  return (
    <Card className="mb-6 p-6">
      <HeaderWithIcon Icon={<IconWrapper Icon={ClockIcon} className="mr-3" iconClassName="text-blue-600" backgroundColor="bg-blue-100" />} title="알람 조건" />

      <NotionStyleConditionBuilder
        condition={rule.condition}
        onChange={onConditionChange}
      />

      {/* 조건 미리보기 */}
      {/* TODO: Callout 컴포넌트로 분리하기 */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
            <CheckIcon className="w-3 h-3 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">조건 미리보기</p>
            {/* TODO: ConditionBuilder 에서 사용하는 문구랑 최대한 맞춰주기 */}
            <p className="text-sm text-blue-700">{describeCondition(rule.condition)}</p>
          </div>
        </div>
      </div>

      {/* 유효성 검사 */}
      {/* TODO: Callout 컴포넌트로 분리하기 */}
      {validationErrors.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start">
            <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <WarningIcon className="w-3 h-3 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-900 mb-2">조건을 확인해주세요</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{error.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

    </Card>
  )
}
