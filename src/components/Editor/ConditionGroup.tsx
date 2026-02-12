import type {
  CompoundCondition,
  TimeCondition,
  LogicalOperator,
} from "@/types/alarm";
import { isCompoundCondition } from "@/utils/typeGuards";
import { createConditionByType } from "@/utils/alarmRules";
import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { Icon } from "@/components/UI/Icon";
import { ConditionRow } from "./ConditionRow";

interface ConditionGroupProps {
  group: CompoundCondition;
  onChange: (updated: CompoundCondition) => void;
  onDelete?: () => void;
}

export function ConditionGroup({
  group,
  onChange,
  onDelete,
}: ConditionGroupProps) {
  const toggleOperator = () => {
    const newOp: LogicalOperator = group.operator === "AND" ? "OR" : "AND";
    onChange({ ...group, operator: newOp });
  };

  const updateCondition = (
    index: number,
    updated: TimeCondition | CompoundCondition,
  ) => {
    const newConditions = group.conditions.map((c, i) =>
      i === index ? updated : c,
    );
    onChange({ ...group, conditions: newConditions });
  };

  const deleteCondition = (index: number) => {
    const newConditions = group.conditions.filter((_, i) => i !== index);
    onChange({ ...group, conditions: newConditions });
  };

  const addCondition = (type: "range" | "interval" | "specific") => {
    onChange({
      ...group,
      conditions: [...group.conditions, createConditionByType(type)],
    });
  };

  return (
    <Card padding="sm" className="border-border-muted border">
      <div className="mb-2 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={toggleOperator}
          aria-label="Toggle match operator"
          className="bg-muted text-overline text-muted-foreground hover:bg-subtle px-2.5 py-1"
        >
          MATCH {group.operator === "AND" ? "ALL" : "ANY"} ({group.operator})
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            onClick={onDelete}
            aria-label="Delete condition group"
            className="h-7 w-7 p-0"
          >
            <Icon name="close" size="sm" />
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {group.conditions.map((cond, idx) =>
          isCompoundCondition(cond) ? (
            <ConditionGroup
              key={idx}
              group={cond}
              onChange={updated => updateCondition(idx, updated)}
              onDelete={() => deleteCondition(idx)}
            />
          ) : (
            <ConditionRow
              key={idx}
              condition={cond}
              onChange={updated => updateCondition(idx, updated)}
              onDelete={() => deleteCondition(idx)}
            />
          ),
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <Button
          variant="ghost"
          className="text-xs"
          onClick={() => addCondition("range")}
        >
          <Icon name="add" size="sm" /> Range
        </Button>
        <Button
          variant="ghost"
          className="text-xs"
          onClick={() => addCondition("interval")}
        >
          <Icon name="add" size="sm" /> Interval
        </Button>
        <Button
          variant="ghost"
          className="text-xs"
          onClick={() => addCondition("specific")}
        >
          <Icon name="add" size="sm" /> Time
        </Button>
      </div>
    </Card>
  );
}
