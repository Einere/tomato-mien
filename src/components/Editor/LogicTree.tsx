import type { TimeCondition, CompoundCondition } from "@/types/alarm";
import { isCompoundCondition } from "@/utils/typeGuards";
import { createDefaultCompound } from "@/utils/alarmRules";
import { Badge } from "@/components/UI/Badge";
import { Button } from "@/components/UI/Button";
import { Icon } from "@/components/UI/Icon";
import { ConditionGroup } from "./ConditionGroup";

interface LogicTreeProps {
  condition: TimeCondition | CompoundCondition;
  onChange: (updated: TimeCondition | CompoundCondition) => void;
}

function countGroups(cond: TimeCondition | CompoundCondition): number {
  if (!isCompoundCondition(cond)) return 0;
  let count = 1;
  for (const child of cond.conditions) {
    count += countGroups(child);
  }
  return count;
}

export function LogicTree({ condition, onChange }: LogicTreeProps) {
  const compound: CompoundCondition = isCompoundCondition(condition)
    ? condition
    : { operator: "AND", conditions: [condition] };

  const groupCount = countGroups(compound);

  const handleChange = (updated: CompoundCondition) => {
    onChange(updated);
  };

  const addGroup = () => {
    handleChange({
      ...compound,
      conditions: [...compound.conditions, createDefaultCompound("OR")],
    });
  };

  return (
    <div className="px-5 pb-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Logic
          </span>
          <Badge>{groupCount} Groups</Badge>
        </div>
        <Button variant="ghost" className="text-xs" onClick={addGroup}>
          <Icon name="add" size="sm" /> Group
        </Button>
      </div>
      <ConditionGroup group={compound} onChange={handleChange} />
    </div>
  );
}
