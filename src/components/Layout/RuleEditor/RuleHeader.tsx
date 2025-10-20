import React from 'react';
import type { AlarmRule } from '@/types/alarm';
import { Button, ActivationStatus, Card } from '@/components/UI';
import { useRuleEditorActions, useAlarmActions } from '@/hooks';

interface RuleHeaderProps {
  rule: AlarmRule;
  hasChanges: boolean;
}

export const RuleHeader: React.FC<RuleHeaderProps> = ({ rule, hasChanges }) => {
  const { updateName, updateEnabled } = useRuleEditorActions();
  const { updateRule, deleteRule } = useAlarmActions();

  const handleSave = () => {
    updateRule(rule);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `"${rule.name}" 규칙을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`,
      )
    ) {
      deleteRule(rule.id);
    }
  };

  return (
    <Card className='mb-6 p-6'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <input
            type='text'
            value={rule.name}
            onChange={e => updateName(e.target.value)}
            className='text-2xl font-semibold text-primary bg-transparent border-none outline-none w-full placeholder-gray-400'
            placeholder='규칙 이름을 입력하세요'
          />
          <div className='text-sm text-secondary mt-1'>
            <ActivationStatus enabled={rule.enabled} light={true} />
          </div>
        </div>
        <div className='flex items-center space-x-3'>
          <Button
            onClick={() => updateEnabled(!rule.enabled)}
            variant={rule.enabled ? 'success' : 'secondary'}
          >
            {rule.enabled ? '비활성화' : '활성화'}
          </Button>
          <Button onClick={handleDelete} variant='danger'>
            삭제
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            variant='primary'
            className={
              !hasChanges ? 'bg-gray-300 text-secondary cursor-not-allowed' : ''
            }
          >
            저장
          </Button>
        </div>
      </div>
    </Card>
  );
};
