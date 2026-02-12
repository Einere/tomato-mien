import { useAtomValue } from "jotai";
import type { TimeCondition, CompoundCondition } from "@/types/alarm";
import { settingsAtom } from "@/store";
import { describeCondition, validateCondition } from "@/utils/condition";
import { Card } from "@/components/UI/Card";
import { Icon } from "@/components/UI/Icon";

interface EditorSummaryProps {
  condition: TimeCondition | CompoundCondition;
}

export function EditorSummary({ condition }: EditorSummaryProps) {
  const { timeFormat } = useAtomValue(settingsAtom);
  const description = describeCondition(condition, timeFormat);
  const issues = validateCondition(condition);

  return (
    <div className="px-5 pb-4">
      <span className="text-overline text-subtle-foreground mb-2 block">
        Summary
      </span>
      <Card padding="sm">
        <div className="flex items-start gap-2">
          <Icon
            name="info"
            size="sm"
            className="text-subtle-foreground mt-0.5 shrink-0"
          />
          <p className="text-body text-foreground">{description}</p>
        </div>
        {issues.length > 0 && (
          <div className="mt-3 flex flex-col gap-1">
            {issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2">
                <Icon
                  name="warning"
                  size="sm"
                  className="text-warning-500 mt-0.5 shrink-0"
                />
                <p className="text-caption text-warning-700">{issue.message}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
