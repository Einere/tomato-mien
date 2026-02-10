import React from 'react';
import { Toolbar } from './Toolbar';
import { RuleList } from './RuleList';
import { RuleEditor } from './RuleEditor';
import { StatusBar } from './StatusBar';
import { useAlarm } from '@/hooks';
import { RuleEditorProvider } from '@/contexts/RuleEditorContext';

export const MainLayout: React.FC = () => {
  const { rules, selectedRuleId, alarmService } = useAlarm();

  const selectedRule = rules.find(rule => rule.id === selectedRuleId);
  const activeRuleCount = alarmService.getActiveRuleCount();
  const lastCheckTime = alarmService.getLastCheckTime();

  return (
    <div className='h-screen flex flex-col bg-gray-50'>
      {/* 툴바 */}
      <Toolbar title='Tomato Mien' />

      {/* 메인 컨텐츠 */}
      <div className='flex-1 flex overflow-hidden'>
        {/* 좌측 패널 - 규칙 리스트 */}
        <div className='w-1/4 min-w-64'>
          <RuleList rules={rules} />
        </div>

        {/* 우측 패널 - 규칙 편집기 */}
        <div className='flex-1'>
          <RuleEditorProvider>
            <RuleEditor rule={selectedRule} />
          </RuleEditorProvider>
        </div>
      </div>

      {/* 상태바 */}
      <StatusBar
        activeRuleCount={activeRuleCount}
        lastCheckTime={lastCheckTime}
      />
    </div>
  );
};
