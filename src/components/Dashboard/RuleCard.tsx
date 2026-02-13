import { useSetAtom, useAtomValue } from "jotai";
import { cn } from "@/lib/cn";
import type {
  AlarmRule,
  TimeCondition,
  CompoundCondition,
} from "@/types/alarm";
import {
  toggleRuleAtom,
  viewAtom,
  editorRuleIdAtom,
  settingsAtom,
} from "@/store";
import { describeCondition } from "@/utils/condition";
import { isCompoundCondition } from "@/utils/typeGuards";
import { Card } from "@/components/UI/Card";
import { Icon } from "@/components/UI/Icon";
import { Toggle } from "@/components/UI/Toggle";

function getConditionIcon(
  condition: TimeCondition | CompoundCondition,
): string {
  if (isCompoundCondition(condition)) return "account_tree";
  switch (condition.type) {
    case "range":
      return "schedule";
    case "interval":
      return "timer";
    case "specific":
      return "alarm";
  }
}

interface RuleCardProps {
  rule: AlarmRule;
}

export function RuleCard({ rule }: RuleCardProps) {
  const toggleRule = useSetAtom(toggleRuleAtom);
  const setView = useSetAtom(viewAtom);
  const setEditorRuleId = useSetAtom(editorRuleIdAtom);
  const { timeFormat } = useAtomValue(settingsAtom);

  const description = describeCondition(rule.condition, timeFormat);
  const icon = getConditionIcon(rule.condition);

  return (
    <Card
      padding="none"
      className={cn(
        "focus-visible:ring-ring cursor-pointer transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        !rule.enabled && "opacity-60",
      )}
      role="button"
      tabIndex={0}
      onClick={() => {
        setEditorRuleId(rule.id);
        setView("editor");
      }}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setEditorRuleId(rule.id);
          setView("editor");
        }
      }}
    >
      <div className="flex items-center gap-3 p-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            rule.enabled
              ? "bg-accent text-accent-foreground"
              : "bg-muted text-subtle-foreground",
          )}
        >
          <Icon name={icon} size="sm" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-body text-foreground truncate font-semibold">
            {rule.name}
          </p>
          <p className="text-caption text-muted-foreground truncate">
            {description}
          </p>
        </div>
        <div
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <Toggle checked={rule.enabled} onChange={() => toggleRule(rule.id)} />
        </div>
      </div>
    </Card>
  );
}
