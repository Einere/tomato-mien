import { useSetAtom, useAtomValue } from "jotai";
import { cn } from "@/lib/cn";
import type { AlarmRule, TriggerCondition } from "@/types/alarm";
import {
  toggleRuleAtom,
  viewAtom,
  editorRuleIdAtom,
  settingsAtom,
} from "@/store";
import { describeRule } from "@/utils/condition";
import { Card, Icon, Toggle } from "@tomato-mien/ui";

function getConditionIcon(triggers: TriggerCondition[]): string {
  if (triggers.length === 0) return "timer";
  const first = triggers[0];
  switch (first.type) {
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

  const description = describeRule(rule.triggers, rule.filters, timeFormat);
  const icon = getConditionIcon(rule.triggers);

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
