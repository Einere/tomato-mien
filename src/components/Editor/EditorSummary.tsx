import type { TimeCondition, CompoundCondition } from '@/types/alarm';
import { describeCondition, validateCondition } from '@/utils/condition';
import { Card } from '@/components/UI/Card';
import { Icon } from '@/components/UI/Icon';

interface EditorSummaryProps {
  condition: TimeCondition | CompoundCondition;
}

export function EditorSummary({ condition }: EditorSummaryProps) {
  const description = describeCondition(condition);
  const issues = validateCondition(condition);

  return (
    <div className="px-5 pb-4">
      <span className="mb-2 block text-xs font-semibold tracking-wider text-slate-400 uppercase">
        Summary
      </span>
      <Card padding="sm">
        <div className="flex items-start gap-2">
          <Icon
            name="info"
            size="sm"
            className="mt-0.5 shrink-0 text-slate-400"
          />
          <p className="text-sm text-slate-700">{description}</p>
        </div>
        {issues.length > 0 && (
          <div className="mt-3 flex flex-col gap-1">
            {issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2">
                <Icon
                  name="warning"
                  size="sm"
                  className="mt-0.5 shrink-0 text-amber-500"
                />
                <p className="text-xs text-amber-700">{issue.message}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
