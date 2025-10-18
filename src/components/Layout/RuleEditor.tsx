import React, { useState, useEffect } from 'react';
import type {
  AlarmRule,
  TimeCondition,
  CompoundCondition,
} from '../../types/alarm';
import { RuleHeader } from './RuleEditor/RuleHeader';
import { ConditionSection } from './RuleEditor/ConditionSection';
import { RuleInfo } from './RuleEditor/RuleInfo';
import { EmptyState } from './RuleEditor/EmptyState';

interface RuleEditorProps {
  rule?: AlarmRule;
  onSave: (rule: AlarmRule) => void;
  onDelete: (ruleId: string) => void;
}

export const RuleEditor: React.FC<RuleEditorProps> = ({
  rule,
  onSave,
  onDelete,
}) => {
  const [editedRule, setEditedRule] = useState<AlarmRule | null>(null);

  useEffect(() => {
    if (rule) {
      setEditedRule({ ...rule });
    }
  }, [rule]);

  if (!rule || !editedRule) {
    return <EmptyState />;
  }

  const handleNameChange = (name: string) => {
    setEditedRule({ ...editedRule, name });
  };

  const handleEnabledChange = (enabled: boolean) => {
    setEditedRule({ ...editedRule, enabled });
  };

  const handleSave = () => {
    onSave(editedRule);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `"${editedRule.name}" 규칙을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`,
      )
    ) {
      onDelete(editedRule.id);
    }
  };

  const handleConditionChange = (
    condition: TimeCondition | CompoundCondition,
  ) => {
    setEditedRule({ ...editedRule, condition, updatedAt: new Date() });
  };

  // 변경사항이 있는지 확인
  const hasChanges = rule
    ? editedRule.name !== rule.name ||
      editedRule.enabled !== rule.enabled ||
      JSON.stringify(editedRule.condition) !== JSON.stringify(rule.condition)
    : true;

  return (
    <div className='bg-gray-50 h-full overflow-y-auto'>
      <div className='p-6 max-w-4xl mx-auto'>
        <RuleHeader
          rule={editedRule}
          onNameChange={handleNameChange}
          onEnabledChange={handleEnabledChange}
          onDelete={handleDelete}
          onSave={handleSave}
          hasChanges={hasChanges}
        />

        <ConditionSection
          rule={editedRule}
          onConditionChange={handleConditionChange}
        />

        <RuleInfo rule={editedRule} />
      </div>
    </div>
  );
};
