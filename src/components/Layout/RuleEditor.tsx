import React, { useEffect } from 'react';
import type { AlarmRule } from '@/types/alarm';
import { RuleHeader } from './RuleEditor/RuleHeader';
import { ConditionSection } from './RuleEditor/ConditionSection';
import { RuleInfo } from './RuleEditor/RuleInfo';
import { EmptyState } from './RuleEditor/EmptyState';
import { useRuleEditor, useRuleEditorActions } from '@/hooks';

interface RuleEditorProps {
  rule?: AlarmRule;
}

export const RuleEditor: React.FC<RuleEditorProps> = ({ rule }) => {
  const { editedRule, hasChanges } = useRuleEditor();
  const { setOriginalRule } = useRuleEditorActions();

  useEffect(() => {
    setOriginalRule(rule || null);
  }, [rule, setOriginalRule]);

  if (!rule || !editedRule) {
    return <EmptyState />;
  }

  return (
    <div className='bg-gray-50 h-full overflow-y-auto'>
      <div className='p-6 max-w-4xl mx-auto'>
        <RuleHeader rule={editedRule} hasChanges={hasChanges} />

        <ConditionSection rule={editedRule} />

        <RuleInfo rule={editedRule} />
      </div>
    </div>
  );
};
