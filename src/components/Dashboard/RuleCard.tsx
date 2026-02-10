import { useSetAtom } from 'jotai';
import { clsx } from 'clsx';
import type { AlarmRule, TimeCondition, CompoundCondition } from '@/types/alarm';
import { toggleRuleAtom, viewAtom } from '@/store';
import { describeCondition } from '@/utils/condition';
import { isCompoundCondition } from '@/utils/typeGuards';
import { Card } from '@/components/UI/Card';
import { Icon } from '@/components/UI/Icon';
import { Toggle } from '@/components/UI/Toggle';

function getConditionIcon(
  condition: TimeCondition | CompoundCondition,
): string {
  if (isCompoundCondition(condition)) return 'account_tree';
  switch (condition.type) {
    case 'range':
      return 'schedule';
    case 'interval':
      return 'timer';
    case 'specific':
      return 'alarm';
  }
}

interface RuleCardProps {
  rule: AlarmRule;
}

export function RuleCard({ rule }: RuleCardProps) {
  const toggleRule = useSetAtom(toggleRuleAtom);
  const setView = useSetAtom(viewAtom);

  const description = describeCondition(rule.condition);
  const icon = getConditionIcon(rule.condition);

  return (
    <Card
      padding="none"
      className={clsx(
        'cursor-pointer transition-shadow hover:shadow-md',
        !rule.enabled && 'opacity-60',
      )}
      onClick={() => setView({ view: 'editor', ruleId: rule.id })}
    >
      <div className="flex items-center gap-3 p-4">
        <div
          className={clsx(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            rule.enabled
              ? 'bg-tomato-100 text-tomato-600'
              : 'bg-slate-100 text-slate-400',
          )}
        >
          <Icon name={icon} size="sm" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">
            {rule.name}
          </p>
          <p className="truncate text-xs text-slate-500">{description}</p>
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Toggle
            checked={rule.enabled}
            onChange={() => toggleRule(rule.id)}
          />
        </div>
      </div>
    </Card>
  );
}
