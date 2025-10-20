import React, { useEffect } from 'react';
import type { AlarmRule } from '../../types/alarm';
import { RuleHeader } from './RuleEditor/RuleHeader';
import { ConditionSection } from './RuleEditor/ConditionSection';
import { RuleInfo } from './RuleEditor/RuleInfo';
import { EmptyState } from './RuleEditor/EmptyState';
import { useAlarmActions } from '../../hooks';
import { useRuleEditor, useRuleEditorActions } from '../../hooks';

interface RuleEditorProps {
  rule?: AlarmRule;
}

export const RuleEditor: React.FC<RuleEditorProps> = ({ rule }) => {
  const { editedRule, hasChanges } = useRuleEditor();
  const { setOriginalRule } = useRuleEditorActions();
  const { updateRule, deleteRule } = useAlarmActions();

  useEffect(() => {
    setOriginalRule(rule || null);
  }, [rule, setOriginalRule]);

  if (!rule || !editedRule) {
    return <EmptyState />;
  }

  const handleSave = () => {
    updateRule(editedRule);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `"${editedRule.name}" 규칙을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`,
      )
    ) {
      deleteRule(editedRule.id);
    }
  };

  return (
    <div className='bg-gray-50 h-full overflow-y-auto'>
      <div className='p-6 max-w-4xl mx-auto'>
        <RuleHeader
          rule={editedRule}
          onSave={handleSave}
          onDelete={handleDelete}
          hasChanges={hasChanges}
        />

        <ConditionSection rule={editedRule} />

        <RuleInfo rule={editedRule} />
      </div>
    </div>
  );
};
