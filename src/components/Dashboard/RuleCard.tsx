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
import { Card, MenuRow, Toggle, TimerIcon, AlarmIcon } from "@tomato-mien/ui";
import type { ComponentType } from "react";
import type { IconProps } from "@tomato-mien/ui";

function getConditionIcon(
  triggers: TriggerCondition[],
): ComponentType<IconProps> {
  if (triggers.length === 0) return TimerIcon;
  const first = triggers[0];
  switch (first.type) {
    case "interval":
      return TimerIcon;
    case "specific":
      return AlarmIcon;
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
      <MenuRow>
        <MenuRow.Icon
          icon={icon}
          className={
            !rule.enabled ? "bg-muted text-subtle-foreground" : undefined
          }
        />
        <MenuRow.Label title={rule.name} description={description} truncate />
        <div
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <Toggle checked={rule.enabled} onChange={() => toggleRule(rule.id)} />
        </div>
      </MenuRow>
    </Card>
  );
}
