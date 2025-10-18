import React from 'react';
import type { AlarmRule } from '../../../types/alarm';
import { EmptyRuleList } from './EmptyRuleList';
import { RuleItem } from './RuleItem';

interface RuleListProps {
  rules: AlarmRule[];
  selectedRuleId?: string;
  onRuleSelect: (ruleId: string) => void;
  onToggleEnabled: (ruleId: string) => void;
}

export const RuleList: React.FC<RuleListProps> = ({
  rules,
  selectedRuleId,
  onRuleSelect,
  onToggleEnabled,
}) => {
  return (
    <div className='bg-white border-r border-gray-200 h-full shadow-sm'>
      {/* 헤더 영역 */}
      <div className='p-4 border-b border-gray-200 bg-gray-50'>
        <h2 className='text-lg font-semibold text-gray-800 flex items-center'>
          📋 알람 규칙
        </h2>
        <p className='text-sm text-gray-600 mt-1'>총 {rules.length}개 규칙</p>
      </div>

      {/* 바디 영역 */}
      <ol className='overflow-y-auto'>
        {rules.length === 0 ? (
          <EmptyRuleList />
        ) : (
          rules.map(rule => (
            <RuleItem
              key={rule.id}
              rule={rule}
              selected={rule.id === selectedRuleId}
              onRuleSelect={onRuleSelect}
              onToggleEnabled={onToggleEnabled}
            />
          ))
        )}
      </ol>
    </div>
  );
};
