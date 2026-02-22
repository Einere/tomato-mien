import { useSetAtom, useAtomValue } from "jotai";
import { cn } from "@/lib/cn";
import type { AlarmRule, TriggerCondition } from "@/types/alarm";
import {
  toggleRuleAtom,
  viewAtom,
  editorRuleIdAtom,
  settingsAtom,
} from "@/store";
import { describeRule, describeSchedule } from "@/utils/condition";
import {
  Card,
  MenuRow,
  Toggle,
  Badge,
  TimerIcon,
  AlarmIcon,
} from "@tomato-mien/ui";
import type { ComponentType } from "react";
import type { IconProps } from "@tomato-mien/ui";
import { useViewTransition } from "@tomato-mien/view-transition";

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
  const { triggerTransition } = useViewTransition();

  const description = describeRule(rule.triggers, rule.filters, timeFormat);
  const scheduleText =
    !rule.enabled && rule.scheduledEnableAt
      ? describeSchedule(rule.scheduledEnableAt, timeFormat)
      : "";
  const icon = getConditionIcon(rule.triggers);

  const navigateToEditor = () => {
    triggerTransition(() => {
      setEditorRuleId(rule.id);
      setView("editor");
    }, "drill-forward");
  };

  return (
    <Card
      padding="none"
      className={cn(
        "focus-visible:ring-ring cursor-pointer transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        !rule.enabled && "opacity-60",
      )}
      role="button"
      tabIndex={0}
      onClick={navigateToEditor}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigateToEditor();
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
        <div className="min-w-0 flex-1">
          <MenuRow.Label title={rule.name} description={description} truncate />
          {scheduleText && (
            <Badge variant="primary" className="mt-1">
              {scheduleText}
            </Badge>
          )}
        </div>
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
