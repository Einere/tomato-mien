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
    <Card padding="sm" className="border border-slate-100">
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={toggleOperator}
          aria-label="Toggle match operator"
          className="focus-visible:ring-primary-500 cursor-pointer rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-600 uppercase hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          MATCH {group.operator === "AND" ? "ALL" : "ANY"} ({group.operator})
        </button>
        {onDelete && (
          <Button
            variant="ghost"
            color="danger"
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
