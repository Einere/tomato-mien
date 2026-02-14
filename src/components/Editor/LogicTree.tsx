import type { TriggerCondition, FilterCondition } from "@/types/alarm";
import { FilterSection } from "./FilterSection";
import { TriggerSection } from "./TriggerSection";

interface LogicTreeProps {
  triggers: TriggerCondition[];
  filters: FilterCondition[];
  onTriggersChange: (triggers: TriggerCondition[]) => void;
  onFiltersChange: (filters: FilterCondition[]) => void;
}

export function LogicTree({
  triggers,
  filters,
  onTriggersChange,
  onFiltersChange,
}: LogicTreeProps) {
  return (
    <div className="px-5 pb-4">
      <div className="mb-4">
        <FilterSection filters={filters} onChange={onFiltersChange} />
      </div>
      <TriggerSection triggers={triggers} onChange={onTriggersChange} />
    </div>
  );
}
