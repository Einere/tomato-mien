import React from 'react';
import type { AlarmRule } from '../../../types/alarm';
import { InfoIcon, Card, HeaderWithIcon, IconWrapper } from '../../UI';

interface RuleInfoProps {
  rule: AlarmRule;
}

export const RuleInfo: React.FC<RuleInfoProps> = ({ rule }) => {
  return (
    <Card className='p-6'>
      <HeaderWithIcon
        Icon={<IconWrapper Icon={<InfoIcon />} className='mr-3' />}
        title='규칙 정보'
      />

      <div className='grid grid-cols-2 gap-4 text-sm'>
        <div>
          <p className='text-secondary mb-1'>생성일</p>
          {/* TODO: intl 유틸 함수로 추상화하기 */}
          <p className='text-primary'>
            {new Date(rule.createdAt).toLocaleDateString('ko-KR')}
          </p>
        </div>
        <div>
          <p className='text-secondary mb-1'>수정일</p>
          <p className='text-primary'>
            {new Date(rule.updatedAt).toLocaleDateString('ko-KR')}
          </p>
        </div>
      </div>
    </Card>
  );
};
