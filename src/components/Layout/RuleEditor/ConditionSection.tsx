import React from 'react';
import type { AlarmRule } from '@/types/alarm';
import { ConditionBuilder } from '@/components/ConditionEditor';
import { describeCondition, validateCondition } from '@/utils/condition';
import {
  ClockIcon,
  CheckIcon,
  WarningIcon,
  Card,
  HeaderWithIcon,
  IconWrapper,
  Callout,
} from '@/components/UI';
import { useRuleEditorActions } from '@/hooks';

interface ConditionSectionProps {
  rule: AlarmRule;
}

export const ConditionSection: React.FC<ConditionSectionProps> = ({ rule }) => {
  const { updateCondition } = useRuleEditorActions();
  const validationErrors = validateCondition(rule.condition);

  return (
    <Card className='mb-6 p-6'>
      {/* 헤더 */}
      <HeaderWithIcon
        Icon={
          <IconWrapper className='mr-3' backgroundColor='bg-tomato-100'>
            <ClockIcon className='text-tomato-600' />
          </IconWrapper>
        }
        title='알람 조건'
      />

      {/* 조건 편집 */}
      <ConditionBuilder condition={rule.condition} onChange={updateCondition} />

      {/* 조건 미리보기 */}
      <Callout
        Icon={
          <IconWrapper
            className='w-5 h-5'
            shape='circle'
            backgroundColor='bg-tomato-100'
          >
            <CheckIcon size={12} className='text-tomato-600' />
          </IconWrapper>
        }
        className='mt-4 bg-tomato-50 border border-tomato-200'
      >
        <p className='text-sm font-medium text-tomato-900 mb-1'>
          조건 미리보기
        </p>
        <p className='text-sm text-tomato-700'>
          {describeCondition(rule.condition)}
        </p>
      </Callout>

      {/* 유효성 검사 */}
      {validationErrors.length > 0 && (
        <Callout
          Icon={
            <IconWrapper
              className='w-5 h-5'
              shape='circle'
              backgroundColor='bg-yellow-100'
            >
              <WarningIcon size={12} className='text-yellow-600' />
            </IconWrapper>
          }
          className='mt-4 bg-yellow-50 border border-yellow-200'
        >
          <p className='text-sm font-medium text-yellow-900 mb-2'>
            조건을 확인해주세요
          </p>
          <ul className='text-sm text-yellow-700 space-y-1'>
            {validationErrors.map((error, index) => (
              <li key={index} className='flex items-start'>
                <span className='mr-2'>•</span>
                <span>{error.message}</span>
              </li>
            ))}
          </ul>
        </Callout>
      )}
    </Card>
  );
};
