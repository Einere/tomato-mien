import type { FilterCondition } from "@/types/alarm";
import { createDefaultRange } from "@/utils/alarmRules";
import { Badge, Button, AddIcon, Panel } from "@tomato-mien/ui";
import { ConditionRow } from "./ConditionRow";

interface FilterSectionProps {
  filters: FilterCondition[];
  onChange: (filters: FilterCondition[]) => void;
}

export function FilterSection({ filters, onChange }: FilterSectionProps) {
  const updateFilter = (index: number, updated: FilterCondition) => {
    onChange(filters.map((f, i) => (i === index ? updated : f)));
  };

  const deleteFilter = (index: number) => {
    onChange(filters.filter((_, i) => i !== index));
  };

  return (
    <Panel>
      <Panel.Header>
        <Panel.Label>
          <span className="text-overline text-subtle-foreground">
            Filters (and)
          </span>
          <Badge>{filters.length}</Badge>
        </Panel.Label>
        <Panel.Actions>
          <Button
            variant="ghost"
            className="text-xs"
            onClick={() => onChange([...filters, createDefaultRange()])}
          >
            <AddIcon size="sm" /> Range
          </Button>
        </Panel.Actions>
      </Panel.Header>
      <Panel.Body>
        <div className="flex flex-col gap-2">
          {filters.map((filter, idx) => (
            <ConditionRow
              key={idx}
              condition={filter}
              onChange={updated =>
                updateFilter(idx, updated as FilterCondition)
              }
              onDelete={() => deleteFilter(idx)}
            />
          ))}
          {filters.length === 0 && (
            <p className="text-caption text-muted-foreground py-2 text-center">
              No filters — triggers fire at any time.
            </p>
          )}
        </div>
      </Panel.Body>
    </Panel>
  );
}
