import clsx from 'clsx';
import type { AlarmRule } from '@/types/alarm';
import { ActivationStatus, ToggleButton } from '../../UI';
import { useAlarmActions, useAlarm } from '@/hooks';

type RuleItemProps = {
  rule: AlarmRule;
};

export function RuleItem({ rule }: RuleItemProps) {
  const { toggleRule, selectRule } = useAlarmActions();
  const { selectedRuleId } = useAlarm();

  const selected = rule.id === selectedRuleId;

  return (
    <li
      role='button'
      onClick={() => selectRule(rule.id)}
      className={clsx(
        'p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-150',
        selected
          ? 'bg-blue-50 border-l-4 border-l-blue-500'
          : 'border-l-4 border-l-transparent',
      )}
    >
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <h3 className='font-medium text-gray-800 flex items-center'>
            <span className='mr-2'>{rule.enabled ? '🔔' : '🔕'}</span>
            {rule.name}
          </h3>
          <ActivationStatus enabled={rule.enabled} className='text-sm mt-1' />
        </div>
        <ToggleButton
          enabled={rule.enabled}
          onToggle={() => toggleRule(rule.id)}
        />
      </div>
    </li>
  );
}
